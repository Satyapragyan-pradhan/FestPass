/**
 * Snowflake ID Generator
 * Generates 64-bit unique, k-ordered IDs across nodes.
 *
 * Bit Layout:
 *  1 bit : Unused (sign bit, 0)
 * 41 bits: Milliseconds since custom epoch (2025-01-01T00:00:00.000Z) -> ~69 years
 * 10 bits: Node ID (0 - 1023)
 * 12 bits: Sequence counter (0 - 4095 per millisecond per node)
 */

const DEFAULT_EPOCH = 1735689600000n; // 2025-01-01T00:00:00.000Z
const NODE_BITS = 10n;
const SEQUENCE_BITS = 12n;

const MAX_NODE_ID = (1n << NODE_BITS) - 1n; // 1023
const SEQUENCE_MASK = (1n << SEQUENCE_BITS) - 1n; // 4095

const TIMESTAMP_SHIFT = NODE_BITS + SEQUENCE_BITS; // 22
const NODE_SHIFT = SEQUENCE_BITS; // 12

class ClockMovedBackwardsError extends Error {
  constructor(deltaMs) {
    super(`Clock moved backwards by ${deltaMs}ms. Refusing to generate ID.`);
    this.name = 'ClockMovedBackwardsError';
    this.deltaMs = deltaMs;
  }
}

class SnowflakeGenerator {
  /**
   * @param {Object} options
   * @param {number|bigint} options.nodeId - Unique node index (0 - 1023)
   * @param {number|bigint} [options.epoch] - Custom epoch in milliseconds
   * @param {number} [options.maxBackwardDriftMs=1000] - Max allowable backward drift to wait out
   */
  constructor({ nodeId, epoch = DEFAULT_EPOCH, maxBackwardDriftMs = 1000 } = {}) {
    const nodeBigInt = BigInt(nodeId ?? 1);
    if (nodeBigInt < 0n || nodeBigInt > MAX_NODE_ID) {
      throw new RangeError(`nodeId must be between 0 and ${MAX_NODE_ID}, got ${nodeId}`);
    }

    this.nodeId = nodeBigInt;
    this.epoch = BigInt(epoch);
    this.maxBackwardDriftMs = maxBackwardDriftMs;
    this.lastTimestamp = -1n;
    this.sequence = 0n;
  }

  /**
   * Returns current physical timestamp in ms as BigInt
   * @private
   */
  _timeGen() {
    return BigInt(Date.now());
  }

  /**
   * Wait until next millisecond
   * @private
   */
  _tilNextMillis(last) {
    let ts = this._timeGen();
    while (ts <= last) {
      ts = this._timeGen();
    }
    return ts;
  }

  /**
   * Generates next unique Snowflake ID
   * @returns {string} 64-bit integer serialized as string
   */
  nextId() {
    let timestamp = this._timeGen();

    if (timestamp < this.lastTimestamp) {
      const delta = Number(this.lastTimestamp - timestamp);
      if (delta <= this.maxBackwardDriftMs) {
        // Short backward drift: wait until clock catches up
        while (timestamp < this.lastTimestamp) {
          timestamp = this._timeGen();
        }
      } else {
        throw new ClockMovedBackwardsError(delta);
      }
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & SEQUENCE_MASK;
      if (this.sequence === 0n) {
        // Sequence overflow in current millisecond: wait until next millisecond
        timestamp = this._tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << TIMESTAMP_SHIFT) | (this.nodeId << NODE_SHIFT) | this.sequence;

    return id.toString();
  }

  /**
   * Deconstructs a Snowflake ID back into its constituent components
   * @param {string|bigint} snowflakeId
   * @param {bigint} [customEpoch]
   */
  static parse(snowflakeId, customEpoch = DEFAULT_EPOCH) {
    const id = BigInt(snowflakeId);
    const epoch = BigInt(customEpoch);

    const timestampPart = id >> TIMESTAMP_SHIFT;
    const epochMs = Number(timestampPart + epoch);
    const nodeId = Number((id >> NODE_SHIFT) & MAX_NODE_ID);
    const sequence = Number(id & SEQUENCE_MASK);

    return {
      id: id.toString(),
      timestamp: new Date(epochMs),
      epochMs,
      nodeId,
      sequence,
    };
  }
}

module.exports = {
  SnowflakeGenerator,
  ClockMovedBackwardsError,
  DEFAULT_EPOCH,
};
