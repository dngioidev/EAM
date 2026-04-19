'use client';

import Link from 'next/link';

export default function WikiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-8 py-10 max-w-md">
        <h2 className="text-lg font-bold text-amber-800 mb-2">Failed to load wiki page</h2>
        <p className="text-sm text-amber-700 mb-4">
          {error.message || 'Could not connect to the database or retrieve this section.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
          <Link
            href="/wiki"
            className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
