@echo off
echo Configurando Node.js con nvs...
call nvs use node/22.19.0/x64
echo Node.js configurado correctamente!
echo.
echo Comandos disponibles:
echo   ng serve        - Iniciar servidor de desarrollo
echo   ng build        - Construir para produccion
echo   ng test         - Ejecutar pruebas
echo   npm install     - Instalar dependencias
echo   npm start       - Alias para ng serve
echo.
echo El entorno esta listo para usar Angular CLI!