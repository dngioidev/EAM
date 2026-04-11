# JSON File Reading

## Wiki File Reader

```typescript
// wiki-app/lib/wiki.ts
import fs from 'fs/promises';
import path from 'path';

const WIKI_ROOT = process.env.WIKI_PATH ?? path.resolve(process.cwd(), '../wiki');

export async function readWikiFile<T>(relativePath: string): Promise<T> {
  const filePath = path.join(WIKI_ROOT, relativePath);
  
  // Security: ensure path is inside wiki root
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(WIKI_ROOT))) {
    throw new Error('Path traversal detected');
  }
  
  const content = await fs.readFile(resolvedPath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function listWikiFiles(section: string): Promise<string[]> {
  const sectionPath = path.join(WIKI_ROOT, section);
  const entries = await fs.readdir(sectionPath);
  return entries
    .filter(e => e.endsWith('.json') && e !== '_index.json')
    .map(e => e.replace('.json', ''));
}

export async function readSectionIndex(section: string): Promise<SectionIndex> {
  return readWikiFile(`${section}/_index.json`);
}
```

## Wiki File Writer

```typescript
// wiki-app/lib/wiki.ts

// Full overwrite
export async function writeWikiFile(relativePath: string, data: unknown): Promise<void>

// Deep-merge patch — also auto-sets meta.last_updated / updatedAt to today
export async function patchWikiFile(
  relativePath: string,
  patches: Record<string, unknown>
): Promise<void>
```

Called only from `app/api/wiki-update/route.ts` (server-side). Never call from client components.

## Environment Variables

```env
# wiki-app/.env.local
WIKI_PATH=/wiki   # Inside Docker: mounted at /wiki
PORT=3001
```

## Next.js Static Generation (Optional)

For production, pre-render all wiki pages at build time:

```typescript
// app/wiki/[section]/[slug]/page.tsx
export async function generateStaticParams() {
  const sections = ['features', 'bugs', 'decisions', 'api-contracts'];
  const params: Array<{ section: string; slug: string }> = [];
  
  for (const section of sections) {
    const slugs = await listWikiFiles(section);
    slugs.forEach(slug => params.push({ section, slug }));
  }
  
  return params;
}
```
