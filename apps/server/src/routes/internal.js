/**
 * Internal Peer-to-Peer Distributed Routes (Stub for Stage 3 & 4)
 *
 * Dedicated to internal cluster communication: gossip membership exchange,
 * anti-entropy log replication, inter-booth quota claiming, and chaos injection.
 */

const express = require('express');
const {
  gossipSchema,
  syncRequestSchema,
  claimQuotaSchema,
  chaosSchema,
} = require('@festpass/shared');
const replicationService = require('../services/replicationService');
const hlcService = require('../services/hlcService');

const router = express.Router();

// POST /internal/gossip
router.post('/gossip', async (req, res, next) => {
  try {
    const validated = gossipSchema.parse(req.body);
    // Update local HLC with remote message
    hlcService.receive(validated.hlc);
    const result = await replicationService.handleGossip(validated);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /internal/sync
router.post('/sync', async (req, res, next) => {
  try {
    const validated = syncRequestSchema.parse(req.body);
    const result = await replicationService.handleSync(validated);
    res.status(200).json({
      success: true,
      currentHlc: hlcService.now().toString(),
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /internal/claim
router.post('/claim', async (req, res, next) => {
  try {
    const validated = claimQuotaSchema.parse(req.body);
    const result = await replicationService.claimQuota(validated);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /internal/chaos (for demo & chaos testing in Stage 6)
router.post('/chaos', (req, res, next) => {
  try {
    const validated = chaosSchema.parse(req.body);
    // TODO(stage-6): Hook into artificial network delay / partition middleware
    res.status(200).json({
      success: true,
      message: 'Chaos configuration accepted (Stage 6 hook)',
      chaos: validated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
