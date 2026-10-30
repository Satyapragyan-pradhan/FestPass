/**
 * SQLite Database Migrator
 */

const fs = require('fs');
const path = require('path');

function runMigrations(db, logger) {
  // Ensure migrations tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const appliedRows = db.prepare('SELECT name FROM _migrations').all();
  const appliedSet = new Set(appliedRows.map((r) => r.name));

  const appliedNow = [];

  for (const file of files) {
    if (!appliedSet.has(file)) {
      if (logger) logger.info({ migration: file }, 'Applying migration');
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      const apply = db.transaction(() => {
        db.exec(sql);
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      });

      apply();
      appliedNow.push(file);
    }
  }

  return appliedNow;
}

module.exports = {
  runMigrations,
};
