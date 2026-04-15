# Sprint Protocol [medium]

> ⚠️ **Wiki System Update (Sprint 4.5+):** Sprint data is now stored in `wiki.db` (SQLite). Use MCP tools or direct database queries to read/write sprint data. References to `wiki/plan/sprints/` JSON files are legacy — the SQLite database in `wiki.db` is the authoritative source of truth.

## SPRINT END CHECKLIST

- [ ] All in-progress features have progress data updated via MCP tools
- [ ] Incomplete features: status → "planning", progress data preserved for next sprint  
- [ ] Use `wiki_session_log()` MCP tool to update sprint closure and retrospective
- [ ] Verify bug counts via wiki-app or `wiki.db` database query
- [ ] `vibe-documentation`: run full wiki audit checklist
- [ ] `wiki/onboarding.json`: follow all 5 steps in a clean environment to verify accuracy
- [ ] Commit final wiki updates to git

## SPRINT START CHECKLIST

- [ ] Call `wiki_dashboard()` MCP tool to read current sprint state
- [ ] Review `blocked_features` returned by dashboard — evaluate unblock conditions
- [ ] PO uses wiki-app approval queue to review and assign features to sprint
- [ ] Update dashboard data via MCP with new sprint number, goals, capacity, dates
- [ ] For each carried-over feature: update sprint assignment to new sprint number
- [ ] Run full test suite from clean state — log any pre-existing failures
- [ ] Create git branch: `chore/sprint-{N}-kickoff` and commit plan artifacts

---

## Sprint Velocity Tracking (Stored in wiki.db)

```json
{
  "velocity": {
    "planned": 8,
    "completed": 6,
    "carried_over": ["feature-id-1"]
  }
}
```

**Definitions:**
- **Planned** = number of features committed at sprint start
- **Completed** = features with ALL tasks "done" at sprint end  
- **Carried-over** = features not completed — preserve their data, update sprint number in next sprint

---

## Retrospective Format (Captured in wiki_session_log)

At sprint end, include retrospective data:

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

## Blocked Feature Evaluation (Sprint Start)

At sprint start:
1. Call `wiki_dashboard()` to get `blocked_features` array
2. For each blocked feature, check its `unblock_condition` field
3. Examples of unblock conditions:
   - "API contract for payments module approved"
   - "Backend auth migration complete"
   - "External vendor API credentials received"
4. **If condition is met:**
   - Update feature status to "planning" via MCP
   - Assign to current sprint
   - Notify PO in wiki comments
5. **If not met:**
   - Leave feature in "blocked" state
   - Log check date in wiki history via `wiki_session_log()`

---

## Documentation Freeze

Last 2 days of every sprint:
- No new wiki records created without PM approval
- Documentation team focuses on updating any stale records
- All in-progress feature data synchronized with true current state
- All feature status tables and indices verified accurate via wiki-app

---

## MCP Tools Reference

**For Sprint Planning:**
- `wiki_dashboard()` — read current sprint info, blocked features, open bugs
- `wiki_session_log(date, session_data)` — record sprint start/end notes and decisions
- `wiki_feature_update(id, patch)` — set feature status and sprint assignment

**For Wiki Updates:**
- `wiki_feature_update()` — update feature status, sprint, owner
- `wiki_session_log()` — append to daily history (date-scoped entry in wiki.db)

See `wiki-mcp/src/tools/` for complete MCP tool implementations.
