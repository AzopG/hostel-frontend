# Hotel Paradise - Configuración Automática de Desarrollo
# Este script configura automáticamente el entorno de desarrollo

param(
    [string]$Command = "help"
)

$ProjectPath = "c:\Users\Ivancho\Desktop\Hotel\frontend"
$NodeVersion = "node/22.19.0/x64"

function Write-Banner {
    Write-Host ""
    Write-Host "🏨═══════════════════════════════════════════════════════════🏨" -ForegroundColor Blue
    Write-Host "    Hotel Paradise - Sistema de Gestión Hotelera" -ForegroundColor Yellow
    Write-Host "🏨═══════════════════════════════════════════════════════════🏨" -ForegroundColor Blue
    Write-Host ""
}

function Setup-Environment {
    Write-Host "⚙️  Configurando entorno de desarrollo..." -ForegroundColor Green
    
    try {
        # Configurar Node.js
        nvs use $NodeVersion
        Write-Host "✅ Node.js configurado: $NodeVersion" -ForegroundColor Green
        
        # Cambiar directorio
        Set-Location $ProjectPath
        Write-Host "✅ Directorio: $ProjectPath" -ForegroundColor Green
        
        # Verificar instalación
        if (Test-Path ".\node_modules\.bin\ng") {
            Write-Host "✅ Angular CLI encontrado" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Angular CLI no encontrado, instalando dependencias..." -ForegroundColor Yellow
            npm install
        }
        
        return $true
    } catch {
        Write-Host "❌ Error configurando entorno: $_" -ForegroundColor Red
        return $false
    }
}

function Start-DevServer {
    Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Blue
    .\node_modules\.bin\ng serve --open
}

function Build-Production {
    Write-Host "🏗️  Construyendo para producción..." -ForegroundColor Blue
    .\node_modules\.bin\ng build
}

function Run-Tests {
    Write-Host "🧪 Ejecutando pruebas..." -ForegroundColor Blue
    .\node_modules\.bin\ng test
}

function Show-Help {
    Write-Host "📖 Comandos disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  .\dev.ps1 serve     - Iniciar servidor de desarrollo" -ForegroundColor White
    Write-Host "  .\dev.ps1 build     - Construir para producción" -ForegroundColor White
    Write-Host "  .\dev.ps1 test      - Ejecutar pruebas" -ForegroundColor White
    Write-Host "  .\dev.ps1 install   - Instalar dependencias" -ForegroundColor White
    Write-Host "  .\dev.ps1 setup     - Solo configurar entorno" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Ejemplos:" -ForegroundColor Cyan
    Write-Host "  .\dev.ps1 serve     # Inicia el servidor en http://localhost:4200" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 build     # Genera archivos en dist/" -ForegroundColor Gray
    Write-Host ""
}

# Script principal
Write-Banner

switch ($Command.ToLower()) {
    "serve" {
        if (Setup-Environment) {
            Start-DevServer
        }
    }
    "build" {
        if (Setup-Environment) {
            Build-Production
        }
    }
    "test" {
        if (Setup-Environment) {
            Run-Tests
        }
    }
    "install" {
        if (Setup-Environment) {
            Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
            npm install
        }
    }
    "setup" {
        Setup-Environment
        Write-Host "✅ Entorno configurado y listo para usar!" -ForegroundColor Green
    }
    default {
        Show-Help
    }
}

Write-Host ""