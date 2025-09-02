@echo off
echo Creating PWA icons for Smart Home Controller...
echo.

REM Create simple SVG icon first
echo ^<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"^> > icon.svg
echo   ^<rect width="512" height="512" fill="#4361ee" rx="80"/^> >> icon.svg
echo   ^<path fill="white" d="M256 80L160 160v240h80V280h96v120h80V160L256 80z"/^> >> icon.svg
echo   ^<circle cx="256" cy="200" r="20" fill="white"/^> >> icon.svg
echo ^</svg^> >> icon.svg

echo SVG icon created: icon.svg
echo.
echo To create PNG icons (192x192 and 512x512):
echo 1. Open icon.svg in any image editor
echo 2. Export as PNG with sizes 192x192 and 512x512
echo 3. Save as icon-192.png and icon-512.png
echo.
echo Or use online converter: https://convertio.co/svg-png/
echo.
pause