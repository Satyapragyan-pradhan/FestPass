/**
 * Cluster & Replication Status Routes (Stub for Stage 3 & 4)
 *
 * TODO(stage-3): Implement peer discovery state, replication lag, and cluster topology.
 * TODO(stage-4): Surface offline validation conflicts and resolutions.
 */

const express = require('express');
const config = require('../config');
const hlcService = require('../services/hlcService');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/cluster/nodes
router.get('/nodes', (_req, res, next) => {
  try {
    const db = getDb();
    const peers = db.prepare('SELECT * FROM peers ORDER BY node_id ASC').all();
    res.status(200).json({
      success: true,
      currentNode: {
        nodeId: config.nodeId,
        role: config.nodeRole,
        port: config.port,
        hlc: hlcService.now().toString(),
      },
      peers,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cluster/replication-status
router.get('/replication-status', (_req, res, next) => {
  try {
    const db = getDb();
    const opCount = db.prepare('SELECT count(*) as count FROM op_log').get()?.count || 0;
    const latestOp = db.prepare('SELECT * FROM op_log ORDER BY hlc DESC LIMIT 1').get() || null;

    res.status(200).json({
      success: true,
      nodeId: config.nodeId,
      hlc: hlcService.now().toString(),
      totalOperations: opCount,
      latestOperation: latestOp,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cluster/conflicts
router.get('/conflicts', (_req, res, next) => {
  try {
    const db = getDb();
    const conflicts = db.prepare('SELECT * FROM conflicts ORDER BY detected_at DESC').all();
    res.status(200).json({
      success: true,
      conflicts,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cluster/stats
router.get('/stats', (_req, res, next) => {
  try {
    const db = getDb();
    const ticketCount = db.prepare('SELECT count(*) as count FROM tickets').get()?.count || 0;
    const checkinCount = db.prepare('SELECT count(*) as count FROM checkins').get()?.count || 0;
    const conflictCount = db.prepare('SELECT count(*) as count FROM conflicts').get()?.count || 0;
    const peerCount = db.prepare('SELECT count(*) as count FROM peers').get()?.count || 0;

    res.status(200).json({
      success: true,
      nodeId: config.nodeId,
      role: config.nodeRole,
      uptimeSeconds: Math.floor(process.uptime()),
      stats: {
        ticketsIssued: ticketCount,
        checkinsRecorded: checkinCount,
        conflictsDetected: conflictCount,
        peersTracked: peerCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
