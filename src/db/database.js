const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './realhands.db';

let db;

function getDb() {
  if (!db) {
    db = new Database(path.resolve(DB_PATH));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      phone       TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      skill       TEXT NOT NULL,
      experience  TEXT NOT NULL,
      city        TEXT DEFAULT 'Hyderabad',
      latitude    REAL,
      longitude   REAL,
      wage_min    INTEGER NOT NULL,
      wage_max    INTEGER NOT NULL,
      language    TEXT DEFAULT 'hi',
      available   INTEGER DEFAULT 1,
      worker_id   TEXT UNIQUE NOT NULL,
      created_at  TEXT DEFAULT (datetime('now')),
      last_active TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      phone      TEXT UNIQUE NOT NULL,
      name       TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      employer_phone  TEXT NOT NULL,
      skill_needed    TEXT NOT NULL,
      workers_needed  INTEGER DEFAULT 1,
      start_date      TEXT NOT NULL,
      latitude        REAL,
      longitude       REAL,
      address         TEXT,
      status          TEXT DEFAULT 'open',
      created_at      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_requests (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id         INTEGER NOT NULL,
      worker_phone   TEXT NOT NULL,
      employer_phone TEXT NOT NULL,
      status         TEXT DEFAULT 'pending',
      created_at     TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_phone   TEXT NOT NULL,
      employer_phone TEXT NOT NULL,
      rating         INTEGER NOT NULL,
      created_at     TEXT DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { getDb };
