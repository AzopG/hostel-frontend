import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage-simple',
  standalone: true,
  template: `
    <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
      <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 2.5em;">🏨 Hotel Paradise</h1>
        <p style="margin: 10px 0 0 0; font-size: 1.2em;">Sistema de Gestión Hotelera</p>
      </header>

      <nav style="display: flex; justify-content: center; margin-bottom: 40px; gap: 20px;">
        <button style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🏠 Inicio</button>
        <button style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🏨 Hoteles</button>
        <button style="padding: 12px 24px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">📅 Reservas</button>
        <button style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">👤 Login</button>
      </nav>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <div style="font-size: 3em; margin-bottom: 15px;">🏨</div>
          <h3 style="color: #333; margin: 0 0 15px 0;">Hoteles</h3>
          <p style="color: #666; margin: 0;">Gestiona todos los hoteles del sistema</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <div style="font-size: 3em; margin-bottom: 15px;">🛏️</div>
          <h3 style="color: #333; margin: 0 0 15px 0;">Habitaciones</h3>
          <p style="color: #666; margin: 0;">Administra habitaciones y disponibilidad</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <div style="font-size: 3em; margin-bottom: 15px;">📅</div>
          <h3 style="color: #333; margin: 0 0 15px 0;">Reservas</h3>
          <p style="color: #666; margin: 0;">Controla todas las reservas</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <div style="font-size: 3em; margin-bottom: 15px;">📊</div>
          <h3 style="color: #333; margin: 0 0 15px 0;">Reportes</h3>
          <p style="color: #666; margin: 0;">Estadísticas y análisis</p>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #333; margin: 0 0 20px 0;">¡Sistema funcionando correctamente!</h2>
        <p style="color: #666; margin: 0; font-size: 18px;">
          ✅ Angular está corriendo<br>
          ✅ Servidor en puerto 4200<br>
          ✅ Componentes cargando
        </p>
      </div>
    </div>
  `,
  styles: [`
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }
    
    div:hover {
      transform: translateY(-5px);
      transition: all 0.3s ease;
    }
  `]
})
export class HomepageSimpleComponent { }