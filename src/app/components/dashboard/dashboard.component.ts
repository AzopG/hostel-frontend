import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { AppState } from '../../store';
import * as HotelActions from '../../store/actions/hotel.actions';
import * as HotelSelectors from '../../store/selectors/hotel.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  animations: [
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-50px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="dashboard">
      <!-- Header profesional -->
      <nav class="navbar" [@fadeInUp]>
        <div class="container-fluid">
          <div class="navbar-content">
            <div class="navbar-brand">
              <div class="brand-icon">🏨</div>
              <div class="brand-text">
                <h4 class="mb-0">Hotel Management</h4>
                <small class="user-info" *ngIf="currentUser">{{ currentUser.nombre }} - {{ getUserRole() }}</small>
              </div>
            </div>
            
            <!-- Stats dinámicas -->
            <div class="quick-stats">
              <div class="stat-item" [@fadeInUp]>
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getDashboardStats().reservas }}</div>
                  <div class="stat-label">Reservas</div>
                </div>
              </div>
              <div class="stat-item" [@fadeInUp]>
                <div class="stat-icon">🏨</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getDashboardStats().hoteles }}</div>
                  <div class="stat-label">Hoteles</div>
                </div>
              </div>
              <div class="stat-item" [@fadeInUp]>
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-number">\${{ getDashboardStats().ingresos }}</div>
                  <div class="stat-label">Ingresos</div>
                </div>
              </div>
            </div>

            <!-- Acciones rápidas -->
            <div class="header-actions">
              <button class="action-btn analytics" (click)="goToAnalytics()" title="Ver Analytics">
                <span class="emoji">📊</span>
              </button>
              <button class="action-btn maps" (click)="goToMaps()" title="Ver Mapas">
                <span class="emoji">🗺️</span>
              </button>
              <button class="action-btn material" (click)="goToMaterial()" title="Material UI">
                <span class="emoji">🎨</span>
              </button>
              <button class="action-btn notifications" title="Notificaciones">
                <span class="emoji">🔔</span>
                <span class="notification-badge">3</span>
              </button>
              <button class="btn-logout" (click)="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <!-- Layout mejorado -->
      <div class="dashboard-layout">
        <!-- Sidebar animado -->
        <aside class="sidebar" [@slideInLeft]>
          <div class="sidebar-header">
            <h5 class="sidebar-title">Panel de Control</h5>
            <div class="sidebar-subtitle">Gestión Hotelera</div>
          </div>
          
          <nav class="sidebar-nav">
            <div class="nav-section">
              <div class="section-header">Principal</div>
              
              <!-- Hoteles -->
              <a *ngIf="currentUser?.tipo === 'admin_central'" 
                 class="nav-item" 
                 routerLink="/dashboard/hoteles" 
                 routerLinkActive="active"
                 [@listAnimation]="0">
                <div class="nav-icon">
                  <span class="emoji">🏨</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Hoteles</span>
                  <span class="nav-badge">5</span>
                </div>
              </a>
              
              <!-- Usuarios -->
              <a *ngIf="canAccessSection('usuarios')" 
                 class="nav-item" 
                 routerLink="/dashboard/usuarios" 
                 routerLinkActive="active"
                 [@listAnimation]="1">
                <div class="nav-icon">
                  <span class="emoji">👥</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Usuarios</span>
                  <span class="nav-badge">{{ getUsersCount() }}</span>
                </div>
              </a>
              
              <!-- Habitaciones -->
              <a *ngIf="canAccessSection('habitaciones')" 
                 class="nav-item" 
                 routerLink="/dashboard/habitaciones" 
                 routerLinkActive="active"
                 [@listAnimation]="2">
                <div class="nav-icon">
                  <span class="emoji">🛏️</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Habitaciones</span>
                  <span class="nav-badge">{{ getRoomsCount() }}</span>
                </div>
              </a>
              
              <!-- Salones -->
              <a *ngIf="canAccessSection('salones')" 
                 class="nav-item" 
                 routerLink="/dashboard/salones" 
                 routerLinkActive="active"
                 [@listAnimation]="3">
                <div class="nav-icon">
                  <i class="fas fa-glass-cheers"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Salones</span>
                  <span class="nav-badge">8</span>
                </div>
              </a>
              
              <!-- Reservas -->
              <a class="nav-item" 
                 routerLink="/dashboard/reservas" 
                 routerLinkActive="active"
                 [@listAnimation]="4">
                <div class="nav-icon">
                  <span class="emoji">📅</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Reservas</span>
                  <span class="nav-badge new">{{ getActiveReservations() }}</span>
                </div>
              </a>
              
              <!-- Disponibilidad -->
              <a *ngIf="canAccessSection('disponibilidad')" 
                 class="nav-item" 
                 routerLink="/dashboard/disponibilidad" 
                 routerLinkActive="active"
                 [@listAnimation]="5">
                <div class="nav-icon">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Disponibilidad</span>
                </div>
              </a>
              
              <!-- Eventos -->
              <a *ngIf="canAccessSection('eventos')" 
                 class="nav-item" 
                 routerLink="/dashboard/eventos" 
                 routerLinkActive="active"
                 [@listAnimation]="6">
                <div class="nav-icon">
                  <i class="fas fa-calendar-plus"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Eventos</span>
                  <span class="nav-badge">12</span>
                </div>
              </a>
              
              <!-- Paquetes -->
              <a *ngIf="canAccessSection('paquetes')" 
                 class="nav-item" 
                 routerLink="/dashboard/paquetes" 
                 routerLinkActive="active"
                 [@listAnimation]="7">
                <div class="nav-icon">
                  <i class="fas fa-box"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Paquetes</span>
                  <span class="nav-badge">6</span>
                </div>
              </a>
              
              <!-- Inventario -->
              <a *ngIf="canAccessSection('inventario')" 
                 class="nav-item" 
                 routerLink="/dashboard/inventario" 
                 routerLinkActive="active"
                 [@listAnimation]="8">
                <div class="nav-icon">
                  <i class="fas fa-boxes"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Inventario</span>
                </div>
              </a>
              
              <!-- Reportes -->
              <a *ngIf="canAccessSection('reportes')" 
                 class="nav-item" 
                 routerLink="/dashboard/reportes" 
                 routerLinkActive="active"
                 [@listAnimation]="9">
                <div class="nav-icon">
                  <i class="fas fa-chart-bar"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Reportes</span>
                </div>
              </a>
            </div>
            
            <!-- Sección avanzada -->
            <div class="nav-section">
              <div class="section-header">Herramientas Avanzadas</div>
              <button class="nav-item quick-action" (click)="goToAnalytics()">
                <div class="nav-icon">
                  <span class="emoji">📊</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Analytics</span>
                  <span class="nav-description">Visualización de datos</span>
                </div>
              </button>
              <button class="nav-item quick-action" (click)="goToMaps()">
                <div class="nav-icon">
                  <span class="emoji">🗺️</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Mapas Interactivos</span>
                  <span class="nav-description">Ubicaciones de hoteles</span>
                </div>
              </button>
              <button class="nav-item quick-action" (click)="goToMaterial()">
                <div class="nav-icon">
                  <span class="emoji">🎨</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Material Design</span>
                  <span class="nav-description">Componentes UI</span>
                </div>
              </button>
              <button class="nav-item quick-action" (click)="goToHome()">
                <div class="nav-icon">
                  <span class="emoji">🏠</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Página Principal</span>
                  <span class="nav-description">Ver sitio público</span>
                </div>
              </button>
            </div>
          </nav>
        </aside>
        
        <!-- Contenido principal -->
        <main class="main-content">
          <div class="content-wrapper" [@fadeInUp]>
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Diseño base */
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
    }

    /* Header profesional */
    .navbar {
      background: rgba(255, 255, 255, 0.98) !important;
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 70px;
      padding: 0;
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 24px;
      height: 100%;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #2d3748 !important;
    }

    .brand-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-text h4 {
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .user-info {
      color: #718096;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Stats rápidas */
    .quick-stats {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 22px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 14px;
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      min-width: 130px;
    }

    .stat-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      background: rgba(255, 255, 255, 0.95);
    }

    .stat-icon {
      font-size: 1.5rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      color: white;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #718096;
      font-weight: 500;
    }

    /* Acciones rápidas */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-btn {
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
      color: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      font-size: 1.2rem;
    }

    .action-btn .emoji {
      font-size: 1.3rem;
      line-height: 1;
      opacity: 1 !important;
    }

    .action-btn:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e53e3e;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(226, 232, 240, 0.8);
      border: none;
      border-radius: 12px;
      color: #4a5568;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-logout:hover {
      background: #e53e3e;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(229, 62, 62, 0.3);
    }

    /* Layout principal */
    .dashboard-layout {
      display: flex;
      margin-top: 70px;
      min-height: calc(100vh - 70px);
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    }

    /* Sidebar mejorado */
    .sidebar {
      width: 300px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(226, 232, 240, 0.3);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.06);
      overflow-y: auto;
      position: fixed;
      left: 0;
      top: 70px;
      bottom: 0;
      z-index: 100;
    }

    .sidebar-header {
      padding: 32px 24px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
    }

    .sidebar-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 4px 0;
    }

    .sidebar-subtitle {
      font-size: 0.875rem;
      color: #718096;
      font-weight: 500;
    }

    .sidebar-nav {
      padding: 24px 0;
    }

    .nav-section {
      margin-bottom: 32px;
    }

    .section-header {
      padding: 0 24px 16px 24px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* Items de navegación */
    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      margin: 3px 12px;
      border-radius: 12px;
      color: #4a5568;
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: none;
      background: transparent;
      width: calc(100% - 24px);
      font-size: 0.95rem;
      min-height: 50px;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
      transition: left 0.6s ease;
    }

    .nav-item:hover::before {
      left: 100%;
    }

    .nav-item:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      color: #667eea;
      transform: translateX(8px);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      transform: translateX(8px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
    }

    .nav-item.active::before {
      display: none;
    }

    .nav-icon {
      width: 48px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-right: 16px;
      border-radius: 12px;
      background: rgba(102, 126, 234, 0.1);
      transition: all 0.3s ease;
    }

    .nav-icon .emoji {
      font-size: 1.3rem;
      line-height: 1;
      opacity: 1 !important;
    }

    .nav-item:hover .nav-icon {
      background: rgba(102, 126, 234, 0.2);
      transform: scale(1.1);
    }

    .nav-item.active .nav-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .nav-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-label {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .nav-description {
      font-size: 0.8rem;
      opacity: 0.7;
    }

    .nav-badge {
      background: #667eea;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: auto;
      min-width: 24px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-badge.new {
      background: #e53e3e;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .quick-action {
      border-left: 4px solid transparent;
      transition: border-color 0.3s ease;
    }

    .quick-action:hover {
      border-left-color: #667eea;
    }

    /* Contenido principal */
    .main-content {
      flex: 1;
      margin-left: 300px;
      background: rgba(255, 255, 255, 0.02);
      min-height: calc(100vh - 70px);
    }

    .content-wrapper {
      padding: 24px 28px;
      min-height: calc(100vh - 70px);
      background: rgba(255, 255, 255, 0.95);
      margin: 8px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    /* Scroll personalizado */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #5a6fd8, #6b46a3);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .quick-stats {
        gap: 16px;
      }
      
      .stat-item {
        min-width: 110px;
        padding: 12px 16px;
      }
    }
    
    @media (max-width: 1024px) {
      .quick-stats {
        display: none;
      }

      .sidebar {
        width: 280px;
      }

      .main-content {
        margin-left: 280px;
      }
      
      .content-wrapper {
        padding: 20px 24px;
      }
    }

    @media (max-width: 768px) {
      .navbar-content {
        padding: 0 16px;
      }

      .brand-text h4 {
        font-size: 1.1rem;
      }

      .user-info {
        display: none;
      }

      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        position: fixed;
        z-index: 1001;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
        width: 100%;
      }

      .action-btn span {
        display: none;
      }

      .btn-logout span {
        display: none;
      }
    }

    @media (max-width: 576px) {
      .navbar-content {
        padding: 0 12px;
      }

      .header-actions {
        gap: 8px;
      }

      .action-btn {
        width: 40px;
        height: 40px;
        font-size: 0.9rem;
      }

      .brand-icon {
        font-size: 1.5rem;
      }

      .content-wrapper {
        padding: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Cargar datos iniciales para el dashboard
    this.store.dispatch(HotelActions.loadHoteles());
  }

  // Métodos de navegación
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToAnalytics(): void {
    this.router.navigate(['/analytics-dashboard']);
  }

  goToMaps(): void {
    this.router.navigate(['/hotel-map']);
  }

  goToMaterial(): void {
    this.router.navigate(['/material-showcase']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Métodos de utilidad para el template
  getUserRole(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.tipo) {
      case 'admin_central':
        return 'Administrador Central';
      case 'admin_hotel':
        return 'Administrador de Hotel';
      case 'empresa':
        return 'Empresa';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  }

  canAccessSection(section: string): boolean {
    if (!this.currentUser) return false;
    
    const adminSections = ['usuarios', 'habitaciones', 'salones', 'disponibilidad', 'eventos', 'paquetes', 'inventario', 'reportes'];
    
    if (this.currentUser.tipo === 'admin_central') {
      return true; // Admin central puede acceder a todo
    }
    
    if (this.currentUser.tipo === 'admin_hotel') {
      return adminSections.includes(section);
    }
    
    // Empresas y clientes tienen acceso limitado
    return ['reservas'].includes(section);
  }

  getDashboardStats(): any {
    return {
      reservas: this.getActiveReservations(),
      hoteles: this.currentUser?.tipo === 'admin_central' ? '5' : '1',
      ingresos: '45K'
    };
  }

  getUsersCount(): string {
    // En una implementación real, esto vendría del store/backend
    return this.currentUser?.tipo === 'admin_central' ? '24' : '8';
  }

  getRoomsCount(): string {
    // En una implementación real, esto vendría del store/backend
    return this.currentUser?.tipo === 'admin_central' ? '156' : '32';
  }

  getActiveReservations(): string {
    // En una implementación real, esto vendría del store/backend
    const baseReservations = 12;
    const multiplier = this.currentUser?.tipo === 'admin_central' ? 5 : 1;
    return (baseReservations * multiplier).toString();
  }

  trackByMenuId(index: number, item: any): any {
    return item.id || index;
  }
}