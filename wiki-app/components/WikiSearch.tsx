'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchEntry {
  section: string;
  slug: string;
  title: string;
  tldr: string;
}

export function WikiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data: SearchEntry[] = await res.json();
        setResults(data.slice(0, 8));
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function navigate(entry: SearchEntry) {
    setOpen(false);
    setQuery('');
    router.push(`/wiki/${entry.section}/${entry.slug}`);
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="search"
        placeholder="Search wiki…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        aria-label="Search wiki"
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
      />
      {loading && (
        <span className="absolute right-2.5 top-2 text-xs text-gray-400">…</span>
      )}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {results.map((entry) => (
            <li key={`${entry.section}/${entry.slug}`} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => navigate(entry)}
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                <span className="font-medium text-gray-900">{entry.title}</span>
                <span className="text-xs text-gray-400 capitalize">{entry.section}</span>
                {entry.tldr && (
                  <span className="mt-0.5 truncate text-xs text-gray-500">{entry.tldr}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && !loading && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 shadow-lg">
          No results for "{query}"
        </div>
      )}
    </div>
  );
}
