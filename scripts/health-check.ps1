# ─────────────────────────────────────────────────────────────────────────────
# health-check.ps1 — verify all EAM services are healthy
#
# Usage:
#   ./scripts/health-check.ps1
#   ./scripts/health-check.ps1 -BaseUrl "http://localhost"
# ─────────────────────────────────────────────────────────────────────────────

param(
    [string]$BaseUrl = "http://localhost"
)

$ErrorActionPreference = "SilentlyContinue"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

# Read REDIS_PASSWORD from backend/.env for authenticated ping
$EnvFile = Join-Path $ProjectRoot "backend\.env"
$RedisPwd = ""
if (Test-Path $EnvFile) {
    $RedisPwd = (Get-Content $EnvFile | Where-Object { $_ -match '^REDIS_PASSWORD=' } | `
        ForEach-Object { ($_ -split '=', 2)[1].Trim().Trim('"').Trim("'") } | Select-Object -First 1)
}

Write-Host ""
Write-Host "=== EAM Health Check ===" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

function Test-Http {
    param([string]$Label, [string]$Url, [int]$ExpectedStatus = 200)
    try {
        $resp = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
        if ($resp.StatusCode -eq $ExpectedStatus) {
            Write-Host "  [OK]  $Label ($Url)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [WARN] $Label - HTTP $($resp.StatusCode) (expected $ExpectedStatus)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  [FAIL] $Label - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-Docker {
    param([string]$Label, [string]$Container)
    $status = docker inspect --format "{{.State.Status}}" $Container 2>$null
    $health = docker inspect --format "{{.State.Health.Status}}" $Container 2>$null
    if ($status -eq "running" -and ($health -eq "healthy" -or $health -eq "")) {
        Write-Host "  [OK]  $Label (container: $Container)" -ForegroundColor Green
        return $true
    } elseif ($status -eq "running") {
        Write-Host "  [WARN] $Label - running but health=$health" -ForegroundColor Yellow
        return $false
    } else {
        Write-Host "  [FAIL] $Label - container status=$status" -ForegroundColor Red
        return $false
    }
}

Write-Host "Container status:" -ForegroundColor White
$allOk = (Test-Docker "postgres"      "eam_postgres")   -and $allOk
$allOk = (Test-Docker "redis"         "eam_redis")      -and $allOk
$allOk = (Test-Docker "backend"       "eam_backend")    -and $allOk
$allOk = (Test-Docker "frontend"      "eam_frontend")   -and $allOk
$allOk = (Test-Docker "nginx"         "eam_nginx")      -and $allOk
$allOk = (Test-Docker "wiki"          "eam_wiki")       -and $allOk

Write-Host ""
Write-Host "HTTP endpoints:" -ForegroundColor White
$allOk = (Test-Http  "Backend API health"  "$BaseUrl/api/health")          -and $allOk
$allOk = (Test-Http  "Backend Swagger"     "$BaseUrl/api/docs")            -and $allOk
$allOk = (Test-Http  "Frontend"            "$BaseUrl/")                    -and $allOk
$allOk = (Test-Http  "Wiki App"            "http://localhost:3001/wiki")      -and $allOk
$allOk = (Test-Http  "pgAdmin"             "http://localhost:5050/")       -and $allOk

Write-Host ""
Write-Host "Redis ping:" -ForegroundColor White
if ($RedisPwd) {
    $redisPing = docker compose exec -T redis redis-cli --no-auth-warning -a "$RedisPwd" ping 2>$null
} else {
    $redisPing = docker compose exec -T redis redis-cli ping 2>$null
}
if ($redisPing -match "PONG") {
    Write-Host "  [OK]  Redis PONG" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Redis did not PONG (got: $redisPing)" -ForegroundColor Red
    $allOk = $false
}

Write-Host ""
if ($allOk) {
    Write-Host "All services healthy." -ForegroundColor Green
} else {
    Write-Host "One or more services failed health check." -ForegroundColor Red
    exit 1
}
