# App Router Pages

## Root Layout

```tsx
// wiki-app/app/layout.tsx
import type { Metadata } from 'next';
import { WikiSidebar } from '@/components/WikiSidebar';

export const metadata: Metadata = {
  title: 'EAM Wiki',
  description: 'Project knowledge base',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen bg-gray-50">
        <WikiSidebar />
        <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
```

## Wiki Dashboard Page

```tsx
// wiki-app/app/wiki/page.tsx
import { readWikiFile } from '@/lib/wiki';

interface DashboardData {
  meta: { title: string; last_updated: string };
  quick_facts: { sprint: string; active_features: number; open_bugs: number };
}

export default async function WikiDashboard() {
  const dashboard = await readWikiFile<DashboardData>('dashboard.json');

  return (
    <div>
      <h1 className="text-2xl font-bold">{dashboard.meta.title}</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatCard label="Sprint" value={dashboard.quick_facts.sprint} />
        <StatCard label="Active Features" value={dashboard.quick_facts.active_features} />
        <StatCard label="Open Bugs" value={dashboard.quick_facts.open_bugs} />
      </div>
    </div>
  );
}
```

## Dynamic Section Page

```tsx
// wiki-app/app/wiki/[section]/[slug]/page.tsx
import { readWikiFile } from '@/lib/wiki';
import { notFound } from 'next/navigation';
import { JsonBlock } from '@/components/JsonBlock';

interface PageProps {
  params: { section: string; slug: string };
}

export default async function WikiEntryPage({ params }: PageProps) {
  try {
    const data = await readWikiFile(`${params.section}/${params.slug}.json`);
    return (
      <div>
        <nav className="text-sm text-gray-500 mb-4">
          Wiki / {params.section} / {params.slug}
        </nav>
        <JsonBlock data={data} />
      </div>
    );
  } catch {
    notFound();
  }
}
```
