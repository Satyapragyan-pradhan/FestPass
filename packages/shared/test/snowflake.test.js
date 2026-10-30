const { SnowflakeGenerator, ClockMovedBackwardsError, DEFAULT_EPOCH } = require('../src/snowflake');

describe('SnowflakeGenerator', () => {
  it('initializes with valid node index', () => {
    const generator = new SnowflakeGenerator({ nodeId: 1 });
    expect(generator.nodeId).toBe(1n);

    const id = generator.nextId();
    expect(typeof id).toBe('string');
    expect(BigInt(id)).toBeGreaterThan(0n);
  });

  it('rejects invalid nodeId out of range [0, 1023]', () => {
    expect(() => new SnowflakeGenerator({ nodeId: -1 })).toThrow(RangeError);
    expect(() => new SnowflakeGenerator({ nodeId: 1024 })).toThrow(RangeError);
  });

  it('generates unique IDs across successive calls', () => {
    const generator = new SnowflakeGenerator({ nodeId: 2 });
    const set = new Set();
    const count = 5000;

    for (let i = 0; i < count; i++) {
      const id = generator.nextId();
      set.add(id);
    }

    expect(set.size).toBe(count);
  });

  it('guarantees uniqueness across different node IDs at same millisecond', () => {
    const genB1 = new SnowflakeGenerator({ nodeId: 1 });
    const genB2 = new SnowflakeGenerator({ nodeId: 2 });
    const genG1 = new SnowflakeGenerator({ nodeId: 4 });

    const ids = new Set();
    for (let i = 0; i < 500; i++) {
      ids.add(genB1.nextId());
      ids.add(genB2.nextId());
      ids.add(genG1.nextId());
    }

    expect(ids.size).toBe(1500);
  });

  it('correctly deconstructs and parses snowflake ID', () => {
    const epoch = DEFAULT_EPOCH;
    const generator = new SnowflakeGenerator({ nodeId: 5, epoch });
    const id = generator.nextId();

    const parsed = SnowflakeGenerator.parse(id, epoch);
    expect(parsed.id).toBe(id);
    expect(parsed.nodeId).toBe(5);
    expect(parsed.sequence).toBe(0);
    expect(parsed.timestamp).toBeInstanceOf(Date);
    expect(Math.abs(parsed.epochMs - Date.now())).toBeLessThan(5000);
  });

  it('throws ClockMovedBackwardsError if clock drifts backwards significantly', () => {
    const generator = new SnowflakeGenerator({ nodeId: 3, maxBackwardDriftMs: 50 });
    // Simulate generation at t=10000
    generator.lastTimestamp = 1000000000000n;
    // Current time Date.now() is around 1.7e12, but if lastTimestamp was set far in the future:
    generator.lastTimestamp = BigInt(Date.now() + 50000); // 50 seconds in future

    expect(() => generator.nextId()).toThrow(ClockMovedBackwardsError);
  });

  it('handles sequence overflow in same millisecond', () => {
    const generator = new SnowflakeGenerator({ nodeId: 6 });
    // Force sequence to mask limit
    generator.sequence = 4095n;
    generator.lastTimestamp = BigInt(Date.now());

    const nextId = generator.nextId();
    expect(typeof nextId).toBe('string');
    const parsed = SnowflakeGenerator.parse(nextId);
    expect(parsed.sequence).toBe(0);
  });
});
