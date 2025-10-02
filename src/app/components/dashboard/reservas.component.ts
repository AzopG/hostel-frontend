import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <h1 class="h2">Gestión de Reservas</h1>
        <button class="btn btn-primary" (click)="nuevaReserva()">
          <i class="fas fa-plus"></i> Nueva Reserva
        </button>
      </div>

      <!-- Estadísticas superiores -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-number">{{ totalReservas }}</div>
          <div class="stat-label">Total Reservas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-number">{{ reservasConfirmadas }}</div>
          <div class="stat-label">Confirmadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-number">{{ reservasPendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-number">{{ ingresosMes | currency:'USD':'symbol':'1.0-0' }}</div>
          <div class="stat-label">Ingresos del mes</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="row mb-3">
        <div class="col-md-3">
          <label class="form-label">Fecha desde</label>
          <input type="date" class="form-control" [value]="fechaDesde">
        </div>
        <div class="col-md-3">
          <label class="form-label">Fecha hasta</label>
          <input type="date" class="form-control" [value]="fechaHasta">
        </div>
        <div class="col-md-3">
          <label class="form-label">Estado</label>
          <select class="form-select">
            <option value="">Todos los estados</option>
            <option value="confirmada">Confirmada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary w-100" (click)="filtrarReservas()">
            <i class="fas fa-search"></i> Filtrar
          </button>
        </div>
      </div>

      <!-- Tabla de reservas -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Lista de Reservas</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Hotel</th>
                      <th>Habitación</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let reserva of reservas">
                      <td><strong>#{{ reserva.id }}</strong></td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar-circle me-2">{{ reserva.cliente.charAt(0) }}</div>
                          <span>{{ reserva.cliente }}</span>
                        </div>
                      </td>
                      <td>{{ reserva.hotel }}</td>
                      <td><span class="room-number">{{ reserva.habitacion }}</span></td>
                      <td>{{ reserva.checkIn | date:'MMM d, y' }}</td>
                      <td>{{ reserva.checkOut | date:'MMM d, y' }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadge(reserva.estado)">
                          {{ reserva.estado | titlecase }}
                        </span>
                      </td>
                      <td><strong>{{ reserva.total | currency:'USD':'symbol':'1.0-0' }}</strong></td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-primary" 
                                  (click)="verReserva(reserva)" 
                                  title="Ver detalles">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" 
                                  (click)="editarReserva(reserva)"
                                  [disabled]="reserva.estado === 'cancelada'" 
                                  title="Editar">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" 
                                  (click)="cancelarReserva(reserva)"
                                  [disabled]="reserva.estado === 'cancelada'" 
                                  title="Cancelar">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      content: '📋';
      margin-right: 1rem;
      font-size: 2rem;
    }

    .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #ff7eb3, #ff758c);
      border: none;
      box-shadow: 0 4px 15px rgba(255, 126, 179, 0.3);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 126, 179, 0.4);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(184, 151, 120, 0.2);
      transition: all 0.3s ease;
      border: 2px solid rgba(184, 151, 120, 0.3);
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(184, 151, 120, 0.3);
      border-color: #B89778;
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #B89778;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.4));
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      color: #1C2526;
      font-family: 'Cormorant Garamond', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .stat-label {
      color: #4A1B2F;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.875rem;
      font-family: 'Crimson Text', serif;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
    }

    .row.mb-3 {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .form-label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-select, .form-control {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-select:focus, .form-control:focus {
      border-color: #ff7eb3;
      box-shadow: 0 0 0 3px rgba(255, 126, 179, 0.1);
    }

    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
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
      content: '🏨';
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
      background: linear-gradient(90deg, rgba(255, 126, 179, 0.05), rgba(255, 117, 140, 0.05));
      transform: scale(1.01);
      transition: all 0.3s ease;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ff7eb3, #ff758c);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .room-number {
      padding: 0.3rem 0.8rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 15px;
      font-weight: 600;
      font-size: 0.875rem;
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

    .bg-success {
      background: linear-gradient(135deg, #48bb78, #38a169) !important;
      color: white;
    }

    .bg-warning {
      background: linear-gradient(135deg, #ed8936, #dd6b20) !important;
      color: white;
    }

    .bg-danger {
      background: linear-gradient(135deg, #f56565, #e53e3e) !important;
      color: white;
    }

    .bg-secondary {
      background: linear-gradient(135deg, #a0aec0, #718096) !important;
      color: white;
    }
    
    .btn-group .btn {
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
      background: rgba(255, 126, 179, 0.1);
      color: #ff7eb3;
      border: none;
    }

    .btn-outline-primary:hover {
      background: rgba(255, 126, 179, 0.2);
      transform: scale(1.1);
      color: #ff758c;
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

    .table-responsive {
      border-radius: 0 0 20px 20px;
      overflow: hidden;
    }

    /* Animaciones de entrada */
    .card, .stat-card {
      animation: slideInUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    .stat-card:nth-child(2) { animation-delay: 0.1s; }
    .stat-card:nth-child(3) { animation-delay: 0.2s; }
    .stat-card:nth-child(4) { animation-delay: 0.3s; }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Efectos especiales */
    td strong {
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
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

      .stats-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-icon {
        font-size: 2rem;
      }

      .stat-number {
        font-size: 2rem;
      }

      .row.mb-3 {
        margin-left: 0;
        margin-right: 0;
      }

      .table-responsive {
        border-radius: 0;
      }

      .btn-group .btn {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
      }

      .avatar-circle {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }
    }

    @media (max-width: 576px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .form-select, .form-control {
        margin-bottom: 1rem;
      }

      .table th, .table td {
        padding: 1rem 0.5rem;
        font-size: 0.875rem;
      }

      .btn-group {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
  `]
})
export class ReservasComponent {
  fechaDesde = '';
  fechaHasta = '';
  
  totalReservas = 156;
  reservasConfirmadas = 142;
  reservasPendientes = 14;
  ingresosMes = 45200;

  reservas = [
    {
      id: 1001,
      cliente: 'Juan Pérez',
      hotel: 'Hotel Boutique Central',
      habitacion: '101',
      checkIn: new Date('2025-09-20'),
      checkOut: new Date('2025-09-23'),
      estado: 'confirmada',
      total: 540
    },
    {
      id: 1002,
      cliente: 'María García',
      hotel: 'Hotel Plaza Mayor',
      habitacion: '201',
      checkIn: new Date('2025-09-25'),
      checkOut: new Date('2025-09-28'),
      estado: 'pendiente',
      total: 720
    },
    {
      id: 1003,
      cliente: 'Carlos López',
      hotel: 'Hotel Ejecutivo',
      habitacion: '301',
      checkIn: new Date('2025-09-18'),
      checkOut: new Date('2025-09-20'),
      estado: 'confirmada',
      total: 400
    },
    {
      id: 1004,
      cliente: 'Ana Martínez',
      hotel: 'Hotel Boutique Central',
      habitacion: '102',
      checkIn: new Date('2025-09-15'),
      checkOut: new Date('2025-09-17'),
      estado: 'cancelada',
      total: 300
    }
  ];

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'cancelada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  nuevaReserva(): void {
    console.log('Crear nueva reserva');
  }

  filtrarReservas(): void {
    console.log('Filtrar reservas');
  }

  verReserva(reserva: any): void {
    console.log('Ver reserva:', reserva);
  }

  editarReserva(reserva: any): void {
    console.log('Editar reserva:', reserva);
  }

  cancelarReserva(reserva: any): void {
    console.log('Cancelar reserva:', reserva);
  }
}