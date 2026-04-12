# ─────────────────────────────────────────────────────────────────────────────
# backup-db.ps1 — pg_dump backup of the production/dev database
#
# Usage:
#   ./scripts/backup-db.ps1                   # dumps to backups/ with timestamp
#   ./scripts/backup-db.ps1 -OutDir "D:\bak"  # custom output directory
#
# Output: backups/eam_YYYYMMDD_HHMMSS.sql (plain SQL format)
# Reads DATABASE_* variables from backend/.env
# ─────────────────────────────────────────────────────────────────────────────

param(
    [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

# Load .env variables
$EnvFile = Join-Path $ProjectRoot "backend\.env"
if (-not (Test-Path $EnvFile)) {
    Write-Error ".env file not found at $EnvFile"
    exit 1
}
$envVars = @{}
Get-Content $EnvFile | Where-Object { $_ -match '^\s*[^#]\w+=.+' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim().Trim('"').Trim("'")
}

$DB_USER = $envVars["DATABASE_USER"]
$DB_PASS = $envVars["DATABASE_PASSWORD"]
$DB_NAME = $envVars["DATABASE_NAME"]

if (-not $DB_USER -or -not $DB_NAME) {
    Write-Error "DATABASE_USER and DATABASE_NAME must be set in backend/.env"
    exit 1
}

# Resolve output directory
if (-not $OutDir) {
    $OutDir = Join-Path $ProjectRoot "backups"
}
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$Timestamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputFile = Join-Path $OutDir "eam_$Timestamp.sql"

Write-Host ""
Write-Host "=== EAM Database Backup ===" -ForegroundColor Cyan
Write-Host "Database : $DB_NAME" -ForegroundColor Gray
Write-Host "Output   : $OutputFile" -ForegroundColor Gray
Write-Host ""

# Run pg_dump inside the postgres container
docker compose exec -T postgres `
    sh -c "PGPASSWORD='$DB_PASS' pg_dump -U $DB_USER -d $DB_NAME --no-password" `
    > $OutputFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backup failed." -ForegroundColor Red
    Remove-Item -Path $OutputFile -ErrorAction SilentlyContinue
    exit $LASTEXITCODE
}

$SizeKB = [math]::Round((Get-Item $OutputFile).Length / 1KB, 1)
Write-Host "Backup complete: $OutputFile ($SizeKB KB)" -ForegroundColor Green
Write-Host ""
Write-Host "To restore: psql -U $DB_USER -d $DB_NAME < $OutputFile" -ForegroundColor Gray
