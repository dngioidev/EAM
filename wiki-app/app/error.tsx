'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="rounded-lg border border-red-200 bg-red-50 px-8 py-10 max-w-md">
        <h2 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-red-600 mb-4">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
