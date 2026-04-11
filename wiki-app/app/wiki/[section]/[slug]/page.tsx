import type { Metadata } from 'next';
import Link from 'next/link';
import { readWikiFile } from '@/lib/wiki';
import { JsonBlock } from '@/components/JsonBlock';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { section: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const data = await readWikiFile<{ meta?: { title?: string } }>(
      `${params.section}/${params.slug}.json`
    );
    return { title: data.meta?.title ?? params.slug };
  } catch {
    return { title: params.slug };
  }
}

export default async function WikiEntryPage({ params }: PageProps) {
  const { section, slug } = params;

  let data: Record<string, unknown>;
  try {
    data = await readWikiFile<Record<string, unknown>>(`${section}/${slug}.json`);
  } catch {
    notFound();
  }

  const title = (data.meta as { title?: string } | undefined)?.title ?? slug;
  const lastUpdated = (data.meta as { last_updated?: string } | undefined)?.last_updated;

  return (
    <div>
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/wiki" className="hover:text-blue-600">
          Wiki
        </Link>
        {' / '}
        <Link href={`/wiki/${section}`} className="capitalize hover:text-blue-600">
          {section}
        </Link>
        {' / '}
        <span className="text-gray-800">{slug}</span>
      </nav>

      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {lastUpdated && (
          <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
        )}
      </div>

      <div className="mt-6">
        <JsonBlock data={data} />
      </div>
    </div>
  );
}
