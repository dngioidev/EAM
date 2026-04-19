'use client';

import { useState, useEffect } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 bg-white border-b border-gray-200 px-4 h-12">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/wiki" className="text-sm font-bold text-gray-900">EAM Wiki</Link>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'w-64 shrink-0 border-r border-gray-200 bg-white min-h-screen flex flex-col',
          'fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/wiki" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-sm font-bold text-gray-900">EAM</p>
              <p className="text-xs text-gray-400">Project Wiki</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
        <div className="border-t border-gray-100 px-4 py-3 space-y-1.5">
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <span>🗄</span>
            <span>DB Admin</span>
          </a>
          <a
            href="http://localhost:5050"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <span>🐘</span>
            <span>pgAdmin</span>
          </a>
          <p className="text-xs text-gray-400 pt-1">EAM © 2026</p>
        </div>
      </aside>
    </>
  );
}
