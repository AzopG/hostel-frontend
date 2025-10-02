import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/homepage.component').then(m => m.HomepageComponent)
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // HU13: Registro de cuenta empresarial
  { 
    path: 'registro-empresa', 
    loadComponent: () => import('./components/registro-empresa/registro-empresa.component').then(m => m.RegistroEmpresaComponent)
  },
  // Rutas públicas del sistema
  { 
    path: 'buscar-habitaciones', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/buscar-habitaciones/buscar-habitaciones.component').then(m => m.BuscarHabitacionesComponent) 
  },
  { 
    path: 'mis-reservas', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent) 
  },
  { 
    path: 'busqueda-salones', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/busqueda-salones/busqueda-salones.component').then(m => m.BusquedaSalonesComponent) 
  },
  { 
    path: 'disponibilidad-ciudad', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/calendario-disponibilidad/calendario-disponibilidad.component').then(m => m.CalendarioDisponibilidadComponent) 
  },
  // Rutas de detalle y reserva
  { 
    path: 'habitacion/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/detalle-habitacion/detalle-habitacion.component').then(m => m.DetalleHabitacionComponent) 
  },
  { 
    path: 'salon/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/detalle-salon/detalle-salon.component').then(m => m.DetalleSalonComponent) 
  },
  { 
    path: 'reservar/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/reservar-habitacion/reservar-habitacion.component').then(m => m.ReservarHabitacionComponent) 
  },
  { 
    path: 'reservar-salon/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/reservar-salon/reservar-salon.component').then(m => m.ReservarSalonComponent) 
  },
  { 
    path: 'detalle-reserva/:codigo', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/detalle-reserva/detalle-reserva.component').then(m => m.DetalleReservaComponent) 
  },
  { 
    path: 'recibo/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/recibo-reserva/recibo-reserva.component').then(m => m.ReciboReservaComponent) 
  },
  // Rutas de paquetes empresariales
  { 
    path: 'ver-paquetes', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/ver-paquetes/ver-paquetes.component').then(m => m.VerPaquetesComponent) 
  },
  { 
    path: 'reservar-paquete/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/paquetes/reservar-paquete.component').then(m => m.ReservarPaqueteComponent) 
  },
  { 
    path: 'reservar-paquete-simple/:id', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/reservar-paquete-simple/reservar-paquete-simple.component').then(m => m.ReservarPaqueteSimpleComponent) 
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'home', 
        loadComponent: () => import('./components/dashboard/dashboard-home.component').then(m => m.DashboardHomeComponent) 
      },
      { 
        path: 'usuarios', 
        loadComponent: () => import('./components/dashboard/usuarios.component').then(m => m.UsuariosComponent) 
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
        path: 'hoteles', 
        loadComponent: () => import('./components/dashboard/hoteles.component').then(m => m.HotelesComponent) 
      },
      { 
        path: 'reportes', 
        loadComponent: () => import('./components/dashboard/reportes.component').then(m => m.ReportesComponent) 
      },
      { 
        path: 'paquetes', 
        loadComponent: () => import('./components/dashboard/paquetes.component').then(m => m.PaquetesComponent) 
      },
      {
        path: 'panel-ocupacion',
        loadComponent: () => import('./components/dashboard/panel-ocupacion-dashboard.component').then(m => m.PanelOcupacionDashboardComponent)
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '' }
];