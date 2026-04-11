---
name: vibe-wiki-app-nextjs
description: |
  Layer 2 Wiki Viewer implementation patterns for V-Smart Ledger / EAM-Tax. Next.js 14.x App Router wiki viewer: reading JSON wiki files, human-friendly section views, admin actions (approve/reject), search, dynamic routing, and sidebar navigation. Serves wiki/ folder content at port 3001.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-documentation) to verify wiki schema.
  STACK GUARD: Verify wiki/techstack/frontend.json → wiki = "Next.js 14.x App Router"
applyTo: "**"
---

# vibe-wiki-app-nextjs

## App Structure

```
wiki-app/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Redirects to /wiki
│   ├── api/
│   │   ├── search/route.ts           # Full-text search over wiki entries
│   │   └── wiki-update/route.ts      # POST: patch a wiki JSON file (admin actions)
│   └── wiki/
│       ├── page.tsx                  # Wiki home (dashboard.json)
│       ├── [section]/
│       │   ├── page.tsx              # Section index (_index.json)
│       │   └── [slug]/
│       │       └── page.tsx          # Entry — routes to specialized view or JsonBlock
├── components/
│   ├── WikiSidebar.tsx               # Nav sidebar
│   ├── WikiSearch.tsx                # Client search w/ Fuse.js
│   ├── JsonBlock.tsx                 # Generic JSON renderer (fallback)
│   ├── StatusBadge.tsx               # Coloured status pill (approved/rejected/planning/…)
│   ├── AdminActions.tsx              # Client: Approve/Reject/Accept/Resolve buttons
│   └── views/
│       ├── FeatureView.tsx           # Human-friendly feature page (stories, RBAC, audit)
│       └── ApiContractView.tsx       # Endpoint table w/ method badges & schema
├── lib/
│   └── wiki.ts                       # Read / write / patch wiki JSON files
└── public/
```

## Section Routing

`app/wiki/[section]/[slug]/page.tsx` routes to the correct view based on `section`:

```tsx
section === 'features'      → <FeatureView>
section === 'api-contracts' → <ApiContractView>
default                     → <JsonBlock>   // generic fallback
```

Add a new specialized view:
1. Create `components/views/YourView.tsx` — accepts `data: Record<string, unknown>`, `section`, `slug`
2. Add the import + `section === 'your-section'` branch in `[slug]/page.tsx`

## Admin Actions

Admin buttons live in `components/AdminActions.tsx` (client component).
Server-side patch is handled by `app/api/wiki-update/route.ts` → calls `patchWikiFile()`.

### Supported entity types

| entityType | Buttons | What it patches |
|---|---|---|
| `feature` | Approve / Reject | `approval.status`, `meta.status`, `approval.approved_at` |
| `api-contract` | Approve / Reject | `status`, `updatedAt` |
| `decision` | Accept / Reject | `status`, `decided_at` |
| `bug` | Resolve / Won't Fix | `status`, `resolved_at` |

### Usage in a view component

```tsx
import { AdminActions } from '@/components/AdminActions';

// Inside your view:
<AdminActions
  section={section}       // e.g. "features"
  slug={slug}             // e.g. "auth"
  entityType="feature"
  currentStatus={data.approval?.status ?? data.meta?.status}
/>
```

After the user clicks, `AdminActions` POSTs to `/api/wiki-update`, which:
1. Deep-merges the patches into the JSON file
2. Auto-sets `meta.last_updated` / `updatedAt` to today
3. Returns `{ ok: true }`
Then calls `router.refresh()` to re-run the server component and show the updated state.

## StatusBadge

```tsx
import { StatusBadge } from '@/components/StatusBadge';

<StatusBadge status="approved" />   // green pill
<StatusBadge status="rejected" />   // red pill
<StatusBadge status="planning" />   // blue pill
```

Recognized values: `approved`, `accepted`, `passing`, `active`, `done`, `resolved`,
`planning`, `proposed`, `backlog`, `in-progress`, `decided`, `deferred`, `blocked`,
`rejected`, `failing`, `wont-fix`, `inactive`, `not-started`.

## Wiki File Read/Write

```typescript
// lib/wiki.ts

// Read
const data = await readWikiFile<MyType>('features/auth.json');

// Write (full overwrite)
await writeWikiFile('features/auth.json', updatedData);

// Patch (deep-merge + auto-set last_updated)
await patchWikiFile('features/auth.json', {
  meta: { status: 'approved' },
  approval: { status: 'approved', approved_at: '2026-04-12' },
});
```

`patchWikiFile` does a deep merge: nested objects are merged, arrays and primitives are replaced.

## FeatureView Sections

`FeatureView` detects the section `heading` to pick the right renderer:

| heading | Renderer |
|---|---|
| `"Actors"` | Role/capability table |
| `"User Stories"` | Collapsible `<details>` cards with ACs, edge cases, BRs |
| contains `"Business Rule"` | ID + description list |
| `"RBAC Matrix"` | Role permission grid |
| `"Open Questions"` | Status-coloured question cards |
| anything else with `items` | Generic bullet list |

## ApiContractView

- Shows module, version, status badge, baseUrl
- Business rules rendered as `BR-XXX + description` list
- Each endpoint is a collapsible `<details>` card:
  - Method badge (colour-coded), path, summary, auth badge
  - Expands to: path/query params table, request body schema table, response codes

## Rules

- All views receive `data: Record<string, unknown>` — cast internally (no `any` in page.tsx)
- Always use `export const dynamic = 'force-dynamic'` on pages that can be mutated
- `AdminActions` hides buttons that would re-apply the current status (idempotent)
- `patchWikiFile` is only called server-side (in the API route) — never expose the fs module to the client

## References

- [JSON File Reading / Writing](references/json-reader.md)
- [App Router Pages](references/app-router-pages.md)
- [Search Implementation](references/wiki-search.md)
- [Sidebar Navigation](references/sidebar.md)
