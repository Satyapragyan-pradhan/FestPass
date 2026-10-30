/**
 * Socket.IO Real-Time Server Configuration
 */

const { Server } = require('socket.io');
const { SOCKET_EVENTS } = require('@festpass/shared');
const logger = require('../logger');

let ioInstance = null;

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected to node WebSocket');

    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'Client disconnected from node WebSocket');
    });
  });

  ioInstance = io;
  return io;
}

function getIo() {
  return ioInstance;
}

function broadcastClusterUpdate(payload) {
  if (ioInstance) {
    ioInstance.emit(SOCKET_EVENTS.CLUSTER_UPDATE, payload);
  }
}

function broadcastTicketIssued(ticket) {
  if (ioInstance) {
    ioInstance.emit(SOCKET_EVENTS.TICKET_ISSUED, ticket);
  }
}

function broadcastCheckinResult(checkin) {
  if (ioInstance) {
    ioInstance.emit(SOCKET_EVENTS.CHECKIN_RESULT, checkin);
  }
}

function broadcastConflictDetected(conflict) {
  if (ioInstance) {
    ioInstance.emit(SOCKET_EVENTS.CONFLICT_DETECTED, conflict);
  }
}

module.exports = {
  initSocket,
  getIo,
  broadcastClusterUpdate,
  broadcastTicketIssued,
  broadcastCheckinResult,
  broadcastConflictDetected,
};
