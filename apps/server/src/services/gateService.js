/**
 * Gate Validation Service (Stub for Stage 4)
 *
 * TODO(stage-4): Implement offline ticket token verification, quorum-based checkin,
 * duplicate scan rejection, offline batch sync, and concurrent checkin conflict resolution.
 */

const logger = require('../logger');
const tokenService = require('./tokenService');
const hlcService = require('./hlcService');
const idService = require('./idService');

async function validateAndCheckin({ token, mode = 'online', offlineHlc = null }) {
  // TODO(stage-4): Complete quorum validation and offline conflict detection
  logger.info({ mode }, 'TODO(stage-4): Gate checkin scan invoked');

  // Verify token signature offline
  const verification = tokenService.verify(token);
  if (!verification.valid) {
    return {
      result: 'rejected_invalid',
      error: verification.error,
    };
  }

  const checkinId = idService.generateId();
  const currentHlc = offlineHlc || hlcService.send().toString();

  return {
    checkinId,
    ticketId: verification.ticketId,
    eventId: verification.eventId,
    result: 'accepted',
    mode,
    hlc: currentHlc,
  };
}

async function processOfflineBatch(scans) {
  // TODO(stage-4): Implement batch replay, HLC ordering, and conflict detection
  logger.info({ count: scans.length }, 'TODO(stage-4): Process offline scan batch');
  return {
    processed: scans.length,
    accepted: scans.length,
    conflicts: [],
  };
}

module.exports = {
  validateAndCheckin,
  processOfflineBatch,
};
