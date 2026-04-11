# Wireframe Patterns

## What Is a Wireframe Spec?

In this project, wireframes are expressed as **structured JSON** (no image files). They define layout zones, component placement, data requirements, and interactive states.

---

## Zone Structure

```json
{
  "zone": "zone-name",
  "layout": "stack | grid | flex-row | flex-col | absolute",
  "visible_when": "always | condition-description",
  "components": []
}
```

---

## Mandatory Zones for Screen Types

### List / Table Screen
- `page-header` — title, breadcrumb, primary action button
- `filter-bar` — search input, dropdowns, date range
- `data-table` — columns with sort indicators, pagination
- `empty-state` — illustration + CTA when no data
- `loading-skeleton` — shown while data fetches

### Form Screen
- `page-header` — title, cancel button
- `form-body` — grouped fields with labels
- `validation-summary` — server errors shown above submit
- `action-bar` — sticky bottom: Cancel + Submit buttons

### Detail / View Screen
- `page-header` — title, breadcrumb, edit/action buttons
- `summary-card` — key facts at a glance
- `detail-sections` — accordion or tabs for sub-sections
- `history-section` — audit trail (if entity is audited)

### Modal
- `modal-header` — title + close button
- `modal-body` — main content (≤ 500px width max)
- `modal-footer` — Cancel + Confirm buttons

---

## Interactive State Rules

Every interactive component must have these states specified:

| State | When |
|-------|------|
| `default` | Initial render |
| `hover` | Mouse over (desktop only) |
| `focus` | Keyboard focus (required for accessibility) |
| `active` | Click/tap in progress |
| `loading` | Async operation pending |
| `disabled` | Action not available |
| `error` | Validation failure |
| `success` | Operation completed |

---

## Currency Display Rules

```json
{
  "currency_format": {
    "symbol": "₫",
    "separator": ".",
    "decimal": ",",
    "example": "1.234.567 ₫",
    "note": "Vietnamese format: thousands separated by dots, symbol after amount"
  }
}
```

NEVER display: `$`, `USD`, `VND 1234567`, `1,234,567 VND`
ALWAYS display: `1.234.567 ₫`

---

## Responsive Breakpoints

```json
{
  "breakpoints": {
    "xs": "320px",
    "sm": "480px",
    "md": "768px — minimum supported (tablet)",
    "lg": "1024px — standard desktop",
    "xl": "1280px — wide desktop"
  }
}
```

All layouts must work at `md` as minimum. Mobile-first design.
