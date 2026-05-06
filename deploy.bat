@echo off
echo Building for production...

REM Clean previous build
if exist dist rmdir /s /q dist

REM Install dependencies
echo Installing dependencies...
npm install

REM Build the project
echo Building project...
npm run build

REM Check if build was successful
if exist dist (
    echo Build successful! Files are in the 'dist' directory.
    echo.
    echo To deploy:
    echo 1. Upload the 'dist' folder contents to your web server
    echo 2. Make sure your server serves index.html for all routes
    echo 3. Ensure HTTPS is enabled for wallet connections
    echo.
    echo For Vercel: vercel --prod
    echo For Netlify: netlify deploy --prod --dir=dist
) else (
    echo Build failed! Check the error messages above.
    exit /b 1
)

pause