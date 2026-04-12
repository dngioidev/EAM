#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# seed.sh — Database seeder (Docker-aware, CI/CD)
#
# Usage:
#   ./scripts/seed.sh admin      # seed default admin user (idempotent)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

TARGET="${1:-admin}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "=== EAM Database Seed ==="
echo "Target: $TARGET"

case "$TARGET" in
  admin)
    echo "Seeding admin user (idempotent)..."
    docker compose --profile seed run --rm seed-admin
    ;;
  *)
    echo "ERROR: Unknown seed target '$TARGET'. Available: admin"
    exit 1
    ;;
esac

echo "Seed complete."
