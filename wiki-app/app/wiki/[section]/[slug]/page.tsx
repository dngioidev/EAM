import type { Metadata } from 'next';
import Link from 'next/link';
import { readWikiFile } from '@/lib/wiki';
import { JsonBlock } from '@/components/JsonBlock';
import { FeatureView } from '@/components/views/FeatureView';
import { ApiContractView } from '@/components/views/ApiContractView';
import { WorkflowView } from '@/components/views/WorkflowView';
import { RulebookView } from '@/components/views/RulebookView';
import { TechstackView } from '@/components/views/TechstackView';
import { ImpactMapView } from '@/components/views/ImpactMapView';
import { HistoryView } from '@/components/views/HistoryView';
import { PlanView } from '@/components/views/PlanView';
import { DesignView } from '@/components/views/DesignView';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { section: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const data = await readWikiFile<Record<string, unknown>>(
      `${params.section}/${params.slug}.json`
    );
    const title = resolveTitle(data, params.slug);
    return { title };
  } catch {
    return { title: params.slug };
  }
}

function resolveTitle(data: Record<string, unknown>, fallback: string): string {
  const meta = data.meta as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;
  return (
    (meta?.title as string | undefined) ??
    (content?.title as string | undefined) ??
    (data.module as string | undefined) ??
    fallback
  );
}

function resolveLastUpdated(data: Record<string, unknown>): string | undefined {
  const meta = data.meta as Record<string, unknown> | undefined;
  return (meta?.last_updated as string | undefined) ?? (data.updatedAt as string | undefined);
}

export default async function WikiEntryPage({ params }: PageProps) {
  const { section, slug } = params;

  let data: Record<string, unknown>;
  try {
    data = await readWikiFile<Record<string, unknown>>(`${section}/${slug}.json`);
  } catch {
    notFound();
  }

  const title = resolveTitle(data, slug);
  const lastUpdated = resolveLastUpdated(data);

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-gray-400">
        <Link href="/wiki" className="hover:text-blue-600 transition-colors">Wiki</Link>
        <span>/</span>
        <Link href={`/wiki/${section}`} className="capitalize hover:text-blue-600 transition-colors">
          {section.replace(/-/g, ' ')}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{title}</span>
      </nav>

      {/* ── Page title ── */}
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {lastUpdated && (
          <span className="text-xs text-gray-400 shrink-0 ml-4">Updated {lastUpdated}</span>
        )}
      </div>

      {/* ── Section-specific view ── */}
      {section === 'features' ? (
        <FeatureView data={data} section={section} slug={slug} />
      ) : section === 'api-contracts' ? (
        <ApiContractView data={data} section={section} slug={slug} />
      ) : section === 'business-workflow' ? (
        <WorkflowView data={data} section={section} slug={slug} />
      ) : section === 'rulebook' ? (
        <RulebookView data={data} section={section} slug={slug} />
      ) : section === 'techstack' ? (
        <TechstackView data={data} section={section} slug={slug} />
      ) : section === 'impact-map' ? (
        <ImpactMapView data={data} section={section} slug={slug} />
      ) : section === 'history' ? (
        <HistoryView data={data} section={section} slug={slug} />
      ) : section === 'plan' ? (
        <PlanView data={data} section={section} slug={slug} />
      ) : section === 'design' ? (
        <DesignView data={data} section={section} slug={slug} />
      ) : (
        <JsonBlock data={data} />
      )}
    </div>
  );
}
