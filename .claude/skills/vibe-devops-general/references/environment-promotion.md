# Environment Promotion

## Standard Deployment Flow

```
local dev → PR review → staging → smoke test → production
```

---

## Staging Deployment Checklist

Before deploying to staging:
- [ ] All tests pass (unit + integration + Playwright)
- [ ] `npm run build` succeeds for all services
- [ ] No critical or high bugs in open status
- [ ] Secret values verified in staging platform
- [ ] Rollback plan documented (what version to revert to)

Staging deploy steps:
1. `git tag staging-{date}` on the commit being deployed
2. Run `docker-compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d`
3. Wait 30 seconds for startup
4. Run health checks on all services
5. Run smoke test (login → main feature → logout)
6. Write result to `wiki/history/{date}.json`

---

## Production Deployment Checklist

- [ ] Staging has been running for ≥ 2 hours without errors
- [ ] Smoke test passed on staging
- [ ] PM has given go-ahead
- [ ] Database backup taken (see backup-recovery.md)
- [ ] Rollback plan: specific tag or commit to revert to
- [ ] Team notified of deployment window (≤ 30 min downtime window)

Production deploy steps:
1. `git tag release-{version}` (use semantic versioning)
2. Pull latest on production server: `git pull origin main`
3. Rebuild: `docker-compose up --build -d`
4. Run health checks
5. Monitor logs for 15 minutes post-deploy
6. Write changelog entry in `wiki/changelog.json`

---

## Rollback Protocol

If health checks fail after production deploy:

```bash
# Revert to previous tag
git checkout release-{previous-version}
docker-compose up --build -d
```

Or if environment variable change caused the issue:
1. Revert env var in hosting platform
2. Restart containers (no rebuild needed)

After rollback:
1. Write incident entry in `wiki/history/{date}.json`
2. Write decision entry explaining what went wrong
3. File a `high` severity bug for the deployment failure

---

## Zero-Downtime Deploys

For services that must stay up:
1. Deploy new containers alongside old ones
2. Health check new containers
3. Switch routing to new containers
4. Stop old containers after traffic confirms success

Current setup does NOT automatically achieve zero-downtime — plan downtime windows of ≤ 5 minutes for production deploys.
