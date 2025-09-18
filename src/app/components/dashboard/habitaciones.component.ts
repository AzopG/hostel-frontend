import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Gestión de Habitaciones</h1>
        <button class="btn btn-primary" (click)="agregarHabitacion()">
          <i class="fas fa-plus"></i> Agregar Habitación
        </button>
      </div>

      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filtroHotel">
            <option value="">Todos los hoteles</option>
            <option *ngFor="let hotel of hoteles" [value]="hotel.id">{{ hotel.nombre }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filtroTipo">
            <option value="">Todos los tipos</option>
            <option value="individual">Individual</option>
            <option value="doble">Doble</option>
            <option value="suite">Suite</option>
            <option value="presidencial">Presidencial</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filtroEstado">
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Lista de Habitaciones</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Hotel</th>
                      <th>Tipo</th>
                      <th>Capacidad</th>
                      <th>Precio/Noche</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let habitacion of habitacionesFiltradas">
                      <td><strong>{{ habitacion.numero }}</strong></td>
                      <td>{{ habitacion.hotel }}</td>
                      <td>
                        <span class="badge" [ngClass]="getTipoBadge(habitacion.tipo)">
                          {{ habitacion.tipo | titlecase }}
                        </span>
                      </td>
                      <td>{{ habitacion.capacidad }} personas</td>
                      <td>{{ habitacion.precio | currency:'USD':'symbol':'1.0-0' }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadge(habitacion.estado)">
                          {{ habitacion.estado | titlecase }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                (click)="verHabitacion(habitacion)">
                          <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-outline-warning me-2" 
                                (click)="editarHabitacion(habitacion)">
                          <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="eliminarHabitacion(habitacion)">
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
    </div>
  `,
  styles: [`
    .container-fluid {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      margin: -20px;
      padding: 20px;
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
      content: '🏨';
      margin-right: 1rem;
      font-size: 2rem;
    }

    .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .row.mb-3 {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .form-select {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
      content: '🛏️';
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
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
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
      background: linear-gradient(135deg, #667eea, #5a6fd8) !important;
      color: white;
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
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: none;
    }

    .btn-outline-primary:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: scale(1.1);
      color: #5a6fd8;
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

    td strong {
      color: #2d3748;
      font-size: 1.1rem;
    }

    .table-responsive {
      border-radius: 0 0 20px 20px;
      overflow: hidden;
    }

    /* Animaciones de entrada */
    .card {
      animation: slideInUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Efectos para los números de habitación */
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

      .row.mb-3 {
        margin-left: 0;
        margin-right: 0;
      }

      .table-responsive {
        border-radius: 0;
      }

      .btn-sm {
        width: 35px;
        height: 35px;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 576px) {
      .form-select {
        margin-bottom: 1rem;
      }

      .table th, .table td {
        padding: 1rem 0.5rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class HabitacionesComponent {
  filtroHotel = '';
  filtroTipo = '';
  filtroEstado = '';

  hoteles = [
    { id: 1, nombre: 'Hotel Boutique Central' },
    { id: 2, nombre: 'Hotel Plaza Mayor' },
    { id: 3, nombre: 'Hotel Ejecutivo' }
  ];

  habitaciones = [
    {
      id: 1,
      numero: '101',
      hotel: 'Hotel Boutique Central',
      tipo: 'individual',
      capacidad: 1,
      precio: 120,
      estado: 'disponible'
    },
    {
      id: 2,
      numero: '102',
      hotel: 'Hotel Boutique Central',
      tipo: 'doble',
      capacidad: 2,
      precio: 180,
      estado: 'ocupada'
    },
    {
      id: 3,
      numero: '201',
      hotel: 'Hotel Plaza Mayor',
      tipo: 'suite',
      capacidad: 4,
      precio: 350,
      estado: 'disponible'
    },
    {
      id: 4,
      numero: '301',
      hotel: 'Hotel Ejecutivo',
      tipo: 'presidencial',
      capacidad: 6,
      precio: 500,
      estado: 'mantenimiento'
    }
  ];

  get habitacionesFiltradas() {
    return this.habitaciones.filter(habitacion => {
      const coincideHotel = !this.filtroHotel || habitacion.hotel.includes(this.filtroHotel);
      const coincideTipo = !this.filtroTipo || habitacion.tipo === this.filtroTipo;
      const coincideEstado = !this.filtroEstado || habitacion.estado === this.filtroEstado;
      return coincideHotel && coincideTipo && coincideEstado;
    });
  }

  getTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'individual': return 'bg-secondary';
      case 'doble': return 'bg-primary';
      case 'suite': return 'bg-info';
      case 'presidencial': return 'bg-warning';
      default: return 'bg-light';
    }
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'disponible': return 'bg-success';
      case 'ocupada': return 'bg-danger';
      case 'mantenimiento': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  agregarHabitacion(): void {
    console.log('Agregar nueva habitación');
  }

  verHabitacion(habitacion: any): void {
    console.log('Ver habitación:', habitacion);
  }

  editarHabitacion(habitacion: any): void {
    console.log('Editar habitación:', habitacion);
  }

  eliminarHabitacion(habitacion: any): void {
    console.log('Eliminar habitación:', habitacion);
  }
}