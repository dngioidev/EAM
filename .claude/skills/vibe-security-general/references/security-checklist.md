# Security Checklist

## OWASP Top 10 Coverage for EAM

### A01 — Broken Access Control

- [ ] Every endpoint that returns data has explicit auth guard
- [ ] Users can only access their own store's data (multi-tenant isolation)
- [ ] Admin endpoints are behind `Roles('admin')` guard
- [ ] No direct object references use guessable IDs (UUID only)
- [ ] `withDeleted: true` queries only used in admin context

---

### A02 — Cryptographic Failures

- [ ] Passwords hashed with bcrypt (cost factor ≥ 12)
- [ ] JWT signed with HS256 minimum, RS256 preferred in production
- [ ] JWT secret is ≥ 256 bits entropy
- [ ] HTTPS enforced in production (HTTP → HTTPS redirect)
- [ ] Sensitive data encrypted at rest in DB (PII fields)

---

### A03 — Injection

- [ ] All TypeORM queries use parameterized inputs
- [ ] No `QueryBuilder.where(userInput)` without `.setParameter()`
- [ ] No `eval()`, `Function()`, `exec()` with user input
- [ ] Redis keys never built from unvalidated user input

---

### A04 — Insecure Design

- [ ] Rate limiting on auth endpoints (max 10 attempts per minute)
- [ ] Rate limiting on all public endpoints (max 100/min per IP)
- [ ] CSRF protection on state-changing endpoints
- [ ] Logout invalidates refresh token in DB

---

### A05 — Security Misconfiguration

- [ ] `.env.example` maintained with clear instructions (no real secrets)
- [ ] Default credentials changed before deployment
- [ ] Debug mode disabled in production (`NODE_ENV=production`)
- [ ] CORS allows only frontend origin (not `*`)
- [ ] Database port not exposed to public internet

---

### A06 — Vulnerable Components

- [ ] `npm audit` runs in CI with zero critical/high vulnerabilities
- [ ] Dependencies reviewed monthly by `vibe-devops-general`
- [ ] No EOL packages in production dependencies

---

### A07 — Auth & Session Failures

- [ ] Session tokens invalidated on logout
- [ ] Account lockout after 10 failed login attempts
- [ ] Password reset tokens expire after 15 minutes
- [ ] Email verification required before first login

---

### A08 — Software Integrity Failures

- [ ] All dependencies from npm registry (no unverified sources)
- [ ] `package-lock.json` / `pnpm-lock.yaml` committed
- [ ] No `--ignore-scripts` required (flag if a package needs it)

---

### A09 — Security Logging & Monitoring

- [ ] All auth events logged (login, logout, failed login, token refresh)
- [ ] All admin actions logged with actor ID
- [ ] Logs do NOT contain passwords, tokens, or PII
- [ ] Log rotation configured (max 30 days)

---

### A10 — Server-Side Request Forgery (SSRF)

- [ ] No user-supplied URLs used in backend HTTP requests
- [ ] Webhook URLs validated against allowlist
- [ ] Internal services not reachable from public-facing handlers
