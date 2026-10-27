@echo off
setlocal enabledelayedexpansion
title Push mythology-site to Git

set "REPO=C:\Users\datan\WorkBuddy\2026-10-15-13-58-24\mythology-site"
set "URL=%~1"

if "%URL%"=="" (
    echo.
    echo   Paste your repository URL, for example:
    echo     https://github.com/yourname/laojishi.git
    echo     git@github.com:yourname/laojishi.git
    echo.
    set /p "URL=  URL: "
)

if "%URL%"=="" (
    echo   No URL given. Exit.
    pause
    exit /b 1
)

cd /d "%REPO%"
if errorlevel 1 (
    echo   Project folder not found: %REPO%
    pause
    exit /b 1
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin "%URL%"
) else (
    git remote set-url origin "%URL%"
)

echo.
echo   Pushing to %URL% ...
echo.
git push -u origin main
if errorlevel 1 (
    echo.
    echo   FAILED. Check the URL and your permission.
    echo   For HTTPS use a Personal Access Token as the password.
    echo   For SSH add this public key to your Git account first:
    echo     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICppAr/vuP742OeaqTty5D0qHg25wl75x2vQGzLQXB8H datan@mythology-site
) else (
    echo.
    echo   DONE. Repository is online.
)
echo.
pause
