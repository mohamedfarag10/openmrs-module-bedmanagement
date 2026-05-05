# Sync OWA source -> OpenMRS Docker container (Windows / PowerShell)
#
# Usage:
#   .\sync-owa.ps1            # fast sync: HTML/CSS/img/manifest + existing build/
#   .\sync-owa.ps1 -Build     # run webpack first, then sync everything
#   .\sync-owa.ps1 -Help

param(
    [switch]$Build,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

$OwaDir    = Join-Path $PSScriptRoot 'owa'
$AppDir    = Join-Path $OwaDir 'app'
$BuildDir  = Join-Path $AppDir 'build'
$Container = 'clarity-openmrs-1'
$ContDest  = '/openmrs/data/owa/bedmanagement'

function Show-Help {
@"
sync-owa.ps1 - copy bedmanagement OWA changes into the running Docker container

  Source    : $AppDir
  Container : $Container
  Target    : $ContDest

Usage:
  .\sync-owa.ps1            Fast sync (HTML/CSS/img/manifest + existing build/)
  .\sync-owa.ps1 -Build     Run webpack first, then sync everything
  .\sync-owa.ps1 -Help      Show this help

After running, hard-refresh the browser (Ctrl+F5).
Note: changes are wiped if the container is recreated (the .omod re-extracts on startup).
"@
}

function Assert-Container {
    $running = docker inspect --format '{{.State.Running}}' $Container 2>$null
    if ($running -ne 'true') {
        Write-Error "Container '$Container' is not running. Start it with: docker compose up -d"
        exit 1
    }
}

function DockCp($local, $remote) {
    docker cp $local "${Container}:${remote}"
    if ($LASTEXITCODE -ne 0) { Write-Error "docker cp failed: $local -> $remote"; exit $LASTEXITCODE }
}

if ($Help) { Show-Help; exit 0 }

if (-not (Test-Path $OwaDir)) { Write-Error "Source folder not found: $OwaDir"; exit 1 }

Assert-Container

if ($Build) {
    Write-Host "==> webpack build (one-shot)..." -ForegroundColor Cyan
    $webpack = Join-Path $OwaDir 'node_modules\.bin\webpack.cmd'
    if (-not (Test-Path $webpack)) {
        Write-Error "webpack not found at $webpack. Run 'npm install' in $OwaDir first."
        exit 1
    }
    Push-Location $OwaDir
    try {
        & $webpack -d
        if ($LASTEXITCODE -ne 0) { Write-Error "webpack failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
    } finally { Pop-Location }
    Write-Host ""
}

Write-Host "==> Syncing static assets -> $Container ..." -ForegroundColor Cyan

# HTML + manifest
foreach ($f in (Get-ChildItem (Join-Path $AppDir '*.html'))) {
    DockCp $f.FullName "$ContDest/$($f.Name)"
    Write-Host "    $($f.Name)" -ForegroundColor DarkGray
}
DockCp (Join-Path $AppDir 'manifest.webapp') "$ContDest/manifest.webapp"
Write-Host "    manifest.webapp" -ForegroundColor DarkGray

# CSS
docker exec $Container mkdir -p "$ContDest/css" | Out-Null
DockCp (Join-Path $AppDir 'css') "$ContDest/"
Write-Host "    css/" -ForegroundColor DarkGray

# Images
docker exec $Container mkdir -p "$ContDest/img" | Out-Null
DockCp (Join-Path $AppDir 'img') "$ContDest/"
Write-Host "    img/" -ForegroundColor DarkGray

# JS bundle
if ((Test-Path $BuildDir) -and (Get-ChildItem $BuildDir -Filter '*.js' -ErrorAction SilentlyContinue)) {
    Write-Host "==> Syncing JS bundle..." -ForegroundColor Cyan
    docker exec $Container mkdir -p "$ContDest/build" | Out-Null
    DockCp (Join-Path $BuildDir 'app.js')    "$ContDest/build/app.js"
    DockCp (Join-Path $BuildDir 'vendor.js') "$ContDest/build/vendor.js"
    Write-Host "    build/app.js + build/vendor.js" -ForegroundColor DarkGray
} else {
    Write-Host "==> Skipping build/ (no bundle found - run .\sync-owa.ps1 -Build first)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. Hard-refresh the browser (Ctrl+F5)." -ForegroundColor Green
