import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';
import { PaqueteDisponible, ReservaPaqueteService } from '../../services/reserva-paquete.service';

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
              <button class="btn btn-warning me-2" (click)="testModal()" *ngIf="paquetes.length > 0">
                🧪 TEST MODAL
              </button>
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
                    <div class="paquete-badges">
                      <div class="info-badge ciudad-badge">
                        <span class="ciudad-label">Ciudad:</span>
                        <span class="ciudad-value">{{ paquete.hotel.ciudad }}</span>
                      </div>
                      <div class="info-badge evento-badge">
                        <span class="evento-label">Tipo de evento:</span>
                        <span class="evento-value">{{ getTipoEventoLabel(paquete.tipo) }}</span>
                      </div>
                    </div>
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
                    <div class="paquete-precio">
                      \${{ formatearPrecio(paquete.precios.base) }}
                      <div class="precio-moneda">{{ paquete.precios.moneda }}</div>
                    </div>
                    
                    <div class="paquete-actions">
                      <button class="btn-ver-detalles" (click)="verDetallePaquete(paquete)">
                        Ver Detalles
                      </button>
                      <button class="btn-reservar" (click)="reservarPaquete(paquete)">
                        Reservar
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
      <div class="modal" 
           [class.fade]="true"
           [class.show]="modalDetalleVisible" 
           [style.display]="modalDetalleVisible ? 'block' : 'none'" 
           [attr.aria-hidden]="!modalDetalleVisible"
           tabindex="-1" 
           *ngIf="modalDetalleVisible"
           role="dialog">
        <div class="modal-dialog modal-lg" role="document">
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
      <div class="modal-backdrop fade" 
           [class.show]="modalDetalleVisible" 
           *ngIf="modalDetalleVisible"
           (click)="cerrarModalDetalle()"></div>

      <!-- Modal Simple para Testing -->
      <div *ngIf="modalDetalleVisible && paqueteSeleccionado" class="modal-simple-test">
        <div class="modal-simple-content">
          <h3>{{ paqueteSeleccionado.nombre }}</h3>
          <p><strong>Descripción:</strong> {{ paqueteSeleccionado.descripcion }}</p>
          <p><strong>Hotel:</strong> {{ paqueteSeleccionado.hotel.nombre }} - {{ paqueteSeleccionado.hotel.ciudad }}</p>
          <p><strong>Tipo:</strong> {{ getTipoEventoLabel(paqueteSeleccionado.tipo) }}</p>
          <p><strong>Capacidad:</strong> {{ paqueteSeleccionado.capacidadMinima }} - {{ paqueteSeleccionado.capacidadMaxima }} personas</p>
          <p><strong>Precio:</strong> \${{ formatearPrecio(paqueteSeleccionado.precios.base) }} {{ paqueteSeleccionado.precios.moneda }}</p>
          
          <div class="modal-simple-buttons">
            <button class="btn-simple-reservar" (click)="reservarPaquete(paqueteSeleccionado!)">
              Reservar
            </button>
            <button class="btn-simple-cerrar" (click)="cerrarModalDetalle()">
              Cerrar
            </button>
          </div>
        </div>
      </div>
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
    console.log('🔍 Abriendo detalles del paquete:', paquete.nombre);
    console.log('Ver detalles de: ', paquete);
    
    this.paqueteSeleccionado = paquete;
    this.modalDetalleVisible = true;
    
    console.log('✅ Modal debería estar visible:', this.modalDetalleVisible);
    console.log('📋 Paquete seleccionado:', this.paqueteSeleccionado?.nombre);
    
    // Forzar detección de cambios y debugging extensivo
    setTimeout(() => {
      console.log('🔄 DEBUGGING COMPLETO:');
      console.log('   - modalDetalleVisible:', this.modalDetalleVisible);
      console.log('   - paqueteSeleccionado:', this.paqueteSeleccionado?.nombre);
      
      const modalSimple = document.querySelector('.modal-simple-test');
      const modalBootstrap = document.querySelector('.modal');
      const backdrop = document.querySelector('.modal-backdrop');
      
      console.log('🎭 ELEMENTOS EN DOM:');
      console.log('   - Modal simple:', modalSimple);
      console.log('   - Modal Bootstrap:', modalBootstrap);
      console.log('   - Backdrop:', backdrop);
      
      if (modalSimple) {
        console.log('📏 Estilos del modal simple:', window.getComputedStyle(modalSimple));
        console.log('   - Display:', window.getComputedStyle(modalSimple).display);
        console.log('   - Position:', window.getComputedStyle(modalSimple).position);
        console.log('   - Z-index:', window.getComputedStyle(modalSimple).zIndex);
      }
      
      if (modalBootstrap) {
        console.log('📏 Estilos del modal Bootstrap:', window.getComputedStyle(modalBootstrap));
      }
      
      // Intentar forzar la visibilidad del modal simple
      if (modalSimple) {
        (modalSimple as HTMLElement).style.display = 'flex';
        (modalSimple as HTMLElement).style.position = 'fixed';
        (modalSimple as HTMLElement).style.top = '0';
        (modalSimple as HTMLElement).style.left = '0';
        (modalSimple as HTMLElement).style.width = '100vw';
        (modalSimple as HTMLElement).style.height = '100vh';
        (modalSimple as HTMLElement).style.zIndex = '99999';
        (modalSimple as HTMLElement).style.background = 'rgba(255, 0, 0, 0.8)';
        console.log('🚨 MODAL FORZADO A SER VISIBLE');
      }
    }, 200);
  }

  /**
   * Cerrar modal de detalles
   */
  cerrarModalDetalle(): void {
    console.log('🚪 Cerrando modal');
    this.modalDetalleVisible = false;
    this.paqueteSeleccionado = null;
  }

  /**
   * Método de test para forzar apertura del modal
   */
  testModal(): void {
    console.log('🧪 TEST: Forzando apertura del modal');
    
    if (this.paquetes.length > 0) {
      const paquetePrueba = this.paquetes[0];
      console.log('🧪 Usando paquete de prueba:', paquetePrueba.nombre);
      
      this.paqueteSeleccionado = paquetePrueba;
      this.modalDetalleVisible = true;
      
      console.log('🧪 Variables establecidas:');
      console.log('   - modalDetalleVisible:', this.modalDetalleVisible);
      console.log('   - paqueteSeleccionado:', this.paqueteSeleccionado?.nombre);
      
      // Forzar actualización del DOM
      setTimeout(() => {
        const modalElement = document.querySelector('.modal-simple-test');
        if (modalElement) {
          console.log('🧪 Modal encontrado, forzando estilos...');
          (modalElement as HTMLElement).style.display = 'flex';
          (modalElement as HTMLElement).style.position = 'fixed';
          (modalElement as HTMLElement).style.zIndex = '999999';
          (modalElement as HTMLElement).style.background = 'rgba(255, 0, 0, 0.9)';
        } else {
          console.log('🚨 ERROR: Modal no encontrado en DOM');
        }
      }, 100);
    } else {
      console.log('🚨 No hay paquetes disponibles');
      alert('No hay paquetes para mostrar');
    }
  }

  /**
   * Método alternativo para debugging - abrir modal con alert
   */
  verDetallesPaqueteDebug(paquete: PaqueteDisponible): void {
    console.log('🔍 DEBUG: Intentando abrir modal para:', paquete.nombre);
    
    // Mostrar un alert primero para confirmar que el método se ejecuta
    alert(`Modal para: ${paquete.nombre}\nTipo: ${this.getTipoEventoLabel(paquete.tipo)}\nCiudad: ${paquete.hotel.ciudad}`);
    
    // Luego intentar abrir el modal
    this.paqueteSeleccionado = paquete;
    this.modalDetalleVisible = true;
    
    console.log('🎭 Estado después de intentar abrir:', {
      modalVisible: this.modalDetalleVisible,
      paqueteSeleccionado: this.paqueteSeleccionado?.nombre
    });
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