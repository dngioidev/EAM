# Impact Map Patterns

## What Is an Impact Map?

An impact map links a business goal → actors → impacts on those actors → deliverables (features).

```
GOAL
 └── Actor 1
      └── Impact (what changes for them)
           └── Deliverable (feature that causes the change)
 └── Actor 2
      └── Impact
           └── Deliverable
```

---

## Template

```json
{
  "goal": "Specific, measurable business outcome with a number",
  "goal_metric": "How will we know when we've achieved this goal",
  "goal_deadline": "YYYY-MM-DD",
  "actors": [
    {
      "name": "ActorName",
      "role_description": "What this actor does in the business",
      "impact": "How this feature changes their work or outcome",
      "deliverables": ["feature-id-1", "feature-id-2"]
    }
  ],
  "affected_entities": ["Entity1", "Entity2"],
  "out_of_scope": [
    "What is explicitly NOT included in this impact map"
  ]
}
```

---

## V-Smart Ledger Impact Map Conventions

1. **Goals must be quantified**
   - BAD: "Improve checkout efficiency"
   - GOOD: "Reduce average checkout time from 45s to 30s by Q2"

2. **Actors must be real business roles** — use the actor list from `user-story-patterns.md`

3. **Impacts must be testable** — BA must be able to write an acceptance criterion for each impact

4. **Deliverables are feature IDs** — they must exist or be created in `wiki/features/`

---

## Entity Registry Update Protocol

When new entities are identified during impact mapping:

1. Check `wiki/impact-map/entity-registry.json` for existing entities
2. If new entity:
   - Add to registry with description and owning module
   - Flag for `vibe-db-general` to define schema
3. If existing entity but new field needed:
   - Flag as "schema extension required"
   - Note in feature `sections` as a dependency

---

## Scope Freeze Rule

After PO approves an impact map:
- No new entities may be added without PO sign-off
- No new actors may be added without re-running the impact mapping session
- Additional deliverables = new sprint backlog item (NOT added to current sprint mid-sprint)
