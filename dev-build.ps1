# ============================================================
# dev-build.ps1  –  Development rebuild script
#
# FAST mode (default):
#   Rebuilds only the webpack JS/CSS bundle, then hot-copies
#   app.js and vendor.js into the running Docker container.
#   No container restart needed. Refresh your browser to see changes.
#   ~10-15 seconds.
#
# FULL mode (-Full flag):
#   Runs a complete Docker image rebuild (Maven + webpack inside
#   Docker) and restarts the container. Use this when you change
#   Java code, pom.xml, HTML pages, or module configuration.
#   ~5-10 minutes.
#
# Usage:
#   .\dev-build.ps1          # fast mode
#   .\dev-build.ps1 -Full    # full rebuild
# ============================================================

param(
    [switch]$Full
)

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot
$OWA_DIR = Join-Path $ROOT "owa"
$BUILD_DIR = Join-Path $OWA_DIR "app\build"
$CONTAINER = "clarity-openmrs-1"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Write-OK($msg) {
    Write-Host "    $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "    ERROR: $msg" -ForegroundColor Red
}

# ── FULL mode ────────────────────────────────────────────────
if ($Full) {
    Write-Step "FULL rebuild: docker compose build"
    Set-Location $ROOT
    docker compose build
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose build failed"; exit 1 }

    Write-Step "Starting containers"
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose up failed"; exit 1 }

    Write-OK "Done. OpenMRS is starting at http://localhost:8080/openmrs"
    Write-Host "    (First boot takes ~2-3 minutes for DB setup)" -ForegroundColor Yellow
    exit 0
}

# ── FAST mode ────────────────────────────────────────────────
Write-Step "Step 1/3 — Building webpack bundle"
Set-Location $OWA_DIR
$env:NODE_PATH = "./app"
npx webpack -p
if ($LASTEXITCODE -ne 0) { Write-Fail "webpack build failed"; exit 1 }
Write-OK "Webpack build complete (app.js, vendor.js)"

Write-Step "Step 2/3 — Locating OWA directory inside container"
Set-Location $ROOT

# Check the container is running
$running = docker ps --filter "name=$CONTAINER" --filter "status=running" -q
if (-not $running) {
    Write-Host ""
    Write-Host "    Container '$CONTAINER' is not running." -ForegroundColor Yellow
    Write-Host "    Starting containers first..." -ForegroundColor Yellow
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose up failed"; exit 1 }
    Write-Host "    Waiting 10s for OpenMRS to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Find where OpenMRS deployed the OWA (looks for app.js under /openmrs/data/owa)
$OWA_CONTAINER_PATH = docker exec $CONTAINER sh -c "find /openmrs/data/owa -name 'app.js' 2>/dev/null | head -1" 2>$null
if (-not $OWA_CONTAINER_PATH) {
    Write-Host ""
    Write-Host "    Could not find OWA app.js in the container yet." -ForegroundColor Yellow
    Write-Host "    OpenMRS may still be deploying the module. Try again in ~30 seconds." -ForegroundColor Yellow
    Write-Host "    Alternatively, run: .\dev-build.ps1 -Full" -ForegroundColor Yellow
    exit 1
}

$OWA_CONTAINER_DIR = ($OWA_CONTAINER_PATH -replace "/app\.js$", "")
Write-OK "Found OWA at: $OWA_CONTAINER_DIR"

Write-Step "Step 3/3 — Copying updated bundle into container"
docker cp "$BUILD_DIR\app.js"    "${CONTAINER}:${OWA_CONTAINER_DIR}/app.js"
docker cp "$BUILD_DIR\vendor.js" "${CONTAINER}:${OWA_CONTAINER_DIR}/vendor.js"
if ($LASTEXITCODE -ne 0) { Write-Fail "docker cp failed"; exit 1 }
Write-OK "Copied app.js and vendor.js"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Done! Refresh your browser — no restart needed." -ForegroundColor Green
Write-Host "  URL: http://localhost:8080/openmrs/owa/bedManagement/admissionLocations.html" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
