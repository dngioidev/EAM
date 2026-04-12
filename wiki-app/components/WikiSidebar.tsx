'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WikiSearch } from './WikiSearch';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', href: '/wiki', icon: '📊' },
  { id: 'features', label: 'Features', href: '/wiki/features', icon: '✨' },
  { id: 'bugs', label: 'Bugs', href: '/wiki/bugs', icon: '🐛' },
  { id: 'decisions', label: 'Decisions (ADR)', href: '/wiki/decisions', icon: '⚖️' },
  { id: 'api-contracts', label: 'API Contracts', href: '/wiki/api-contracts', icon: '📋' },
  { id: 'business-workflow', label: 'Workflows', href: '/wiki/business-workflow', icon: '🔄' },
  { id: 'design', label: 'Design', href: '/wiki/design', icon: '🎨' },
  { id: 'impact-map', label: 'Impact Map', href: '/wiki/impact-map', icon: '🗺️' },
  { id: 'test-cases', label: 'Test Cases', href: '/wiki/test-cases', icon: '✅' },
  { id: 'rulebook', label: 'Rulebook', href: '/wiki/rulebook', icon: '📏' },
  { id: 'techstack', label: 'Tech Stack', href: '/wiki/techstack', icon: '🛠️' },
  { id: 'plan', label: 'Plan / Backlog', href: '/wiki/plan', icon: '📅' },
  { id: 'onboarding', label: 'Onboarding', href: '/wiki/onboarding', icon: '👋' },
  { id: 'glossary', label: 'Glossary', href: '/wiki/glossary', icon: '📖' },
  { id: 'changelog', label: 'Changelog', href: '/wiki/changelog', icon: '📝' },
  { id: 'history', label: 'History', href: '/wiki/history', icon: '🕓' },
];

export function WikiSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/wiki" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <div>
            <p className="text-sm font-bold text-gray-900">V-Smart Ledger</p>
            <p className="text-xs text-gray-400">Project Wiki</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-100">
        <WikiSearch />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {SECTIONS.map((section) => {
            const isActive =
              section.href === '/wiki'
                ? pathname === '/wiki'
                : pathname === section.href || pathname.startsWith(section.href + '/');

            return (
              <li key={section.id}>
                <Link
                  href={section.href}
                  className={[
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')}
                >
                  <span className="text-base leading-none">{section.icon}</span>
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3 space-y-1">
        <a
          href="/admin"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <span>🗄</span>
          <span>SQLite Admin</span>
        </a>
        <p className="text-xs text-gray-400">EAM-Tax © 2025</p>
      </div>
    </aside>
  );
}
