const { HLC, ClockDriftError } = require('../src/hlc');

describe('Hybrid Logical Clock (HLC)', () => {
  it('initializes with a valid nodeId', () => {
    const clock = new HLC({ nodeId: 'B1' });
    const ts = clock.now();

    expect(ts.nodeId).toBe('B1');
    expect(ts.wallTime).toBeGreaterThan(0);
    expect(ts.logical).toBeGreaterThanOrEqual(0);
    expect(ts.toString()).toContain(':');
  });

  it('increments logical counter when physical clock has not moved', () => {
    const clock = new HLC({ nodeId: 'B1' });
    // Artificially advance wall time into the future with logical 0
    clock.wallTime = Date.now() + 5000;
    clock.logical = 0;

    const ts1 = clock.now();
    const ts2 = clock.now();

    expect(ts1.wallTime).toBe(clock.wallTime);
    expect(ts1.logical).toBe(1);
    expect(ts2.logical).toBe(2);
  });

  it('updates local clock upon receiving a greater remote timestamp', () => {
    const clock = new HLC({ nodeId: 'G1' });
    const remoteTime = Date.now() + 500;
    const remoteTs = { wallTime: remoteTime, logical: 10, nodeId: 'B1' };

    const updated = clock.receive(remoteTs);

    expect(updated.wallTime).toBeGreaterThanOrEqual(remoteTime);
    expect(updated.logical).toBeGreaterThan(10);
    expect(updated.nodeId).toBe('G1');
  });

  it('detects and rejects excessive clock drift', () => {
    const clock = new HLC({ nodeId: 'G2', maxDriftMs: 5000 });
    const excessiveRemote = {
      wallTime: Date.now() + 10000, // 10s ahead
      logical: 0,
      nodeId: 'B2',
    };

    expect(() => clock.receive(excessiveRemote)).toThrow(ClockDriftError);
  });

  it('orders timestamps totally with nodeId tie-break', () => {
    // 1. Different wallTime
    const t1 = { wallTime: 1000, logical: 5, nodeId: 'B1' };
    const t2 = { wallTime: 2000, logical: 1, nodeId: 'B2' };
    expect(HLC.compare(t1, t2)).toBe(-1);
    expect(HLC.compare(t2, t1)).toBe(1);

    // 2. Same wallTime, different logical
    const t3 = { wallTime: 1000, logical: 1, nodeId: 'B1' };
    const t4 = { wallTime: 1000, logical: 2, nodeId: 'B1' };
    expect(HLC.compare(t3, t4)).toBe(-1);
    expect(HLC.compare(t4, t3)).toBe(1);

    // 3. Same wallTime, same logical, different nodeId
    const t5 = { wallTime: 1000, logical: 2, nodeId: 'B1' };
    const t6 = { wallTime: 1000, logical: 2, nodeId: 'B2' };
    expect(HLC.compare(t5, t6)).toBe(-1); // 'B1' < 'B2'
    expect(HLC.compare(t6, t5)).toBe(1);

    // 4. Exactly equal
    const t7 = { wallTime: 1000, logical: 2, nodeId: 'B1' };
    expect(HLC.compare(t5, t7)).toBe(0);

    // Helpers
    expect(HLC.isBefore(t1, t2)).toBe(true);
    expect(HLC.isAfter(t2, t1)).toBe(true);
  });

  it('parses and serializes timestamp strings accurately', () => {
    const str = '1730000000000:42:G3';
    const parsed = HLC.parse(str);

    expect(parsed.wallTime).toBe(1730000000000);
    expect(parsed.logical).toBe(42);
    expect(parsed.nodeId).toBe('G3');
    expect(parsed.toString()).toBe(str);
  });
});
