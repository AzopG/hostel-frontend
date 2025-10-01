# Script de configuración automática de Node.js para el proyecto Hotel
Write-Host "🏨 Configurando entorno para Hotel Paradise..." -ForegroundColor Green
Write-Host ""

# Configurar Node.js con nvs
try {
    nvs use node/22.19.0/x64
    Write-Host "✅ Node.js 22.19.0 configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando Node.js. Verifica que nvs esté instalado." -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del frontend
Set-Location "c:\Users\Ivancho\Desktop\Hotel\frontend"
Write-Host "📁 Directorio cambiado a: $(Get-Location)" -ForegroundColor Blue

Write-Host ""
Write-Host "🚀 Entorno listo! Comandos disponibles:" -ForegroundColor Yellow
Write-Host "   .\node_modules\.bin\ng serve --open    - Servidor de desarrollo"
Write-Host "   .\node_modules\.bin\ng build           - Build de producción"
Write-Host "   .\node_modules\.bin\ng test            - Ejecutar pruebas"
Write-Host "   npm install                            - Instalar dependencias"
Write-Host ""
Write-Host "💡 Tip: Ejecuta este script cada vez que abras una nueva terminal" -ForegroundColor Cyan