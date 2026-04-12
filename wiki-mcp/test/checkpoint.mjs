import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../wiki.db'));
const result = db.pragma('wal_checkpoint(TRUNCATE)');
console.log('WAL checkpoint:', result);
db.close();
console.log('wiki.db ready to commit.');
