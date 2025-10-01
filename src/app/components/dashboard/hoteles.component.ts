import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="hoteles-container">
      <!-- Header Section -->
      <div class="page-header" [@fadeInUp]>
        <div class="header-content">
          <div class="title-section">
            <div class="page-icon">🏨</div>
            <div class="title-text">
              <h1>Gestión de Hoteles</h1>
              <p class="subtitle">Administra y controla toda la cadena hotelera</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-add-hotel" (click)="agregarHotel()">
              <span class="btn-icon">➕</span>
              <span class="btn-text">Nuevo Hotel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section" [@slideInLeft]>
        <div class="stat-card">
          <div class="stat-icon active">🏨</div>
          <div class="stat-info">
            <div class="stat-number">{{ getTotalHoteles() }}</div>
            <div class="stat-label">Total Hoteles</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ getHotelesActivos() }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon premium">⭐</div>
          <div class="stat-info">
            <div class="stat-number">{{ getHotelesPremium() }}</div>
            <div class="stat-label">5 Estrellas</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon revenue">💰</div>
          <div class="stat-info">
            <div class="stat-number">\$2.4M</div>
            <div class="stat-label">Revenue Mensual</div>
          </div>
        </div>
      </div>

      <!-- Hotels Grid -->
      <div class="hotels-section" [@fadeInUp]>
        <div class="section-header">
          <h2>Todos los Hoteles</h2>
          <div class="filters">
            <select class="filter-select" (change)="filtrarPorEstado($event)">
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo activos</option>
              <option value="inactivo">Solo inactivos</option>
            </select>
            <select class="filter-select" (change)="filtrarPorCategoria($event)">
              <option value="todas">Todas las categorías</option>
              <option value="5">5 Estrellas</option>
              <option value="4">4 Estrellas</option>
              <option value="3">3 Estrellas</option>
            </select>
          </div>
        </div>

        <div class="hotels-grid" [@listAnimation]="hotelesFiltrados.length">
          <div 
            class="hotel-card" 
            *ngFor="let hotel of hotelesFiltrados; trackBy: trackByHotelId"
            [class.inactive]="!hotel.activo">
            
            <div class="hotel-header">
              <div class="hotel-info">
                <h3 class="hotel-name">{{ hotel.nombre }}</h3>
                <p class="hotel-location">
                  <span class="location-icon">📍</span>
                  {{ hotel.ubicacion }}
                </p>
              </div>
              <div class="hotel-status">
                <span class="status-badge" [class.active]="hotel.activo" [class.inactive]="!hotel.activo">
                  {{ hotel.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>

            <div class="hotel-details">
              <div class="detail-item">
                <span class="detail-label">Categoría:</span>
                <div class="stars">
                  <span class="star" *ngFor="let star of getStarsArray(hotel.categoria)">⭐</span>
                  <span class="category-text">{{ hotel.categoria }} Estrellas</span>
                </div>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Habitaciones:</span>
                <span class="detail-value">{{ hotel.habitaciones || 'N/A' }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Ocupación:</span>
                <div class="ocupacion-bar">
                  <div class="ocupacion-fill" [style.width.%]="hotel.ocupacion || 0"></div>
                  <span class="ocupacion-text">{{ hotel.ocupacion || 0 }}%</span>
                </div>
              </div>
            </div>

            <div class="hotel-actions">
              <button class="action-btn view" (click)="verHotel(hotel)" title="Ver detalles">
                <span class="emoji">👁️</span>
                <span class="action-text">Ver</span>
              </button>
              <button class="action-btn edit" (click)="editarHotel(hotel)" title="Editar hotel">
                <span class="emoji">✏️</span>
                <span class="action-text">Editar</span>
              </button>
              <button class="action-btn delete" (click)="eliminarHotel(hotel)" title="Eliminar hotel">
                <span class="emoji">🗑️</span>
                <span class="action-text">Eliminar</span>
              </button>
              <button class="action-btn toggle" (click)="toggleEstadoHotel(hotel)" 
                      [title]="hotel.activo ? 'Desactivar' : 'Activar'">
                <span class="emoji">{{ hotel.activo ? '⏸️' : '▶️' }}</span>
                <span class="action-text">{{ hotel.activo ? 'Pausar' : 'Activar' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="hotelesFiltrados.length === 0" [@fadeInUp]>
          <div class="empty-icon">🏨</div>
          <h3>No se encontraron hoteles</h3>
          <p>No hay hoteles que coincidan con los filtros seleccionados</p>
          <button class="btn-add-first" (click)="agregarHotel()">
            <span class="btn-icon">➕</span>
            Agregar Primer Hotel
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hoteles-container {
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Header Section */
    .page-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .page-icon {
      font-size: 3rem;
      color: #B89778;
      filter: drop-shadow(2px 2px 4px rgba(184, 151, 120, 0.3));
    }

    .title-text h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1C2526;
      margin: 0;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .subtitle {
      color: #4A1B2F;
      font-size: 1.1rem;
      margin: 0.5rem 0 0 0;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
    }

    .btn-add-hotel {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 15px;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-add-hotel:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(184, 151, 120, 0.15);
      border: 2px solid rgba(184, 151, 120, 0.3);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(184, 151, 120, 0.25);
      border-color: #B89778;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.4));
    }

    .stat-icon.active {
      background: linear-gradient(135deg, #B89778, #4A1B2F);
      color: #F8F1E9;
    }

    .stat-icon.success {
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: #F8F1E9;
    }

    .stat-icon.premium {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
      color: #F8F1E9;
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #38b2ac, #319795);
      color: #F8F1E9;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1C2526;
      margin-bottom: 0.25rem;
      font-family: 'Cormorant Garamond', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .stat-label {
      color: #4A1B2F;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Crimson Text', serif;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
    }

    /* Hotels Section */
    .hotels-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      color: #4a5568;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Hotels Grid */
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .hotel-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .hotel-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .hotel-card.inactive::before {
      background: linear-gradient(135deg, #e53e3e, #c53030);
    }

    .hotel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }

    .hotel-card.inactive {
      opacity: 0.7;
      background: #f7fafc;
    }

    .hotel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .hotel-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .hotel-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #718096;
      font-size: 0.9rem;
      margin: 0;
    }

    .location-icon {
      font-size: 1rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.active {
      background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
      color: #22543d;
    }

    .status-badge.inactive {
      background: linear-gradient(135deg, #fed7d7, #feb2b2);
      color: #742a2a;
    }

    .hotel-details {
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .detail-label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .detail-value {
      color: #2d3748;
      font-weight: 500;
    }

    .stars {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .star {
      font-size: 1rem;
    }

    .category-text {
      margin-left: 0.5rem;
      color: #718096;
      font-size: 0.85rem;
    }

    .ocupacion-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      max-width: 120px;
    }

    .ocupacion-fill {
      height: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 4px;
      position: relative;
    }

    .ocupacion-bar {
      position: relative;
      background: #e2e8f0;
      border-radius: 4px;
      height: 8px;
      flex: 1;
    }

    .ocupacion-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .ocupacion-text {
      font-size: 0.8rem;
      font-weight: 600;
      color: #4a5568;
      min-width: 35px;
    }

    /* Hotel Actions */
    .hotel-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      flex: 1;
      justify-content: center;
      min-width: 80px;
    }

    .action-btn.view {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      color: white;
    }

    .action-btn.edit {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
      color: white;
    }

    .action-btn.delete {
      background: linear-gradient(135deg, #e53e3e, #c53030);
      color: white;
    }

    .action-btn.toggle {
      background: linear-gradient(135deg, #38b2ac, #319795);
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .action-btn .emoji {
      font-size: 1rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #718096;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .btn-add-first {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-add-first:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hoteles-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .hotels-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filters {
        justify-content: center;
      }

      .hotel-actions {
        grid-template-columns: 1fr 1fr;
      }

      .title-text h1 {
        font-size: 2rem;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .hotel-actions {
        flex-direction: column;
      }

      .action-btn {
        min-width: auto;
      }
    }
  `]
})
export class HotelesComponent implements OnInit {
  hoteles = [
    {
      id: 1,
      nombre: 'Hotel Boutique Central',
      ubicacion: 'Centro, Ciudad',
      categoria: 5,
      activo: true,
      habitaciones: 45,
      ocupacion: 87
    },
    {
      id: 2,
      nombre: 'Hotel Plaza Mayor',
      ubicacion: 'Zona Rosa, Ciudad',
      categoria: 4,
      activo: true,
      habitaciones: 32,
      ocupacion: 92
    },
    {
      id: 3,
      nombre: 'Hotel Ejecutivo',
      ubicacion: 'Zona Financiera, Ciudad',
      categoria: 4,
      activo: false,
      habitaciones: 28,
      ocupacion: 0
    },
    {
      id: 4,
      nombre: 'Hotel Paradise Beach',
      ubicacion: 'Costa Dorada, Playa',
      categoria: 5,
      activo: true,
      habitaciones: 67,
      ocupacion: 95
    },
    {
      id: 5,
      nombre: 'Hotel Business Center',
      ubicacion: 'Distrito Financiero, Ciudad',
      categoria: 3,
      activo: true,
      habitaciones: 24,
      ocupacion: 78
    }
  ];

  hotelesFiltrados = [...this.hoteles];
  filtroEstado = 'todos';
  filtroCategoria = 'todas';

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  // Métodos de estadísticas
  getTotalHoteles(): number {
    return this.hoteles.length;
  }

  getHotelesActivos(): number {
    return this.hoteles.filter(hotel => hotel.activo).length;
  }

  getHotelesPremium(): number {
    return this.hoteles.filter(hotel => hotel.categoria === 5).length;
  }

  // Métodos de filtrado
  filtrarPorEstado(event: any): void {
    this.filtroEstado = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorCategoria(event: any): void {
    this.filtroCategoria = event.target.value;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.hotelesFiltrados = this.hoteles.filter(hotel => {
      // Filtro por estado
      let pasaFiltroEstado = true;
      if (this.filtroEstado === 'activo') {
        pasaFiltroEstado = hotel.activo;
      } else if (this.filtroEstado === 'inactivo') {
        pasaFiltroEstado = !hotel.activo;
      }

      // Filtro por categoría
      let pasaFiltroCategoria = true;
      if (this.filtroCategoria !== 'todas') {
        pasaFiltroCategoria = hotel.categoria === parseInt(this.filtroCategoria);
      }

      return pasaFiltroEstado && pasaFiltroCategoria;
    });
  }

  // Métodos de utilidad
  getStarsArray(categoria: number): number[] {
    return Array.from({ length: categoria }, (_, i) => i);
  }

  trackByHotelId(index: number, hotel: any): number {
    return hotel.id;
  }

  // Métodos de acciones
  agregarHotel(): void {
    console.log('Agregar nuevo hotel');
    // TODO: Abrir modal de creación de hotel
    const nuevoHotel = {
      id: this.hoteles.length + 1,
      nombre: `Hotel Nuevo ${this.hoteles.length + 1}`,
      ubicacion: 'Nueva Ubicación',
      categoria: 4,
      activo: true,
      habitaciones: 30,
      ocupacion: 0
    };
    
    this.hoteles.push(nuevoHotel);
    this.aplicarFiltros();
  }

  verHotel(hotel: any): void {
    console.log('Ver hotel:', hotel);
    // TODO: Abrir modal con detalles del hotel
    alert(`Ver detalles de: ${hotel.nombre}\nUbicación: ${hotel.ubicacion}\nCategoría: ${hotel.categoria} estrellas\nHabitaciones: ${hotel.habitaciones}\nOcupación: ${hotel.ocupacion}%`);
  }

  editarHotel(hotel: any): void {
    console.log('Editar hotel:', hotel);
    // TODO: Abrir modal de edición
    const nuevoNombre = prompt('Nuevo nombre del hotel:', hotel.nombre);
    if (nuevoNombre) {
      hotel.nombre = nuevoNombre;
    }
  }

  eliminarHotel(hotel: any): void {
    console.log('Eliminar hotel:', hotel);
    if (confirm(`¿Estás seguro de que quieres eliminar ${hotel.nombre}?`)) {
      const index = this.hoteles.findIndex(h => h.id === hotel.id);
      if (index > -1) {
        this.hoteles.splice(index, 1);
        this.aplicarFiltros();
      }
    }
  }

  toggleEstadoHotel(hotel: any): void {
    hotel.activo = !hotel.activo;
    if (!hotel.activo) {
      hotel.ocupacion = 0;
    }
    this.aplicarFiltros();
  }