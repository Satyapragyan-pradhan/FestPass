/**
 * Pino Logger Configuration with Node Context
 */

const pino = require('pino');
const config = require('../config');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: config.logLevel,
  base: {
    nodeId: config.nodeId,
    role: config.nodeRole,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

module.exports = logger;
