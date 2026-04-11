import type { Metadata } from 'next';
import Link from 'next/link';
import { readWikiFile, listWikiFiles } from '@/lib/wiki';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { section: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: params.section };
}

export default async function SectionPage({ params }: PageProps) {
  const { section } = params;

  let index: { meta?: { title?: string }; files?: string[] } = {};
  try {
    index = await readWikiFile(`${section}/_index.json`);
  } catch {
    notFound();
  }

  let slugs: string[] = [];
  try {
    slugs = await listWikiFiles(section);
  } catch {
    slugs = index.files ?? [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold capitalize text-gray-900">
        {index.meta?.title ?? section}
      </h1>

      {slugs.length === 0 ? (
        <p className="mt-6 text-gray-500">No entries yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {slugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/wiki/${section}/${slug}`}
                className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
