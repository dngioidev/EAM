import { getDb } from '@/lib/db';
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

export default function AdminPage() {
  const db = getDb();

  const stats = TABLES.map(({ name, icon }) => {
    try {
      const row = db
        .prepare(`SELECT COUNT(*) AS c FROM "${name}"`)
        .get() as { c: number };
      return { name, icon, count: row.c, error: false };
    } catch {
      return { name, icon, count: 0, error: true };
    }
  });

  const totalRows = stats.reduce((s, t) => s + t.count, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">
          {stats.length} tables · {totalRows} total rows
        </h2>
        <span className="text-xs text-gray-400 font-mono">wiki.db</span>
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
