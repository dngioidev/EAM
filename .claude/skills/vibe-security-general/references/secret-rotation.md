# Secret Rotation Protocol

## When to Rotate

| Trigger | Scope |
|---------|-------|
| Suspected compromise | Rotate ALL secrets immediately |
| Developer leaves team | Rotate all secrets they had access to |
| Scheduled quarterly | Rotate JWT secrets, API keys |
| Docker image rebuilt | Regenerate DB credentials if stored in image |
| `.env` accidentally committed | Rotate ALL secrets in that file and invalidate old ones |

---

## Secret Inventory (EAM)

Maintain this list. All secrets must be in `.env`. Never hardcode.

```
DB_PASSWORD          → PostgreSQL main DB password
DB_TEST_PASSWORD     → PostgreSQL test DB password
REDIS_PASSWORD       → Redis auth password
JWT_SECRET           → JWT signing secret
JWT_REFRESH_SECRET   → Refresh token signing secret
SMTP_PASSWORD        → Email service (for auth emails)
STORAGE_ACCESS_KEY   → S3/storage access key (if applicable)
STORAGE_SECRET_KEY   → S3/storage secret key (if applicable)
```

---

## Rotation Procedure

**Step 1: Generate new secret**
```bash
# For JWT secrets (≥ 256 bits):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For passwords (≥ 24 chars, mixed):
node -e "console.log(require('crypto').randomBytes(18).toString('base64'))"
```

**Step 2: Update in secret store**
- Production: update environment variable in hosting platform (Render, Railway, etc.)
- Staging: update `.env.staging` (not committed) and restart services
- Do NOT update `.env.example` with real values

**Step 3: Restart services**
- Restart backend service — picks up new env vars
- Verify health check passes before retiring old secret

**Step 4: Invalidate old secret**
- JWT: all existing tokens signed with old secret are now invalid — users will need to re-login
- DB password: revoke old credential at DB level
- API keys: revoke via service dashboard

**Step 5: Document**
- Write `wiki/decisions/{date}-secret-rotation.json`
- Note: which secrets were rotated, why, what user impact
- If users forced to re-login: write to `wiki/changelog.json`

---

## `.env` File Rules

- `.env` — local development only, NEVER commit
- `.env.example` — committed, contains key names with fake/placeholder values
- `.env.test` — test DB only, NEVER real credentials
- `.env.production` — NEVER in repo, managed only in hosting platform

---

## Emergency Rotation Checklist

When a secret breach is suspected:
- [ ] Rotate ALL secrets (not just the suspected one)
- [ ] Revoke all active sessions (clear refresh token table in DB)
- [ ] Review access logs for suspicious activity in last 7 days
- [ ] Notify PM and affected users
- [ ] Write incident report in `wiki/decisions/`
- [ ] Schedule post-mortem within 24 hours
