import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles: string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside 
      class="sidebar" 
      [class.collapsed]="isCollapsed"
      [class.mobile-open]="isMobileMenuOpen"
      role="navigation"
      aria-label="Menú principal"
    >
      <!-- Header del Sidebar -->
      <div class="sidebar-header">
        <div class="brand" [class.collapsed]="isCollapsed">
          <img src="/assets/logo.svg" alt="Hostel Colombia" class="brand-logo">
          <span class="brand-text" *ngIf="!isCollapsed">Hostel Colombia</span>
        </div>
        <button 
          class="collapse-btn"
          (click)="toggleSidebar()"
          [attr.aria-label]="isCollapsed ? 'Expandir menú' : 'Contraer menú'"
          type="button"
        >
          <i [class]="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
        </button>
      </div>

      <!-- Perfil de Usuario -->
      <div class="user-profile" *ngIf="currentUser">
        <div class="user-avatar">
          <img [src]="currentUser.avatar || '/assets/default-avatar.png'" 
               [alt]="currentUser.nombre + ' avatar'">
          <div class="status-indicator online" aria-label="En línea"></div>
        </div>
        <div class="user-info" *ngIf="!isCollapsed">
          <h4 class="user-name">{{ currentUser.nombre }}</h4>
          <p class="user-role">{{ getRoleLabel(currentUser.rol) }}</p>
        </div>
      </div>

      <!-- Navegación Principal -->
      <nav class="sidebar-nav">
        <ul class="nav-list" role="menubar">
          <li 
            *ngFor="let item of menuItems; trackBy: trackByRoute" 
            class="nav-item"
            [class.has-children]="item.children?.length"
            role="none"
          >
            <!-- Elemento principal -->
            <a 
              *ngIf="!item.children?.length; else submenuTemplate"
              [routerLink]="item.route"
              class="nav-link"
              [class.active]="isActiveRoute(item.route)"
              [attr.aria-label]="item.label"
              role="menuitem"
              routerLinkActive="active"
            >
              <i [class]="item.icon" class="nav-icon" aria-hidden="true"></i>
              <span class="nav-text" *ngIf="!isCollapsed">{{ item.label }}</span>
              <span 
                *ngIf="item.badge && item.badge > 0 && !isCollapsed" 
                class="nav-badge"
                [attr.aria-label]="item.badge + ' elementos'"
              >
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            </a>

            <!-- Template para submenús -->
            <ng-template #submenuTemplate>
              <button 
                class="nav-link submenu-toggle"
                [class.active]="isSubmenuActive(item)"
                (click)="toggleSubmenu(item)"
                [attr.aria-expanded]="item.expanded"
                [attr.aria-label]="'Expandir ' + item.label"
                type="button"
                role="menuitem"
              >
                <i [class]="item.icon" class="nav-icon" aria-hidden="true"></i>
                <span class="nav-text" *ngIf="!isCollapsed">{{ item.label }}</span>
                <i 
                  *ngIf="!isCollapsed"
                  class="fas fa-chevron-down submenu-arrow" 
                  [class.rotated]="item.expanded"
                  aria-hidden="true"
                ></i>
              </button>
              
              <ul 
                class="submenu" 
                [class.expanded]="item.expanded && !isCollapsed"
                role="menu"
                [attr.aria-label]="'Submenú de ' + item.label"
              >
                <li *ngFor="let child of item.children" class="submenu-item" role="none">
                  <a 
                    [routerLink]="child.route"
                    class="submenu-link"
                    [class.active]="isActiveRoute(child.route)"
                    role="menuitem"
                    routerLinkActive="active"
                  >
                    <i [class]="child.icon" class="submenu-icon" aria-hidden="true"></i>
                    <span>{{ child.label }}</span>
                    <span 
                      *ngIf="child.badge && child.badge > 0" 
                      class="nav-badge small"
                      [attr.aria-label]="child.badge + ' elementos'"
                    >
                      {{ child.badge > 99 ? '99+' : child.badge }}
                    </span>
                  </a>
                </li>
              </ul>
            </ng-template>
          </li>
        </ul>
      </nav>

      <!-- Acciones Rápidas -->
      <div class="quick-actions" *ngIf="!isCollapsed">
        <h5 class="section-title">Acciones Rápidas</h5>
        <div class="quick-buttons">
          <button 
            class="quick-btn primary"
            routerLink="/dashboard/reservas/nueva"
            aria-label="Crear nueva reserva"
            type="button"
          >
            <i class="fas fa-plus" aria-hidden="true"></i>
            <span>Nueva Reserva</span>
          </button>
          <button 
            class="quick-btn secondary"
            routerLink="/dashboard/disponibilidad"
            aria-label="Ver calendario"
            type="button"
          >
            <i class="fas fa-calendar" aria-hidden="true"></i>
            <span>Calendario</span>
          </button>
        </div>
      </div>

      <!-- Footer del Sidebar -->
      <div class="sidebar-footer">
        <button 
          class="logout-btn"
          (click)="logout()"
          [attr.aria-label]="'Cerrar sesión de ' + currentUser?.nombre"
          type="button"
        >
          <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
          <span *ngIf="!isCollapsed">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Overlay para mobile -->
    <div 
      class="sidebar-overlay"
      [class.active]="isMobileMenuOpen"
      (click)="closeMobileMenu()"
      aria-hidden="true"
    ></div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
      color: white;
      transform: translateX(0);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    .brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .collapse-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    .user-profile {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      position: relative;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #1a202c;
    }

    .status-indicator.online {
      background: #48bb78;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
      width: 100%;
      background: none;
      cursor: pointer;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateX(4px);
    }

    .nav-link.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      position: relative;
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #fbd38d;
      border-radius: 0 4px 4px 0;
    }

    .nav-icon {
      width: 20px;
      text-align: center;
      margin-right: 0.75rem;
      font-size: 1rem;
    }

    .nav-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background: #e53e3e;
      color: white;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      margin-left: 0.5rem;
    }

    .nav-badge.small {
      font-size: 0.625rem;
      padding: 0.0625rem 0.25rem;
      min-width: 16px;
    }

    .submenu-arrow {
      margin-left: auto;
      transition: transform 0.2s ease;
      font-size: 0.75rem;
    }

    .submenu-arrow.rotated {
      transform: rotate(180deg);
    }

    .submenu {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background: rgba(0, 0, 0, 0.2);
    }

    .submenu.expanded {
      max-height: 300px;
    }

    .submenu-link {
      display: flex;
      align-items: center;
      padding: 0.5rem 1.5rem 0.5rem 3.5rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .submenu-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .submenu-link.active {
      background: rgba(102, 126, 234, 0.3);
      color: white;
    }

    .submenu-icon {
      width: 16px;
      text-align: center;
      margin-right: 0.5rem;
      font-size: 0.875rem;
    }

    .quick-actions {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 1rem 0;
    }

    .quick-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .quick-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .quick-btn.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .quick-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }

    .quick-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem;
      background: rgba(229, 62, 62, 0.1);
      border: 1px solid rgba(229, 62, 62, 0.3);
      color: #fc8181;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(229, 62, 62, 0.2);
      color: #e53e3e;
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    }

    .sidebar-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 280px;
      }

      .quick-actions {
        display: none;
      }
    }

    /* Animaciones personalizadas */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .nav-item {
      animation: slideIn 0.3s ease forwards;
    }

    .nav-item:nth-child(1) { animation-delay: 0.1s; }
    .nav-item:nth-child(2) { animation-delay: 0.15s; }
    .nav-item:nth-child(3) { animation-delay: 0.2s; }
    .nav-item:nth-child(4) { animation-delay: 0.25s; }
    .nav-item:nth-child(5) { animation-delay: 0.3s; }
    .nav-item:nth-child(6) { animation-delay: 0.35s; }
    .nav-item:nth-child(7) { animation-delay: 0.4s; }
    .nav-item:nth-child(8) { animation-delay: 0.45s; }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobileMenuOpen = false;
  currentUser: any;
  activeRoute = '';

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/dashboard',
      roles: ['admin_central', 'admin_hotel', 'cliente', 'empresa']
    },
    {
      label: 'Reservas',
      icon: 'fas fa-calendar-check',
      route: '/dashboard/reservas',
      badge: 3,
      roles: ['admin_central', 'admin_hotel', 'cliente', 'empresa']
    },
    {
      label: 'Disponibilidad',
      icon: 'fas fa-calendar',
      route: '/dashboard/disponibilidad',
      roles: ['admin_central', 'admin_hotel', 'cliente', 'empresa']
    },
    {
      label: 'Gestión',
      icon: 'fas fa-cogs',
      route: '#',
      roles: ['admin_central', 'admin_hotel'],
      children: [
        {
          label: 'Habitaciones',
          icon: 'fas fa-bed',
          route: '/dashboard/habitaciones',
          badge: 2,
          roles: ['admin_central', 'admin_hotel']
        },
        {
          label: 'Salones',
          icon: 'fas fa-users',
          route: '/dashboard/salones',
          roles: ['admin_central', 'admin_hotel']
        },
        {
          label: 'Hoteles',
          icon: 'fas fa-building',
          route: '/dashboard/hoteles',
          roles: ['admin_central']
        }
      ]
    },
    {
      label: 'Eventos',
      icon: 'fas fa-calendar-alt',
      route: '/dashboard/eventos',
      badge: 1,
      roles: ['admin_central', 'admin_hotel', 'empresa']
    },
    {
      label: 'Paquetes',
      icon: 'fas fa-box-open',
      route: '/dashboard/paquetes',
      roles: ['admin_central', 'admin_hotel', 'empresa']
    },
    {
      label: 'Reportes',
      icon: 'fas fa-chart-bar',
      route: '/dashboard/reportes',
      roles: ['admin_central', 'admin_hotel']
    },
    {
      label: 'Usuarios',
      icon: 'fas fa-users-cog',
      route: '/dashboard/usuarios',
      roles: ['admin_central']
    }
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 768 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Filtrar menú según rol
    this.menuItems = this.menuItems.filter(item => 
      item.roles.includes(this.currentUser?.rol || 'cliente')
    );

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activeRoute = event.url;
      this.updateMenuBadges();
    });

    // Simular actualización de badges en tiempo real
    this.updateMenuBadges();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    
    // Cerrar submenús cuando se colapsa
    if (this.isCollapsed) {
      this.menuItems.forEach(item => {
        if (item.children) {
          item.expanded = false;
        }
      });
    }
  }

  toggleSubmenu(item: MenuItem): void {
    if (this.isCollapsed) {
      return;
    }
    
    item.expanded = !item.expanded;
    
    // Cerrar otros submenús
    this.menuItems.forEach(menuItem => {
      if (menuItem !== item && menuItem.children) {
        menuItem.expanded = false;
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }

  isSubmenuActive(item: MenuItem): boolean {
    return item.children?.some(child => this.isActiveRoute(child.route)) || false;
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'admin_central': 'Administrador Central',
      'admin_hotel': 'Administrador Hotel',
      'empresa': 'Usuario Empresarial',
      'cliente': 'Cliente'
    };
    return roleLabels[role] || role;
  }

  trackByRoute(index: number, item: MenuItem): string {
    return item.route;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updateMenuBadges(): void {
    // Simular actualización de badges basado en datos reales
    // En producción, esto vendría de servicios reales
    
    const reservasItem = this.menuItems.find(item => item.route === '/dashboard/reservas');
    if (reservasItem) {
      // Simular nuevas reservas pendientes
      reservasItem.badge = Math.floor(Math.random() * 5) + 1;
    }

    const habitacionesItem = this.menuItems
      .find(item => item.children)?.children
      ?.find(child => child.route === '/dashboard/habitaciones');
    if (habitacionesItem) {
      // Simular habitaciones que requieren atención
      habitacionesItem.badge = Math.floor(Math.random() * 3);
    }

    const eventosItem = this.menuItems.find(item => item.route === '/dashboard/eventos');
    if (eventosItem) {
      // Simular eventos próximos
      eventosItem.badge = Math.floor(Math.random() * 2);
    }
  }
}