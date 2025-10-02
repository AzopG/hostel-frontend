import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="habitaciones-container">
      <!-- Header mejorado -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <span class="title-icon">🛏️</span>
              Gestión de Habitaciones
            </h1>
            <p class="page-subtitle">Administra habitaciones, disponibilidad y configuraciones</p>
          </div>
          <button class="btn-add-room" (click)="agregarHabitacion()">
            <span class="btn-icon">➕</span>
            Agregar Habitación
          </button>
        </div>
      </div>

      <!-- Filtros mejorados -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label class="filter-label">🏨 Hotel</label>
            <select class="filter-select" [(ngModel)]="filtroHotel">
              <option value="">Todos los hoteles</option>
              <option *ngFor="let hotel of hoteles" [value]="hotel.id">{{ hotel.nombre }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">🏠 Tipo</label>
            <select class="filter-select" [(ngModel)]="filtroTipo">
              <option value="">Todos los tipos</option>
              <option value="individual">Individual</option>
              <option value="doble">Doble</option>
              <option value="suite">Suite</option>
              <option value="presidencial">Presidencial</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">🚦 Estado</label>
            <select class="filter-select" [(ngModel)]="filtroEstado">
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div class="filter-actions">
            <button class="btn-filter-clear" (click)="limpiarFiltros()">
              🔄 Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla moderna -->
      <div class="rooms-table-section">
        <div class="table-header">
          <h3 class="table-title">Lista de Habitaciones</h3>
          <div class="table-stats">
            <span class="stat-chip">Total: {{ habitacionesFiltradas.length }}</span>
            <span class="stat-chip disponible">Disponibles: {{ getDisponibles() }}</span>
            <span class="stat-chip ocupada">Ocupadas: {{ getOcupadas() }}</span>
          </div>
        </div>
        
        <div class="modern-table-container">
          <div class="table-wrapper">
            <table class="modern-table">
              <thead>
                <tr>
                  <th class="number-col">
                    <span class="header-icon">🏠</span>
                    Número
                  </th>
                  <th class="hotel-col">
                    <span class="header-icon">🏨</span>
                    Hotel
                  </th>
                  <th class="type-col">
                    <span class="header-icon">🛏️</span>
                    Tipo
                  </th>
                  <th class="capacity-col">
                    <span class="header-icon">👥</span>
                    Capacidad
                  </th>
                  <th class="price-col">
                    <span class="header-icon">💰</span>
                    Precio/Noche
                  </th>
                  <th class="status-col">
                    <span class="header-icon">🚦</span>
                    Estado
                  </th>
                  <th class="actions-col">
                    <span class="header-icon">⚙️</span>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let habitacion of habitacionesFiltradas; trackBy: trackByRoomId" class="room-row">
                  <td class="room-number">
                    <div class="number-badge">{{ habitacion.numero }}</div>
                  </td>
                  <td class="hotel-name">{{ habitacion.hotel }}</td>
                  <td class="room-type">
                    <span class="type-badge" [ngClass]="getTipoBadge(habitacion.tipo)">
                      {{ getRoomTypeIcon(habitacion.tipo) }} {{ habitacion.tipo | titlecase }}
                    </span>
                  </td>
                  <td class="capacity">
                    <span class="capacity-text">{{ habitacion.capacidad }} personas</span>
                  </td>
                  <td class="price">
                    <span class="price-amount">\${{ habitacion.precio }}</span>
                  </td>
                  <td class="status">
                    <span class="status-badge" [ngClass]="getEstadoBadge(habitacion.estado)">
                      {{ getStatusIcon(habitacion.estado) }} {{ habitacion.estado | titlecase }}
                    </span>
                  </td>
                  <td class="actions">
                    <div class="action-buttons">
                      <button class="action-btn view" 
                              (click)="verHabitacion(habitacion)"
                              title="Ver detalles">
                        👁️ Ver
                      </button>
                      <button class="action-btn edit" 
                              (click)="editarHabitacion(habitacion)"
                              title="Editar habitación">
                        ✏️ Editar
                      </button>
                      <button class="action-btn delete" 
                              (click)="eliminarHabitacion(habitacion)"
                              title="Eliminar habitación">
                        🗑️ Eliminar
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
    /* Contenedor principal moderno */
    .habitaciones-container {
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
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    /* Header principal */
    .page-header {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 24px 32px;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .title-section {
      flex: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 2.2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      color: #718096;
      font-size: 1rem;
      margin: 4px 0 0 0;
      font-weight: 500;
    }

    .btn-add-room {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-add-room:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-icon {
      font-size: 1.1rem;
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

    /* Sección de filtros */
    .filters-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

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

    /* Sección de tabla */
    .rooms-table-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
    }

    .table-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .table-stats {
      display: flex;
      gap: 12px;
    }

    .stat-chip {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #e2e8f0;
      color: #4a5568;
    }

    .stat-chip.disponible {
      background: #c6f6d5;
      color: #22543d;
    }

    .stat-chip.ocupada {
      background: #fed7d7;
      color: #742a2a;
    }

    .modern-table-container {
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .modern-table th {
      background: #f7fafc;
      padding: 16px 20px;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .header-icon {
      margin-right: 6px;
      font-size: 1rem;
    }

    .modern-table td {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .room-row {
      transition: all 0.3s ease;
    }

    .room-row:hover {
      background: #f8fafc;
      transform: translateX(2px);
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

    .hotel-name {
      font-weight: 500;
      color: #2d3748;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .type-badge.bg-secondary { background: #edf2f7; color: #4a5568; }
    .type-badge.bg-primary { background: #bee3f8; color: #2a4365; }
    .type-badge.bg-info { background: #b8f5ff; color: #065666; }
    .type-badge.bg-warning { background: #fef5e7; color: #744210; }

    .capacity-text {
      color: #718096;
      font-size: 0.9rem;
    }

    .price-amount {
      font-weight: 700;
      color: #2d3748;
      font-size: 1rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-badge.bg-success { background: #c6f6d5; color: #22543d; }
    .status-badge.bg-danger { background: #fed7d7; color: #742a2a; }
    .status-badge.bg-warning { background: #fef5e7; color: #744210; }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 14px;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn.view {
      background: #bee3f8;
      color: #2a4365;
    }

    .action-btn.edit {
      background: #fef5e7;
      color: #744210;
    }

    .action-btn.delete {
      background: #fed7d7;
      color: #742a2a;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

    /* Responsive design */
    @media (max-width: 1024px) {
      .filters-container {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .table-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .table-stats {
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .page-title {
        font-size: 1.7rem;
      }

      .filters-container {
        grid-template-columns: 1fr;
      }
      
      .table-header {
        padding: 20px;
      }
      
      .modern-table th,
      .modern-table td {
        padding: 12px 16px;
        font-size: 0.9rem;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 6px;
      }
      
      .action-btn {
        padding: 10px;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 576px) {
      .page-header,
      .filters-section,
      .rooms-table-section {
        margin-left: -8px;
        margin-right: -8px;
        border-radius: 12px;
      }
      
      .number-badge {
        width: 35px;
        height: 30px;
        font-size: 0.9rem;
      }
      
      .stat-chip {
        padding: 4px 10px;
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

    /* Animaciones suaves */
    .rooms-table-section {
      animation: slideInUp 0.6s ease-out;
    }

    .room-row {
      animation: fadeInRow 0.5s ease-out;
      animation-fill-mode: both;
    }

    .room-row:nth-child(1) { animation-delay: 0.1s; }
    .room-row:nth-child(2) { animation-delay: 0.15s; }
    .room-row:nth-child(3) { animation-delay: 0.2s; }
    .room-row:nth-child(4) { animation-delay: 0.25s; }
    .room-row:nth-child(5) { animation-delay: 0.3s; }

    @keyframes fadeInRow {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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
      case 'individual': return '🛏️';
      case 'doble': return '🛏️🛏️';
      case 'suite': return '🏠';
      case 'presidencial': return '👑';
      default: return '🏠';
    }
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'disponible': return '✅';
      case 'ocupada': return '🔴';
      case 'mantenimiento': return '🔧';
      default: return '❓';
    }
  }
}