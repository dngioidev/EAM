export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗄</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SQLite Admin</h1>
            <p className="text-xs text-gray-500">wiki.db — browse migrated data</p>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-sm">
          <a href="/admin" className="text-blue-600 hover:underline font-medium">
            All Tables
          </a>
          <a href="/wiki" className="text-gray-400 hover:underline">
            ← Wiki
          </a>
        </div>
      </div>
      {children}
    </>
  );
}
