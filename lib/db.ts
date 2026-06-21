import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "medbill.db");

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      bill_type TEXT,
      provider_name TEXT,
      total_billed REAL,
      total_errors_found INTEGER DEFAULT 0,
      estimated_savings REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      raw_text TEXT
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
      error_type TEXT NOT NULL,
      line_item TEXT,
      charge_amount REAL,
      expected_amount REAL,
      savings REAL,
      severity TEXT NOT NULL DEFAULT 'medium',
      explanation TEXT,
      action_required TEXT
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'draft',
      letter_content TEXT,
      provider_name TEXT,
      amount_disputed REAL,
      amount_recovered REAL DEFAULT 0,
      notes TEXT
    );
  `);

  return db;
}

export default getDb;
