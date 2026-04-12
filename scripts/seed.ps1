# ─────────────────────────────────────────────────────────────────────────────
# seed.ps1 — Database seeder (Docker-aware)
#
# Usage (run from project root or scripts/):
#   ./scripts/seed.ps1 admin        # seed default admin user (idempotent)
#
# Requires the stack to be running (postgres must be healthy).
# Runs inside a fresh Docker container using the backend development image.
# ─────────────────────────────────────────────────────────────────────────────

param(
    [Parameter(Position = 0)]
    [ValidateSet("admin")]
    [string]$Target = "admin"
)

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== EAM Database Seed ===" -ForegroundColor Cyan
Write-Host "Target   : $Target" -ForegroundColor Gray
Write-Host "Project  : $ProjectRoot" -ForegroundColor Gray
Write-Host ""

switch ($Target) {
    "admin" {
        Write-Host "Seeding admin user (idempotent — skips if already exists)..." -ForegroundColor Yellow
        # Uses the 'seed-admin' service defined with profiles: ["seed"]
        docker compose --profile seed run --rm seed-admin
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Seed command failed (exit code $LASTEXITCODE)." -ForegroundColor Red
    Write-Host "Check postgres is running: docker compose ps postgres" -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Seed complete." -ForegroundColor Green
