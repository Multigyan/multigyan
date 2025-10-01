@echo off
echo ===================================
echo Switching to Username-Based URLs
echo ===================================
echo.
echo Deleting OLD system: app\author\[id]
echo Keeping NEW system: app\author\[username]
echo.

rd /s /q "app\author\[id]"

if exist "app\author\[id]" (
    echo ERROR: Failed to delete [id] folder
    echo Please delete manually via VS Code
) else (
    echo SUCCESS: Old [id] folder deleted!
    echo.
    echo Now using USERNAME-based URLs!
    echo Example: /author/john-doe
    echo.
    echo You can now run: npm run dev
)

echo.
pause
