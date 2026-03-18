import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dbDir = path.join(process.cwd(), "db");

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "growry.sqlite");

// Node標準のSQLite接続
export const db = new DatabaseSync(dbPath);

// taskテーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    detail TEXT,
    status TEXT NOT NULL DEFAULT 'uncomplete',
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);
