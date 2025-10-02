import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { EstadisticasService, EstadisticasGenerales } from '../../services/estadisticas.service';

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
          
          <div class="action-card" (click)="navegarA('/dashboard/paquetes')">
            <div class="card-icon">📦</div>
            <h3>Gestionar Paquetes</h3>
            <p>Crea y administra paquetes corporativos</p>
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
        
        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{error}}
          <button class="retry-btn" (click)="cargarEstadisticas()">Reintentar</button>
        </div>

        <!-- Stats grid -->
        <div *ngIf="!isLoading && !error" class="stats-grid">
          <!-- Para clientes y empresas -->
          <div class="stat-card" *ngIf="currentUser.tipo === 'cliente' || currentUser.tipo === 'empresa'">
            <div class="stat-number">{{ getMyReservationsCount() }}</div>
            <div class="stat-label">Mis Reservas</div>
          </div>
          
          <div class="stat-card" *ngIf="currentUser.tipo === 'cliente' || currentUser.tipo === 'empresa'">
            <div class="stat-number">{{ getTotalGastado() }}</div>
            <div class="stat-label">Total Gastado</div>
          </div>

          <!-- Para admin_hotel -->
          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_hotel'">
            <div class="stat-number">{{ getTotalReservations() }}</div>
            <div class="stat-label">Reservas Hotel</div>
          </div>

          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_hotel'">
            <div class="stat-number">{{ getIngresosTotales() }}</div>
            <div class="stat-label">Ingresos</div>
          </div>

          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_hotel' && estadisticas.nombreHotel">
            <div class="stat-number">{{ estadisticas.totalHabitaciones || 0 }}</div>
            <div class="stat-label">Habitaciones</div>
          </div>

          <!-- Para admin_central -->
          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_central'">
            <div class="stat-number">{{ getTotalHotels() }}</div>
            <div class="stat-label">Hoteles</div>
          </div>
          
          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_central'">
            <div class="stat-number">{{ getTotalReservations() }}</div>
            <div class="stat-label">Total Reservas</div>
          </div>

          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_central'">
            <div class="stat-number">{{ getTotalClientes() }}</div>
            <div class="stat-label">Clientes</div>
          </div>

          <div class="stat-card" *ngIf="currentUser.tipo === 'admin_central'">
            <div class="stat-number">{{ getIngresosTotales() }}</div>
            <div class="stat-label">Ingresos</div>
          </div>
          
          <!-- Para todos -->
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
      font-weight: 500;
    }

    .loading-container {
      text-align: center;
      padding: 2rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #B89778;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    .error-message {
      background: rgba(245, 101, 101, 0.1);
      border: 1px solid rgba(245, 101, 101, 0.3);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      color: #e53e3e;
      margin: 1rem 0;
    }

    .error-icon {
      font-size: 1.2rem;
      margin-right: 0.5rem;
    }

    .retry-btn {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-left: 1rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .retry-btn:hover {
      background: #c53030;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
  estadisticas: EstadisticasGenerales = {};
  isLoading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private estadisticasService: EstadisticasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.cargarEstadisticas();
      }
    });
  }

  cargarEstadisticas(): void {
    this.isLoading = true;
    this.error = '';
    
    this.estadisticasService.obtenerEstadisticasGenerales().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.stats;
        } else {
          this.error = 'Error al cargar estadísticas';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.error = 'Error de conexión al cargar estadísticas';
        this.isLoading = false;
        // Usar valores por defecto en caso de error
        this.usarValoresPorDefecto();
      }
    });
  }

  usarValoresPorDefecto(): void {
    this.estadisticas = {
      totalHoteles: 0,
      totalReservas: 0,
      totalClientes: 0,
      ingresosTotales: 0,
      misReservas: 0,
      reservasActivas: 0
    };
  }

  getMyReservationsCount(): string {
    if (this.currentUser?.tipo === 'cliente' || this.currentUser?.tipo === 'empresa') {
      return (this.estadisticas.misReservas || 0).toString();
    }
    return (this.estadisticas.reservasActivas || 0).toString();
  }

  getTotalReservations(): string {
    return (this.estadisticas.totalReservas || 0).toString();
  }

  getTotalHotels(): string {
    return (this.estadisticas.totalHoteles || 0).toString();
  }

  getTotalClientes(): string {
    return (this.estadisticas.totalClientes || 0).toString();
  }

  getIngresosTotales(): string {
    const ingresos = this.estadisticas.ingresosTotales || 0;
    if (ingresos >= 1000000) {
      return `${Math.round(ingresos / 1000000)}M`;
    } else if (ingresos >= 1000) {
      return `${Math.round(ingresos / 1000)}K`;
    }
    return ingresos.toString();
  }

  getTotalGastado(): string {
    const gastado = this.estadisticas.totalGastado || 0;
    if (gastado >= 1000000) {
      return `${Math.round(gastado / 1000000)}M`;
    } else if (gastado >= 1000) {
      return `${Math.round(gastado / 1000)}K`;
    }
    return gastado.toString();
  }

  getOcupacionPromedio(): string {
    return `${this.estadisticas.ocupacionPromedio || 0}%`;
  }

  getCurrentMonth(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[new Date().getMonth()];
  }

  navegarA(ruta: string): void {
    console.log('🔄 Navegando a:', ruta);
    this.router.navigate([ruta]).then(success => {
      if (success) {
        console.log('✅ Navegación exitosa a:', ruta);
      } else {
        console.error('❌ Error en navegación a:', ruta);
      }
    }).catch(error => {
      console.error('💥 Error en navegación:', error);
    });
  }
}