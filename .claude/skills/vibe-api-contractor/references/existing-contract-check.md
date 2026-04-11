# Existing Contract Check

## Before Writing Any New Contract

Run through this checklist to avoid duplicates and inconsistencies.

---

## Step 1: Read the Contract Index

File: `wiki/api-contracts/_index.json`

Check:
- Does a contract already exist for this module?
- Is there a related module contract that overlaps in scope?

---

## Step 2: Check All Endpoint Paths

For each proposed new endpoint, verify:
- No existing endpoint uses the same path + method combination
- Common resource paths (`/api/auth`, `/api/users`, etc.) are not being duplicated

---

## Step 3: Check Entity Registry for Ownership

File: `wiki/impact-map/entity-registry.json`

For each entity the contract will expose:
- Which module owns it?
- Is there already a contract for that module?
- Does exposing it via a NEW contract violate the module ownership boundary?

If yes: use the owning module's contract — don't create a cross-boundary contract.

---

## Step 4: Check for Overlapping Business Logic

File: `wiki/business-workflow/{topic}.json`

Does the contract's behavior overlap with:
- Existing checkout flow?
- Existing tax calculation?
- Existing receipt generation?

If yes: extend the existing contract or add a sub-resource rather than a new top-level contract.

---

## Conflict Resolution Protocol

If two contracts claim the same endpoint:
1. Stop — flag conflict to PM
2. PM decides ownership based on entity registry
3. One contract wins — the other endpoint is removed or renamed
4. Both `vibe-backend-general` and `vibe-frontend-general` are notified
5. Decision recorded in `wiki/decisions/{date}.json`
