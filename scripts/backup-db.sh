#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup-db.sh — pg_dump backup (Docker-aware, CI/CD)
#
# Usage:
#   ./scripts/backup-db.sh                # dumps to backups/ with timestamp
#   ./scripts/backup-db.sh /custom/path   # custom output directory
#
# Reads DATABASE_* variables from backend/.env
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

OUT_DIR="${1:-$PROJECT_ROOT/backups}"
ENV_FILE="$PROJECT_ROOT/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

# Parse .env
DB_USER=$(grep -E '^DATABASE_USER=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' | tr -d "'")
DB_PASS=$(grep -E '^DATABASE_PASSWORD=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' | tr -d "'")
DB_NAME=$(grep -E '^DATABASE_NAME=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' | tr -d "'")

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  echo "ERROR: DATABASE_USER and DATABASE_NAME must be set in backend/.env"
  exit 1
fi

mkdir -p "$OUT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="$OUT_DIR/eam_${TIMESTAMP}.sql"

echo ""
echo "=== EAM Database Backup ==="
echo "Database : $DB_NAME"
echo "Output   : $OUTPUT_FILE"

docker compose exec -T postgres \
  sh -c "PGPASSWORD='${DB_PASS}' pg_dump -U ${DB_USER} -d ${DB_NAME} --no-password" \
  > "$OUTPUT_FILE"

SIZE_KB=$(du -k "$OUTPUT_FILE" | cut -f1)
echo "Backup complete: $OUTPUT_FILE (${SIZE_KB} KB)"
