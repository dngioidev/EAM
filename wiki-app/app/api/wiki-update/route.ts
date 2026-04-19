import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sections backed by PostgreSQL — updates go to DB
const DB_SECTIONS: Record<string, { table: string; idCol: string }> = {
  features:        { table: 'wiki.features',      idCol: 'id' },
  bugs:            { table: 'wiki.bugs',          idCol: 'id' },
  decisions:       { table: 'wiki.decisions',     idCol: 'id' },
  'api-contracts': { table: 'wiki.api_contracts', idCol: 'module' },
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

async function patchDbSection(
  wikiPath: string,
  patches: Record<string, unknown>
): Promise<boolean> {
  const parts = wikiPath.replace(/\.json$/, '').split('/');
  if (parts.length !== 2) return false;
  const [section, slug] = parts as [string, string];

  const mapping = DB_SECTIONS[section];
  if (!mapping) return false;

  const pool = getPool();
  const today = new Date().toISOString().split('T')[0];

  const { rows } = await pool.query(
    `SELECT data FROM ${mapping.table} WHERE ${mapping.idCol} = $1`, [slug]
  );
  if (!rows[0]) return false;

  const current = rows[0].data as Record<string, unknown>;
  const merged = deepMerge(current, patches);
  if (merged.meta && typeof merged.meta === 'object' && !Array.isArray(merged.meta)) {
    (merged.meta as Record<string, unknown>).last_updated = today;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE ${mapping.table} SET data = $1::jsonb, updated_at = now() WHERE ${mapping.idCol} = $2`,
      [JSON.stringify(merged), slug]
    );
    await client.query(
      `INSERT INTO wiki.audit_log (tool, author, target_type, target_id, changed)
       VALUES ('wiki-update-api', 'web-ui', $1, $2, $3::jsonb)`,
      [section, slug, JSON.stringify(patches)]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

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

    const handled = await patchDbSection(wikiPath, patches);
    if (!handled) {
      return NextResponse.json({ error: `Section not found or not supported: ${wikiPath}` }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
