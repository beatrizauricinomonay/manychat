import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), ".data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "manychat.db");

declare global {
  var __manychatDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS flows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      trigger_value TEXT NOT NULL DEFAULT '',
      nodes TEXT NOT NULL DEFAULT '[]',
      edges TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      flow_id TEXT NOT NULL,
      flow_name TEXT NOT NULL,
      recipient_id TEXT,
      trigger_summary TEXT,
      status TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

export const db = globalThis.__manychatDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__manychatDb = db;
}
