
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { HotelesComponent } from './components/dashboard/hoteles.component';
import { UsuariosComponent } from './components/dashboard/usuarios.component';
import { ReportesComponent } from './components/dashboard/reportes.component';
import { HabitacionesComponent } from './components/dashboard/habitaciones.component';
import { SalonesComponent } from './components/dashboard/salones.component';
import { ReservasComponent } from './components/dashboard/reservas.component';
import { EventosComponent } from './components/dashboard/eventos.component';
import { MisReservasComponent } from './components/dashboard/mis-reservas.component';
import { PaquetesComponent } from './components/dashboard/paquetes.component';
import { HistorialComponent } from './components/dashboard/historial.component';
import { DisponibilidadComponent } from './components/dashboard/disponibilidad.component';
import { InventarioComponent } from './components/dashboard/inventario.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'hoteles', component: HotelesComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'habitaciones', component: HabitacionesComponent },
      { path: 'salones', component: SalonesComponent },
      { path: 'reservas', component: ReservasComponent },
      { path: 'eventos', component: EventosComponent },
      { path: 'disponibilidad', component: DisponibilidadComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'mis-reservas', component: MisReservasComponent },
      { path: 'paquetes', component: PaquetesComponent },
      { path: 'historial', component: HistorialComponent },
      { path: 'buscar-hoteles', component: HotelesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
