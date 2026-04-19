import { getPool } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const VALID_TABLES = new Set([
  'features',
  'bugs',
  'decisions',
  'api_contracts',
  'changelog',
  'dashboard',
  'history',
  'sprints',
  'pages',
]);

const PAGE_SIZE = 30;

function tryJson(v: unknown): unknown {
  if (v !== null && typeof v === 'object') return v; // JSONB already parsed by pg
  if (typeof v !== 'string') return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

export default async function TablePage({
  params,
  searchParams,
}: {
  params: { table: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { table } = params;

  if (!VALID_TABLES.has(table)) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
        Unknown table: <code className="font-mono">{table}</code>
      </div>
    );
  }

  const page   = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const section = typeof searchParams.section === 'string' ? searchParams.section : undefined;
  const offset  = (page - 1) * PAGE_SIZE;

  const pool = getPool();
  const qualifiedTable = `wiki.${table}`;

  // Column metadata from information_schema
  const colResult = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'wiki' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  const allCols = colResult.rows.map((c: { column_name: string }) => c.column_name);
  const metaCols = allCols.filter((c: string) => c !== 'data' && c !== 'tsv');
  const hasData  = allCols.includes('data');

  // Optional section filter (pages table only)
  let sections: string[] = [];
  if (table === 'pages') {
    const secResult = await pool.query(
      'SELECT DISTINCT section FROM wiki.pages ORDER BY section'
    );
    sections = secResult.rows.map((r: { section: string }) => r.section);
  }

  // Section-filtered counts and rows
  let total: number;
  let rows: Array<Record<string, unknown>>;

  // Build column list for SELECT (exclude tsv column which is a tsvector)
  const selectCols = allCols.filter((c: string) => c !== 'tsv').join(', ');

  if (table === 'pages' && section) {
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS c FROM ${qualifiedTable} WHERE section = $1`, [section]
    );
    total = countResult.rows[0].c;
    const dataResult = await pool.query(
      `SELECT ${selectCols} FROM ${qualifiedTable} WHERE section = $1 ORDER BY slug LIMIT $2 OFFSET $3`,
      [section, PAGE_SIZE, offset]
    );
    rows = dataResult.rows;
  } else {
    const countResult = await pool.query(`SELECT COUNT(*)::int AS c FROM ${qualifiedTable}`);
    total = countResult.rows[0].c;
    const dataResult = await pool.query(
      `SELECT ${selectCols} FROM ${qualifiedTable} LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset]
    );
    rows = dataResult.rows;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const href = (p: number, sec?: string) => {
    const qs = new URLSearchParams();
    if (p > 1) qs.set('page', String(p));
    if (sec)   qs.set('section', sec);
    const s = qs.toString();
    return `/admin/${table}${s ? '?' + s : ''}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold font-mono">{table}</h2>
        <span className="text-xs text-gray-500">{total} rows</span>
      </div>

      {/* Section filter (pages table) */}
      {table === 'pages' && sections.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Link
            href={href(1)}
            className={`px-2.5 py-1 rounded text-xs border font-mono ${
              !section
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-gray-50 text-gray-600'
            }`}
          >
            all
          </Link>
          {sections.map((s) => (
            <Link
              key={s}
              href={href(1, s)}
              className={`px-2.5 py-1 rounded text-xs border font-mono ${
                section === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50 text-gray-600'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      {/* Data table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-mono font-semibold text-gray-500 w-8">
                #
              </th>
              {metaCols.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-mono font-semibold text-gray-500"
                >
                  {col}
                </th>
              ))}
              {hasData && (
                <th className="px-3 py-2 text-left font-mono font-semibold text-gray-500">
                  data (click to expand)
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={metaCols.length + (hasData ? 2 : 1)}
                  className="px-3 py-10 text-center text-gray-400"
                >
                  No rows
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const parsed = tryJson(row.data);
              const keys =
                parsed && typeof parsed === 'object'
                  ? Object.keys(parsed as object)
                  : [];

              return (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-blue-50/30 align-top"
                >
                  <td className="px-3 py-2 text-gray-400 tabular-nums">
                    {offset + i + 1}
                  </td>
                  {metaCols.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2 font-mono text-gray-800 max-w-[200px] truncate"
                      title={String(row[col] ?? '')}
                    >
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                  {hasData && (
                    <td className="px-3 py-2 max-w-[400px]">
                      {parsed ? (
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:underline select-none list-none flex items-center gap-1">
                            <span className="text-gray-400">▶</span>
                            <span className="font-mono">
                              {keys.slice(0, 5).join(', ')}
                              {keys.length > 5 ? ' …' : ''}
                            </span>
                          </summary>
                          <pre className="mt-2 bg-gray-50 border rounded p-2 text-xs overflow-auto max-h-72 whitespace-pre-wrap break-all text-gray-700">
                            {JSON.stringify(parsed, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={href(page - 1, section)}
              className="px-3 py-1.5 border rounded hover:bg-gray-100 text-gray-600"
            >
              ← Prev
            </Link>
          )}
          <span className="text-gray-500 text-xs">
            Page {page} of {totalPages} ({total} rows)
          </span>
          {page < totalPages && (
            <Link
              href={href(page + 1, section)}
              className="px-3 py-1.5 border rounded hover:bg-gray-100 text-gray-600"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
