# dev-build.ps1 - Development rebuild script
#
# FAST mode (default, ~15 sec):
#   Rebuilds webpack JS/CSS bundle and hot-copies app.js + vendor.js
#   directly into the running Docker container. Just refresh the browser.
#
# FULL mode (-Full flag, ~5-10 min):
#   Rebuilds the Docker image (Maven + webpack inside Docker), clears the
#   old OWA from the persistent volume so OpenMRS re-extracts the new one,
#   then restarts the container.
#
# Usage:
#   .\dev-build.ps1          # fast: webpack + docker cp
#   .\dev-build.ps1 -Full    # full: docker compose build + clean + up

param(
    [switch]$Full
)

$ErrorActionPreference = "Stop"
$ROOT      = $PSScriptRoot
$OWA_DIR   = Join-Path $ROOT "owa"
$BUILD_DIR = Join-Path $OWA_DIR "app\build"
$CONTAINER = "clarity-openmrs-1"
$VOLUME    = "clarity_openmrs-data"

function Write-Step {
    param([string]$msg)
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Write-OK {
    param([string]$msg)
    Write-Host "    OK: $msg" -ForegroundColor Green
}

function Write-Fail {
    param([string]$msg)
    Write-Host "    ERROR: $msg" -ForegroundColor Red
    exit 1
}

# --- FULL mode ---------------------------------------------------
if ($Full) {
    Write-Step "Step 1/4 - Building Docker image (Maven + webpack)"
    Set-Location $ROOT
    docker compose build
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose build failed" }
    Write-OK "Docker image built"

    Write-Step "Step 2/4 - Stopping containers"
    docker compose down
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose down failed" }
    Write-OK "Containers stopped"

    Write-Step "Step 3/4 - Clearing old OWA from volume"
    # This forces OpenMRS to re-extract the fresh OWA from the new .omod
    docker run --rm -v "${VOLUME}:/data" alpine sh -c "rm -rf /data/owa"
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to clear OWA from volume" }
    Write-OK "Old OWA files removed from volume"

    Write-Step "Step 4/4 - Starting containers"
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose up failed" }
    Write-OK "Containers started"

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  Done! OpenMRS is starting up..." -ForegroundColor Green
    Write-Host "  Wait 2-3 minutes for first boot, then open:" -ForegroundColor Green
    Write-Host "  http://localhost:8080/openmrs" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    exit 0
}

# --- FAST mode ---------------------------------------------------
Write-Step "Step 1/3 - Building webpack bundle"
Set-Location $OWA_DIR
$env:NODE_PATH = "./app"
npx webpack -p
if ($LASTEXITCODE -ne 0) { Write-Fail "webpack build failed" }
Write-OK "Webpack bundle built: app.js, vendor.js"

Write-Step "Step 2/3 - Locating OWA directory inside container"
Set-Location $ROOT

$running = docker ps --filter "name=$CONTAINER" --filter "status=running" -q 2>$null
if (-not $running) {
    Write-Host "    Container '$CONTAINER' is not running. Starting..." -ForegroundColor Yellow
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { Write-Fail "docker compose up failed" }
    Write-Host "    Waiting 15s for OpenMRS to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

$owaAppJs = docker exec $CONTAINER sh -c "find /openmrs/data/owa -name 'app.js' 2>/dev/null | head -1" 2>$null
if (-not $owaAppJs) {
    Write-Host ""
    Write-Host "    Cannot find OWA app.js in the container yet." -ForegroundColor Yellow
    Write-Host "    OpenMRS may still be deploying the module." -ForegroundColor Yellow
    Write-Host "    Wait ~30 sec and try again, or run: .\dev-build.ps1 -Full" -ForegroundColor Yellow
    exit 1
}

$owaDir = $owaAppJs -replace "/app\.js$", ""
Write-OK "OWA found at: $owaDir"

Write-Step "Step 3/3 - Copying updated bundle into container"
$appJs    = Join-Path $BUILD_DIR "app.js"
$vendorJs = Join-Path $BUILD_DIR "vendor.js"
docker cp $appJs    "${CONTAINER}:${owaDir}/app.js"
docker cp $vendorJs "${CONTAINER}:${owaDir}/vendor.js"
if ($LASTEXITCODE -ne 0) { Write-Fail "docker cp failed" }
Write-OK "Copied app.js and vendor.js"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Done! Refresh your browser to see the changes." -ForegroundColor Green
Write-Host "  http://localhost:8080/openmrs/owa/bedManagement/admissionLocations.html" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
