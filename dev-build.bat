@echo off
REM Fast rebuild: webpack + copy into running Docker container
REM Double-click this file (or run from terminal) after making CSS/JS changes.
REM
REM For a full Docker rebuild use:  dev-build.bat full

if /i "%1"=="full" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev-build.ps1" -Full
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev-build.ps1"
)
pause
