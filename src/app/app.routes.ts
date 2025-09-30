import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CalendarioDisponibilidadComponent } from './components/calendario-disponibilidad/calendario-disponibilidad.component';
import { BuscarHabitacionesComponent } from './components/buscar-habitaciones/buscar-habitaciones.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/homepage.component').then(m => m.HomepageComponent)
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  // HU04: Calendario de disponibilidad por ciudad (acceso público)
  { path: 'disponibilidad-ciudad', component: CalendarioDisponibilidadComponent },
  // HU05: Buscar habitaciones por fechas y huéspedes (acceso público)
  { path: 'buscar-habitaciones', component: BuscarHabitacionesComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'hoteles', 
        loadComponent: () => import('./components/dashboard/hoteles.component').then(m => m.HotelesComponent) 
      },
      { 
        path: 'usuarios', 
        loadComponent: () => import('./components/dashboard/usuarios.component').then(m => m.UsuariosComponent) 
      },
      { 
        path: 'reportes', 
        loadComponent: () => import('./components/dashboard/reportes.component').then(m => m.ReportesComponent) 
      },
      { 
        path: 'habitaciones', 
        loadComponent: () => import('./components/dashboard/habitaciones.component').then(m => m.HabitacionesComponent) 
      },
      { 
        path: 'salones', 
        loadComponent: () => import('./components/dashboard/salones.component').then(m => m.SalonesComponent) 
      },
      { 
        path: 'reservas', 
        loadComponent: () => import('./components/dashboard/reservas.component').then(m => m.ReservasComponent) 
      },
      { 
        path: 'eventos', 
        loadComponent: () => import('./components/dashboard/eventos.component').then(m => m.EventosComponent) 
      },
      { 
        path: 'disponibilidad', 
        loadComponent: () => import('./components/dashboard/disponibilidad.component').then(m => m.DisponibilidadComponent) 
      },
      { 
        path: 'inventario', 
        loadComponent: () => import('./components/dashboard/inventario.component').then(m => m.InventarioComponent) 
      },
      { 
        path: 'mis-reservas', 
        loadComponent: () => import('./components/dashboard/mis-reservas.component').then(m => m.MisReservasComponent) 
      },
      { 
        path: 'paquetes', 
        loadComponent: () => import('./components/dashboard/paquetes.component').then(m => m.PaquetesComponent) 
      },
      { 
        path: 'historial', 
        loadComponent: () => import('./components/dashboard/historial.component').then(m => m.HistorialComponent) 
      },
      { 
        path: 'buscar-hoteles', 
        loadComponent: () => import('./components/dashboard/hoteles.component').then(m => m.HotelesComponent) 
      },
      { 
        path: 'demos/animations', 
        loadComponent: () => import('./components/demos/animations-demo.component').then(m => m.AnimationsDemoComponent) 
      },
      { 
        path: 'demos/performance', 
        loadComponent: () => import('./components/demos/performance-demo.component').then(m => m.PerformanceDemoComponent) 
      },
      { 
        path: 'performance-monitor', 
        loadComponent: () => import('./components/performance-monitor/performance-monitor.component').then(m => m.PerformanceMonitorComponent) 
      },
      { 
        path: 'analytics', 
        loadComponent: () => import('./components/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent) 
      },
      { 
        path: 'material-showcase', 
        loadComponent: () => import('./components/material-showcase/material-showcase.component').then(m => m.MaterialShowcaseComponent) 
      },
      { 
        path: 'hotel-map', 
        loadComponent: () => import('./components/hotel-map/hotel-map.component').then(m => m.HotelMapComponent) 
      }
    ]
  },
  {
    path: 'demos',
    children: [
      { 
        path: 'animations', 
        loadComponent: () => import('./components/demos/animations-demo.component').then(m => m.AnimationsDemoComponent) 
      },
      { 
        path: 'performance', 
        loadComponent: () => import('./components/demos/performance-demo.component').then(m => m.PerformanceDemoComponent) 
      },
      { 
        path: 'monitor', 
        loadComponent: () => import('./components/performance-monitor/performance-monitor.component').then(m => m.PerformanceMonitorComponent) 
      },
      { path: '', redirectTo: 'animations', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];