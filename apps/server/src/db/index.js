/**
 * Database Connection & Lifecycle Management
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');
const logger = require('../logger');
const { runMigrations } = require('./migrator');

let dbInstance = null;

function initDb(customDbPath = null) {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure data directory exists
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }

  const dbPath = customDbPath || path.join(config.dataDir, `${config.nodeId}.db`);
  logger.info({ dbPath }, 'Initializing SQLite database');

  const db = new Database(dbPath);

  // Performance and integrity pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  // Run migrations
  const applied = runMigrations(db, logger);
  logger.info({ count: applied.length, applied }, 'Database migrations up to date');

  // Sync initial peers into peers table if missing
  const peers = config.getPeerList();
  const insertPeer = db.prepare(`
    INSERT INTO peers (node_id, url, role, status)
    VALUES (?, ?, ?, 'healthy')
    ON CONFLICT(node_id) DO UPDATE SET url = excluded.url
  `);

  for (const peer of peers) {
    const role = peer.nodeId.startsWith('B') ? 'booth' : 'gate';
    insertPeer.run(peer.nodeId, peer.url, role);
  }

  dbInstance = db;
  return db;
}

function getDb() {
  if (!dbInstance) {
    return initDb();
  }
  return dbInstance;
}

function closeDb() {
  if (dbInstance) {
    logger.info('Closing SQLite database connection');
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  initDb,
  getDb,
  closeDb,
};
