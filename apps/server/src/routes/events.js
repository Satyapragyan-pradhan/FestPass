/**
 * Events CRUD Routes (Stub for Stage 2)
 *
 * TODO(stage-2): Implement event creation, updating, quota allocation across booth nodes,
 * and listing active events.
 */

const express = require('express');
const { createEventSchema, updateEventSchema } = require('@festpass/shared');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/events
router.get('/', (_req, res, next) => {
  try {
    const db = getDb();
    const events = db.prepare('SELECT * FROM events ORDER BY starts_at ASC').all();
    res.status(200).json({ success: true, events });
  } catch (err) {
    next(err);
  }
});

// POST /api/events
router.post('/', (req, res, next) => {
  try {
    const validated = createEventSchema.parse(req.body);
    // TODO(stage-2): Insert event into SQLite and partition quotas across booth nodes
    res.status(201).json({
      success: true,
      message: 'TODO(stage-2): Create event',
      event: {
        id: 'evt_stub',
        ...validated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id
router.get('/:id', (req, res, next) => {
  try {
    const db = getDb();
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }
    const quotas = db.prepare('SELECT * FROM booth_quotas WHERE event_id = ?').all(req.params.id);
    res.status(200).json({ success: true, event: { ...event, quotas } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id
router.put('/:id', (req, res, next) => {
  try {
    const validated = updateEventSchema.parse(req.body);
    // TODO(stage-2): Update event details
    res.status(200).json({
      success: true,
      message: 'TODO(stage-2): Update event',
      id: req.params.id,
      updated: validated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
