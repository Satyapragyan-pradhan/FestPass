/**
 * Health & Node Info Routes
 */

const express = require('express');
const config = require('../config');
const hlcService = require('../services/hlcService');
const { getDb } = require('../db');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    nodeId: config.nodeId,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

router.get('/node/info', (_req, res) => {
  let peerCount = 0;
  try {
    const db = getDb();
    const countRow = db.prepare('SELECT count(*) as count FROM peers').get();
    peerCount = countRow ? countRow.count : 0;
  } catch {
    // If DB is busy or initializing
  }

  res.status(200).json({
    nodeId: config.nodeId,
    role: config.nodeRole,
    nodeIndex: config.nodeIndex,
    hlc: hlcService.now().toString(),
    uptime: Math.floor(process.uptime()),
    peersConfigured: config.getPeerList().length,
    peersTracked: peerCount,
  });
});

module.exports = router;
