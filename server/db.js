const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'jetsales.db');
let db = null;
let dbReady = null;

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initSchema() {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
    email TEXT, phone TEXT, company TEXT, title TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS aircraft (
    id TEXT PRIMARY KEY, make TEXT NOT NULL, model TEXT NOT NULL, year INTEGER,
    serial_number TEXT, registration TEXT, total_hours REAL, price REAL,
    status TEXT DEFAULT 'available' CHECK(status IN ('available','reserved','sold','maintenance')),
    description TEXT, image_url TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS prospects (
    id TEXT PRIMARY KEY, contact_id TEXT NOT NULL REFERENCES contacts(id),
    aircraft_id TEXT REFERENCES aircraft(id),
    stage TEXT DEFAULT 'inquiry' CHECK(stage IN ('inquiry','qualified','proposal','negotiation','closed_won','closed_lost')),
    source TEXT, budget_min REAL, budget_max REAL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    assigned_to TEXT, expected_close_date TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY, prospect_id TEXT REFERENCES prospects(id),
    contact_id TEXT REFERENCES contacts(id),
    type TEXT NOT NULL CHECK(type IN ('call','email','meeting','note','demo','tour','follow_up')),
    subject TEXT NOT NULL, description TEXT, scheduled_at TEXT, completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS pipeline_stages (
    stage TEXT PRIMARY KEY, display_name TEXT NOT NULL, sort_order INTEGER NOT NULL, color TEXT
  )`);
  db.run(`INSERT OR IGNORE INTO pipeline_stages VALUES ('inquiry','Inquiry',1,'#6366f1')`);
  db.run(`INSERT OR IGNORE INTO pipeline_stages VALUES ('qualified','Qualified',2,'#3b82f6')`);
  db.run(`INSERT OR IGNORE INTO pipeline_stages VALUES ('proposal','Proposal Sent',3,'#f59e0b')`);
  db.run(`INSERT OR IGNORE INTO pipeline_stages VALUES ('negotiation','Negotiation',4,'#f97316')`);
  db.run(`INSERT OR IGNORE INTO pipeline_stages VALUES ('closed_won','Closed Won',5,'#22c55e')`);
  db.run(`INSERT OR IGNORE INTO pipeline_stages VALUES ('closed_lost','Closed Lost',6,'#ef4444')`);
  saveDb();
}

async function initDb() {
  if (db) return db;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing database from', DB_PATH);
    } else {
      db = new SQL.Database();
      console.log('Created new database');
    }
    db.run('PRAGMA foreign_keys = ON');
    initSchema();
    return db;
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
}

// Helper functions
function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  let result = null;
  if (stmt.step()) result = stmt.getAsObject();
  stmt.free();
  return result;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return { changes: db.getRowsModified() };
}

dbReady = initDb();

module.exports = { initDb, getAll, getOne, run, getDbReady: () => dbReady };
