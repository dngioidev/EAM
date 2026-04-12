import type { Metadata } from 'next';
import Link from 'next/link';
import { readWikiFile, listWikiFiles } from '@/lib/wiki';
import { StatusBadge } from '@/components/StatusBadge';
import { notFound } from 'next/navigation';

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
    const d = await readWikiFile<Record<string, unknown>>(`${section}/${slug}.json`);
    const meta = d.meta as Record<string, unknown> | undefined;
    const content = d.content as Record<string, unknown> | undefined;
    const qf = d.quick_facts as Record<string, unknown> | undefined;
    const approval = d.approval as Record<string, unknown> | undefined;
    const overview = d.overview as Record<string, unknown> | undefined;

    const title =
      (meta?.title as string | undefined) ??
      (d.module as string | undefined) ??
      slug;

    const tldr =
      (content?.tldr as string | undefined) ??
      (overview?.summary as string | undefined) ??
      (d.goal as string | undefined) ??
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

  let index: { meta?: { title?: string; description?: string } } = {};
  try {
    index = await readWikiFile(`${section}/_index.json`);
  } catch {
    notFound();
  }

  let slugs: string[] = [];
  try {
    slugs = await listWikiFiles(section);
  } catch {
    slugs = [];
  }

  // Load previews in parallel
  const previews = await Promise.all(slugs.map((slug) => loadPreview(section, slug)));

  const sectionTitle = (index.meta?.title as string | undefined) ??
    section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
      ) : (
        <div className="mt-4 space-y-2">
          {previews.map((entry) => (
            <Link
              key={entry.slug}
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
          ))}
        </div>
      )}
    </div>
  );
}
