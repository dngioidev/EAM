# Component-First Approach

## Principle

Before designing a page layout, identify which components are needed. Check if they already exist. Only create new component specs when necessary.

---

## Step 1: Component Audit

Before any design work, run this audit:

1. Read `wiki/design/design-system.json → components` inventory
2. List all UI elements needed for the feature
3. For each element — check: **Exists? Reusable? Needs extension?**

```
Needed: Price display with VND format
Exists? → CurrencyDisplay component in design-system.json
Reusable? → Yes, just pass amount as prop
Action: REUSE — no new spec needed
```

```
Needed: Promotion code badge on order item
Exists? → No
Action: CREATE new component spec in wiki/design/components/promo-badge.json
```

---

## Step 2: Component Spec Template

```json
{
  "component": "ComponentName",
  "description": "One sentence purpose",
  "category": "atom | molecule | organism | template",
  "props": {
    "propName": {
      "type": "string | number | boolean | enum | object",
      "required": true,
      "description": "What this prop controls",
      "enum_values": ["value1", "value2"]
    }
  },
  "states": {
    "default": "Default rendered state — describe what it looks like",
    "loading": "What shows while data loads — skeleton or spinner?",
    "error": "What shows if validation fails",
    "empty": "What shows if no data yet"
  },
  "accessibility": {
    "role": "button | listitem | dialog | etc",
    "aria_labels": ["aria-label for screen readers"],
    "keyboard_nav": "Tab order, Enter/Space behavior"
  },
  "responsive": {
    "md": "Layout at tablet minimum",
    "lg": "Layout at desktop"
  }
}
```

---

## Atomic Design Hierarchy

| Level | Description | Examples |
|-------|-------------|---------|
| Atom | Single element, no children | Button, Input, Badge, Icon |
| Molecule | 2-3 atoms combined | FormField (label + input + error), SearchBar |
| Organism | Complex section | DataTable, OrderSummaryCard, Navigation |
| Template | Full layout zone | PageLayout, ModalLayout |

---

## Design System Token Rules

Only add new tokens to `design-system.json` if:
- The colour/size does not exist in the current token set
- PO approves the brand extension
- Both Light and Dark mode values are defined

Never hardcode hex values or pixel values in component specs — always reference tokens.
