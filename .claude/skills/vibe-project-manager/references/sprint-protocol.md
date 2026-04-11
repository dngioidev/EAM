# Sprint Protocol [medium]

## SPRINT END CHECKLIST

- [ ] All in-progress features have `progress.json` updated
- [ ] Incomplete features: status → "planning", `progress.json` preserved for next sprint
- [ ] `wiki/plan/sprints/sprint-{N}.json` written with velocity and retrospective
- [ ] `wiki/bugs/_index.json` counts verified accurate
- [ ] `vibe-documentation`: full wiki audit checklist run
- [ ] `wiki/onboarding.json`: follow all 5 steps in a clean environment to verify accuracy

## SPRINT START CHECKLIST

- [ ] Create `wiki/plan/sprints/sprint-{N+1}.json`
- [ ] Read `dashboard.json` `blocked_features` — evaluate unblock conditions
- [ ] PO reads `backlog.json` — selects items and assigns to sprint
- [ ] Update `dashboard.json` sprint fields
- [ ] For each carried-over feature: read `progress.json`, update sprint number
- [ ] Run full test suite from clean state — log any pre-existing failures

---

## Sprint Velocity Tracking

```json
{
  "velocity": {
    "planned": 8,
    "completed": 6,
    "carried_over": ["feature-id-1"]
  }
}
```

- Planned = number of features committed at sprint start
- Completed = features with ALL tasks "done" at sprint end
- Carried-over = features not completed — their `progress.json` is preserved, sprint number updated

---

## Retrospective Format

At sprint end, write to `wiki/plan/sprints/sprint-{N}.json`:

```json
{
  "retrospective": {
    "went_well": [
      "API contract first approach saved two back-and-forth cycles",
      "Test cases written before dev caught edge cases early"
    ],
    "to_improve": [
      "Design file was not ready when frontend started — caused 2-day wait",
      "Migration tested late in sprint — blocking backend"
    ],
    "action_items": [
      "Design must complete 2 days before dev sprint starts",
      "Run migrations at sprint start, not end"
    ]
  }
}
```

---

## Blocked Feature Evaluation

At sprint start:
1. Read `dashboard.json → blocked_features`
2. For each blocked feature, check `unblock_condition`
3. Examples of unblock conditions:
   - "API contract for payments module approved"
   - "Backend auth migration complete"
   - "External vendor API credentials received"
4. If condition met → set feature status "planning" → assign to sprint → notify PO
5. If not met → leave blocked → note in `wiki/history/{date}.json`

---

## Documentation Freeze

Last 2 days of every sprint:
- No new wiki files created without PM approval
- Documentation focuses on catching up any files behind
- All `progress.json` files updated to true current state
- All `_index.json` status_tables verified accurate
