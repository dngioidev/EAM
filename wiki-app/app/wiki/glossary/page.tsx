import type { Metadata } from 'next';
import { getEntry } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Glossary' };

interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
}

interface Glossary {
  meta: { title: string; last_updated: string };
  quick_facts: { total_terms: number; last_reviewed_sprint: string };
  content: { terms: GlossaryTerm[] };
}

const CATEGORY_STYLES: Record<string, string> = {
  business: 'bg-green-50 text-green-700 border-green-200',
  domain:   'bg-blue-50 text-blue-700 border-blue-200',
  technical: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function GlossaryPage() {
  const raw = getEntry('glossary', '_index');
  if (!raw) notFound();
  const data = raw as unknown as Glossary;
  const { meta, quick_facts: qf, content } = data;

  // Group terms by category
  const groups: Record<string, GlossaryTerm[]> = {};
  for (const term of content.terms) {
    const cat = term.category ?? 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(term);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        <span className="text-xs text-gray-400 shrink-0 ml-4">Updated {meta.last_updated}</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {qf.total_terms} terms · last reviewed sprint {qf.last_reviewed_sprint}
      </p>

      <div className="space-y-6">
        {Object.entries(groups).map(([category, terms]) => {
          const style = CATEGORY_STYLES[category] ?? 'bg-gray-50 text-gray-600 border-gray-200';
          return (
            <section key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wide rounded-full border px-2.5 py-0.5 ${style}`}>
                  {category}
                </span>
                <span className="text-xs text-gray-400">{terms.length} terms</span>
              </div>

              <div className="space-y-2">
                {terms.map((t) => (
                  <div key={t.term} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{t.term}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
