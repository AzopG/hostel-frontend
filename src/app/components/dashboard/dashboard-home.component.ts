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
            <div class="card-icon">🏨</div>
            <h3>Gestionar Hoteles</h3>
            <p>Administra toda la cadena hotelera</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/dashboard/usuarios">
            <div class="card-icon">👥</div>
            <h3>Gestionar Usuarios</h3>
            <p>Administra todos los usuarios del sistema</p>
            <div class="card-arrow">→</div>
          </div>
          
          <div class="action-card" routerLink="/dashboard/reportes">
            <div class="card-icon">📊</div>
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
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-header h1 {
      font-size: 2.5rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #718096;
      max-width: 600px;
      margin: 0 auto;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
      text-decoration: none;
      color: inherit;
      position: relative;
      overflow: hidden;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      font-size: 1.3rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .action-card p {
      color: #718096;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .card-arrow {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
      color: #667eea;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .action-card:hover .card-arrow {
      opacity: 1;
    }

    .stats-section {
      margin-bottom: 3rem;
    }

    .stats-section h2 {
      color: #2d3748;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .tips-section {
      background: #f7fafc;
      padding: 2rem;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .tips-section h3 {
      color: #2d3748;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .tips-list p {
      color: #4a5568;
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .dashboard-home {
        padding: 1rem;
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