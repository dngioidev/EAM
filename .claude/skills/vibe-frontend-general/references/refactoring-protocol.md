# Refactoring Protocol (Frontend)

## Same principles as Backend Refactoring. Frontend specifics below.

## When Frontend Refactoring Is Allowed

- Component has >300 lines — must be split
- A hook fetches data AND manages complex local state — separate them
- A page component contains business logic — extract to hook or feature component
- A component is duplicated in 2+ places — extract to `src/components/`
- `useEffect` is being used for data fetching — migrate to React Query

---

## Component Split Protocol

1. Identify the largest "zone" in the component
2. Extract it to a named component file with clear props interface
3. Run `npm run typecheck` — zero errors required
4. Run `npm run test` — no regressions
5. Commit: `refactor(ui): extract {ComponentName} from {ParentComponent}`

---

## Hook Migration Protocol

When converting `useEffect` + `useState` data fetching to React Query:

1. Identify all state variables that hold server data
2. Write the React Query `useQuery` hook equivalent
3. Remove the `useEffect` + `useState`
4. Map loading states: `isLoading` → was `loading === true`
5. Map error states: `error` → was `error !== null`
6. Verify component renders correctly in all states

---

## CSS Refactoring Protocol

When cleaning up Tailwind classes:
1. Never remove classes without visually verifying the component
2. Extract repeated class groups to `@apply` in component CSS module ONLY if used 3+ times
3. Prefer Tailwind `cn()` utility for conditional class merging
4. Never convert Tailwind to inline styles

---

## What NOT to Refactor Frontend

- Auto-generated files in `src/types/` — regenerate with `npm run generate:types`
- The React Query client setup — only vibe-frontend-react can touch this
- Route configuration — only vibe-frontend-react
- Auth store — security-sensitive, requires `vibe-security-general` review
