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
│       ├── changelog/page.tsx        # Standalone: changelog.json timeline view
│       ├── glossary/page.tsx         # Standalone: glossary.json grouped by category
│       ├── onboarding/page.tsx       # Standalone: onboarding.json step-by-step guide
│       ├── [section]/
│       │   ├── page.tsx              # Section index — preview cards with title + tldr
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
│       ├── ApiContractView.tsx       # Endpoint table w/ method badges & schema
│       ├── WorkflowView.tsx          # WF-XXX step cards, triggers, failure paths
│       ├── RulebookView.tsx          # Rules table (id/rule/enforcer) or string list
│       ├── TechstackView.tsx         # Quick-facts grid, package table, service table
│       └── ImpactMapView.tsx         # Entity cards (registry) or actor cards (relations)
├── lib/
│   └── wiki.ts                       # Read / write / patch wiki JSON files
└── public/
```

## Section Routing

`app/wiki/[section]/[slug]/page.tsx` routes to the correct view based on `section`:

```tsx
section === 'features'          → <FeatureView>
section === 'api-contracts'     → <ApiContractView>
section === 'business-workflow' → <WorkflowView>
section === 'rulebook'          → <RulebookView>
section === 'techstack'         → <TechstackView>
section === 'impact-map'        → <ImpactMapView>
default                         → <JsonBlock>   // generic fallback
```

**Standalone pages** (root-level wiki JSON files, take priority over `[section]` dynamic route):
- `/wiki/glossary` → `app/wiki/glossary/page.tsx` → reads `wiki/glossary.json`
- `/wiki/onboarding` → `app/wiki/onboarding/page.tsx` → reads `wiki/onboarding.json`
- `/wiki/changelog` → `app/wiki/changelog/page.tsx` → reads `wiki/changelog.json`

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

## WorkflowView (`business-workflow` section)

Handles dual schema — workflows can be at `content.workflows` OR top-level `workflows`:
```tsx
const workflows = (data.workflows ?? data.content?.workflows) as WorkflowEntry[];
```
Each `WorkflowEntry` renders: ID badge, trigger/actor row, collapsible preconditions,
numbered steps (string[] OR `{step, actor, action, result}[]`), atomicity box, success outcome,
collapsible failure paths (`{condition, response}[]` OR string[]), postconditions, legal note.

## RulebookView (`rulebook` section)

Handles three content shapes automatically:
- `content.rules: {id, rule, enforcer}[]` → sortable table with ID badges
- `content.rules: string[]` → numbered list
- `content.{sectionName}: string[]` → sub-section per key (coding-standards style)
- `content.decisions: {category, chosen, reason}[]` → decision cards
- `content.port_exposure_policy` → port table with exposed/internal split

## TechstackView (`techstack` section)

- `quick_facts` → stat grid (backend/frontend/infrastructure variants)
- `content.key_packages` → package/version/purpose table
- `content.services` → service/image/port/purpose table (infrastructure)
- `content.volumes`, `content.networks` → inline tables
- `content.project_structure` → dark-background code block
- `content.port`, `content.api_prefix` → highlighted stat boxes

## ImpactMapView (`impact-map` section)

Two shapes detected automatically:
- Entity registry (`content.entities` present): entity cards with table name, key fields, relations chips, state machine badge
- Relations file (`goal` at top level): goal/metric/deadline banner, actor cards with impact + deliverables, affected entities, out-of-scope list

## Standalone Pages

| Route | File | Source |
|---|---|---|
| `/wiki/glossary` | `app/wiki/glossary/page.tsx` | `wiki/glossary.json` — terms grouped by category |
| `/wiki/onboarding` | `app/wiki/onboarding/page.tsx` | `wiki/onboarding.json` — setup steps with code blocks |
| `/wiki/changelog` | `app/wiki/changelog/page.tsx` | `wiki/changelog.json` — version timeline |

Static routes take priority over `[section]` dynamic route in Next.js App Router.

## Section Index Improvement

`app/wiki/[section]/page.tsx` now loads preview data for every entry in parallel:
```tsx
const previews = await Promise.all(slugs.map((slug) => loadPreview(section, slug)));
```
Each card shows: title, status badge, sprint, tldr preview, owner. Falls back gracefully to slug text.

## Rules

- All views receive `data: Record<string, unknown>` — cast internally (no `any` in page.tsx)
- Always use `export const dynamic = 'force-dynamic'` on pages that can be mutated
- `AdminActions` hides buttons that would re-apply the current status (idempotent)
- `patchWikiFile` is only called server-side (in the API route) — never expose the fs module to the client

## MANDATORY: Build + Type-Check Before Marking Done

**Never mark wiki-app work complete without running these two commands and getting zero errors:**

```bash
cd wiki-app
npm run type-check   # tsc --noEmit — must exit 0
npm run build        # next build — must show "Compiled successfully"
```

### Common type errors to watch for

| Error | Cause | Fix |
|---|---|---|
| `TS1501: regex flag /s only available for ES2018+` | `tsconfig.json` targets `ES2017` | Remove `/s` flag — business rule strings are single-line |
| `TS2322` prop mismatch | Server component passing `data as any` to typed view | View must accept `Record<string, unknown>` and cast internally |
| `TS2339` property does not exist | Accessing `.meta.title` directly on unknown | Use optional chaining with `as` cast |
| `TS2322: Type 'unknown' is not assignable to type 'ReactNode'` | `@types/react@18.3` removed `{}` from `ReactNode` — arbitrary objects and `unknown` are no longer valid JSX children | Replace `{someRecord && <JSX>}` with `{someRecord != null && <JSX>}` — the `!= null` check coerces to `boolean`, removing `Record<string,unknown>` from the `&&` expression type |

### Why this rule exists

The previous session (2026-04-12) shipped `FeatureView` and `ApiContractView` without running `type-check` or `build`. Two type errors were present at delivery:
- Both files used the `/s` regex dotAll flag which is invalid at `target: ES2017`
- The build would have failed in any CI or Docker context

The wiki-app runs in Docker. A build that compiles locally but ships broken is worse than not shipping. **Type-check + build are the minimum bar for "done" on wiki-app changes.**

## References

- [JSON File Reading / Writing](references/json-reader.md)
- [App Router Pages](references/app-router-pages.md)
- [Search Implementation](references/wiki-search.md)
- [Sidebar Navigation](references/sidebar.md)
