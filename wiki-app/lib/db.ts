/**
 * Server-side PostgreSQL access for the wiki-app (Next.js 14 App Router).
 * Only import from Server Components / Route Handlers — never from client code.
 * Uses the wiki.* schema in the shared eam_db populated by wiki-mcp/src/migrate.ts.
 */

import { Pool } from 'pg';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  _pool = new Pool({
    host:     process.env.DATABASE_HOST     ?? 'localhost',
    port:     parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user:     process.env.DATABASE_USER     ?? 'eam_user',
    password: process.env.DATABASE_PASSWORD ?? 'devpassword123',
    database: process.env.DATABASE_NAME     ?? 'eam_db',
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  return _pool;
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
export async function getDashboard(): Promise<Record<string, unknown>> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT data FROM wiki.dashboard WHERE id = 1');
  if (!rows[0]) throw new Error('Dashboard not found — run migration first');
  return rows[0].data as Record<string, unknown>;
}

// ── Unified section → table mapping ──────────────────────────────────────────

const SECTION_TABLE: Record<string, { table: string; idCol: string }> = {
  features:        { table: 'wiki.features',      idCol: 'id'     },
  bugs:            { table: 'wiki.bugs',          idCol: 'id'     },
  decisions:       { table: 'wiki.decisions',     idCol: 'id'     },
  'api-contracts': { table: 'wiki.api_contracts', idCol: 'module' },
  history:         { table: 'wiki.history',       idCol: 'date'   },
};

/** Get full feature record by ID */
export async function getFeature(id: string): Promise<Record<string, unknown> | null> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT data FROM wiki.features WHERE id = $1', [id]);
  return rows[0] ? (rows[0].data as Record<string, unknown>) : null;
}

/** List features with optional filters */
export async function listFeatures(filters?: {
  status?: string;
  sprint?: string;
  domain?: string;
}): Promise<FeatureRow[]> {
  const pool = getPool();
  const conditions: string[] = [];
  const params: string[] = [];
  let i = 1;
  if (filters?.status) { conditions.push(`status = $${i++}`); params.push(filters.status); }
  if (filters?.sprint) { conditions.push(`sprint = $${i++}`); params.push(filters.sprint); }
  if (filters?.domain) { conditions.push(`domain = $${i++}`); params.push(filters.domain); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const sql = `SELECT id, title, status, sprint, domain, priority, size, owner FROM wiki.features${where} ORDER BY priority ASC, id ASC`;
  const { rows } = await pool.query(sql, params);
  return rows as FeatureRow[];
}

/** Get a full entry from any section by section name + slug */
export async function getEntry(section: string, slug: string): Promise<Record<string, unknown> | null> {
  const pool = getPool();

  // 1. Dedicated table (features, bugs, decisions, api-contracts, history)
  //    Skip for '_index' — section indices live in wiki.pages, not the dedicated table
  const mapping = SECTION_TABLE[section];
  if (mapping && slug !== '_index') {
    const { rows } = await pool.query(
      `SELECT data FROM ${mapping.table} WHERE ${mapping.idCol} = $1`, [slug]
    );
    if (rows[0]) return rows[0].data as Record<string, unknown>;
  }

  // 2. Special case: plan section has pages (backlog, _index) AND sprints table
  if (section === 'plan') {
    const { rows: pageRows } = await pool.query(
      'SELECT data FROM wiki.pages WHERE section = $1 AND slug = $2', ['plan', slug]
    );
    if (pageRows[0]) return pageRows[0].data as Record<string, unknown>;
    const { rows: sprintRows } = await pool.query(
      'SELECT data FROM wiki.sprints WHERE id = $1', [slug]
    );
    return sprintRows[0] ? (sprintRows[0].data as Record<string, unknown>) : null;
  }

  // 3. Generic pages table
  const { rows: pageRows } = await pool.query(
    'SELECT data FROM wiki.pages WHERE section = $1 AND slug = $2', [section, slug]
  );
  return pageRows[0] ? (pageRows[0].data as Record<string, unknown>) : null;
}

/** List entry IDs/slugs for a known section */
export async function listSection(section: string): Promise<string[]> {
  const pool = getPool();

  // 1. Dedicated table
  const mapping = SECTION_TABLE[section];
  if (mapping) {
    const { rows } = await pool.query(
      `SELECT ${mapping.idCol}::text AS id FROM ${mapping.table} ORDER BY ${mapping.idCol}`
    );
    return rows.map((r: { id: string }) => r.id);
  }

  // 2. plan — combine pages (backlog) and sprints table
  if (section === 'plan') {
    const { rows: pageRows } = await pool.query(
      "SELECT slug FROM wiki.pages WHERE section = 'plan' AND slug != '_index' ORDER BY slug"
    );
    const { rows: sprintRows } = await pool.query(
      'SELECT id FROM wiki.sprints ORDER BY id'
    );
    const sprints = sprintRows
      .map((r: { id: string }) => r.id)
      .sort((a: string, b: string) => {
        const numA = parseInt(a.replace(/\D+/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D+/g, ''), 10) || 0;
        return numA - numB;
      });
    return [...pageRows.map((r: { slug: string }) => r.slug), ...sprints];
  }

  // 3. Generic pages table
  const { rows } = await pool.query(
    "SELECT slug FROM wiki.pages WHERE section = $1 AND slug != '_index' ORDER BY slug",
    [section]
  );
  return rows.map((r: { slug: string }) => r.slug);
}

/** Get changelog entries, newest-first */
export async function getChangelog(): Promise<Record<string, unknown>[]> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT data FROM wiki.changelog ORDER BY date DESC');
  return rows.map((r: { data: Record<string, unknown> }) => r.data);
}

/** Full-text search across features, bugs, decisions, contracts using tsvector */
export interface SearchResult {
  section: string;
  id: string;
  title: string;
  snippet: string;
}

export async function searchWiki(query: string, section?: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const pool = getPool();
  const words = query.trim().split(/\s+/).filter(Boolean);
  const tsQuery = words.map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean).join(' & ');
  if (!tsQuery) return [];

  const results: SearchResult[] = [];

  const targets = [
    { section: 'features',      table: 'wiki.features',      idCol: 'id',     titleCol: 'title',  snippetCol: "title || ' ' || COALESCE(domain, '')" },
    { section: 'bugs',          table: 'wiki.bugs',          idCol: 'id',     titleCol: 'title',  snippetCol: "title || ' ' || COALESCE(description, '')" },
    { section: 'decisions',     table: 'wiki.decisions',     idCol: 'id',     titleCol: 'title',  snippetCol: 'title' },
    { section: 'api-contracts', table: 'wiki.api_contracts', idCol: 'module', titleCol: 'module', snippetCol: "module || ' ' || COALESCE(data::text, '')" },
  ] as const;

  for (const t of targets) {
    if (section && section !== t.section) continue;
    try {
      const sql = `
        SELECT ${t.idCol} AS id, ${t.titleCol} AS title,
          ts_headline('english', ${t.snippetCol}, to_tsquery('english', $1),
            'StartSel=…, StopSel=…, MaxFragments=2, MaxWords=30') AS snippet
        FROM ${t.table}
        WHERE tsv @@ to_tsquery('english', $1)
        ORDER BY ts_rank(tsv, to_tsquery('english', $1)) DESC
        LIMIT 20`;
      const { rows } = await pool.query(sql, [tsQuery]);
      for (const r of rows) {
        results.push({ section: t.section, id: r.id, title: r.title, snippet: r.snippet });
      }
    } catch {
      // Invalid query or empty table — skip
    }
  }
  return results;
}
