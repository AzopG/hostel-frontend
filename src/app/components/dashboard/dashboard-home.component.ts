import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-home">
      <div class="dashboard-content">
        <!-- Header personalizado -->
        <div class="welcome-header">
          <h1>¡Bienvenido{{ currentUser?.tipo === 'cliente' ? '' : 'a' }}, {{ currentUser?.nombre }}!</h1>
          <p class="subtitle" [ngSwitch]="currentUser?.tipo">
            <span *ngSwitchCase="'cliente'">Explora nuestras opciones de alojamiento y haz tu próxima reserva.</span>
            <span *ngSwitchCase="'empresa'">Gestiona tus eventos corporativos y reservas empresariales.</span>
            <span *ngSwitchCase="'admin_hotel'">Panel de administración para gestionar tu hotel.</span>
            <span *ngSwitchCase="'admin_central'">Panel de administración central del sistema.</span>
            <span *ngSwitchDefault>¡Comienza a explorar nuestras funcionalidades!</span>
          </p>
        </div>

      <!-- Opciones rápidas por rol -->
      <div class="quick-actions" [ngSwitch]="currentUser?.tipo">
        
        <!-- Cliente Individual -->
        <div *ngSwitchCase="'cliente'" class="actions-grid">
          <div class="action-card" routerLink="/buscar-habitaciones">
            <div class="card-icon">🔍</div>
            <h3>Buscar Habitaciones</h3>
            <p>Encuentra la habitación perfecta para tu estadía</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/disponibilidad-ciudad">
            <div class="card-icon">📊</div>
            <h3>Ver Disponibilidad</h3>
            <p>Consulta disponibilidad por ciudad y fechas</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/mis-reservas">
            <div class="card-icon">📅</div>
            <h3>Mis Reservas</h3>
            <p>Gestiona tus reservas existentes</p>
            <div class="card-arrow">→</div>
          </div>
        </div>

        <!-- Empresa -->
        <div *ngSwitchCase="'empresa'" class="actions-grid">
          <div class="action-card" routerLink="/busqueda-salones">
            <div class="card-icon">🏛️</div>
            <h3>Buscar Salones</h3>
            <p>Encuentra salones para tus eventos corporativos</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/buscar-habitaciones">
            <div class="card-icon">🛏️</div>
            <h3>Habitaciones</h3>
            <p>Reserva habitaciones para tus empleados</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/mis-reservas">
            <div class="card-icon">📋</div>
            <h3>Mis Reservas</h3>
            <p>Gestiona todas tus reservas empresariales</p>
            <div class="card-arrow">→</div>
          </div>
        </div>

        <!-- Admin Hotel -->
        <div *ngSwitchCase="'admin_hotel'" class="actions-grid">
          <div class="action-card" routerLink="/dashboard/habitaciones">
            <div class="card-icon">🛏️</div>
            <h3>Gestionar Habitaciones</h3>
            <p>Administra las habitaciones de tu hotel</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/dashboard/salones">
            <div class="card-icon">🏛️</div>
            <h3>Gestionar Salones</h3>
            <p>Administra los salones para eventos</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/dashboard/reservas">
            <div class="card-icon">📅</div>
            <h3>Ver Reservas</h3>
            <p>Consulta todas las reservas del hotel</p>
            <div class="card-arrow">→</div>
          </div>
        </div>

        <!-- Admin Central -->
        <div *ngSwitchCase="'admin_central'" class="actions-grid">
          <div class="action-card" routerLink="/dashboard/hoteles">
            <div class="card-icon"><i class="fas fa-building"></i></div>
            <h3>Gestionar Hoteles</h3>
            <p>Administra toda la cadena hotelera</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/dashboard/usuarios">
            <div class="card-icon"><i class="fas fa-users-cog"></i></div>
            <h3>Gestionar Usuarios</h3>
            <p>Administra todos los usuarios del sistema</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/dashboard/reportes">
            <div class="card-icon"><i class="fas fa-chart-line"></i></div>
            <h3>Ver Reportes</h3>
            <p>Consulta estadísticas y reportes globales</p>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section" *ngIf="currentUser">
        <h2>Resumen Rápido</h2>
        <div class="stats-grid">
          <div class="stat-card" *ngIf="currentUser.tipo === 'cliente' || currentUser.tipo === 'empresa'">
            <div class="stat-number">{{ getMyReservationsCount() }}</div>
            <div class="stat-label">Mis Reservas</div>
          </div>
          
          <div class="stat-card" *ngIf="currentUser.tipo.includes('admin')">
            <div class="stat-number">{{ getTotalReservations() }}</div>
            <div class="stat-label">Total Reservas</div>
          </div>
          
          <div class="stat-card" *ngIf="currentUser.tipo.includes('admin')">
            <div class="stat-number">{{ getTotalHotels() }}</div>
            <div class="stat-label">Hoteles</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-number">{{ getCurrentMonth() }}</div>
            <div class="stat-label">Mes Actual</div>
          </div>
        </div>
      </div>

      <!-- Tips según rol -->
      <div class="tips-section">
        <h3>💡 Tips útiles</h3>
        <div class="tips-list" [ngSwitch]="currentUser?.tipo">
          <div *ngSwitchCase="'cliente'">
            <p>• Usa los filtros de búsqueda para encontrar habitaciones con servicios específicos</p>
            <p>• Puedes modificar tus reservas hasta 24 horas antes del check-in</p>
            <p>• Descarga tus comprobantes desde la sección "Mis Reservas"</p>
          </div>
          
          <div *ngSwitchCase="'empresa'">
            <p>• Los paquetes corporativos incluyen descuentos por volumen</p>
            <p>• Puedes gestionar la lista de asistentes después de hacer la reserva</p>
            <p>• Contacta a nuestro equipo corporativo para necesidades especiales</p>
          </div>
          
          <div *ngSwitchDefault>
            <p>• Usa las estadísticas para tomar decisiones informadas</p>
            <p>• Revisa los reportes regularmente para optimizar operaciones</p>
            <p>• Mantén actualizada la información de contacto</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-home {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 75%, #adb5bd 100%);
      min-height: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
      overflow-y: auto;
      position: relative;
    }

    .dashboard-content {
      padding: 2rem;
      width: 100%;
      height: 100%;
      margin: 0;
      position: relative;
      z-index: 1;
      box-sizing: border-box;
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 3rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 2rem;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .welcome-header h1 {
      font-size: 2.5rem;
      color: #212529;
      margin-bottom: 0.5rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
    }

    .subtitle {
      font-size: 1.1rem;
      color: #495057;
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid rgba(255, 255, 255, 0.5);
      text-decoration: none;
      color: inherit;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(15px);
    }

    .action-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
      border-color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.95);
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
    }

    .action-card h3 {
      font-size: 1.3rem;
      color: #1C2526;
      margin-bottom: 0.5rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .action-card p {
      color: #4A1B2F;
      line-height: 1.5;
      margin-bottom: 1rem;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
    }

    .card-arrow {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
      color: #B89778;
      opacity: 0.7;
      transition: all 0.3s ease;
      font-weight: bold;
    }

    .action-card:hover .card-arrow {
      opacity: 1;
      color: #4A1B2F;
      transform: translateX(4px);
    }

    .stats-section {
      margin-bottom: 3rem;
    }

    .stats-section h2 {
      color: #1C2526;
      margin-bottom: 1.5rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.2);
      color: #212529;
      padding: 1.5rem;
      border-radius: 16px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.3);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #212529;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.5);
    }

    .stat-label {
      font-size: 1rem;
      color: #495057;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .tips-section {
      background: rgba(255, 255, 255, 0.15);
      padding: 2rem;
      border-radius: 16px;
      border-left: 4px solid #6c757d;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin-top: 2rem;
    }

    .tips-section h3 {
      color: #212529;
      margin-bottom: 1rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
    }

    .tips-list p {
      color: #495057;
      margin-bottom: 0.5rem;
      font-family: 'Crimson Text', serif;
      line-height: 1.6;
    }
      line-height: 1.6;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .dashboard-home {
        padding: 0;
        height: 100%;
      }

      .dashboard-content {
        padding: 1rem;
        height: 100%;
      }

      .welcome-header h1 {
        font-size: 2rem;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .action-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  currentUser: Usuario | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getMyReservationsCount(): string {
    // En una implementación real, esto vendría del backend
    return '3';
  }

  getTotalReservations(): string {
    // En una implementación real, esto vendría del backend
    const baseCount = this.currentUser?.tipo === 'admin_central' ? 156 : 23;
    return baseCount.toString();
  }

  getTotalHotels(): string {
    // En una implementación real, esto vendría del backend
    return this.currentUser?.tipo === 'admin_central' ? '8' : '1';
  }

  getCurrentMonth(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[new Date().getMonth()];
  }
}