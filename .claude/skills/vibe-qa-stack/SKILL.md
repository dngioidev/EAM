---
name: vibe-qa-stack
description: |
  Layer 2 QA stack implementation patterns for V-Smart Ledger / EAM-Tax. Covers Vitest 1.x + React Testing Library + Playwright 1.x: config files, test fixtures, page object pattern, coverage setup, and CI integration. Activates alongside vibe-qa-general.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-qa-general) test strategy approval.
applyTo: "**"
---

# vibe-qa-stack

## Test Tooling Overview

| Layer | Tool | Config File |
|---|---|---|
| Unit (backend) | Jest + NestJS TestingModule | `jest.config.ts` |
| Unit (frontend) | Vitest + jsdom | `vitest.config.ts` |
| Component | React Testing Library | via Vitest |
| E2E | Playwright | `playwright.config.ts` |

## References

- [Playwright Config + Page Objects](references/playwright-setup.md)
- [Vitest Config](references/vitest-config.md)
- [NestJS Test Utils](references/nestjs-test-utils.md)
- [Coverage Setup](references/coverage-setup.md)
- [CI Test Pipeline](references/ci-test-pipeline.md)
