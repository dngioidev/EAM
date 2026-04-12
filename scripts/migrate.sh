#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# migrate.sh — TypeORM migration management (Docker-aware, CI/CD)
#
# Usage:
#   ./scripts/migrate.sh run                         # apply pending migrations
#   ./scripts/migrate.sh revert                      # revert last migration
#   ./scripts/migrate.sh show                        # list migration status
#   ./scripts/migrate.sh generate CreateOrderTable   # generate new migration
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

COMMAND="${1:-run}"
MIGRATION_NAME="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "=== EAM Database Migration ==="
echo "Command: $COMMAND"

case "$COMMAND" in
  run)
    docker compose run --rm migrate npm run migration:run
    ;;
  revert)
    docker compose run --rm migrate npm run migration:revert
    ;;
  show)
    docker compose run --rm migrate npm run migration:show
    ;;
  generate)
    if [ -z "$MIGRATION_NAME" ]; then
      echo "ERROR: Migration name required. Usage: ./migrate.sh generate <Name>"
      exit 1
    fi
    docker compose run --rm migrate npm run migration:generate -- "src/database/migrations/$MIGRATION_NAME"
    echo "Migration file created in backend/src/database/migrations/"
    ;;
  *)
    echo "ERROR: Unknown command '$COMMAND'. Use: run | revert | show | generate <Name>"
    exit 1
    ;;
esac

echo "Done."
