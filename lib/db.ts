import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbDir = path.join(process.cwd(), "db");

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "growry.sqlite");

if (process.env.NODE_ENV !== "production") {
    console.log("DB PATH:", dbPath);
}

export const db = new Database(dbPath);

// 🔥 追加
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// テーブル
db.exec(`
  CREATE TABLE IF NOT EXISTS task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    detail TEXT,
    status TEXT NOT NULL DEFAULT 'uncomplete',
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT
  )
`);
