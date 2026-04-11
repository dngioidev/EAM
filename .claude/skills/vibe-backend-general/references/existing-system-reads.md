# Existing System Reads (Backend)

## When to Use This Guide

Run through this read checklist BEFORE modifying any existing backend module. This prevents overwriting existing patterns, breaking existing contracts, and ignoring established decisions.

---

## Tier 1 (Bug Fix) — Minimal Reads

1. `wiki/bugs/{date}-{slug}.json` — understand the exact failure
2. `src/modules/{affected-module}/{affected-file}.ts` — read the broken file
3. The relevant test file — understand what was supposed to happen

**Stop**: implement fix, write test, verify build passes.

---

## Tier 2 (Extend Existing Feature) — Targeted Reads

1. `wiki/features/{feature-id}.json` — AC and business rules
2. `wiki/api-contracts/{module}.json` — existing contract
3. `src/modules/{module}/` — all 5 files: controller, service, module, dto/, entity/
4. `src/modules/{module}/{module}.spec.ts` — existing test patterns
5. Check for `wiki/decisions/` entries with `affects: ["{module}"]`

**Stop**: implement, test, wiki-update.

---

## Tier 3 (New Feature) — Comprehensive Reads

1. `wiki/features/{feature-id}.json` — complete read
2. `wiki/api-contracts/{module}.json` — complete read
3. `wiki/rulebook/coding-standards.json` — complete read
4. `wiki/techstack/backend.json` — check versions and approved libraries
5. `wiki/decisions/` — any recent decisions affecting new modules
6. `src/app.module.ts` — understand what modules are already wired
7. `src/common/` — read all guards, decorators, middleware already in place

**Stop**: design module structure, implement, test, wiki-update.

---

## Module Anatomy Check

When reading an existing module, always note:

- [ ] What entities does it own?
- [ ] What events does it emit?
- [ ] What external services does it call?
- [ ] What auth guards are applied?
- [ ] What cache keys does it use (check for Redis calls)?
- [ ] What migrations belong to it?

This prevents gaps when implementing related features.

---

## Common Mistakes to Avoid

- Reading only the service, missing the DTO validation — causes duplicate logic
- Reading only the controller, missing the entity — causes schema conflicts
- Reading features but not decisions — causes consistency violations
- Not checking `src/common/exceptions/` — leads to non-standard error formats
