import { NextResponse } from 'next/server';
import { patchWikiFile } from '@/lib/wiki';
import { getWriteDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sections backed by SQLite — updates go to DB instead of JSON file
const DB_SECTIONS: Record<string, { table: string; idCol: string }> = {
  features:        { table: 'features',     idCol: 'id' },
  bugs:            { table: 'bugs',         idCol: 'id' },
  decisions:       { table: 'decisions',    idCol: 'id' },
  'api-contracts': { table: 'api_contracts', idCol: 'module' },
};

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null && typeof value === 'object' && !Array.isArray(value) &&
      target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

function patchDbSection(
  wikiPath: string,
  patches: Record<string, unknown>
): boolean {
  // wikiPath is like "features/auth.json" or "bugs/BUG-0001.json"
  const parts = wikiPath.replace(/\.json$/, '').split('/');
  if (parts.length !== 2) return false;
  const [section, slug] = parts as [string, string];

  const mapping = DB_SECTIONS[section];
  if (!mapping) return false;

  const db = getWriteDb();
  const today = new Date().toISOString().split('T')[0];

  const existing = db
    .prepare(`SELECT data FROM ${mapping.table} WHERE ${mapping.idCol} = ?`)
    .get(slug) as { data: string } | null;
  if (!existing) return false;

  const current = JSON.parse(existing.data) as Record<string, unknown>;
  const merged = deepMerge(current, patches);
  if (merged.meta && typeof merged.meta === 'object' && !Array.isArray(merged.meta)) {
    (merged.meta as Record<string, unknown>).last_updated = today;
  }

  db.prepare(
    `UPDATE ${mapping.table} SET data = ?, updated_at = datetime('now') WHERE ${mapping.idCol} = ?`
  ).run(JSON.stringify(merged), slug);

  // Audit log
  db.prepare(
    "INSERT INTO audit_log (table_name, row_id, action, patch, ts) VALUES (?, ?, ?, ?, datetime('now'))"
  ).run(mapping.table, slug, 'wiki-update-api', JSON.stringify(patches));

  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { path?: string; patches?: Record<string, unknown> };
    const { path: wikiPath, patches } = body;

    if (!wikiPath || typeof wikiPath !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid path' }, { status: 400 });
    }
    if (!patches || typeof patches !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid patches' }, { status: 400 });
    }

    // Try DB update first; fall back to JSON file patch for non-DB sections
    const handled = patchDbSection(wikiPath, patches);
    if (!handled) {
      await patchWikiFile(wikiPath, patches);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
