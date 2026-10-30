const request = require('supertest');
const { createApp } = require('../src/app');

describe('Health and Node Info Endpoints', () => {
  const app = createApp();

  it('GET /health returns 200 and node status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.nodeId).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /node/info returns 200 and node metadata', async () => {
    const res = await request(app).get('/node/info');
    expect(res.status).toBe(200);
    expect(res.body.nodeId).toBeDefined();
    expect(res.body.role).toBeDefined();
    expect(res.body.hlc).toBeDefined();
    expect(res.body.peersConfigured).toBeGreaterThan(0);
  });

  it('handles unmatched routes with 404 JSON', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
