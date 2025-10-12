import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" style="position: relative;">
        <h1 class="h2"><i class="fas fa-bed me-3"></i>Gestión de Habitaciones</h1>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="card-title mb-0"><i class="fas fa-filter me-2"></i>Filtros de Búsqueda</h5>
        </div>
        <div class="card-body">
          <div class="filters-container">
            <div class="filter-group">
              <label class="filter-label"><i class="fas fa-hotel"></i> Hotel</label>
              <select class="filter-select" [(ngModel)]="filtroHotel">
                <option value="">Todos los hoteles</option>
                <option *ngFor="let hotel of hoteles" [value]="hotel.id">{{ hotel.nombre }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label"><i class="fas fa-home"></i> Tipo</label>
              <select class="filter-select" [(ngModel)]="filtroTipo">
                <option value="">Todos los tipos</option>
                <option value="individual">Individual</option>
                <option value="doble">Doble</option>
                <option value="suite">Suite</option>
                <option value="presidencial">Presidencial</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label"><i class="fas fa-traffic-light"></i> Estado</label>
              <select class="filter-select" [(ngModel)]="filtroEstado">
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div class="filter-actions">
              <button class="btn-filter-clear" (click)="limpiarFiltros()">
                <i class="fas fa-redo"></i> Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de habitaciones -->
      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0"><i class="fas fa-list me-2"></i>Lista de Habitaciones</h5>
          <div class="table-stats">
            <span class="badge bg-primary me-2">Total: {{ habitacionesFiltradas.length }}</span>
            <span class="badge bg-success me-2">Disponibles: {{ getDisponibles() }}</span>
            <span class="badge bg-danger">Ocupadas: {{ getOcupadas() }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th><i class="fas fa-home me-1"></i>Número</th>
                  <th><i class="fas fa-hotel me-1"></i>Hotel</th>
                  <th><i class="fas fa-bed me-1"></i>Tipo</th>
                  <th><i class="fas fa-users me-1"></i>Capacidad</th>
                  <th><i class="fas fa-dollar-sign me-1"></i>Precio/Noche</th>
                  <th><i class="fas fa-traffic-light me-1"></i>Estado</th>
                  <th><i class="fas fa-cog me-1"></i>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let habitacion of habitacionesFiltradas; trackBy: trackByRoomId" class="room-row">
                  <td>
                    <div class="number-badge">{{ habitacion.numero }}</div>
                  </td>
                  <td>{{ habitacion.hotel }}</td>
                  <td>
                    <span class="badge" [ngClass]="getTipoBadge(habitacion.tipo)">
                      <span [innerHTML]="getRoomTypeIcon(habitacion.tipo)"></span> {{ habitacion.tipo | titlecase }}
                    </span>
                  </td>
                  <td>{{ habitacion.capacidad }} personas</td>
                  <td class="price-cell">\${{ habitacion.precio }}</td>
                  <td>
                    <span class="badge" [ngClass]="getEstadoBadge(habitacion.estado)">
                      <span [innerHTML]="getStatusIcon(habitacion.estado)"></span> {{ habitacion.estado | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline-primary" 
                              (click)="verHabitacion(habitacion)"
                              title="Ver detalles">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-warning" 
                              (click)="editarHabitacion(habitacion)"
                              title="Editar habitación">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" 
                              (click)="eliminarHabitacion(habitacion)"
                              title="Eliminar habitación">
                        <i class="fas fa-trash"></i>
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
  `,
  styles: [`
    /* Container styles consistent with reportes component */
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
      padding-top: 0;
      padding-bottom: 0;
    }

    .d-flex.justify-content-between {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 0.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 0;
    }

    .h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .btn-success {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #48bb78, #38a169);
      border: none;
      box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
      transition: all 0.3s ease;
    }

    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
      background: linear-gradient(135deg, #38a169, #2f855a);
    }

    .btn-success:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-bottom: 1px solid #e2e8f0;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .card-body {
      padding: 2rem;
    }

    /* Filtros */
    .filters-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #4a5568;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .filter-select {
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      font-size: 0.95rem;
      color: #2d3748;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .filter-actions {
      display: flex;
      align-items: end;
    }

    .btn-filter-clear {
      padding: 12px 20px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      color: #4a5568;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-filter-clear:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    /* Table styles */
    .table-stats {
      display: flex;
      gap: 8px;
      align-items: center;
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

    .number-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 45px;
      height: 35px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
    }

    .price-cell {
      font-weight: 700;
      color: #2d3748;
      font-size: 1rem;
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
      gap: 4px;
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

    .action-buttons {
      display: flex;
      gap: 8px;
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

    /* Responsive design */
    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }

      .d-flex.justify-content-between {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .h2 {
        font-size: 2rem;
      }

      .filters-container {
        grid-template-columns: 1fr;
      }
      
      .card-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .table-stats {
        justify-content: center;
      }
      
      .table th,
      .table td {
        padding: 12px 16px;
        font-size: 0.9rem;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 6px;
      }
      
      .btn-sm {
        width: auto;
        height: auto;
        padding: 8px 12px;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 576px) {
      .card-header,
      .card-body {
        padding: 1.5rem;
      }
      
      .number-badge {
        width: 35px;
        height: 30px;
        font-size: 0.9rem;
      }
      
      .badge {
        padding: 4px 8px;
        font-size: 0.75rem;
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
    // console.log('Agregar nueva habitación');
  }

  verHabitacion(habitacion: any): void {
    // console.log('Ver habitación:', habitacion);
  }

  editarHabitacion(habitacion: any): void {
    // console.log('Editar habitación:', habitacion);
  }

  eliminarHabitacion(habitacion: any): void {
    // console.log('Eliminar habitación:', habitacion);
  }

  // Métodos adicionales para la nueva UI
  limpiarFiltros(): void {
    this.filtroHotel = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
  }

  getDisponibles(): number {
    return this.habitacionesFiltradas.filter(h => h.estado === 'disponible').length;
  }

  getOcupadas(): number {
    return this.habitacionesFiltradas.filter(h => h.estado === 'ocupada').length;
  }

  trackByRoomId(index: number, item: any): any {
    return item.id;
  }

  getRoomTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'individual': return '<i class="fas fa-bed"></i>';
      case 'doble': return '<i class="fas fa-bed"></i><i class="fas fa-bed"></i>';
      case 'suite': return '<i class="fas fa-home"></i>';
      case 'presidencial': return '<i class="fas fa-crown"></i>';
      default: return '<i class="fas fa-home"></i>';
    }
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'disponible': return '<i class="fas fa-check-circle"></i>';
      case 'ocupada': return '<i class="fas fa-times-circle"></i>';
      case 'mantenimiento': return '<i class="fas fa-wrench"></i>';
      default: return '<i class="fas fa-question-circle"></i>';
    }
  }
}
