import type { Metadata } from 'next';
import Link from 'next/link';
import { getEntry, listSection } from '@/lib/db';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { section: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: params.section };
}

interface EntryPreview {
  slug: string;
  title: string;
  tldr: string;
  status?: string;
  sprint?: string | number;
  owner?: string;
}

async function loadPreview(section: string, slug: string): Promise<EntryPreview> {
  try {
    // Load from DB
    const d: Record<string, unknown> | null = await getEntry(section, slug);
    if (!d) return { slug, title: slug, tldr: '' };
    const meta = d.meta as Record<string, unknown> | undefined;
    const content = d.content as Record<string, unknown> | undefined;
    const qf = d.quick_facts as Record<string, unknown> | undefined;
    const approval = d.approval as Record<string, unknown> | undefined;
    const overview = d.overview as Record<string, unknown> | undefined;

    const title =
      (meta?.title as string | undefined) ??
      (d.module as string | undefined) ??
      slug;

    // goal may be a plain string OR { statement, metric, deadline } — extract string safely
    const rawGoal = d.goal;
    const goalString =
      rawGoal !== null && typeof rawGoal === 'object' && !Array.isArray(rawGoal)
        ? ((rawGoal as Record<string, unknown>).statement as string | undefined)
        : (rawGoal as string | undefined);

    const tldr =
      (content?.tldr as string | undefined) ??
      (overview?.summary as string | undefined) ??
      goalString ??
      (qf?.sprint_goal as string | undefined) ??
      '';

    const status =
      (meta?.status as string | undefined) ??
      (qf?.status as string | undefined) ??
      (approval?.status as string | undefined) ??
      (d.status as string | undefined);

    const sprint =
      (qf?.sprint as string | number | undefined) ??
      (meta?.sprint as string | number | undefined);

    const owner = meta?.owner as string | undefined;

    return { slug, title, tldr, status, sprint, owner };
  } catch {
    return { slug, title: slug, tldr: '' };
  }
}

export default async function SectionPage({ params }: PageProps) {
  const { section } = params;

  // Load section metadata from DB (pages table stores _index for most sections).
  // Dedicated-table sections (features, bugs, history …) don't have _index in
  // pages — that's fine: we synthesise the title from the section name below.
  const rawIndex = await getEntry(section, '_index');
  const index: { meta?: { title?: string; description?: string } } = rawIndex ?? {};

  let slugs: string[] = [];
  try {
    slugs = await listSection(section);
  } catch {
    slugs = [];
  }

  // Load previews in parallel
  const previews = await Promise.all(slugs.map((slug) => loadPreview(section, slug)));

  const sectionTitle = (index.meta?.title as string | undefined) ??
    section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // For plan: split backlog items from sprint items for better UX
  const isPlan = section === 'plan';
  const sprintPreviews = isPlan ? previews.filter((p) => p.slug.startsWith('sprint')) : [];
  const otherPreviews  = isPlan ? previews.filter((p) => !p.slug.startsWith('sprint')) : previews;

  function EntryCard({ entry }: { entry: EntryPreview }) {
    return (
      <Link
        href={`/wiki/${section}/${entry.slug}`}
        className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {entry.title}
            </span>
            {entry.status && <StatusBadge status={entry.status} />}
            {entry.sprint !== undefined && (
              <span className="text-xs text-gray-400">Sprint {entry.sprint}</span>
            )}
          </div>
          {entry.tldr && (
            <p className="mt-0.5 text-xs text-gray-500 truncate">{entry.tldr}</p>
          )}
        </div>
        {entry.owner && (
          <span className="text-xs text-gray-300 font-mono shrink-0 hidden sm:inline mt-0.5">
            {entry.owner}
          </span>
        )}
        <span className="text-gray-300 shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors">&#8594;</span>
      </Link>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{sectionTitle}</h1>
      {index.meta?.description && (
        <p className="text-sm text-gray-500 mb-6">{index.meta.description}</p>
      )}

      {previews.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No entries yet.</p>
        </div>
      ) : isPlan ? (
        /* ── Plan section: Backlog + Sprints separated ── */
        <div className="mt-4 space-y-8">
          {otherPreviews.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Backlog
              </h2>
              <div className="space-y-2">
                {otherPreviews.map((entry) => <EntryCard key={entry.slug} entry={entry} />)}
              </div>
            </section>
          )}
          {sprintPreviews.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Sprints ({sprintPreviews.length})
              </h2>
              <div className="space-y-2">
                {sprintPreviews.map((entry) => <EntryCard key={entry.slug} entry={entry} />)}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ── Default flat list ── */
        <div className="mt-4 space-y-2">
          {otherPreviews.map((entry) => <EntryCard key={entry.slug} entry={entry} />)}
        </div>
      )}
    </div>
  );
}
