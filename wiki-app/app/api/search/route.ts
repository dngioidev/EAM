import { NextResponse } from 'next/server';
import { searchWiki } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  if (!query) {
    return NextResponse.json([]);
  }

  const results = await searchWiki(query);
  return NextResponse.json(results);
}
