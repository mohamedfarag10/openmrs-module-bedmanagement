@echo off
echo ========================================
echo   Bed Management - Build and Deploy
echo ========================================

cd /d "C:\work\openmrs-module-bedmanagement\owa"

echo.
echo [1/3] Building webpack...
set NODE_PATH=./app
node_modules\.bin\webpack -p
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Deploying to server...
copy /Y "app\build\app.js"    "C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\build\app.js"
copy /Y "app\build\vendor.js" "C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\build\vendor.js"
if %errorlevel% neq 0 (
    echo ERROR: Deploy failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Updating cache-busting version...
for /f %%i in ('node -e "process.stdout.write(String(Date.now()).slice(0,-3))"') do set VER=%%i

set HTML_DIR=C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement

node -e "^
var fs=require('fs');^
var ver='%VER%';^
var files=['admissionLocations.html','bedTypes.html','bedTags.html'];^
files.forEach(function(f){^
  var p='%HTML_DIR%\\\\'+f;^
  var c=fs.readFileSync(p,'utf8');^
  c=c.replace(/vendor\.js(\?v=\d+)?/g,'vendor.js?v='+ver);^
  c=c.replace(/app\.js(\?v=\d+)?/g,'app.js?v='+ver);^
  fs.writeFileSync(p,c,'utf8');^
  console.log('Updated: '+f);^
});"

echo.
echo ========================================
echo   Done! Version: %VER%
echo   Press Ctrl+Shift+R in browser to reload
echo ========================================
pause
