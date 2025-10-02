import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { AppState } from '../../store';
import * as HotelActions from '../../store/actions/hotel.actions';
import * as HotelSelectors from '../../store/selectors/hotel.selectors';
import { EstadisticasService, EstadisticasGenerales } from '../../services/estadisticas.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  animations: [
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  currentUser: Usuario | null = null;
  currentTime: string = '';
  hoteles$: Observable<any[]>;
  
  // Menú items según el tipo de usuario
  menuItems: any[] = [];
  
  // Datos estadísticos
  statsData = {
    hoteles: 0,
    reservas: 0,
    clientes: 0,
    ingresos: '0'
  };
  
  estadisticas: EstadisticasGenerales = {};
  isLoadingStats = true;
  statsError = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store<AppState>);
  private estadisticasService = inject(EstadisticasService);

  constructor() {
    this.hoteles$ = this.store.select(HotelSelectors.selectHoteles);
  }

  ngOnInit(): void {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    // Configurar menú según tipo de usuario
    this.setupMenuItems();
    
    // Actualizar tiempo cada segundo
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    
    // Cargar datos iniciales
    this.loadInitialData();
    
    // Cargar estadísticas reales
    this.cargarEstadisticasReales();
  }

  private setupMenuItems(): void {
    const userType = this.getCurrentUserType();
    
    const baseItems = [
      {
        id: 'home',
        label: 'Inicio',
        icon: 'fas fa-home',
        route: '/dashboard/home',
        description: 'Panel principal'
      }
    ];

    switch (userType) {
      case 'admin_central':
        this.menuItems = [
          ...baseItems,
          {
            id: 'hoteles',
            label: 'Hoteles',
            icon: 'fas fa-building',
            route: '/dashboard/hoteles',
            description: 'Gestión de hoteles'
          },
          {
            id: 'usuarios',
            label: 'Usuarios',
            icon: 'fas fa-users',
            route: '/dashboard/usuarios',
            description: 'Administrar usuarios'
          },
          {
            id: 'reportes',
            label: 'Reportes',
            icon: 'fas fa-chart-bar',
            route: '/dashboard/reportes',
            description: 'Reportes generales'
          }
        ];
        break;
        
      case 'admin_hotel':
        this.menuItems = [
          ...baseItems,
          {
            id: 'habitaciones',
            label: 'Habitaciones',
            icon: 'fas fa-bed',
            route: '/dashboard/habitaciones',
            description: 'Gestión de habitaciones'
          },
          {
            id: 'reservas',
            label: 'Reservas',
            icon: 'fas fa-calendar-check',
            route: '/dashboard/reservas',
            description: 'Gestión de reservas'
          },
          {
            id: 'salones',
            label: 'Salones',
            icon: 'fas fa-glass-cheers',
            route: '/dashboard/salones',
            description: 'Gestión de salones'
          }
        ];
        break;
        
      default:
        this.menuItems = [
          ...baseItems,
          {
            id: 'mis-reservas',
            label: 'Mis Reservas',
            icon: 'fas fa-calendar',
            route: '/dashboard/mis-reservas',
            description: 'Ver mis reservas'
          }
        ];
    }
  }

  private loadInitialData(): void {
    // Cargar hoteles si es admin central
    if (this.getCurrentUserType() === 'admin_central') {
      this.store.dispatch(HotelActions.loadHoteles());
    }
  }

  private setupStatsData(): void {
    const userType = this.getCurrentUserType();
    
    // Mock data basado en el tipo de usuario
    switch (userType) {
      case 'admin_central':
        this.statsData = {
          hoteles: 12,
          reservas: 1250,
          clientes: 3800,
          ingresos: '2.4M'
        };
        break;
      case 'admin_hotel':
        this.statsData = {
          hoteles: 1,
          reservas: 150,
          clientes: 280,
          ingresos: '125K'
        };
        break;
      default:
        this.statsData = {
          hoteles: 0,
          reservas: 5,
          clientes: 1,
          ingresos: '0'
        };
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getCurrentUserType(): string {
    return this.currentUser?.tipo || 'cliente';
  }

  getCurrentUserName(): string {
    return this.currentUser?.nombre || 'Usuario';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByMenuId(index: number, item: any): any {
    return item.id || index;
  }

  cargarEstadisticasReales(): void {
    this.isLoadingStats = true;
    this.statsError = '';
    
    this.estadisticasService.obtenerEstadisticasGenerales().subscribe({
      next: (response) => {
        console.log('📊 Estadísticas recibidas:', response);
        if (response.success) {
          this.estadisticas = response.stats;
          this.actualizarStatsData();
        } else {
          this.statsError = 'Error al cargar estadísticas';
          this.usarValoresPorDefecto();
        }
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        this.statsError = 'Error de conexión al cargar estadísticas';
        this.isLoadingStats = false;
        this.usarValoresPorDefecto();
      }
    });
  }

  private actualizarStatsData(): void {
    const userType = this.getCurrentUserType();
    
    if (userType === 'admin_central') {
      this.statsData = {
        hoteles: this.estadisticas.totalHoteles || 0,
        reservas: this.estadisticas.totalReservas || 0,
        clientes: this.estadisticas.totalClientes || 0,
        ingresos: this.formatearIngresos(this.estadisticas.ingresosTotales || 0)
      };
    } else if (userType === 'admin_hotel') {
      this.statsData = {
        hoteles: this.estadisticas.totalHoteles || 0, // Usar valor real del backend
        reservas: this.estadisticas.totalReservas || 0,
        clientes: this.estadisticas.totalClientes || 0,
        ingresos: this.formatearIngresos(this.estadisticas.ingresosTotales || 0)
      };
    } else {
      // Cliente o empresa
      this.statsData = {
        hoteles: 0,
        reservas: this.estadisticas.misReservas || 0,
        clientes: 1,
        ingresos: this.formatearIngresos(this.estadisticas.totalGastado || 0)
      };
    }
  }

  private formatearIngresos(ingresos: number): string {
    if (ingresos >= 1000000) {
      return `${Math.round(ingresos / 1000000)}M`;
    } else if (ingresos >= 1000) {
      return `${Math.round(ingresos / 1000)}K`;
    }
    return ingresos.toString();
  }

  private usarValoresPorDefecto(): void {
    this.statsData = {
      hoteles: 0,
      reservas: 0,
      clientes: 0,
      ingresos: '0'
    };
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}