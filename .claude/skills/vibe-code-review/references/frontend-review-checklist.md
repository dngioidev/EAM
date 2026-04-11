# Frontend Review Checklist

## React / TypeScript Specifics

### Types
- [ ] No `any` types (use `unknown` + type guard if needed)
- [ ] All component props have explicit TypeScript interfaces
- [ ] API response types come from generated `src/types/` — not manually rewritten
- [ ] Event handler types used: `React.ChangeEvent<HTMLInputElement>`, etc.

### Component Quality
- [ ] Components ≤ 300 lines
- [ ] Page components contain ONLY layout + data orchestration — no JSX logic blocks
- [ ] No inline functions in JSX that recreate on every render (extract `useCallback`)
- [ ] `key` prop is unique per list item (not array index unless list is immutable)
- [ ] No JSX spread of untrusted objects: `<div {...userInput} />` is forbidden

### State Management
- [ ] Server data uses React Query (not `useState` + `useEffect`)
- [ ] Global state uses Zustand correctly (not component state for global data)
- [ ] No derived state stored in state — compute from source
- [ ] No stale closure issues in `useEffect` dependencies

### Data Fetching
- [ ] React Query keys are specific (not just entity name — include filters)
- [ ] `useMutation` has `onError` handler — never silently fails
- [ ] `onSuccess` uses `queryClient.invalidateQueries` to refresh data
- [ ] Loading states handled (not showing stale/empty data while loading)
- [ ] Error states handled (error boundary or inline error UI)

### Accessibility
- [ ] Interactive elements are keyboard navigable (Tab + Enter/Space)
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages are associated to their field via `aria-describedby`
- [ ] Modals trap focus while open
- [ ] Images have `alt` text or `alt=""` if decorative

### Performance
- [ ] No unnecessary `React.memo` wrapping (adds complexity without benefit for simple components)
- [ ] Large lists use virtualization if >100 items
- [ ] Lazy-loaded route components: `lazy(() => import(...))`

### Testing
- [ ] Vitest + RTL tests for hooks with logic
- [ ] Playwright test exists for the user journey

---

## Common Frontend Rejections

| Issue | Outcome |
|-------|---------|
| `useState` + `useEffect` for data fetching | REQUEST CHANGES — Major |
| `any` TypeScript type | REQUEST CHANGES — Minor |
| No loading/error state handling | REQUEST CHANGES — Major |
| Array index as key for dynamic list | REQUEST CHANGES — Minor |
| Missing error boundary for critical route | REQUEST CHANGES — Major |
| No Playwright test for feature | REQUEST CHANGES — Major |
