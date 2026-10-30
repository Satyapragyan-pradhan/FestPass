/**
 * Hybrid Logical Clock (HLC) Service
 * Node-level singleton maintaining causality and event ordering for this node.
 */

const { HLC } = require('@festpass/shared');
const config = require('../config');

const hlc = new HLC({
  nodeId: config.nodeId,
});

function now() {
  return hlc.now();
}

function send() {
  return hlc.send();
}

function receive(remote) {
  return hlc.receive(remote);
}

function getTimestamp() {
  return hlc.getTimestamp();
}

function compare(a, b) {
  return HLC.compare(a, b);
}

module.exports = {
  hlc,
  now,
  send,
  receive,
  getTimestamp,
  compare,
};
