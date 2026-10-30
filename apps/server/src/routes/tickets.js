/**
 * Ticket Issuance and Lookup Routes (Stub for Stage 2)
 *
 * TODO(stage-2): Implement booth-side ticket sale, local quota decrement,
 * Ed25519 token signing, and lookup by email/phone.
 */

const express = require('express');
const {
  issueTicketSchema,
  revokeTicketSchema,
  ticketLookupQuerySchema,
} = require('@festpass/shared');
const ticketService = require('../services/ticketService');
const { getDb } = require('../db');

const router = express.Router();

// POST /api/tickets/issue
router.post('/issue', async (req, res, next) => {
  try {
    const validated = issueTicketSchema.parse(req.body);
    // TODO(stage-2): Decrement quota for this booth node and issue signed ticket
    const ticket = await ticketService.issueTicket(validated);
    res.status(201).json({
      success: true,
      ticket,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }
    res.status(200).json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets (lookup by holder email, phone, or event)
router.get('/', (req, res, next) => {
  try {
    const query = ticketLookupQuerySchema.parse(req.query);
    const db = getDb();
    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];

    if (query.email) {
      sql += ' AND holder_email = ?';
      params.push(query.email);
    }
    if (query.phone) {
      sql += ' AND holder_phone = ?';
      params.push(query.phone);
    }
    if (query.eventId) {
      sql += ' AND event_id = ?';
      params.push(query.eventId);
    }

    const tickets = db.prepare(sql).all(...params);
    res.status(200).json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets/:id/revoke
router.post('/:id/revoke', async (req, res, next) => {
  try {
    const validated = revokeTicketSchema.parse(req.body);
    const result = await ticketService.revokeTicket(req.params.id, validated.reason);
    res.status(200).json({ success: true, ticket: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
