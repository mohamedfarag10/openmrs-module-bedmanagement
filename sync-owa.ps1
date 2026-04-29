# Sync OWA source -> OpenMRS deployed folder (Windows / PowerShell)
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

$Src  = 'C:\Work\Virtual_Hospital\openmrs-module-bedmanagement\owa'
$Dest = 'C:\openmrs\data\owa\bedmanagement'

function Show-Help {
@"
sync-owa.ps1 - copy bedmanagement OWA changes to the running OpenMRS server

  Source : $Src
  Target : $Dest

Usage:
  .\sync-owa.ps1            Fast sync (HTML/CSS/img/manifest + existing build/)
  .\sync-owa.ps1 -Build     Run webpack first, then sync everything
  .\sync-owa.ps1 -Help      Show this help

After running, hard-refresh the browser (Ctrl+F5).
Note: changes are wiped if Tomcat restarts (the .omod re-extracts on startup).
"@
}

if ($Help) { Show-Help; exit 0 }

if (-not (Test-Path $Src))  { Write-Error "Source folder not found: $Src";  exit 1 }
if (-not (Test-Path $Dest)) { Write-Error "Deployed folder not found: $Dest`nHas the bedmanagement OWA been installed in OpenMRS?"; exit 1 }

if ($Build) {
    Write-Host "==> webpack build (one-shot)..." -ForegroundColor Cyan
    Push-Location $Src
    try {
        $webpack = Join-Path $Src 'node_modules\.bin\webpack.cmd'
        if (-not (Test-Path $webpack)) {
            Write-Error "webpack not found at $webpack. Run 'npm install' in $Src first."
            exit 1
        }
        & $webpack -d
        if ($LASTEXITCODE -ne 0) { Write-Error "webpack failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

Write-Host "==> Syncing static assets..." -ForegroundColor Cyan
Copy-Item -Path (Join-Path $Src 'app\*.html')        -Destination $Dest -Force
Copy-Item -Path (Join-Path $Src 'app\manifest.webapp') -Destination $Dest -Force

New-Item -ItemType Directory -Force -Path (Join-Path $Dest 'css') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Dest 'img') | Out-Null
Copy-Item -Path (Join-Path $Src 'app\css\*') -Destination (Join-Path $Dest 'css') -Recurse -Force
Copy-Item -Path (Join-Path $Src 'app\img\*') -Destination (Join-Path $Dest 'img') -Recurse -Force

$buildDir = Join-Path $Src 'build'
if ((Test-Path $buildDir) -and (Get-ChildItem -Path $buildDir -Filter '*.js' -ErrorAction SilentlyContinue)) {
    Write-Host "==> Syncing build/ bundle..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path (Join-Path $Dest 'build') | Out-Null
    Copy-Item -Path (Join-Path $buildDir '*.js') -Destination (Join-Path $Dest 'build') -Force
} else {
    Write-Host "==> Skipping build/ (no bundle found - run with -Build the first time)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. Hard-refresh the browser (Ctrl+F5)." -ForegroundColor Green
