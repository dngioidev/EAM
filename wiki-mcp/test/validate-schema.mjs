import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(':memory:');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = readFileSync(path.join(__dirname, '../src/schema.sql'), 'utf8');
db.exec(schema);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables created:');
tables.forEach(t => console.log(' ', t.name));

const fts = db.prepare("SELECT name FROM sqlite_master WHERE name LIKE '%_fts'").all();
console.log('FTS5 virtual tables:');
fts.forEach(t => console.log(' ', t.name));

db.close();
console.log('\nSchema validation: OK');
