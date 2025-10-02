import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-salones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="navigation-header">
      <button (click)="irAInicio()" class="btn-home-nav">
        🏠 Inicio
      </button>
      <button (click)="irADashboard()" class="btn-dashboard-nav">
        📊 Dashboard
      </button>
    </div>

    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">🏢 Gestión de Salones</h1>
        <button class="btn btn-primary" (click)="agregarSalon()">
          <i class="fas fa-plus"></i> Agregar Salón
        </button>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Lista de Salones</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Hotel</th>
                      <th>Capacidad</th>
                      <th>Tipo</th>
                      <th>Precio/Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let salon of salones">
                      <td><strong>{{ salon.nombre }}</strong></td>
                      <td>{{ salon.hotel }}</td>
                      <td>{{ salon.capacidad }} personas</td>
                      <td>
                        <span class="badge" [ngClass]="getTipoBadge(salon.tipo)">
                          {{ salon.tipo | titlecase }}
                        </span>
                      </td>
                      <td>{{ salon.precioHora | currency:'USD':'symbol':'1.0-0' }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadge(salon.estado)">
                          {{ salon.estado | titlecase }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                (click)="verSalon(salon)">
                          <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-outline-warning me-2" 
                                (click)="editarSalon(salon)">
                          <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="eliminarSalon(salon)">
                          <i class="fas fa-trash"></i> Eliminar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario de disponibilidad -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Disponibilidad de Salones</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4" *ngFor="let salon of salones">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h6 class="card-title">{{ salon.nombre }}</h6>
                      <p class="card-text text-muted">{{ salon.hotel }}</p>
                      <div class="mb-2">
                        <small class="text-muted">Próximas reservas:</small>
                      </div>
                      <div *ngFor="let reserva of salon.proximasReservas" class="alert alert-info alert-sm py-1 px-2 mb-1">
                        <small>{{ reserva.fecha }} - {{ reserva.evento }}</small>
                      </div>
                      <button class="btn btn-sm btn-success mt-2" (click)="reservarSalon(salon)">
                        <i class="fas fa-calendar-plus"></i> Reservar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== NAVEGACIÓN HEADER ========== */
    .navigation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      margin-bottom: 20px;
      border-radius: 12px;
      max-width: 1400px;
      margin: 0 auto 20px auto;
    }

    .btn-home-nav,
    .btn-dashboard-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      font-size: 0.95rem;
    }

    .btn-home-nav {
      background: rgba(56, 178, 172, 0.1);
      color: #38b2ac;
      border: 2px solid rgba(56, 178, 172, 0.2);
    }

    .btn-home-nav:hover {
      background: #38b2ac;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(56, 178, 172, 0.3);
    }

    .btn-dashboard-nav {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 2px solid rgba(102, 126, 234, 0.2);
    }

    .btn-dashboard-nav:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .container-fluid {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 75%, #adb5bd 100%);
      min-height: calc(100vh - 70px);
      margin: 0;
      padding: 2rem;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
    }

    .d-flex.justify-content-between {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .h2::before {
      content: '🏛️';
      margin-right: 1rem;
      font-size: 2rem;
    }

    .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #84fab0, #8fd3f4);
      border: none;
      color: #2d3748;
      box-shadow: 0 4px 15px rgba(132, 250, 176, 0.3);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(132, 250, 176, 0.4);
      color: #2d3748;
    }

    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
      margin-bottom: 2rem;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-bottom: 1px solid #e2e8f0;
      padding: 2rem;
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .card-title::before {
      content: '🏛️';
      margin-right: 0.5rem;
    }
    
    .table {
      margin: 0;
    }
    
    .table th {
      background: #f8fafc;
      border: none;
      padding: 1.5rem 1rem;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table td {
      padding: 1.5rem 1rem;
      border: none;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .table tbody tr:hover {
      background: linear-gradient(90deg, rgba(132, 250, 176, 0.05), rgba(143, 211, 244, 0.05));
      transform: scale(1.01);
      transition: all 0.3s ease;
    }
    
    .badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bg-secondary {
      background: linear-gradient(135deg, #a0aec0, #718096) !important;
      color: white;
    }

    .bg-primary {
      background: linear-gradient(135deg, #84fab0, #8fd3f4) !important;
      color: #2d3748;
    }

    .bg-info {
      background: linear-gradient(135deg, #4299e1, #3182ce) !important;
      color: white;
    }

    .bg-warning {
      background: linear-gradient(135deg, #ed8936, #dd6b20) !important;
      color: white;
    }

    .bg-success {
      background: linear-gradient(135deg, #48bb78, #38a169) !important;
      color: white;
    }

    .bg-danger {
      background: linear-gradient(135deg, #f56565, #e53e3e) !important;
      color: white;
    }
    
    .btn-sm {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      margin: 0 2px;
    }

    .btn-outline-primary {
      background: rgba(132, 250, 176, 0.1);
      color: #4a7c59;
      border: none;
    }

    .btn-outline-primary:hover {
      background: rgba(132, 250, 176, 0.2);
      transform: scale(1.1);
      color: #38543e;
    }

    .btn-outline-warning {
      background: rgba(237, 137, 54, 0.1);
      color: #ed8936;
      border: none;
    }

    .btn-outline-warning:hover {
      background: rgba(237, 137, 54, 0.2);
      transform: scale(1.1);
      color: #dd6b20;
    }

    .btn-outline-danger {
      background: rgba(245, 101, 101, 0.1);
      color: #f56565;
      border: none;
    }

    .btn-outline-danger:hover {
      background: rgba(245, 101, 101, 0.2);
      transform: scale(1.1);
      color: #e53e3e;
    }

    .btn-success {
      background: linear-gradient(135deg, #48bb78, #38a169);
      border: none;
      border-radius: 10px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
    }

    .table-responsive {
      border-radius: 0 0 20px 20px;
      overflow: hidden;
    }

    /* Estilos especiales para las cards de disponibilidad */
    .row.mt-4 .card .card-body {
      background: linear-gradient(135deg, rgba(132, 250, 176, 0.1), rgba(143, 211, 244, 0.1));
      border-radius: 0 0 20px 20px;
    }

    .row.mt-4 .card .card-body .card {
      background: white;
      border: 1px solid rgba(132, 250, 176, 0.2);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }

    .row.mt-4 .card .card-body .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .card-body h6 {
      color: #2d3748;
      font-weight: 700;
      font-size: 1.1rem;
      background: linear-gradient(135deg, #84fab0, #8fd3f4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .alert-info {
      background: linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(49, 130, 206, 0.1));
      border: 1px solid rgba(66, 153, 225, 0.2);
      border-radius: 10px;
      color: #3182ce;
    }

    .alert-sm {
      padding: 0.5rem 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Animaciones de entrada */
    .card {
      animation: slideInUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    .card:nth-child(2) { animation-delay: 0.1s; }
    .card:nth-child(3) { animation-delay: 0.2s; }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Efectos para los nombres de salones */
    td strong {
      background: linear-gradient(135deg, #84fab0, #8fd3f4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .container-fluid {
        margin: -10px;
        padding: 10px;
      }

      .d-flex.justify-content-between {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .h2 {
        font-size: 2rem;
      }

      .table-responsive {
        border-radius: 0;
      }

      .btn-sm {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
      }

      .row.mt-4 .col-md-4 {
        margin-bottom: 1rem;
      }
    }

    @media (max-width: 576px) {
      .table th, .table td {
        padding: 1rem 0.5rem;
        font-size: 0.875rem;
      }

      .card-body h6 {
        font-size: 1rem;
      }

      .alert-sm {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }
    }
  `]
})
export class SalonesComponent {
  salones = [
    {
      id: 1,
      nombre: 'Salón Ejecutivo',
      hotel: 'Hotel Boutique Central',
      capacidad: 50,
      tipo: 'conferencia',
      precioHora: 150,
      estado: 'disponible',
      proximasReservas: [
        { fecha: '2025-09-20', evento: 'Reunión Corporativa' },
        { fecha: '2025-09-22', evento: 'Conferencia Tech' }
      ]
    },
    {
      id: 2,
      nombre: 'Salón Crystal',
      hotel: 'Hotel Plaza Mayor',
      capacidad: 120,
      tipo: 'eventos',
      precioHora: 300,
      estado: 'disponible',
      proximasReservas: [
        { fecha: '2025-09-25', evento: 'Boda García-López' }
      ]
    },
    {
      id: 3,
      nombre: 'Salón VIP',
      hotel: 'Hotel Ejecutivo',
      capacidad: 30,
      tipo: 'privado',
      precioHora: 200,
      estado: 'ocupado',
      proximasReservas: [
        { fecha: '2025-09-18', evento: 'Cena de Negocios' },
        { fecha: '2025-09-19', evento: 'Presentación Producto' }
      ]
    },
    {
      id: 4,
      nombre: 'Salón Imperial',
      hotel: 'Hotel Boutique Central',
      capacidad: 200,
      tipo: 'banquetes',
      precioHora: 500,
      estado: 'mantenimiento',
      proximasReservas: []
    }
  ];

  getTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'conferencia': return 'bg-primary';
      case 'eventos': return 'bg-success';
      case 'privado': return 'bg-warning';
      case 'banquetes': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'disponible': return 'bg-success';
      case 'ocupado': return 'bg-danger';
      case 'mantenimiento': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  constructor(private router: Router) {}

  irAInicio(): void {
    this.router.navigate(['/']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  agregarSalon(): void {
    console.log('Agregar nuevo salón');
  }

  verSalon(salon: any): void {
    console.log('Ver salón:', salon);
  }

  editarSalon(salon: any): void {
    console.log('Editar salón:', salon);
  }

  eliminarSalon(salon: any): void {
    console.log('Eliminar salón:', salon);
  }

  reservarSalon(salon: any): void {
    console.log('Reservar salón:', salon);
  }
}