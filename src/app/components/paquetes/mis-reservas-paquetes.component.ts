import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaPaqueteService, ReservaPaquete } from '../../services/reserva-paquete.service';

@Component({
  selector: 'app-mis-reservas-paquetes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mis-reservas-container">
      <!-- Navegación Principal -->
      <div class="navigation-header">
        <div class="container">
          <div class="nav-buttons">
            <button class="btn-nav-home" (click)="irAInicio()">
              <i class="fas fa-home me-2"></i>Inicio
            </button>
            <button class="btn-nav-dashboard" (click)="irADashboard()">
              <i class="fas fa-tachometer-alt me-2"></i>Dashboard
            </button>
            <button class="btn-nav-paquetes" (click)="buscarPaquetes()">
              <i class="fas fa-search me-2"></i>Buscar Paquetes
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="header-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="page-title">
                <i class="fas fa-list-alt me-3"></i>
                Mis Reservas de Paquetes
              </h1>
              <p class="page-subtitle">Gestiona tus reservas de eventos corporativos</p>
            </div>
            <div class="col-md-4 text-end">
              <button class="btn btn-primary me-2" (click)="buscarPaquetes()">
                <i class="fas fa-plus me-2"></i>Nueva Reserva
              </button>
              <button class="btn btn-secondary" (click)="actualizarReservas()">
                <i class="fas fa-sync me-2"></i>Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros-section">
        <div class="container">
          <div class="filtros-card">
            <div class="row align-items-center">
              <div class="col-md-4">
                <div class="form-group">
                  <label>Filtrar por Estado</label>
                  <select class="form-control" [(ngModel)]="filtroEstado" (change)="aplicarFiltros()">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Reservas por Página</label>
                  <select class="form-control" [(ngModel)]="reservasPorPagina" (change)="aplicarFiltros()">
                    <option value="5">5 reservas</option>
                    <option value="10">10 reservas</option>
                    <option value="20">20 reservas</option>
                  </select>
                </div>
              </div>
              <div class="col-md-4">
                <div class="estadisticas-quick">
                  <div class="stat-quick">
                    <span class="stat-number">{{ totalReservas }}</span>
                    <span class="stat-label">Total</span>
                  </div>
                  <div class="stat-quick">
                    <span class="stat-number">{{ contarPorEstado('confirmada') }}</span>
                    <span class="stat-label">Confirmadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content">
        <div class="container">
          
          <!-- Loading -->
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando tus reservas...</p>
          </div>

          <!-- Sin reservas -->
          <div *ngIf="!cargando && reservas.length === 0" class="sin-reservas">
            <div class="text-center py-5">
              <i class="fas fa-calendar-times fa-4x text-muted mb-4"></i>
              <h3>No tienes reservas de paquetes</h3>
              <p class="text-muted mb-4">¡Explora nuestros paquetes empresariales y haz tu primera reserva!</p>
              <button class="btn btn-primary" (click)="buscarPaquetes()">
                <i class="fas fa-search me-2"></i>Buscar Paquetes
              </button>
            </div>
          </div>

          <!-- Lista de reservas -->
          <div *ngIf="!cargando && reservas.length > 0" class="reservas-grid">
            <div *ngFor="let reserva of reservas" class="reserva-card">
              
              <!-- Header de la reserva -->
              <div class="reserva-header">
                <div class="reserva-numero">
                  <strong>{{ reserva.numeroReserva }}</strong>
                  <span class="reserva-estado" [ngClass]="'estado-' + reserva.estado">
                    {{ getEstadoLabel(reserva.estado || 'pendiente') }}
                  </span>
                </div>
                <div class="reserva-fecha">
                  <i class="fas fa-calendar-alt me-2"></i>
                  {{ formatearFecha(reserva.fechaInicio) }}
                </div>
              </div>

              <!-- Contenido de la reserva -->
              <div class="reserva-body">
                <div class="evento-info">
                  <h5 class="evento-nombre">{{ reserva.nombreEvento }}</h5>
                  <p class="evento-tipo">
                    <i class="fas fa-tag me-2"></i>{{ getTipoEventoLabel(reserva.tipoEvento) }}
                  </p>
                  <p class="evento-descripcion" *ngIf="reserva.descripcionEvento">
                    {{ reserva.descripcionEvento }}
                  </p>
                </div>

                <div class="detalles-reserva">
                  <div class="detalle-item">
                    <i class="fas fa-users text-primary"></i>
                    <span>{{ reserva.numeroAsistentes }} asistentes</span>
                  </div>
                  
                  <div class="detalle-item" *ngIf="reserva.paquete && typeof reserva.paquete === 'object'">
                    <i class="fas fa-cube text-info"></i>
                    <span>{{ getPaqueteNombre(reserva.paquete) }}</span>
                  </div>
                  
                  <div class="detalle-item" *ngIf="reserva.hotel && typeof reserva.hotel === 'object'">
                    <i class="fas fa-map-marker-alt text-success"></i>
                    <span>{{ getHotelInfo(reserva.hotel) }}</span>
                  </div>
                  
                  <div class="detalle-item">
                    <i class="fas fa-clock text-warning"></i>
                    <span>{{ reserva.horaInicio }} - {{ reserva.horaFin }}</span>
                  </div>
                </div>

                <!-- Información financiera -->
                <div class="info-financiera" *ngIf="reserva.precios">
                  <div class="precio-total">
                    <span class="precio-label">Total:</span>
                    <span class="precio-valor">\${{ formatearPrecio(reserva.precios.total) }}</span>
                  </div>
                  <div class="estado-pago">
                    <span class="pago-estado" [ngClass]="'pago-' + (reserva.estadoPago || 'pendiente')">
                      {{ getEstadoPagoLabel(reserva.estadoPago || 'pendiente') }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Footer con acciones -->
              <div class="reserva-footer">
                <div class="fecha-creacion">
                  <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    Creada: {{ formatearFechaCompleta(reserva.createdAt || '') }}
                  </small>
                </div>
                
                <div class="reserva-actions">
                  <button class="btn btn-sm btn-outline-primary" (click)="verDetalle(reserva)">
                    <i class="fas fa-eye me-1"></i>Ver Detalle
                  </button>
                  
                  <button *ngIf="puedeModificar(reserva)" 
                          class="btn btn-sm btn-outline-warning" 
                          (click)="modificarReserva(reserva)">
                    <i class="fas fa-edit me-1"></i>Modificar
                  </button>
                  
                  <button *ngIf="puedeCancelar(reserva)" 
                          class="btn btn-sm btn-outline-danger" 
                          (click)="cancelarReserva(reserva)">
                    <i class="fas fa-times me-1"></i>Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div *ngIf="totalPaginas > 1" class="paginacion">
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="paginaActual <= 1">
                  <button class="page-link" (click)="cambiarPagina(paginaActual - 1)" [disabled]="paginaActual <= 1">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                <li *ngFor="let pagina of getPaginasVisibles()" 
                    class="page-item" [class.active]="pagina === paginaActual">
                  <button class="page-link" (click)="cambiarPagina(pagina)">{{ pagina }}</button>
                </li>
                
                <li class="page-item" [class.disabled]="paginaActual >= totalPaginas">
                  <button class="page-link" (click)="cambiarPagina(paginaActual + 1)" [disabled]="paginaActual >= totalPaginas">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Modal de detalle de reserva -->
      <div class="modal fade" [class.show]="modalDetalleVisible" [style.display]="modalDetalleVisible ? 'block' : 'none'" 
           tabindex="-1" *ngIf="modalDetalleVisible">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle de Reserva - {{ reservaSeleccionada?.numeroReserva }}</h5>
              <button type="button" class="btn-close" (click)="cerrarModalDetalle()"></button>
            </div>
            <div class="modal-body" *ngIf="reservaSeleccionada">
              <div class="detalle-completo">
                <!-- Información del evento -->
                <div class="seccion-detalle">
                  <h6><i class="fas fa-info-circle me-2"></i>Información del Evento</h6>
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>Evento:</strong> {{ reservaSeleccionada.nombreEvento }}
                    </div>
                    <div class="info-item">
                      <strong>Tipo:</strong> {{ getTipoEventoLabel(reservaSeleccionada.tipoEvento) }}
                    </div>
                    <div class="info-item">
                      <strong>Asistentes:</strong> {{ reservaSeleccionada.numeroAsistentes }}
                    </div>
                    <div class="info-item">
                      <strong>Fechas:</strong> {{ formatearFecha(reservaSeleccionada.fechaInicio) }} - {{ formatearFecha(reservaSeleccionada.fechaFin) }}
                    </div>
                  </div>
                </div>

                <!-- Información de la empresa -->
                <div class="seccion-detalle" *ngIf="reservaSeleccionada.datosEmpresa">
                  <h6><i class="fas fa-building me-2"></i>Información de la Empresa</h6>
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>Razón Social:</strong> {{ reservaSeleccionada.datosEmpresa.razonSocial }}
                    </div>
                    <div class="info-item">
                      <strong>NIT:</strong> {{ reservaSeleccionada.datosEmpresa.nit }}
                    </div>
                    <div class="info-item" *ngIf="reservaSeleccionada.datosEmpresa.contactoPrincipal">
                      <strong>Contacto:</strong> {{ reservaSeleccionada.datosEmpresa.contactoPrincipal.nombre }}
                    </div>
                    <div class="info-item" *ngIf="reservaSeleccionada.datosEmpresa.contactoPrincipal">
                      <strong>Email:</strong> {{ reservaSeleccionada.datosEmpresa.contactoPrincipal.email }}
                    </div>
                  </div>
                </div>

                <!-- Información financiera -->
                <div class="seccion-detalle" *ngIf="reservaSeleccionada.precios">
                  <h6><i class="fas fa-dollar-sign me-2"></i>Información Financiera</h6>
                  <div class="precio-detalle">
                    <div class="precio-linea">
                      <span>Subtotal Paquete:</span>
                      <span>\${{ formatearPrecio(reservaSeleccionada.precios.subtotalPaquete) }}</span>
                    </div>
                    <div class="precio-linea">
                      <span>IVA (19%):</span>
                      <span>\${{ formatearPrecio(reservaSeleccionada.precios.impuestos) }}</span>
                    </div>
                    <div class="precio-linea total">
                      <span><strong>Total:</strong></span>
                      <span><strong>\${{ formatearPrecio(reservaSeleccionada.precios.total) }}</strong></span>
                    </div>
                  </div>
                </div>

                <!-- Notas -->
                <div class="seccion-detalle" *ngIf="reservaSeleccionada.notas">
                  <h6><i class="fas fa-sticky-note me-2"></i>Observaciones</h6>
                  <p>{{ reservaSeleccionada.notas }}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cerrarModalDetalle()">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="modalDetalleVisible" *ngIf="modalDetalleVisible"></div>
    </div>
  `,
  styleUrls: ['./mis-reservas-paquetes.component.css']
})
export class MisReservasPaquetesComponent implements OnInit {
  // Datos
  reservas: ReservaPaquete[] = [];
  reservaSeleccionada: ReservaPaquete | null = null;
  
  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalReservas = 0;
  reservasPorPagina = 10;
  
  // Filtros
  filtroEstado = '';
  
  // Estados
  cargando = false;
  modalDetalleVisible = false;

  constructor(
    private router: Router,
    private reservaPaqueteService: ReservaPaqueteService
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  /**
   * Cargar reservas del usuario
   */
  cargarReservas(): void {
    this.cargando = true;
    
    const filtros = {
      estado: this.filtroEstado || undefined,
      limit: this.reservasPorPagina,
      offset: (this.paginaActual - 1) * this.reservasPorPagina
    };
    
    this.reservaPaqueteService.listarMisReservasPaquetes(filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.reservas = response.reservas;
          this.totalReservas = response.total;
          this.totalPaginas = response.totalPaginas;
          this.paginaActual = response.pagina;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarReservas();
  }

  /**
   * Cambiar página
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarReservas();
    }
  }

  /**
   * Obtener páginas visibles para paginación
   */
  getPaginasVisibles(): number[] {
    const paginas = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  /**
   * Ver detalle de una reserva
   */
  verDetalle(reserva: ReservaPaquete): void {
    this.reservaSeleccionada = reserva;
    this.modalDetalleVisible = true;
  }

  /**
   * Cerrar modal de detalle
   */
  cerrarModalDetalle(): void {
    this.modalDetalleVisible = false;
    this.reservaSeleccionada = null;
  }

  /**
   * Verificar si se puede modificar una reserva
   */
  puedeModificar(reserva: ReservaPaquete): boolean {
    return reserva.estado === 'pendiente' || reserva.estado === 'confirmada';
  }

  /**
   * Verificar si se puede cancelar una reserva
   */
  puedeCancelar(reserva: ReservaPaquete): boolean {
    return reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
  }

  /**
   * Modificar reserva
   */
  modificarReserva(reserva: ReservaPaquete): void {
    // Por ahora solo mostrar mensaje
    alert('Funcionalidad de modificación próximamente disponible');
  }

  /**
   * Cancelar reserva
   */
  cancelarReserva(reserva: ReservaPaquete): void {
    const motivo = prompt('¿Por qué desea cancelar esta reserva?');
    if (motivo && reserva._id) {
      this.reservaPaqueteService.cancelarReservaPaquete(reserva._id, motivo).subscribe({
        next: (response) => {
          if (response.success) {
            alert(`Reserva cancelada. ${response.penalizacion > 0 ? 'Penalización: ' + response.penalizacion + '%' : 'Sin penalización'}`);
            this.cargarReservas();
          }
        },
        error: (err) => {
          console.error('Error al cancelar reserva:', err);
          alert('Error al cancelar la reserva');
        }
      });
    }
  }

  /**
   * Contar reservas por estado
   */
  contarPorEstado(estado: string): number {
    return this.reservas.filter(r => r.estado === estado).length;
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Formatear fecha completa
   */
  formatearFechaCompleta(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  /**
   * Obtener etiqueta del estado
   */
  getEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'en_proceso': 'En Proceso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  /**
   * Obtener etiqueta del estado de pago
   */
  getEstadoPagoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pago Pendiente',
      'anticipo_pagado': 'Anticipo Pagado',
      'pagado_completo': 'Pagado Completo',
      'vencido': 'Vencido'
    };
    return estados[estado] || estado;
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
   * Obtener nombre del paquete
   */
  getPaqueteNombre(paquete: any): string {
    if (typeof paquete === 'object' && paquete?.nombre) {
      return paquete.nombre;
    }
    return 'Paquete';
  }

  /**
   * Obtener información del hotel
   */
  getHotelInfo(hotel: any): string {
    if (typeof hotel === 'object' && hotel?.nombre) {
      return `${hotel.nombre}${hotel.ciudad ? ' - ' + hotel.ciudad : ''}`;
    }
    return 'Hotel';
  }

  // Navegación
  buscarPaquetes(): void {
    this.router.navigate(['/paquetes-empresariales']);
  }

  irAInicio(): void {
    this.router.navigate(['/']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  actualizarReservas(): void {
    this.cargarReservas();
  }
}