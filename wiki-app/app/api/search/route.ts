import { NextResponse } from 'next/server';
import { buildSearchIndex } from '@/lib/wiki';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  const index = await buildSearchIndex();

  if (!query) {
    return NextResponse.json(index);
  }

  const lower = query.toLowerCase();
  const results = index.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lower) ||
      entry.tldr.toLowerCase().includes(lower) ||
      entry.slug.toLowerCase().includes(lower)
  );

  return NextResponse.json(results);
}
