# ============================================================
#  dev-owa.ps1  -  Bahmni Bed Management OWA - Dev Workflow
# ============================================================
#
# Usage:
#   .\dev-owa.ps1              # build (dev) + sync to Docker container
#   .\dev-owa.ps1 -Watch       # webpack watch mode (live rebuild)
#   .\dev-owa.ps1 -Prod        # run tests + production build + sync
#   .\dev-owa.ps1 -SyncOnly    # copy files only, skip build
#   .\dev-owa.ps1 -Install     # npm install + build + sync

param(
    [switch]$Watch,
    [switch]$Prod,
    [switch]$SyncOnly,
    [switch]$Install
)

$ErrorActionPreference = 'Stop'

$OwaDir    = Join-Path $PSScriptRoot 'owa'
$AppDir    = Join-Path $OwaDir  'app'
$BuildDir  = Join-Path $AppDir  'build'
$Webpack   = Join-Path $OwaDir  'node_modules\.bin\webpack.cmd'
$Container = 'clarity-openmrs-1'
$ContDest  = '/openmrs/data/owa/bedmanagement'

# ── helpers ──────────────────────────────────────────────────
function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "    $msg" -ForegroundColor Yellow }
function Die($msg)  { Write-Error $msg; exit 1 }

function DockCp($local, $remote) {
    docker cp $local "${Container}:${remote}"
    if ($LASTEXITCODE -ne 0) { Die "docker cp failed: $local -> $remote" }
}

function Assert-Container {
    $running = docker inspect --format '{{.State.Running}}' $Container 2>$null
    if ($running -ne 'true') { Die "Container '$Container' is not running. Start with: docker compose up -d" }
}

function Copy-Static {
    Step "Copying HTML pages -> $Container ..."
    foreach ($f in (Get-ChildItem (Join-Path $AppDir '*.html'))) {
        DockCp $f.FullName "$ContDest/$($f.Name)"
        Ok $f.Name
    }
    DockCp (Join-Path $AppDir 'manifest.webapp') "$ContDest/manifest.webapp"
    Ok "manifest.webapp"

    Step "Copying CSS..."
    docker exec $Container mkdir -p "$ContDest/css" | Out-Null
    DockCp (Join-Path $AppDir 'css') "$ContDest/"
    Ok "css/"

    Step "Copying images..."
    docker exec $Container mkdir -p "$ContDest/img" | Out-Null
    DockCp (Join-Path $AppDir 'img') "$ContDest/"
    Ok "img/"
}

function Copy-Bundle {
    if (-not (Test-Path $BuildDir)) { Warn "No build/ found - run without -SyncOnly first."; return }
    $js = Get-ChildItem $BuildDir -Filter '*.js' -ErrorAction SilentlyContinue
    if (-not $js) { Warn "build/ exists but has no .js files - run a build first."; return }

    Step "Copying JS bundle -> $Container ..."
    docker exec $Container mkdir -p "$ContDest/build" | Out-Null
    DockCp (Join-Path $BuildDir 'app.js')    "$ContDest/build/app.js"
    DockCp (Join-Path $BuildDir 'vendor.js') "$ContDest/build/vendor.js"
    Ok "build/app.js + build/vendor.js"
}

function Run-NpmInstall {
    Step "Running npm install..."
    Push-Location $OwaDir
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { Die "npm install failed (exit $LASTEXITCODE)" }
    } finally { Pop-Location }
    Ok "node_modules ready"
}

function Assert-Webpack {
    if (-not (Test-Path $Webpack)) { Die "webpack not found. Run: .\dev-owa.ps1 -Install" }
}

# ── main ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Bahmni Bed Management OWA" -ForegroundColor Magenta
Write-Host "  Source    : $AppDir"    -ForegroundColor DarkGray
Write-Host "  Container : $Container" -ForegroundColor DarkGray
Write-Host "  Target    : $ContDest"  -ForegroundColor DarkGray
Write-Host ""

Assert-Container

if ($Install) { Run-NpmInstall }

if ($SyncOnly) {
    Copy-Static
    Copy-Bundle

} elseif ($Watch) {
    Assert-Webpack
    Copy-Static
    Step "Starting webpack WATCH mode (Ctrl+C to stop)..."
    Write-Host "    JS will rebuild automatically on save." -ForegroundColor DarkGray
    Write-Host "    Run  .\dev-owa.ps1 -SyncOnly  after each rebuild to push changes." -ForegroundColor DarkGray
    Push-Location $OwaDir
    try { & $Webpack -wd } finally { Pop-Location }

} elseif ($Prod) {
    Assert-Webpack
    Step "Running tests + production build..."
    Push-Location $OwaDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { Die "npm run build failed (exit $LASTEXITCODE)" }
    } finally { Pop-Location }
    Ok "Production bundle ready"
    Copy-Static
    Copy-Bundle

} else {
    # Default: dev one-shot build
    Assert-Webpack
    Step "Running webpack dev build..."
    Push-Location $OwaDir
    try {
        & $Webpack -d
        if ($LASTEXITCODE -ne 0) { Die "webpack failed (exit $LASTEXITCODE)" }
    } finally { Pop-Location }
    Ok "build/app.js + build/vendor.js ready"
    Copy-Static
    Copy-Bundle
}

Write-Host ""
Write-Host "  Setup completed successfully!" -ForegroundColor Green
Write-Host "  Hard-refresh the browser (Ctrl+F5) to see changes." -ForegroundColor DarkGray
Write-Host ""
