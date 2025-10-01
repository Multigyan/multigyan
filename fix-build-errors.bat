@echo off
echo ========================================
echo Fixing Build Errors - Multigyan Project
echo ========================================
echo.

echo Step 1: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder deleted
) else (
    echo ! .next folder not found
)
echo.

echo Step 2: Deleting node_modules folder...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ node_modules folder deleted
) else (
    echo ! node_modules folder not found
)
echo.

echo Step 3: Deleting package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✓ package-lock.json deleted
) else (
    echo ! package-lock.json not found
)
echo.

echo Step 4: Installing all packages fresh...
echo (This may take a few minutes)
call npm install
echo.

echo Step 5: Installing nprogress...
call npm install nprogress
echo.

echo ========================================
echo ✓ All done! Now you can run: npm run dev
echo ========================================
pause
