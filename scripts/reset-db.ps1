# ─────────────────────────────────────────────────────────────────────────────
# reset-db.ps1 — DEV ONLY: drop volume, recreate and migrate fresh DB
#
# Usage:
#   ./scripts/reset-db.ps1                    # reset main DB
#   ./scripts/reset-db.ps1 -Confirm           # skip confirmation prompt
#   ./scripts/reset-db.ps1 -SeedAdmin         # reset + seed admin user
#
# WARNING: This DESTROYS ALL DATA in the postgres_data volume.
# For development use only. Never run against staging or production.
# ─────────────────────────────────────────────────────────────────────────────

param(
    [switch]$Confirm,
    [switch]$SeedAdmin
)

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== EAM Database Reset (DEV ONLY) ===" -ForegroundColor Red
Write-Host "This will DESTROY ALL DATA in the postgres_data volume." -ForegroundColor Red
Write-Host ""

if (-not $Confirm) {
    $answer = Read-Host "Type 'yes' to continue"
    if ($answer -ne "yes") {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "[1/4] Stopping backend and dependent services..." -ForegroundColor Yellow
docker compose stop backend migrate 2>$null
docker compose rm -f backend migrate 2>$null

Write-Host "[2/4] Dropping postgres_data volume..." -ForegroundColor Yellow
docker compose down -v --remove-orphans 2>$null

Write-Host "[3/4] Starting postgres and running migrations..." -ForegroundColor Yellow
docker compose up -d postgres
Write-Host "Waiting for postgres to be healthy..." -ForegroundColor Gray
# Poll health
$retries = 30
while ($retries -gt 0) {
    $health = docker inspect --format "{{.State.Health.Status}}" eam_postgres 2>$null
    if ($health -eq "healthy") { break }
    Start-Sleep -Seconds 2
    $retries--
}
if ($retries -eq 0) {
    Write-Error "postgres did not become healthy in time."
    exit 1
}
docker compose run --rm migrate npm run migration:run

Write-Host "[4/4] Restarting full stack..." -ForegroundColor Yellow
docker compose up -d

if ($SeedAdmin) {
    Write-Host ""
    Write-Host "Seeding admin user..." -ForegroundColor Yellow
    & "$ScriptDir\seed.ps1" admin
}

Write-Host ""
Write-Host "Database reset complete." -ForegroundColor Green
