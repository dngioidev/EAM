# ─────────────────────────────────────────────────────────────────────────────
# setup-dev.ps1 — first-time developer environment setup
#
# Runs the full local dev stack setup sequence:
#   1. Verify backend/.env exists
#   2. Install backend node_modules (on host for IDE support)
#   3. Build and start all Docker services
#   4. Wait for healthy state
#   5. Run all pending migrations
#   6. Seed the admin user
#
# Usage:
#   ./scripts/setup-dev.ps1
#   ./scripts/setup-dev.ps1 -SkipInstall     # skip npm ci (already installed)
#   ./scripts/setup-dev.ps1 -SkipSeed        # skip admin seed
# ─────────────────────────────────────────────────────────────────────────────

param(
    [switch]$SkipInstall,
    [switch]$SkipSeed
)

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  EAM-Tax — Developer Environment Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check .env
Write-Host "[1/5] Checking backend/.env..." -ForegroundColor Yellow
$EnvFile = Join-Path $ProjectRoot "backend\.env"
if (-not (Test-Path $EnvFile)) {
    Write-Host ""
    Write-Host "ERROR: backend/.env not found." -ForegroundColor Red
    Write-Host "Copy backend/.env.example to backend/.env and fill in your values." -ForegroundColor Yellow
    exit 1
}
Write-Host "  backend/.env found." -ForegroundColor Green

# Step 2: npm install on host (optional — for IDE TypeScript support)
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "[2/5] Installing backend npm dependencies (for IDE support)..." -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "backend")
    npm ci
    Pop-Location
    Write-Host "  Done." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[2/5] Skipping npm install (-SkipInstall)." -ForegroundColor Gray
}

# Step 3: Build and start Docker stack
Write-Host ""
Write-Host "[3/5] Building and starting Docker services..." -ForegroundColor Yellow
docker compose up -d --build
Write-Host "  Services started." -ForegroundColor Green

# Step 4: Wait for postgres healthy (migrations need it)
Write-Host ""
Write-Host "[4/5] Waiting for postgres to be healthy..." -ForegroundColor Yellow
$retries = 30
while ($retries -gt 0) {
    $health = docker inspect --format "{{.State.Health.Status}}" eam_postgres 2>$null
    if ($health -eq "healthy") {
        Write-Host "  postgres is healthy." -ForegroundColor Green
        break
    }
    Write-Host "  Still waiting... ($retries retries left)" -ForegroundColor Gray
    Start-Sleep -Seconds 3
    $retries--
}
if ($retries -eq 0) {
    Write-Error "postgres did not become healthy. Check: docker compose logs postgres"
    exit 1
}

# Step 5: Run migrations
Write-Host ""
Write-Host "[5/5] Running database migrations..." -ForegroundColor Yellow
& "$ScriptDir\migrate.ps1" run

# Optional: seed admin
if (-not $SkipSeed) {
    Write-Host ""
    Write-Host "[+] Seeding admin user..." -ForegroundColor Yellow
    & "$ScriptDir\seed.ps1" admin
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend  : http://localhost/" -ForegroundColor White
Write-Host "  API       : http://localhost/api" -ForegroundColor White
Write-Host "  Swagger   : http://localhost/api/docs" -ForegroundColor White
Write-Host "  Wiki      : http://localhost:3001/" -ForegroundColor White
Write-Host "  pgAdmin   : http://localhost:5050/" -ForegroundColor White
Write-Host ""
Write-Host "  Run health check: ./scripts/health-check.ps1" -ForegroundColor Gray
