# Existing Context Reads (PO)

## When to Use This Guide

Run through this checklist at the START of every sprint planning session and every approval session.

---

## Sprint Planning Read Set

1. `wiki/dashboard.json` — focus on:
   - `current_sprint.number`
   - `current_sprint.capacity_remaining`
   - `blocked_features` list and their `unblock_condition`
   - `active_work` entries (anything in-progress?)

2. `wiki/plan/backlog.json` — focus on:
   - Top 10 items by `priority` score
   - Items marked `status: "ready"` only (BA-approved, waiting for PO commit)
   - Items already assigned to a sprint that wasn't completed (carried over)

3. `wiki/plan/sprints/sprint-{N-1}.json` — focus on:
   - `carried_over` features from last sprint
   - `retrospective.action_items` — are any action items addressed this sprint?

**Stop and write sprint plan** once you have answers to:
- What fits in capacity?
- What must come in based on dependencies?
- What is carried over from last sprint?

---

## Feature Approval Read Set

1. `wiki/features/{feature-id}.json` — full read
2. `wiki/impact-map/entity-registry.json` — check all entities listed in `affects`
3. For each entity — check `wiki/features/{entity-feature}.json` for existing behavior
4. `wiki/business-workflow/{domain}.json` — check for conflicting rules

**Stop when you can answer:**
- Are the stories actionable?
- Are the business rules accurate?
- Is there a conflict with an existing feature?

---

## Capacity Formula

```
Capacity = (team_hours_this_sprint) - (overhead_percent * team_hours)
         = sum of story size estimates for selected features
```

Do NOT exceed capacity by more than 10% without explicit stakeholder approval.

---

## Priority Escalation Triggers

Immediately re-prioritize backlog when:
- A `severity: "critical"` bug is filed — it always goes to top of backlog
- A regulatory deadline is discovered (Vietnamese tax law changes)
- A blocked feature is unblocked and its dependencies are complete
