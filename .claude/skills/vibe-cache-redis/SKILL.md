---
name: vibe-cache-redis
description: |
  Layer 2 Redis-specific patterns for EAM. Covers Redis 7.x + ioredis: connection setup, key namespacing, TTL strategy, cache-aside implementation, session storage, and testing utilities. Activates alongside vibe-backend-nestjs when caching is involved.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-backend-general) + vibe-backend-nestjs activation.
  STACK VALIDATION GUARD: Verify wiki/techstack/backend.json → cache = "Redis 7.x"
applyTo: "**"
---

# vibe-cache-redis

## STACK GUARD

Verify `wiki/techstack/backend.json → cache = "Redis 7.x"` before applying patterns.

## Key Rules

1. ALL cache keys must follow `{module}:{entity}:{id}` namespacing — no bare keys
2. Every `set()` must include a TTL — no indefinite cache entries
3. Cache-aside only: write to DB first, then cache; invalidate on write
4. Redis is volatile — application MUST work if Redis is unavailable
5. Never cache auth tokens in Redis — use JWTs with short expiry instead

## TTL Reference

| Data | TTL |
|---|---|
| Product catalog | 300s |
| Order detail | 120s |
| User permissions | 900s |
| Config/settings | 3600s |
| Static reference data | 86400s |

## References

- [Redis Client Setup](references/redis-client.md)
- [Cache Patterns](references/cache-patterns.md)
- [Session Storage](references/session-storage.md)
- [Redis Testing](references/redis-testing.md)
