/**
 * Hybrid Logical Clock (HLC)
 * Implementation of Kulkarni et al. "Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases"
 *
 * Provides monotonically increasing, causally consistent timestamps that track physical wall time
 * bounded by bounded drift, with deterministic tie-breaking across distributed nodes.
 */

class ClockDriftError extends Error {
  constructor(message, driftMs) {
    super(message);
    this.name = 'ClockDriftError';
    this.driftMs = driftMs;
  }
}

class HLC {
  /**
   * @param {Object} options
   * @param {string} options.nodeId - Node identifier (e.g., 'B1', 'G2')
   * @param {number} [options.maxDriftMs=60000] - Max allowable clock drift between nodes (default 60s)
   */
  constructor({ nodeId, maxDriftMs = 60000 } = {}) {
    if (!nodeId || typeof nodeId !== 'string') {
      throw new TypeError('nodeId must be a non-empty string');
    }

    this.nodeId = nodeId;
    this.maxDriftMs = maxDriftMs;
    this.wallTime = Date.now();
    this.logical = 0;
  }

  /**
   * Reads or generates a timestamp for a local event without physical time progression
   * @returns {{ wallTime: number, logical: number, nodeId: string, toString: () => string }}
   */
  now() {
    const pt = Date.now();
    const lOld = this.wallTime;
    const lNew = Math.max(lOld, pt);

    if (lNew === lOld) {
      this.logical += 1;
    } else {
      this.wallTime = lNew;
      this.logical = 0;
    }

    return this.getTimestamp();
  }

  /**
   * Timestamp for an outgoing message or persisted operation.
   * Advances the clock identically to now().
   * @returns {{ wallTime: number, logical: number, nodeId: string, toString: () => string }}
   */
  send() {
    return this.now();
  }

  /**
   * Updates local clock upon receiving a remote HLC timestamp.
   * Guarantees that subsequent local events will be causally after the remote event.
   *
   * @param {string|{ wallTime: number, logical: number, nodeId: string }} remote
   * @returns {{ wallTime: number, logical: number, nodeId: string, toString: () => string }}
   */
  receive(remote) {
    const remoteTs = typeof remote === 'string' ? HLC.parse(remote) : remote;

    if (
      !remoteTs ||
      typeof remoteTs.wallTime !== 'number' ||
      typeof remoteTs.logical !== 'number' ||
      typeof remoteTs.nodeId !== 'string'
    ) {
      throw new TypeError('Invalid remote timestamp supplied to receive()');
    }

    const pt = Date.now();
    const drift = remoteTs.wallTime - pt;
    if (drift > this.maxDriftMs) {
      throw new ClockDriftError(
        `Remote timestamp wall time exceeds allowable clock drift: ${drift}ms > ${this.maxDriftMs}ms`,
        drift
      );
    }

    const lOld = this.wallTime;
    const lNew = Math.max(lOld, remoteTs.wallTime, pt);

    if (lNew === lOld && lNew === remoteTs.wallTime) {
      this.logical = Math.max(this.logical, remoteTs.logical) + 1;
    } else if (lNew === lOld) {
      this.logical += 1;
    } else if (lNew === remoteTs.wallTime) {
      this.logical = remoteTs.logical + 1;
    } else {
      this.logical = 0;
    }

    this.wallTime = lNew;
    return this.getTimestamp();
  }

  /**
   * Current snapshot of the clock
   */
  getTimestamp() {
    return {
      wallTime: this.wallTime,
      logical: this.logical,
      nodeId: this.nodeId,
      toString() {
        return HLC.stringify(this);
      },
    };
  }

  /**
   * Compares two HLC timestamps.
   * Total ordering:
   * 1. wallTime asc
   * 2. logical asc
   * 3. nodeId asc (tie-break)
   *
   * @param {string|Object} a
   * @param {string|Object} b
   * @returns {number} -1 if a < b, 1 if a > b, 0 if a == b
   */
  static compare(a, b) {
    const tsA = typeof a === 'string' ? HLC.parse(a) : a;
    const tsB = typeof b === 'string' ? HLC.parse(b) : b;

    if (!tsA || !tsB) {
      throw new TypeError('Both arguments to HLC.compare must be valid timestamps');
    }

    if (tsA.wallTime < tsB.wallTime) return -1;
    if (tsA.wallTime > tsB.wallTime) return 1;

    if (tsA.logical < tsB.logical) return -1;
    if (tsA.logical > tsB.logical) return 1;

    if (tsA.nodeId < tsB.nodeId) return -1;
    if (tsA.nodeId > tsB.nodeId) return 1;

    return 0;
  }

  /**
   * Checks if timestamp A is strictly before timestamp B
   */
  static isBefore(a, b) {
    return HLC.compare(a, b) < 0;
  }

  /**
   * Checks if timestamp A is strictly after timestamp B
   */
  static isAfter(a, b) {
    return HLC.compare(a, b) > 0;
  }

  /**
   * Serializes a timestamp object to string format: "<wallTime>:<logical>:<nodeId>"
   */
  static stringify(ts) {
    if (!ts || typeof ts.wallTime !== 'number' || typeof ts.logical !== 'number') {
      throw new TypeError('Invalid timestamp object to stringify');
    }
    return `${ts.wallTime}:${ts.logical}:${ts.nodeId}`;
  }

  /**
   * Parses serialized string into timestamp object
   * @param {string} str
   */
  static parse(str) {
    if (!str || typeof str !== 'string') {
      throw new TypeError('Timestamp string must be a non-empty string');
    }

    const parts = str.split(':');
    if (parts.length !== 3) {
      throw new Error(`Invalid HLC timestamp format: "${str}", expected "wallTime:logical:nodeId"`);
    }

    const wallTime = Number(parts[0]);
    const logical = Number(parts[1]);
    const nodeId = parts[2].trim();

    if (Number.isNaN(wallTime) || Number.isNaN(logical) || !nodeId) {
      throw new Error(`Invalid numeric components in HLC timestamp: "${str}"`);
    }

    return {
      wallTime,
      logical,
      nodeId,
      toString() {
        return HLC.stringify(this);
      },
    };
  }
}

module.exports = {
  HLC,
  ClockDriftError,
};
