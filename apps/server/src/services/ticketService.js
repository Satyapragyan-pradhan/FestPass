/**
 * Ticket Service (Stub for Stage 2)
 *
 * TODO(stage-2): Implement ticket issuance, database transactions,
 * booth quota reservation & oversell prevention, ticket lookup, and revocation.
 */

const logger = require('../logger');
const idService = require('./idService');
const hlcService = require('./hlcService');
const tokenService = require('./tokenService');
const { getDb } = require('../db');

async function issueTicket({ eventId, holderName, holderEmail, holderPhone }) {
  // TODO(stage-2): Implement atomic quota decrement and ticket insertion
  logger.info({ eventId, holderEmail }, 'TODO(stage-2): Issue ticket invoked');
  const ticketId = idService.generateId();
  const issuedHlc = hlcService.send().toString();
  const token = tokenService.sign(ticketId, eventId);

  return {
    ticketId,
    eventId,
    holderName,
    holderEmail,
    holderPhone,
    status: 'valid',
    token,
    issuedAtHlc: issuedHlc,
  };
}

async function getTicketById(ticketId) {
  // TODO(stage-2): Implement database query
  const db = getDb();
  return db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
}

async function revokeTicket(ticketId, reason) {
  // TODO(stage-2): Implement revocation and op_log generation
  logger.info({ ticketId, reason }, 'TODO(stage-2): Revoke ticket invoked');
  return { ticketId, status: 'revoked', reason };
}

module.exports = {
  issueTicket,
  getTicketById,
  revokeTicket,
};
