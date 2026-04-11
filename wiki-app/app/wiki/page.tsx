import type { Metadata } from 'next';
import { readWikiFile } from '@/lib/wiki';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard' };

interface Dashboard {
  meta: { title: string; last_updated: string };
  quick_facts: {
    sprint: string;
    sprint_goal: string;
    sprint_start: string;
    sprint_end: string;
  };
  content: {
    tldr: string;
    active_features: string[];
    open_bugs: number;
    sprint_notes: string;
  };
}

export default async function WikiDashboardPage() {
  const dashboard = await readWikiFile<Dashboard>('dashboard.json');
  const { meta, quick_facts: qf, content } = dashboard;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
      <p className="mt-1 text-sm text-gray-500">Updated {meta.last_updated}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Sprint" value={qf.sprint} />
        <StatCard label="Active Features" value={content.active_features.length} />
        <StatCard label="Open Bugs" value={content.open_bugs} />
        <StatCard label="End Date" value={qf.sprint_end} />
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Sprint Goal</h2>
        <p className="mt-1 text-gray-600">{qf.sprint_goal}</p>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Summary</h2>
        <p className="mt-1 text-gray-600">{content.tldr}</p>
      </div>

      {content.sprint_notes && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-800">Notes</h2>
          <p className="mt-1 text-amber-700">{content.sprint_notes}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
