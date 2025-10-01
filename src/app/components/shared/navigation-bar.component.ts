import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navigation-bar">
      <div class="nav-container">
        <!-- Botón Volver -->
        <button 
          *ngIf="showBackButton" 
          (click)="goBack()" 
          class="btn-back"
          [title]="backButtonText">
          <span class="back-icon">←</span>
          <span class="back-text">{{ backButtonText }}</span>
        </button>

        <!-- Logo/Título central -->
        <div class="nav-center">
          <a routerLink="/" class="nav-logo">
            <span class="logo-icon">🏨</span>
            <span class="logo-text">{{ appTitle }}</span>
          </a>
        </div>

        <!-- Acciones de la derecha -->
        <div class="nav-actions">
          <!-- Dashboard (si está logueado) -->
          <button 
            *ngIf="showDashboard" 
            (click)="goToDashboard()" 
            class="btn-dashboard"
            title="Ir al Dashboard">
            <span class="dashboard-icon">📊</span>
            <span class="dashboard-text">Dashboard</span>
          </button>

          <!-- Buscar -->
          <button 
            *ngIf="showSearch" 
            routerLink="/buscar-habitaciones" 
            class="btn-search"
            title="Buscar Habitaciones">
            <span class="search-icon">🔍</span>
            <span class="search-text">Buscar</span>
          </button>

          <!-- Mis Reservas -->
          <button 
            *ngIf="showReservations" 
            routerLink="/mis-reservas" 
            class="btn-reservations"
            title="Mis Reservas">
            <span class="reservations-icon">📅</span>
            <span class="reservations-text">Reservas</span>
          </button>

          <!-- Home -->
          <button 
            *ngIf="showHome" 
            routerLink="/" 
            class="btn-home"
            title="Ir a Inicio">
            <span class="home-icon">🏠</span>
            <span class="home-text">Inicio</span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navigation-bar {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 70px;
      display: flex;
      align-items: center;
    }

    .nav-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Botón Volver */
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(102, 126, 234, 0.1);
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 12px;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-back:hover {
      background: #667eea;
      color: white;
      transform: translateX(-4px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .back-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    .back-text {
      font-size: 0.95rem;
    }

    /* Logo central */
    .nav-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #2d3748;
      font-weight: 700;
      font-size: 1.3rem;
      transition: all 0.3s ease;
    }

    .nav-logo:hover {
      color: #667eea;
      transform: scale(1.05);
    }

    .logo-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-text {
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Acciones de la derecha */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-dashboard,
    .btn-search,
    .btn-reservations,
    .btn-home {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(226, 232, 240, 0.6);
      border-radius: 10px;
      color: #4a5568;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-dashboard:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-search:hover {
      background: #48bb78;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
    }

    .btn-reservations:hover {
      background: #ed8936;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(237, 137, 54, 0.3);
    }

    .btn-home:hover {
      background: #38b2ac;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(56, 178, 172, 0.3);
    }

    /* Iconos */
    .dashboard-icon,
    .search-icon,
    .reservations-icon,
    .home-icon {
      font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .nav-container {
        padding: 0 16px;
      }

      .back-text,
      .dashboard-text,
      .search-text,
      .reservations-text,
      .home-text {
        display: none;
      }

      .btn-back,
      .btn-dashboard,
      .btn-search,
      .btn-reservations,
      .btn-home {
        padding: 10px;
        min-width: 44px;
        justify-content: center;
      }

      .logo-text {
        display: none;
      }

      .nav-actions {
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 0 12px;
      }

      .nav-actions {
        gap: 6px;
      }

      .btn-back,
      .btn-dashboard,
      .btn-search,
      .btn-reservations,
      .btn-home {
        padding: 8px;
        min-width: 40px;
      }
    }
  `]
})
export class NavigationBarComponent {
  @Input() appTitle = 'Hotel Management';
  @Input() showBackButton = true;
  @Input() backButtonText = 'Volver';
  @Input() showDashboard = true;
  @Input() showSearch = true;
  @Input() showReservations = true;
  @Input() showHome = true;
  @Input() customBackAction?: () => void;

  constructor(
    private location: Location,
    private router: Router
  ) {}

  goBack(): void {
    if (this.customBackAction) {
      this.customBackAction();
    } else {
      this.location.back();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}