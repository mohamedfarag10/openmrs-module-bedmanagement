# Build the bedmanagement OWA then sync to the running OpenMRS server.
#
# Usage:
#   .\build-owa.ps1           # npm install + webpack + sync
#   .\build-owa.ps1 -SkipInstall  # skip npm install (faster, if deps already installed)

param(
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

$OwaDir = Join-Path $PSScriptRoot 'owa'
$Dest   = 'C:\openmrs\data\owa\bedmanagement'

if (-not (Test-Path $OwaDir)) {
    Write-Error "OWA source folder not found: $OwaDir"
    exit 1
}

Push-Location $OwaDir
try {
    if (-not $SkipInstall) {
        Write-Host "==> npm install..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
        Write-Host ""
    }

    Write-Host "==> webpack build..." -ForegroundColor Cyan
    $webpack = Join-Path $OwaDir 'node_modules\.bin\webpack.cmd'
    if (-not (Test-Path $webpack)) {
        Write-Error "webpack not found. Run without -SkipInstall to install dependencies first."
        exit 1
    }
    & $webpack -d
    if ($LASTEXITCODE -ne 0) { Write-Error "webpack failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
    Write-Host ""
} finally {
    Pop-Location
}

Write-Host "==> Syncing to OpenMRS..." -ForegroundColor Cyan
& "$PSScriptRoot\sync-owa.ps1" -Build:$false

Write-Host ""
Write-Host "Build complete. Hard-refresh the browser (Ctrl+F5)." -ForegroundColor Green
