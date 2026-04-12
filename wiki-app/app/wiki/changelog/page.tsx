import type { Metadata } from 'next';
import { StatusBadge } from '@/components/StatusBadge';
import { readWikiFile } from '@/lib/wiki';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Changelog' };

interface ChangeEntry {
  version: string;
  date: string;
  sprint?: string;
  tags?: string[];
  summary: string;
  features_added?: string[];
  bugs_fixed?: string[];
  breaking_changes?: string[];
  notes?: string;
}

interface Changelog {
  meta: { title: string; last_updated: string };
  quick_facts: { current_version: string; total_entries: number };
  content: { entries: ChangeEntry[] };
}

const TAG_STYLES: Record<string, string> = {
  backend:    'bg-blue-50 text-blue-700',
  frontend:   'bg-purple-50 text-purple-700',
  auth:       'bg-amber-50 text-amber-700',
  docker:     'bg-cyan-50 text-cyan-700',
  wiki:       'bg-gray-100 text-gray-600',
  'wiki-app': 'bg-gray-100 text-gray-600',
  ux:         'bg-pink-50 text-pink-700',
  admin:      'bg-orange-50 text-orange-700',
  security:   'bg-red-50 text-red-700',
  tests:      'bg-green-50 text-green-700',
};

function TagBadge({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] ?? 'bg-gray-50 text-gray-500';
  return (
    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${style}`}>{tag}</span>
  );
}

export default async function ChangelogPage() {
  const data = await readWikiFile<Changelog>('changelog.json');
  const { meta, quick_facts: qf, content } = data;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        <span className="text-xs text-gray-400 shrink-0 ml-4">Updated {meta.last_updated}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-500">{qf.total_entries} entries</span>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-semibold text-gray-700">Current: v{qf.current_version}</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true" />

        <div className="space-y-6 pl-10">
          {content.entries.map((entry) => (
            <article key={entry.version} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[26px] top-3.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />

              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 flex-wrap">
                  <span className="font-mono font-bold text-gray-900 text-sm">v{entry.version}</span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                  {entry.sprint && (
                    <span className="text-xs text-gray-400">Sprint {entry.sprint}</span>
                  )}
                  {entry.tags && entry.tags.map((t) => <TagBadge key={t} tag={t} />)}
                </div>

                <div className="px-4 py-3 space-y-3">
                  {/* Summary */}
                  <p className="text-sm text-gray-700">{entry.summary}</p>

                  {/* Features added */}
                  {entry.features_added && entry.features_added.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1.5">
                        Features Added ({entry.features_added.length})
                      </p>
                      <ul className="space-y-1">
                        {entry.features_added.map((f, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-green-500 shrink-0">+</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bugs fixed */}
                  {entry.bugs_fixed && entry.bugs_fixed.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1.5">
                        Bugs Fixed ({entry.bugs_fixed.length})
                      </p>
                      <ul className="space-y-1">
                        {entry.bugs_fixed.map((f, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-blue-400 shrink-0">&#10003;</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Breaking changes */}
                  {entry.breaking_changes && entry.breaking_changes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1.5">
                        Breaking Changes
                      </p>
                      <ul className="space-y-1">
                        {entry.breaking_changes.map((bc, i) => (
                          <li key={i} className="flex gap-2 text-sm text-red-700">
                            <span className="text-red-500 shrink-0">!</span>
                            {bc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <p className="text-xs text-gray-400 italic">{entry.notes}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
