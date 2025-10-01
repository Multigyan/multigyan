@echo off
echo ===================================
echo Fixing Next.js Routing Conflict
echo ===================================
echo.
echo Deleting: app\author\[username]
echo.

rd /s /q "app\author\[username]"

if exist "app\author\[username]" (
    echo ERROR: Failed to delete folder
    echo Please delete manually via VS Code
) else (
    echo SUCCESS: Folder deleted!
    echo.
    echo You can now run: npm run dev
)

echo.
pause
