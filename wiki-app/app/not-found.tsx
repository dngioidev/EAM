import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="rounded-lg border border-gray-200 bg-white px-8 py-10 max-w-md">
        <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/wiki"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
