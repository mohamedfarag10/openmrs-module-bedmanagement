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

powershell -Command "(Get-Content 'C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\admissionLocations.html') -replace 'vendor\.js\?v=\d+', 'vendor.js?v=%VER%' -replace 'app\.js\?v=\d+', 'app.js?v=%VER%' -replace 'vendor\.js\"', 'vendor.js?v=%VER%\"' -replace 'app\.js\"', 'app.js?v=%VER%\"' | Set-Content 'C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\admissionLocations.html'"

powershell -Command "(Get-Content 'C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\bedTypes.html') -replace 'vendor\.js\?v=\d+', 'vendor.js?v=%VER%' -replace 'app\.js\?v=\d+', 'app.js?v=%VER%' -replace 'vendor\.js\"', 'vendor.js?v=%VER%\"' -replace 'app\.js\"', 'app.js?v=%VER%\"' | Set-Content 'C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\bedTypes.html'"

powershell -Command "(Get-Content 'C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\bedTags.html') -replace 'vendor\.js\?v=\d+', 'vendor.js?v=%VER%' -replace 'app\.js\?v=\d+', 'app.js?v=%VER%' -replace 'vendor\.js\"', 'vendor.js?v=%VER%\"' -replace 'app\.js\"', 'app.js?v=%VER%\"' | Set-Content 'C:\Users\mohamedfarag\openmrs\myserver\owa\bedmanagement\bedTags.html'"

echo.
echo ========================================
echo   Done! Version: %VER%
echo   Press Ctrl+Shift+R in browser to reload
echo ========================================
pause
