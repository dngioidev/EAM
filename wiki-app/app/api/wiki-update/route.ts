import { NextResponse } from 'next/server';
import { patchWikiFile } from '@/lib/wiki';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { path?: string; patches?: Record<string, unknown> };
    const { path: wikiPath, patches } = body;

    if (!wikiPath || typeof wikiPath !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid path' }, { status: 400 });
    }
    if (!patches || typeof patches !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid patches' }, { status: 400 });
    }

    await patchWikiFile(wikiPath, patches);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
