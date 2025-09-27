import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

interface Statistics {
  totalHoteles: number;
  totalReservas: number;
  totalUsuarios: number;
  ingresosTotales: number;
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasCanceladas: number;
  notificaciones: { total: number };
}

@Component({
  selector: 'app-homepage-fixed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="homepage-container">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="nav-brand">
          <h1>🏨 Hotel Paradise</h1>
        </div>
        <div class="nav-menu">
          <button class="nav-btn" (click)="navigateTo('/dashboard/hoteles')">
            🏨 Hoteles
          </button>
          <button class="nav-btn" (click)="navigateTo('/dashboard/habitaciones')">
            🛏️ Habitaciones
          </button>
          <button class="nav-btn" (click)="navigateTo('/dashboard/reservas')">
            📅 Reservas
          </button>
          <button class="nav-btn" (click)="navigateTo('/dashboard/inventario')">
            📦 Inventario
          </button>
          <button class="nav-btn" (click)="navigateTo('/dashboard/reportes')">
            📊 Reportes
          </button>
          
          <!-- Auth Section -->
          <div class="auth-section">
            <div *ngIf="!isAuthenticated" class="auth-buttons">
              <button class="btn-login" (click)="navigateTo('/login')">
                🔐 Iniciar Sesión
              </button>
            </div>
            <div *ngIf="isAuthenticated" class="user-menu">
              <span class="user-name">👤 {{ currentUser?.nombre || 'Usuario' }}</span>
              <button class="btn-logout" (click)="logout()">
                🚪 Salir
              </button>
              <div class="notification-bell" (click)="toggleNotifications()">
                🔔 <span class="notification-count">{{ currentStats.notificaciones.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h2>Sistema de Gestión Hotelera</h2>
          <p>Administra tu hotel de manera eficiente y profesional</p>
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-number">{{ currentStats.totalHoteles }}</div>
              <div class="stat-label">Hoteles</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ currentStats.totalReservas }}</div>
              <div class="stat-label">Reservas</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ currentStats.totalUsuarios }}</div>
              <div class="stat-label">Usuarios</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ formatCurrency(currentStats.ingresosTotales) }}</div>
              <div class="stat-label">Ingresos</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Grid -->
      <section class="services-section">
        <h3>Servicios Principales</h3>
        <div class="services-grid">
          <div class="service-card" (click)="navigateTo('/dashboard/hoteles')">
            <div class="service-icon">🏨</div>
            <h4>Gestión de Hoteles</h4>
            <p>Administra la información de todos los hoteles</p>
          </div>
          
          <div class="service-card" (click)="navigateTo('/dashboard/habitaciones')">
            <div class="service-icon">🛏️</div>
            <h4>Habitaciones</h4>
            <p>Controla la disponibilidad y estado de habitaciones</p>
          </div>
          
          <div class="service-card" (click)="navigateTo('/dashboard/reservas')">
            <div class="service-icon">📅</div>
            <h4>Reservas</h4>
            <p>Gestiona todas las reservas y bookings</p>
          </div>
          
          <div class="service-card" (click)="navigateTo('/dashboard/inventario')">
            <div class="service-icon">📦</div>
            <h4>Inventario</h4>
            <p>Control de stock y suministros</p>
          </div>
          
          <div class="service-card" (click)="navigateTo('/dashboard/reportes')">
            <div class="service-icon">📊</div>
            <h4>Reportes</h4>
            <p>Análisis y estadísticas detalladas</p>
          </div>
          
          <div class="service-card" (click)="navigateTo('/dashboard/usuarios')">
            <div class="service-icon">👥</div>
            <h4>Usuarios</h4>
            <p>Administración de usuarios del sistema</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .homepage-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .navbar {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    .nav-brand h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .nav-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      background: #3498db;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .nav-btn:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .auth-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-login {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      background: #27ae60;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-login:hover {
      background: #229954;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      color: #2c3e50;
      font-weight: 500;
    }

    .btn-logout {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      background: #e74c3c;
      color: white;
      cursor: pointer;
    }

    .notification-bell {
      position: relative;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .notification-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      font-size: 0.7rem;
      padding: 2px 6px;
      min-width: 16px;
      text-align: center;
    }

    .hero-section {
      padding: 4rem 2rem;
      text-align: center;
      color: #2c3e50;
    }

    .hero-content h2 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 3rem;
      color: #7f8c8d;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 1rem;
    }

    .services-section {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .services-section h3 {
      text-align: center;
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 3rem;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .service-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .service-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    }

    .service-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .service-card h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    .service-card p {
      color: #7f8c8d;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-menu {
        justify-content: center;
      }

      .hero-content h2 {
        font-size: 2rem;
      }

      .hero-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .services-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomepageFixedComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isAuthenticated = false;
  currentUser: any = null;
  currentStats: Statistics = {
    totalHoteles: 12,
    totalReservas: 245,
    totalUsuarios: 34,
    ingresosTotales: 125000,
    reservasConfirmadas: 189,
    reservasPendientes: 23,
    reservasCanceladas: 33,
    notificaciones: { total: 8 }
  };

  ngOnInit() {
    // Simular algunos datos para demostración
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData() {
    // Aquí puedes agregar la lógica real de carga de datos más tarde
    console.log('Homepage cargado correctamente');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    // Aquí agregarás la lógica real de logout más tarde
  }

  toggleNotifications() {
    console.log('Toggling notifications');
    // Aquí agregarás la lógica de notificaciones más tarde
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}