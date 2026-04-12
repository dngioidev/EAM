/**
 * Server-side SQLite access for the wiki-app (Next.js 14 App Router).
 * Only import from Server Components / Route Handlers — never from client code.
 * Uses the same wiki.db populated by wiki-mcp/src/migrate.ts.
 *
 * DB_PATH resolution order:
 *   1. WIKI_DB env var (absolute path)
 *   2. WIKI_DB env var from next.config.js  ("../wiki.db" relative to cwd)
 *   3. Hard fallback: process.cwd()/../wiki.db
 */

import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.WIKI_DB ?? '../wiki.db'
);

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH, { readonly: true });
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  return _db;
}

let _writeDb: Database.Database | null = null;

/** Writable connection — for admin operations only. Never import in read-only Server Components. */
export function getWriteDb(): Database.Database {
  if (_writeDb) return _writeDb;
  _writeDb = new Database(DB_PATH);
  _writeDb.pragma('journal_mode = WAL');
  _writeDb.pragma('foreign_keys = ON');
  return _writeDb;
}

// ── Type helpers ──────────────────────────────────────────────────────────────

export interface FeatureRow {
  id: string;
  title: string;
  status: string | null;
  sprint: string | null;
  domain: string | null;
  priority: number | null;
  size: string | null;
  owner: string | null;
}

export interface BugRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  feature: string | null;
  sprint: string | null;
  created_at: string;
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Get the dashboard row (always id=1) */
export function getDashboard(): Record<string, unknown> {
  const db = getDb();
  const row = db
    .prepare('SELECT data FROM dashboard WHERE id = 1')
    .get() as { data: string } | null;
  if (!row) throw new Error('Dashboard not found — run migration first');
  return JSON.parse(row.data) as Record<string, unknown>;
}

/** Get full feature record by ID */
export function getFeature(id: string): Record<string, unknown> | null {
  const db = getDb();
  const row = db
    .prepare('SELECT data FROM features WHERE id = ?')
    .get(id) as { data: string } | null;
  return row ? (JSON.parse(row.data) as Record<string, unknown>) : null;
}

/** List features with optional filters */
export function listFeatures(filters?: {
  status?: string;
  sprint?: string;
  domain?: string;
}): FeatureRow[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];
  if (filters?.status) { conditions.push('status = ?'); params.push(filters.status); }
  if (filters?.sprint) { conditions.push('sprint = ?');  params.push(filters.sprint); }
  if (filters?.domain) { conditions.push('domain = ?');  params.push(filters.domain); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const sql = `SELECT id, title, status, sprint, domain, priority, size, owner FROM features${where} ORDER BY priority ASC, id ASC`;
  return db.prepare(sql).all(...params) as FeatureRow[];
}

/** Get a full entry from any section by section name + slug */
export function getEntry(section: string, slug: string): Record<string, unknown> | null {
  const db = getDb();

  const tableMap: Record<string, string> = {
    features:      'features',
    bugs:          'bugs',
    decisions:     'decisions',
    'api-contracts': 'api_contracts',
  };

  const table = tableMap[section];
  if (!table) return null; // Unknown section — caller should fall back to readWikiFile

  const idCol = section === 'api-contracts' ? 'module' : 'id';
  const row = db
    .prepare(`SELECT data FROM ${table} WHERE ${idCol} = ?`)
    .get(slug) as { data: string } | null;
  return row ? (JSON.parse(row.data) as Record<string, unknown>) : null;
}

/** List entry IDs/slugs for a known section */
export function listSection(section: string): string[] {
  const db = getDb();

  const tableMap: Record<string, { table: string; idCol: string }> = {
    features:        { table: 'features',     idCol: 'id' },
    bugs:            { table: 'bugs',         idCol: 'id' },
    decisions:       { table: 'decisions',    idCol: 'id' },
    'api-contracts': { table: 'api_contracts', idCol: 'module' },
  };

  const mapping = tableMap[section];
  if (!mapping) return []; // Unknown section — caller should fall back to listWikiFiles

  const rows = db
    .prepare(`SELECT ${mapping.idCol} AS id FROM ${mapping.table} ORDER BY ${mapping.idCol}`)
    .all() as Array<{ id: string }>;
  return rows.map((r) => r.id);
}

/** Get changelog entries, newest-first */
export function getChangelog(): Record<string, unknown>[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT data FROM changelog ORDER BY date DESC')
    .all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data) as Record<string, unknown>);
}

/** FTS5 search across features, bugs, decisions, contracts */
export interface SearchResult {
  section: string;
  id: string;
  title: string;
  snippet: string;
}

export function searchWiki(query: string, section?: string): SearchResult[] {
  if (!query.trim()) return [];
  const db = getDb();
  const ftsQuery = query.trim().replace(/"/g, '""');
  const results: SearchResult[] = [];

  const targets = [
    { ftsTable: 'features_fts',  section: 'features',      idCol: 'id',     titleCol: 'title',  },
    { ftsTable: 'bugs_fts',      section: 'bugs',          idCol: 'id',     titleCol: 'title',  },
    { ftsTable: 'decisions_fts', section: 'decisions',     idCol: 'id',     titleCol: 'title',  },
    { ftsTable: 'contracts_fts', section: 'api-contracts', idCol: 'module', titleCol: 'module', },
  ] as const;

  for (const t of targets) {
    if (section && section !== t.section) continue;
    try {
      const rows = db.prepare(
        `SELECT ${t.idCol} AS id, ${t.titleCol} AS title,
          snippet(${t.ftsTable}, -1, '…', '…', '…', 20) AS snippet
         FROM ${t.ftsTable}
         WHERE ${t.ftsTable} MATCH ?
         ORDER BY rank LIMIT 20`
      ).all(`"${ftsQuery}"`) as Array<{ id: string; title: string; snippet: string }>;
      for (const r of rows) {
        results.push({ section: t.section, id: r.id, title: r.title, snippet: r.snippet });
      }
    } catch {
      // Invalid FTS syntax or empty table — skip
    }
  }
  return results;
}
