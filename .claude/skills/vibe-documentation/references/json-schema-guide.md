# JSON Schema Guide

## Universal Envelope

ALL wiki JSON files follow this top-level structure:

```json
{
  "meta": { ... },           // File identity, status, versioning
  "quick_facts": { ... },    // Human-readable summary at a glance
  "content": { ... },        // The actual content (schema varies by type)
  "approval": { ... },       // Approval workflow state
  "audit": [ ... ]           // Change history log
}
```

---

## `meta` Fields (All Files)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | YES | Kebab-case, unique within folder |
| `type` | string | YES | File type: feature, bug, decision, contract, etc. |
| `status` | string | YES | Current lifecycle status |
| `owner` | string | YES | Role that owns this file |
| `sprint` | number | YES | Sprint when created |
| `last_updated` | string | YES | ISO-8601 date |
| `created` | string | YES | ISO-8601 date |
| `version` | number | YES | Increment each update |
| `depends_on` | array | YES | IDs of dependencies (empty [] if none) |
| `related_to` | array | YES | IDs of related files |
| `affects` | array | YES | Entity names affected |
| `tags` | array | YES | Searchable tags |
| `blocked_by` | string? | YES | ID of blocking item or null |
| `unblock_condition` | string? | YES | Description of unblock condition or null |

---

## `quick_facts` Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `one_line` | string | YES | ≤ 15 words, plain English |
| `status_reason` | string | YES | Why this status? |
| `last_change` | string | YES | What changed most recently |
| `key_links` | array | YES | Related file IDs |

---

## `content` Fields (Common)

| Field | Type | When |
|-------|------|------|
| `title` | string | Always |
| `tldr` | string | Always — ≤ 3 lines |
| `summary` | string | Always — 1 paragraph |
| `skip_if` | object | Always — tells agents when to skip |
| `do_not` | array | Always — invariant rules |
| `see_also` | array | If cross-references exist |
| `sections` | array | Flexible typed sections |

---

## `audit` Entry Format

```json
{
  "date": "YYYY-MM-DD",
  "role": "backend | frontend | qa | ...",
  "action": "created | updated | status_change | ...",
  "description": "What changed and why",
  "version_before": 1,
  "version_after": 2
}
```

Every write to a wiki file must add an audit entry.

---

## Version Conflict Protocol

If two agents (two sessions) both increment page from version 5 → 6:
1. The second write must check `meta.version` before saving
2. If version in file ≠ version read at start of session → CONFLICT
3. Resolve by:
   - Reading the newer file
   - Merging changes
   - Set version = current + 1
   - Write merged content with both audit entries preserved
