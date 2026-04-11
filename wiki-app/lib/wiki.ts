import fs from 'fs/promises';
import path from 'path';

const WIKI_ROOT = path.resolve(
  process.env.WIKI_PATH ?? path.join(process.cwd(), '../wiki')
);

function assertSafe(filePath: string): void {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(WIKI_ROOT + path.sep) && resolved !== WIKI_ROOT) {
    throw new Error('Path traversal detected');
  }
}

export async function readWikiFile<T = unknown>(relativePath: string): Promise<T> {
  const filePath = path.join(WIKI_ROOT, relativePath);
  assertSafe(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function listWikiFiles(section: string): Promise<string[]> {
  const sectionPath = path.join(WIKI_ROOT, section);
  assertSafe(sectionPath);
  const entries = await fs.readdir(sectionPath);
  return entries
    .filter((e) => e.endsWith('.json') && !e.startsWith('_'))
    .map((e) => e.replace('.json', ''));
}

export async function readSectionIndex(section: string): Promise<{ files: string[] }> {
  return readWikiFile<{ files: string[] }>(`${section}/_index.json`);
}

export async function listAllSections(): Promise<string[]> {
  const index = await readWikiFile<{ sections: Array<{ id: string }> }>('_index.json');
  return index.sections.map((s) => s.id);
}

/** Flat list of all searchable entries: { section, slug, title, tldr } */
export interface SearchEntry {
  section: string;
  slug: string;
  title: string;
  tldr: string;
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const sections = ['features', 'bugs', 'decisions', 'api-contracts', 'rulebook', 'techstack'];
  const results: SearchEntry[] = [];

  for (const section of sections) {
    try {
      const slugs = await listWikiFiles(section);
      for (const slug of slugs) {
        try {
          const entry = await readWikiFile<{
            meta?: { title?: string };
            content?: { tldr?: string };
          }>(`${section}/${slug}.json`);
          results.push({
            section,
            slug,
            title: entry.meta?.title ?? slug,
            tldr: entry.content?.tldr ?? '',
          });
        } catch {
          // skip unreadable entry
        }
      }
    } catch {
      // section may not exist yet
    }
  }
  return results;
}
