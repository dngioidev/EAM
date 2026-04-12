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
  // readonly: true — do NOT set journal_mode or foreign_keys pragmas;
  // WAL is already set on the DB at creation; pragmas that write fail on readonly handles.
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
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

// ── Unified section → table mapping ──────────────────────────────────────────

/** Sections backed by a dedicated table (not the generic pages table). */
const SECTION_TABLE: Record<string, { table: string; idCol: string }> = {
  features:        { table: 'features',      idCol: 'id'     },
  bugs:            { table: 'bugs',          idCol: 'id'     },
  decisions:       { table: 'decisions',     idCol: 'id'     },
  'api-contracts': { table: 'api_contracts', idCol: 'module' },
  history:         { table: 'history',       idCol: 'date'   },
};

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

  // 1. Dedicated table (features, bugs, decisions, api-contracts, history)
  const mapping = SECTION_TABLE[section];
  if (mapping) {
    const row = db
      .prepare(`SELECT data FROM "${mapping.table}" WHERE "${mapping.idCol}" = ?`)
      .get(slug) as { data: string } | null;
    if (row) return JSON.parse(row.data) as Record<string, unknown>;
    // _index slugs for these sections aren't in dedicated tables — fall through
    // to pages table (they may or may not be there)
  }

  // 2. Special case: plan section has pages (backlog, _index) AND sprints table
  if (section === 'plan') {
    const pageRow = db
      .prepare('SELECT data FROM pages WHERE section = ? AND slug = ?')
      .get('plan', slug) as { data: string } | null;
    if (pageRow) return JSON.parse(pageRow.data) as Record<string, unknown>;
    // Check sprints table (sprint-1, sprint-2, …)
    const sprintRow = db
      .prepare('SELECT data FROM sprints WHERE id = ?')
      .get(slug) as { data: string } | null;
    return sprintRow ? (JSON.parse(sprintRow.data) as Record<string, unknown>) : null;
  }

  // 3. Generic pages table (techstack, rulebook, impact-map, design, …)
  //    Also serves as catch-all fallback for _index slugs of dedicated sections
  const pageRow = db
    .prepare('SELECT data FROM pages WHERE section = ? AND slug = ?')
    .get(section, slug) as { data: string } | null;
  return pageRow ? (JSON.parse(pageRow.data) as Record<string, unknown>) : null;
}

/** List entry IDs/slugs for a known section */
export function listSection(section: string): string[] {
  const db = getDb();

  // 1. Dedicated table
  const mapping = SECTION_TABLE[section];
  if (mapping) {
    const rows = db
      .prepare(
        `SELECT "${mapping.idCol}" AS id FROM "${mapping.table}" ORDER BY "${mapping.idCol}"`,
      )
      .all() as Array<{ id: string }>;
    return rows.map((r) => r.id);
  }

  // 2. plan — combine pages (backlog) and sprints table, sprints sorted numerically
  if (section === 'plan') {
    const pageRows = db
      .prepare("SELECT slug FROM pages WHERE section = 'plan' AND slug != '_index' ORDER BY slug")
      .all() as Array<{ slug: string }>;
    const sprintRows = db
      .prepare('SELECT id FROM sprints ORDER BY id')
      .all() as Array<{ id: string }>;
    // Sort sprints numerically (sprint-1, sprint-2, … sprint-13)
    const sprints = sprintRows
      .map((r) => r.id)
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D+/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D+/g, ''), 10) || 0;
        return numA - numB;
      });
    return [...pageRows.map((r) => r.slug), ...sprints];
  }

  // 3. Generic pages table (techstack/backend, rulebook/api-standards, …)
  const rows = db
    .prepare("SELECT slug FROM pages WHERE section = ? AND slug != '_index' ORDER BY slug")
    .all(section) as Array<{ slug: string }>;
  return rows.map((r) => r.slug);
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
