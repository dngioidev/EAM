import { getPool } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const TABLES = [
  { name: 'features',      icon: '✨' },
  { name: 'bugs',          icon: '🐛' },
  { name: 'decisions',     icon: '⚖️' },
  { name: 'api_contracts', icon: '📋' },
  { name: 'changelog',     icon: '📝' },
  { name: 'dashboard',     icon: '📊' },
  { name: 'history',       icon: '🕓' },
  { name: 'sprints',       icon: '📅' },
  { name: 'pages',         icon: '📄' },
];

export default async function AdminPage() {
  const pool = getPool();

  const stats = await Promise.all(
    TABLES.map(async ({ name, icon }) => {
      try {
        const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM wiki.${name}`);
        return { name, icon, count: rows[0].c as number, error: false };
      } catch {
        return { name, icon, count: 0, error: true };
      }
    })
  );

  const totalRows = stats.reduce((s, t) => s + t.count, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">
          {stats.length} tables · {totalRows} total rows
        </h2>
        <span className="text-xs text-gray-400 font-mono">PostgreSQL wiki.*</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ name, icon, count, error }) => (
          <Link
            key={name}
            href={`/admin/${name}`}
            className="block p-5 border rounded-xl hover:border-blue-400 hover:shadow-sm transition-all bg-white group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{icon}</span>
              <span className="font-mono text-sm text-gray-600 group-hover:text-gray-900">
                {name}
              </span>
            </div>
            <div
              className={`text-3xl font-bold tabular-nums ${
                error ? 'text-red-500' : 'text-blue-600'
              }`}
            >
              {error ? 'ERR' : count}
            </div>
            <div className="text-xs text-gray-400 mt-1">rows</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
