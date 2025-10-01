@echo off
echo ===================================
echo Final Cleanup - Delete [id] Folder
echo ===================================
echo.
echo This will delete: app\author\[id]
echo And keep: app\author\[username]
echo.
pause

if exist "app\author\[id]" (
    rd /s /q "app\author\[id]"
    
    if exist "app\author\[id]" (
        echo.
        echo ERROR: Could not delete folder
        echo Please delete manually in VS Code:
        echo 1. Open: app\author\
        echo 2. Delete: [id] folder
        echo 3. Keep: [username] folder
    ) else (
        echo.
        echo SUCCESS! [id] folder deleted
        echo.
        echo You can now run: npm run dev
        echo.
        echo All fixes applied:
        echo  - Navbar icons aligned
        echo  - Next.js 15 params fixed
        echo  - Mongoose warning fixed
        echo  - Username-based URLs active
    )
) else (
    echo.
    echo [id] folder not found. Already deleted!
    echo You're good to go!
)

echo.
pause
