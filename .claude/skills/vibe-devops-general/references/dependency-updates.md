# Dependency Updates

## Monthly Dependency Audit Schedule

Run at the start of every sprint:

### Backend (`/backend`)

```bash
cd backend
npm audit --audit-level=moderate
npx npm-check-updates --interactive
```

### Frontend (`/frontend`)

```bash
cd frontend
npm audit --audit-level=moderate
npx npm-check-updates --interactive
```

---

## Update Priority

1. **Critical security patches** → Apply immediately, deploy to staging within 24h
2. **High security patches** → Apply this sprint
3. **Moderate/Low patches** → Batch into next sprint
4. **Non-security minor updates** → Review monthly, apply in batches
5. **Major version updates** → Dedicated sprint task, never inline

---

## Before Applying Any Update

1. Read the changelog for the package — what changed?
2. Check for breaking changes in minor/patch versions (some packages break despite semver)
3. Update ONE package at a time
4. Run full test suite after each update
5. If tests break → revert that package, file a bug, skip for this sprint

---

## Docker Base Image Updates

Monthly check:
```bash
docker pull node:20-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine
```

If digest changes:
1. Rebuild local containers
2. Run health checks
3. Run test suite
4. If all pass → commit updated `docker-compose.yml` with new hash pin if needed

---

## Dependency Audit Wiki Entry

After each audit, write to `wiki/history/{YYYY-MM-DD}.json`:

```json
{
  "role": "devops",
  "action": "dependency-audit",
  "backend_vulnerabilities": { "critical": 0, "high": 0, "moderate": 2 },
  "frontend_vulnerabilities": { "critical": 0, "high": 1, "moderate": 0 },
  "packages_updated": ["express@4.18.3", "class-validator@0.14.1"],
  "packages_skipped": ["@nestjs/core@11 — major version, scheduled sprint 8"],
  "notes": ""
}
```

---

## Package Allowlist Policy

Only install packages that are:
- Published to npmjs.com (public registry)
- Have > 1,000 weekly downloads OR are official tool packages
- Have an open-source license (MIT, Apache, BSD, ISC)
- Not deprecated (check npm page)

Do NOT install packages that:
- Require `--ignore-scripts` (red flag for malicious postinstall)
- Are archived on GitHub with no updates in 2+ years
- Have unresolved critical CVEs on Snyk/npm audit
