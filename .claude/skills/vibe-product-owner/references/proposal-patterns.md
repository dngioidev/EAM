# Proposal Patterns (PO)

## What Makes a Strong Proposal

A proposal ready for PO approval must have all of these:

| Field | Must Have |
|-------|-----------|
| `meta.id` | Unique kebab-case, no conflicts with `_index.json` |
| `quick_facts.one_line` | ≤ 15 words, no jargon |
| `content.summary` | 1 paragraph, Vietnamese business context first |
| User stories | ≥ 1 story, all with acceptance criteria |
| Business rules | At least 1 explicit rule (not assumed) |
| `meta.depends_on` | All dependencies listed or empty |
| Size estimate | No XL stories |

---

## Rejection Templates

### Missing Acceptance Criteria
```
Reject: User stories for "checkout promotion" lack acceptance criteria.
Return to BA with: Each story must have ≥ 3 Given/When/Then criteria.
```

### Scope Too Large
```
Reject: "Reporting module" feature covers 8 business domains in one story.
Return to BA with: Split into ≤ 4 stories per feature file, create sub-features.
```

### Business Rule Conflict
```
Reject: Story assumes Tax Rate can be 0% — conflicts with wiki/business-workflow/tax-rules.json which mandates minimum 5% VAT for retail.
Return to BA with: Confirm with tax accountant if zero-rate is allowed for specific SKU categories.
```

### Vague Actor
```
Reject: "As a user" is not a valid actor in this system.
Return to BA with: Specify role: Cashier, Store Manager, Accountant, System Admin, Tax Inspector.
```

---

## Mid-Sprint Scope Addition Protocol

If someone wants to add scope mid-sprint:

1. Is it a `severity: "critical"` bug? → Use hotfix workflow
2. Is it a regulatory change? → PM + PO assess — can only add if removing equal-size item
3. Is it "nice to have"? → Add to backlog for NEXT sprint only
4. Is it a critical dependency blocker discovered mid-sprint? → PM decision

**RULE: No new features added to active sprint without removing equal capacity.**

---

## Backlog Priority Scoring

| Factor | Score |
|--------|-------|
| Regulatory compliance impact | +30 |
| Revenue impact (high) | +20 |
| Unblocks other features | +15 |
| High bug count in related area | +10 |
| User-facing visibility | +10 |
| Tech debt reduction only | -5 |
| Cosmetic/nice-to-have | -10 |

Compute score per backlog item and sort descending.
