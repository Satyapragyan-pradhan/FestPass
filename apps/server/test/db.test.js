const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { runMigrations } = require('../src/db/migrator');

describe('Database & Migrations', () => {
  const testDbDir = path.resolve(__dirname, '..', '..', '..', 'data', 'test');
  const testDbPath = path.join(testDbDir, 'test-node.db');
  let db;

  beforeEach(() => {
    if (!fs.existsSync(testDbDir)) {
      fs.mkdirSync(testDbDir, { recursive: true });
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    db = new Database(testDbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // file lock cleanup
      }
    }
  });

  it('runs migrations and creates all 9 specified tables', () => {
    const applied = runMigrations(db);
    expect(applied).toContain('001_initial_schema.sql');

    const expectedTables = [
      'users',
      'events',
      'booth_quotas',
      'tickets',
      'checkins',
      'op_log',
      'peers',
      'conflicts',
      'meta',
      '_migrations',
    ];

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all()
      .map((t) => t.name);

    for (const expected of expectedTables) {
      expect(tables).toContain(expected);
    }
  });

  it('migrations are idempotent (re-running applies 0 new files)', () => {
    const firstRun = runMigrations(db);
    expect(firstRun.length).toBeGreaterThan(0);

    const secondRun = runMigrations(db);
    expect(secondRun.length).toBe(0);
  });

  it('enforces table constraints and foreign keys', () => {
    runMigrations(db);

    // Insert user with valid role
    const insertUser = db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    );
    expect(() => insertUser.run('u1', 'Alice', 'alice@campus.edu', 'hash', 'admin')).not.toThrow();

    // Invalid role rejected by CHECK constraint
    expect(() => insertUser.run('u2', 'Bob', 'bob@campus.edu', 'hash', 'invalid_role')).toThrow();

    // Unique email constraint
    expect(() =>
      insertUser.run('u3', 'Alice Dup', 'alice@campus.edu', 'hash', 'booth_staff')
    ).toThrow();
  });
});
