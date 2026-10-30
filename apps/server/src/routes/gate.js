/**
 * Gate Validation & Scan Routes (Stub for Stage 4)
 *
 * TODO(stage-4): Implement online quorum check-in, offline signature validation,
 * duplicate scan rejection, and offline batch replay.
 */

const express = require('express');
const { scanTicketSchema, batchScanSchema } = require('@festpass/shared');
const gateService = require('../services/gateService');
const { getDb } = require('../db');

const router = express.Router();

// POST /api/gate/scan
router.post('/scan', async (req, res, next) => {
  try {
    const validated = scanTicketSchema.parse(req.body);
    const result = await gateService.validateAndCheckin(validated);
    res.status(200).json({
      success: result.result === 'accepted',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/gate/scan-offline-batch
router.post('/scan-offline-batch', async (req, res, next) => {
  try {
    const validated = batchScanSchema.parse(req.body);
    const result = await gateService.processOfflineBatch(validated.scans);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/gate/checkins
router.get('/checkins', (req, res, next) => {
  try {
    const db = getDb();
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const checkins = db
      .prepare('SELECT * FROM checkins ORDER BY created_at DESC LIMIT ?')
      .all(limit);
    res.status(200).json({ success: true, checkins });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
