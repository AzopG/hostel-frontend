import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaPaqueteService, PaqueteDisponible } from '../../services/reserva-paquete.service';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-buscar-paquetes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="buscar-paquetes-container">
      <!-- Header -->
      <div class="header-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h1 class="page-title">
                <i class="fas fa-cube me-3"></i>
                Paquetes Empresariales
              </h1>
              <p class="page-subtitle">Encuentra el paquete perfecto para tu evento corporativo</p>
            </div>
            <div class="col-md-6 text-end">
              <button class="btn btn-outline-primary me-2" (click)="irAMisReservas()">
                <i class="fas fa-list me-2"></i>Mis Reservas
              </button>
              <button class="btn btn-secondary" (click)="irAInicio()">
                <i class="fas fa-home me-2"></i>Inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros de búsqueda -->
      <div class="filtros-section">
        <div class="container">
          <div class="filtros-card">
            <h5 class="filtros-title">
              <i class="fas fa-search me-2"></i>Buscar Paquetes
            </h5>
            
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Hotel</label>
                  <select class="form-control" [(ngModel)]="filtros.hotelId" name="hotelId">
                    <option value="">Todos los hoteles</option>
                    <option *ngFor="let hotel of hoteles" [value]="hotel._id">
                      {{ hotel.nombre }} - {{ hotel.ciudad }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label>Fecha Inicio</label>
                  <input type="date" class="form-control" [(ngModel)]="filtros.fechaInicio" name="fechaInicio">
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label>Fecha Fin</label>
                  <input type="date" class="form-control" [(ngModel)]="filtros.fechaFin" name="fechaFin">
                </div>
              </div>
              
              <div class="col-md-2">
                <div class="form-group">
                  <label>Asistentes</label>
                  <input type="number" class="form-control" [(ngModel)]="filtros.numeroAsistentes" 
                         name="numeroAsistentes" min="1" placeholder="Cantidad">
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="form-group d-flex align-items-end">
                  <button class="btn btn-primary me-2" (click)="buscarPaquetes()" [disabled]="cargando">
                    <i class="fas fa-search me-2"></i>
                    {{ cargando ? 'Buscando...' : 'Buscar' }}
                  </button>
                  <button class="btn btn-outline-secondary" (click)="limpiarFiltros()">
                    <i class="fas fa-eraser me-2"></i>Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div class="resultados-section">
        <div class="container">
          <!-- Loading -->
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Buscando paquetes disponibles...</p>
          </div>

          <!-- Sin resultados -->
          <div *ngIf="!cargando && paquetes.length === 0 && busquedaRealizada" class="sin-resultados">
            <div class="text-center py-5">
              <i class="fas fa-search fa-3x text-muted mb-3"></i>
              <h4>No se encontraron paquetes</h4>
              <p class="text-muted">Intenta modificar tus criterios de búsqueda</p>
            </div>
          </div>

          <!-- Listado de paquetes -->
          <div *ngIf="!cargando && paquetes.length > 0" class="paquetes-grid">
            <div class="row">
              <div *ngFor="let paquete of paquetes" class="col-lg-6 col-xl-4 mb-4">
                <div class="paquete-card">
                  <div class="paquete-header">
                    <div class="paquete-tipo">{{ getTipoEventoLabel(paquete.tipo) }}</div>
                    <h5 class="paquete-titulo">{{ paquete.nombre }}</h5>
                  </div>
                  
                  <div class="paquete-body">
                    <div class="hotel-info">
                      <i class="fas fa-map-marker-alt me-2"></i>
                      <strong>{{ paquete.hotel.nombre }}</strong> - {{ paquete.hotel.ciudad }}
                    </div>
                    
                    <p class="paquete-descripcion">{{ paquete.descripcion }}</p>
                    
                    <div class="paquete-stats">
                      <div class="stat-item">
                        <i class="fas fa-users text-primary"></i>
                        <span>{{ paquete.capacidadMinima }} - {{ paquete.capacidadMaxima }} personas</span>
                      </div>
                      
                      <div class="stat-item" *ngIf="paquete.habitaciones?.length">
                        <i class="fas fa-bed text-success"></i>
                        <span>{{ paquete.habitaciones.length }} tipos de habitación</span>
                      </div>
                      
                      <div class="stat-item" *ngIf="paquete.salones?.length">
                        <i class="fas fa-building text-info"></i>
                        <span>{{ paquete.salones.length }} salones incluidos</span>
                      </div>
                      
                      <div class="stat-item" *ngIf="paquete.servicios?.length">
                        <i class="fas fa-concierge-bell text-warning"></i>
                        <span>{{ paquete.servicios.length }} servicios adicionales</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="paquete-footer">
                    <div class="precio-info">
                      <span class="precio-label">Desde</span>
                      <span class="precio-valor">\${{ formatearPrecio(paquete.precios.base) }}</span>
                      <span class="precio-moneda">{{ paquete.precios.moneda }}</span>
                    </div>
                    
                    <div class="paquete-actions">
                      <button class="btn btn-outline-primary btn-sm me-2" (click)="verDetallePaquete(paquete)">
                        <i class="fas fa-eye me-1"></i>Ver Detalles
                      </button>
                      <button class="btn btn-primary btn-sm" (click)="reservarPaquete(paquete)">
                        <i class="fas fa-calendar-plus me-1"></i>Reservar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalles del paquete -->
      <div class="modal fade" [class.show]="modalDetalleVisible" [style.display]="modalDetalleVisible ? 'block' : 'none'" 
           tabindex="-1" *ngIf="modalDetalleVisible">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ paqueteSeleccionado?.nombre }}</h5>
              <button type="button" class="btn-close" (click)="cerrarModalDetalle()"></button>
            </div>
            <div class="modal-body" *ngIf="paqueteSeleccionado">
              <div class="detalle-paquete">
                <div class="mb-4">
                  <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                  <p>{{ paqueteSeleccionado.descripcion }}</p>
                  <div class="row">
                    <div class="col-md-6">
                      <strong>Tipo:</strong> {{ getTipoEventoLabel(paqueteSeleccionado.tipo) }}
                    </div>
                    <div class="col-md-6">
                      <strong>Capacidad:</strong> {{ paqueteSeleccionado.capacidadMinima }} - {{ paqueteSeleccionado.capacidadMaxima }} personas
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.habitaciones?.length">
                  <h6><i class="fas fa-bed me-2"></i>Habitaciones Incluidas</h6>
                  <div class="list-group">
                    <div *ngFor="let hab of paqueteSeleccionado.habitaciones" class="list-group-item">
                      <strong>{{ getTipoHabitacionLabel(hab.tipo) }}</strong>
                      - {{ hab.cantidad }} unidades por {{ hab.noches }} noche(s)
                      <span class="badge bg-success ms-2">\${{ formatearPrecio(hab.precioPorNoche) }}/noche</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.salones?.length">
                  <h6><i class="fas fa-building me-2"></i>Salones Incluidos</h6>
                  <div class="list-group">
                    <div *ngFor="let salon of paqueteSeleccionado.salones" class="list-group-item">
                      <strong>{{ salon.nombre }}</strong>
                      - Capacidad: {{ salon.capacidad }} personas
                      <span class="badge bg-info ms-2">{{ salon.horas }}h incluidas</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.servicios?.length">
                  <h6><i class="fas fa-concierge-bell me-2"></i>Servicios Adicionales</h6>
                  <div class="list-group">
                    <div *ngFor="let servicio of paqueteSeleccionado.servicios" class="list-group-item">
                      <strong>{{ servicio.nombre }}</strong>
                      <span class="text-muted">- {{ servicio.categoria }}</span>
                      <span class="badge bg-warning ms-2">\${{ formatearPrecio(servicio.precio) }}</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.catering?.length">
                  <h6><i class="fas fa-utensils me-2"></i>Opciones de Catering</h6>
                  <div class="list-group">
                    <div *ngFor="let catering of paqueteSeleccionado.catering" class="list-group-item">
                      <strong>{{ getCateringLabel(catering.tipo) }}</strong>
                      <p class="mb-1 text-muted">{{ catering.descripcion }}</p>
                      <span class="badge bg-primary">\${{ formatearPrecio(catering.precioPorPersona) }}/persona</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cerrarModalDetalle()">Cerrar</button>
              <button class="btn btn-primary" (click)="reservarPaquete(paqueteSeleccionado!)">
                <i class="fas fa-calendar-plus me-2"></i>Reservar Paquete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="modalDetalleVisible" *ngIf="modalDetalleVisible"></div>
    </div>
  `,
  styleUrls: ['./buscar-paquetes.component.css']
})
export class BuscarPaquetesComponent implements OnInit {
  // Datos
  paquetes: PaqueteDisponible[] = [];
  hoteles: any[] = [];
  
  // Estados
  cargando = false;
  busquedaRealizada = false;
  
  // Modal
  modalDetalleVisible = false;
  paqueteSeleccionado: PaqueteDisponible | null = null;
  
  // Filtros
  filtros = {
    hotelId: '',
    fechaInicio: '',
    fechaFin: '',
    numeroAsistentes: undefined as number | undefined
  };

  constructor(
    private router: Router,
    private reservaPaqueteService: ReservaPaqueteService,
    private hotelService: HotelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarHoteles();
    this.buscarPaquetes(); // Cargar todos los paquetes inicialmente
  }

  /**
   * Cargar lista de hoteles
   */
  cargarHoteles(): void {
    this.hotelService.listarHoteles().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.hoteles = response.hoteles;
        }
      },
      error: (err: any) => {
        console.error('Error al cargar hoteles:', err);
      }
    });
  }

  /**
   * Buscar paquetes según filtros
   */
  buscarPaquetes(): void {
    this.cargando = true;
    this.busquedaRealizada = true;
    
    const filtrosBusqueda = { ...this.filtros };
    
    this.reservaPaqueteService.listarPaquetesDisponibles(filtrosBusqueda).subscribe({
      next: (response) => {
        if (response.success) {
          this.paquetes = response.paquetes;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al buscar paquetes:', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Limpiar filtros de búsqueda
   */
  limpiarFiltros(): void {
    this.filtros = {
      hotelId: '',
      fechaInicio: '',
      fechaFin: '',
      numeroAsistentes: undefined
    };
    this.buscarPaquetes();
  }

  /**
   * Ver detalles de un paquete
   */
  verDetallePaquete(paquete: PaqueteDisponible): void {
    this.paqueteSeleccionado = paquete;
    this.modalDetalleVisible = true;
  }

  /**
   * Cerrar modal de detalles
   */
  cerrarModalDetalle(): void {
    this.modalDetalleVisible = false;
    this.paqueteSeleccionado = null;
  }

  /**
   * Reservar un paquete
   */
  reservarPaquete(paquete: PaqueteDisponible): void {
    // Navegar a la página de reserva con el ID del paquete
    this.router.navigate(['/reservar-paquete', paquete._id]);
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  /**
   * Obtener etiqueta del tipo de evento
   */
  getTipoEventoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'evento_corporativo': 'Evento Corporativo',
      'reunion_negocios': 'Reunión de Negocios',
      'congreso': 'Congreso',
      'capacitacion': 'Capacitación',
      'celebracion_empresarial': 'Celebración Empresarial'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Obtener etiqueta del tipo de habitación
   */
  getTipoHabitacionLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'individual': 'Individual',
      'doble': 'Doble',
      'triple': 'Triple',
      'suite_junior': 'Suite Junior',
      'suite_ejecutiva': 'Suite Ejecutiva',
      'suite_presidencial': 'Suite Presidencial'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Obtener etiqueta del catering
   */
  getCateringLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'coffee_break': 'Coffee Break',
      'desayuno_continental': 'Desayuno Continental',
      'desayuno_americano': 'Desayuno Americano',
      'almuerzo_ejecutivo': 'Almuerzo Ejecutivo',
      'almuerzo_buffet': 'Almuerzo Buffet',
      'cena_formal': 'Cena Formal',
      'coctel': 'Cóctel',
      'brunch': 'Brunch'
    };
    return tipos[tipo] || tipo;
  }

  // Navegación
  irAInicio(): void {
    this.router.navigate(['/']);
  }

  irAMisReservas(): void {
    this.router.navigate(['/mis-reservas-paquetes']);
  }
}