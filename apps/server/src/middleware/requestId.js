/**
 * Request ID Middleware
 * Assigns or propagates a unique ID to every incoming HTTP request and binds to logger.
 */

const crypto = require('crypto');
const logger = require('../logger');

function requestIdMiddleware(req, res, next) {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  // Attach child logger with request context
  req.log = logger.child({ reqId, path: req.path, method: req.method });
  next();
}

module.exports = requestIdMiddleware;
