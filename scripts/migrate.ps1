# ─────────────────────────────────────────────────────────────────────────────
# migrate.ps1 — TypeORM migration management (Docker-aware)
#
# Usage (run from project root or scripts/):
#   ./scripts/migrate.ps1 run                          # apply all pending
#   ./scripts/migrate.ps1 revert                       # revert last migration
#   ./scripts/migrate.ps1 show                         # list migration status
#   ./scripts/migrate.ps1 generate CreateOrderTable    # generate new migration
#
# Runs inside a fresh Docker container using the backend development image.
# DATABASE_HOST is automatically set to 'postgres' (Docker service name).
# ─────────────────────────────────────────────────────────────────────────────

param(
    [Parameter(Position = 0)]
    [ValidateSet("run", "revert", "show", "generate")]
    [string]$Command = "run",

    [Parameter(Position = 1)]
    [string]$MigrationName = ""
)

$ErrorActionPreference = "Stop"

# Resolve project root (one level up from scripts/)
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== EAM Database Migration ===" -ForegroundColor Cyan
Write-Host "Command  : $Command" -ForegroundColor Gray
Write-Host "Project  : $ProjectRoot" -ForegroundColor Gray
Write-Host ""

switch ($Command) {
    "run" {
        Write-Host "Applying all pending migrations..." -ForegroundColor Yellow
        docker compose run --rm migrate npm run migration:run
    }

    "revert" {
        Write-Host "Reverting last migration..." -ForegroundColor Yellow
        docker compose run --rm migrate npm run migration:revert
    }

    "show" {
        Write-Host "Fetching migration status..." -ForegroundColor Yellow
        docker compose run --rm migrate npm run migration:show
    }

    "generate" {
        if (-not $MigrationName) {
            Write-Error "Migration name is required for 'generate'. Example: ./scripts/migrate.ps1 generate CreateOrderTable"
            exit 1
        }
        $OutputPath = "src/database/migrations/$MigrationName"
        Write-Host "Generating migration: $MigrationName" -ForegroundColor Yellow
        Write-Host "Output path (inside container): $OutputPath" -ForegroundColor Gray
        docker compose run --rm migrate npm run migration:generate -- $OutputPath
        Write-Host ""
        Write-Host "Migration file created in backend/src/database/migrations/" -ForegroundColor Green
        Write-Host "Review the generated SQL before committing." -ForegroundColor Yellow
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Migration command failed (exit code $LASTEXITCODE)." -ForegroundColor Red
    Write-Host "Check: docker compose logs migrate --tail 50" -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
