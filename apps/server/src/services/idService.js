/**
 * Snowflake ID Generation Service
 * Node-level singleton configured with current node index.
 */

const { SnowflakeGenerator } = require('@festpass/shared');
const config = require('../config');

const generator = new SnowflakeGenerator({
  nodeId: config.nodeIndex,
});

function generateId() {
  return generator.nextId();
}

function parseId(id) {
  return SnowflakeGenerator.parse(id);
}

module.exports = {
  generator,
  generateId,
  parseId,
};
