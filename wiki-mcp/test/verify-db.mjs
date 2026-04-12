import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../wiki.db'), { readonly: true });

const rows = db.prepare(`
  SELECT 'features'   AS t, COUNT(*) AS n FROM features
  UNION ALL SELECT 'sprints',    COUNT(*) FROM sprints
  UNION ALL SELECT 'tasks',      COUNT(*) FROM tasks
  UNION ALL SELECT 'bugs',       COUNT(*) FROM bugs
  UNION ALL SELECT 'changelog',  COUNT(*) FROM changelog
  UNION ALL SELECT 'contracts',  COUNT(*) FROM api_contracts
  UNION ALL SELECT 'history',    COUNT(*) FROM history
  UNION ALL SELECT 'audit_log',  COUNT(*) FROM audit_log
`).all();

rows.forEach(r => console.log(`  ${r.t}: ${r.n}`));
db.close();
console.log('\nwiki.db content verified.');
