# ─────────────────────────────────────────────────────────────────────────────
# logs.ps1 — tail logs for one or all EAM services
#
# Usage:
#   ./scripts/logs.ps1                          # tail all services
#   ./scripts/logs.ps1 backend                  # tail backend only
#   ./scripts/logs.ps1 backend -Lines 100       # last 100 lines
#   ./scripts/logs.ps1 migrate                  # review migration output
#
# Available services: postgres, redis, backend, frontend, nginx, wiki, pgadmin
#                     migrate, seed-admin
# ─────────────────────────────────────────────────────────────────────────────

param(
    [Parameter(Position = 0)]
    [string]$Service = "",

    [int]$Lines = 50,

    [switch]$Follow
)

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

$followFlag = if ($Follow) { "--follow" } else { "" }

if ($Service) {
    Write-Host "=== Logs: $Service (last $Lines lines) ===" -ForegroundColor Cyan
    if ($followFlag) {
        docker compose logs $Service --tail $Lines --follow
    } else {
        docker compose logs $Service --tail $Lines
    }
} else {
    Write-Host "=== Logs: all services (last $Lines lines each) ===" -ForegroundColor Cyan
    if ($followFlag) {
        docker compose logs --tail $Lines --follow
    } else {
        docker compose logs --tail $Lines
    }
}
