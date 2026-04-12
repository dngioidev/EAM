import Database from "better-sqlite3";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// wiki.db lives at repo root: <project>/wiki.db
const DB_PATH = path.resolve(__dirname, "../../wiki.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);

  // Performance and safety PRAGMAs
  _db.pragma("journal_mode = WAL");   // BR-WIKII-06: WAL mode for concurrent reads
  _db.pragma("foreign_keys = ON");
  _db.pragma("synchronous = NORMAL"); // Safe with WAL

  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
