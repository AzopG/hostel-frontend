@echo off
title Hotel Paradise - Angular Dev Server
echo.
echo 🏨 Iniciando Hotel Paradise Frontend...
echo.

call nvs use node/22.19.0/x64

cd /d "c:\Users\Ivancho\Desktop\Hotel\frontend"

echo ✅ Entorno configurado
echo 🚀 Iniciando servidor de desarrollo...
echo.

.\node_modules\.bin\ng serve --open

pause