---
name: vibe-wiki-app-nextjs
description: |
  Layer 2 Wiki Viewer implementation patterns for V-Smart Ledger / EAM-Tax. Next.js 14.x App Router wiki viewer: reading JSON wiki files, search, dynamic routing for wiki entries, and sidebar navigation. Serves wiki/ folder content at port 3001.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-documentation) to verify wiki schema.
  STACK GUARD: Verify wiki/techstack/frontend.json → wiki = "Next.js 14.x App Router"
applyTo: "**"
---

# vibe-wiki-app-nextjs

## App Structure

```
wiki-app/
├── app/
│   ├── layout.tsx               # Root layout with sidebar
│   ├── page.tsx                 # Redirects to /wiki
│   └── wiki/
│       ├── page.tsx             # Wiki home (dashboard.json)
│       ├── [section]/
│       │   ├── page.tsx         # Section index (_index.json)
│       │   └── [slug]/
│       │       └── page.tsx     # Individual entry
├── components/
│   ├── WikiSidebar.tsx
│   ├── WikiSearch.tsx
│   └── JsonBlock.tsx            # Pretty-prints JSON with syntax highlighting
├── lib/
│   └── wiki.ts                  # JSON file reading utilities
└── public/
```

## References

- [JSON File Reading](references/json-reader.md)
- [App Router Pages](references/app-router-pages.md)
- [Search Implementation](references/wiki-search.md)
- [Sidebar Navigation](references/sidebar.md)
