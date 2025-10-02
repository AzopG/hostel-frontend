import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaqueteAdminService, PaqueteAdmin, OpcionesPaquete } from '../../services/paquete-admin.service';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-paquetes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Navegación -->
      <div class="navigation-header">
        <button (click)="irAInicio()" class="btn-home-nav">
          🏠 Inicio
        </button>
        <button (click)="irADashboard()" class="btn-dashboard-nav">
          📊 Dashboard
        </button>
      </div>

      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-cubes me-3"></i>
            Gestión de Paquetes Corporativos
          </h1>
          <p class="page-subtitle">Crea y administra paquetes corporativos para empresas en toda la red</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-modern" (click)="abrirModalCrear()" [disabled]="!hotelSeleccionado">
            <i class="fas fa-plus me-2"></i>
            Crear Paquete
          </button>
        </div>
      </div>

      <!-- Selector de Hotel -->
      <div class="hotel-selector-section" *ngIf="hoteles.length > 0">
        <div class="row">
          <div class="col-md-6">
            <label for="hotelSelect" class="form-label">Hotel:</label>
            <select id="hotelSelect" [(ngModel)]="hotelSeleccionado" (change)="onHotelChange()" class="form-select">
              <option value="">Ver todos los hoteles</option>
              <option *ngFor="let hotel of hoteles" [value]="hotel._id">
                {{hotel.nombre}} - {{hotel.ciudad}}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Filtros:</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" [(ngModel)]="mostrarSoloActivos" (change)="filtrarPaquetes()" id="filtroActivos">
              <label class="form-check-label" for="filtroActivos">
                Solo paquetes activos
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="loading-text">Cargando paquetes...</p>
      </div>

      <!-- Lista de paquetes -->
      <div *ngIf="!cargando" class="paquetes-grid">
        <div *ngFor="let paquete of paquetesFiltrados" class="paquete-card">
          <div class="paquete-header">
            <div>
              <h3 class="paquete-name">{{ paquete.nombre }}</h3>
              <div class="hotel-info" *ngIf="!hotelSeleccionado">
                <i class="fas fa-hotel me-1"></i>
                <small class="text-muted">{{ getHotelInfo(paquete) }}</small>
              </div>
            </div>
            <div class="paquete-status">
              <span class="badge" [class]="(paquete.activo !== false && paquete.estado !== 'inactivo') ? 'bg-success' : 'bg-danger'">
                {{ (paquete.activo !== false && paquete.estado !== 'inactivo') ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          
          <div class="paquete-body">
            <p class="paquete-description">{{ paquete.descripcion }}</p>
            
            <div class="paquete-stats">
              <div class="stat-item">
                <i class="fas fa-dollar-sign text-success"></i>
                <span class="stat-label">Precio Base:</span>
                <span class="stat-value">\${{ formatearPrecio(getPrecioBase(paquete)) }}</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-bed text-info"></i>
                <span class="stat-label">Habitaciones:</span>
                <span class="stat-value">{{ (paquete.habitaciones && paquete.habitaciones.length) || 0 }} tipos</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-users text-warning"></i>
                <span class="stat-label">Salones:</span>
                <span class="stat-value">{{ (paquete.salones && paquete.salones.length) || 0 }} incluidos</span>
              </div>
            </div>
          </div>

          <div class="paquete-actions">
            <button 
              class="btn btn-sm btn-outline-primary" 
              (click)="verDetalles(paquete)"
              title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              (click)="editarPaquete(paquete)"
              title="Configurar paquete">
              <i class="fas fa-cog"></i> Configurar
            </button>
            <button 
              class="btn btn-sm" 
              [class]="(paquete.activo !== false) ? 'btn-outline-warning' : 'btn-outline-success'"
              (click)="toggleEstado(paquete)"
              title="Cambiar estado">
              <i class="fas" [class]="(paquete.activo !== false) ? 'fa-pause' : 'fa-play'"></i>
            </button>
            <button 
              class="btn btn-sm btn-outline-danger" 
              (click)="eliminarPaquete(paquete)"
              title="Eliminar paquete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!cargando && paquetesFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-cubes"></i>
        </div>
        <h3>No hay paquetes corporativos</h3>
        <p *ngIf="!hotelSeleccionado">Selecciona un hotel para ver o crear paquetes corporativos.</p>
        <p *ngIf="hotelSeleccionado">Comienza creando tu primer paquete corporativo para empresas.</p>
        <button class="btn btn-primary" (click)="abrirModalCrear()" *ngIf="hotelSeleccionado">
          <i class="fas fa-plus me-2"></i>Crear Primer Paquete
        </button>
      </div>
    </div>

    <!-- Modal simplificado -->
    <div *ngIf="modalVisible" class="modal-backdrop" (click)="cerrarModal()"></div>
    <div *ngIf="modalVisible" class="modal-container">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h3>{{ modalTipo === 'crear' ? 'Crear Paquete' : modalTipo === 'editar' ? 'Editar Paquete' : 'Ver Paquete' }}</h3>
          <button class="close-btn" (click)="cerrarModal()">×</button>
        </div>
        
        <div class="modal-body-custom" *ngIf="modalTipo !== 'ver'">
          <form (ngSubmit)="guardarPaquete()">
            <!-- Información básica -->
            <div class="form-section">
              <h5><i class="fas fa-info-circle me-2"></i>Información Básica</h5>
              <div class="row">
                <div class="col-md-12">
                  <div class="form-group">
                    <label>Hotel*</label>
                    <select class="form-control" [(ngModel)]="formularioPaquete.hotel" name="hotel" required>
                      <option value="">-- Selecciona --</option>
                      <option *ngFor="let hotel of hoteles" [value]="hotel._id">{{ hotel.nombre }} - {{ hotel.ciudad }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-group">
                    <label>Nombre del Paquete*</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      [(ngModel)]="formularioPaquete.nombre" 
                      name="nombre"
                      placeholder="Ej: Paquete Ejecutivo Premium"
                      required>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-group">
                    <label>Descripción*</label>
                    <textarea 
                      class="form-control" 
                      [(ngModel)]="formularioPaquete.descripcion" 
                      name="descripcion"
                      rows="3"
                      placeholder="Describe qué incluye este paquete corporativo..."
                      required></textarea>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Tipo de Evento</label>
                    <select class="form-control" [(ngModel)]="formularioPaquete.tipo" name="tipo">
                      <option value="evento_corporativo">Evento Corporativo</option>
                      <option value="reunion_negocios">Reunión de Negocios</option>
                      <option value="congreso">Congreso</option>
                      <option value="capacitacion">Capacitación</option>
                      <option value="celebracion_empresarial">Celebración Empresarial</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Estado</label>
                    <select class="form-control" [(ngModel)]="formularioPaquete.estado" name="estado">
                      <option value="borrador">Borrador</option>
                      <option value="activo">Activo</option>
                      <option value="pausado">Pausado</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Capacidad -->
            <div class="form-section">
              <h5><i class="fas fa-users me-2"></i>Capacidad</h5>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Capacidad Mínima*</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      [(ngModel)]="formularioPaquete.capacidadMinima" 
                      name="capacidadMinima"
                      min="1"
                      placeholder="10">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Capacidad Máxima*</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      [(ngModel)]="formularioPaquete.capacidadMaxima" 
                      name="capacidadMaxima"
                      min="1"
                      placeholder="100">
                  </div>
                </div>
              </div>
            </div>

            <!-- Precios -->
            <div class="form-section">
              <h5><i class="fas fa-dollar-sign me-2"></i>Precios</h5>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Precio Base*</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      [(ngModel)]="formularioPaquete.precioBase" 
                      name="precioBase"
                      min="0"
                      placeholder="500000"
                      required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>Descuento (%)</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      [(ngModel)]="formularioPaquete.descuentoPorcentaje" 
                      name="descuentoPorcentaje"
                      min="0"
                      max="50"
                      placeholder="10">
                  </div>
                </div>
              </div>
            </div>

            <!-- Habitaciones -->
            <div class="form-section">
              <h5><i class="fas fa-bed me-2"></i>Habitaciones</h5>
              <div class="habitaciones-config">
                <div *ngFor="let habitacion of formularioPaquete.habitaciones; let i = index" class="habitacion-item">
                  <div class="row">
                    <div class="col-md-4">
                      <label>Tipo</label>
                      <select class="form-control" [(ngModel)]="habitacion.tipo" [name]="'habitacion_tipo_' + i">
                        <option value="individual">Individual</option>
                        <option value="doble">Doble</option>
                        <option value="triple">Triple</option>
                        <option value="suite_junior">Suite Junior</option>
                        <option value="suite_ejecutiva">Suite Ejecutiva</option>
                        <option value="suite_presidencial">Suite Presidencial</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label>Cantidad</label>
                      <input type="number" class="form-control" [(ngModel)]="habitacion.cantidad" [name]="'habitacion_cantidad_' + i" min="1">
                    </div>
                    <div class="col-md-3">
                      <label>Noches</label>
                      <input type="number" class="form-control" [(ngModel)]="habitacion.noches" [name]="'habitacion_noches_' + i" min="1" value="1">
                    </div>
                    <div class="col-md-2">
                      <label>&nbsp;</label>
                      <button type="button" class="btn btn-sm btn-outline-danger form-control" (click)="eliminarHabitacion(i)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-outline-primary" (click)="agregarHabitacion()">
                  <i class="fas fa-plus me-2"></i>Agregar Habitación
                </button>
              </div>
            </div>

            <!-- Salones -->
            <div class="form-section" *ngIf="opciones?.salones">
              <h5><i class="fas fa-building me-2"></i>Salones</h5>
              <div class="salones-selection">
                <div *ngFor="let salon of opciones?.salones" class="salon-item">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                           [checked]="isSalonSeleccionado(salon._id)"
                           (change)="toggleSalon(salon, $event)"
                           [id]="'salon_' + salon._id">
                    <label class="form-check-label" [for]="'salon_' + salon._id">
                      <strong>{{ salon.nombre }}</strong>
                      <br><small>Capacidad: {{ salon.capacidad }} personas - \${{ formatearPrecio(salon.precioPorDia) }}/día</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicios -->
            <div class="form-section">
              <h5><i class="fas fa-concierge-bell me-2"></i>Servicios Adicionales</h5>
              <div class="servicios-config">
                <div *ngFor="let servicio of formularioPaquete.servicios; let i = index" class="servicio-item">
                  <div class="row">
                    <div class="col-md-3">
                      <label>Categoría</label>
                      <select class="form-control" [(ngModel)]="servicio.categoria" [name]="'servicio_categoria_' + i">
                        <option value="audiovisual">Audiovisual</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="personal">Personal</option>
                        <option value="decoracion">Decoración</option>
                        <option value="transporte">Transporte</option>
                        <option value="entretenimiento">Entretenimiento</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label>Nombre</label>
                      <input type="text" class="form-control" [(ngModel)]="servicio.nombre" [name]="'servicio_nombre_' + i" placeholder="Ej: WiFi Premium">
                    </div>
                    <div class="col-md-2">
                      <label>Precio</label>
                      <input type="number" class="form-control" [(ngModel)]="servicio.precio" [name]="'servicio_precio_' + i" min="0">
                    </div>
                    <div class="col-md-2">
                      <label>Obligatorio</label>
                      <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" [(ngModel)]="servicio.obligatorio" [name]="'servicio_obligatorio_' + i">
                      </div>
                    </div>
                    <div class="col-md-2">
                      <label>&nbsp;</label>
                      <button type="button" class="btn btn-sm btn-outline-danger form-control" (click)="eliminarServicio(i)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-outline-primary" (click)="agregarServicio()">
                  <i class="fas fa-plus me-2"></i>Agregar Servicio
                </button>
              </div>
            </div>

            <!-- Catering -->
            <div class="form-section">
              <h5><i class="fas fa-utensils me-2"></i>Catering</h5>
              <div class="servicios-config">
                <div *ngFor="let catering of formularioPaquete.catering; let i = index" class="servicio-item">
                  <div class="row">
                    <div class="col-md-3">
                      <label>Tipo</label>
                      <select class="form-control" [(ngModel)]="catering.tipo" [name]="'catering_tipo_' + i">
                        <option value="coffee_break">Coffee Break</option>
                        <option value="desayuno_continental">Desayuno Continental</option>
                        <option value="desayuno_americano">Desayuno Americano</option>
                        <option value="almuerzo_ejecutivo">Almuerzo Ejecutivo</option>
                        <option value="almuerzo_buffet">Almuerzo Buffet</option>
                        <option value="cena_formal">Cena Formal</option>
                        <option value="coctel">Cóctel</option>
                        <option value="brunch">Brunch</option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label>Descripción</label>
                      <input type="text" class="form-control" [(ngModel)]="catering.descripcion" [name]="'catering_descripcion_' + i" placeholder="Ej: Coffee break matutino">
                    </div>
                    <div class="col-md-2">
                      <label>Precio/persona</label>
                      <input type="number" class="form-control" [(ngModel)]="catering.precioPorPersona" [name]="'catering_precio_' + i" min="0">
                    </div>
                    <div class="col-md-2">
                      <label>Min personas</label>
                      <input type="number" class="form-control" [(ngModel)]="catering.minPersonas" [name]="'catering_min_' + i" min="1">
                    </div>
                    <div class="col-md-2">
                      <label>&nbsp;</label>
                      <button type="button" class="btn btn-sm btn-outline-danger form-control" (click)="eliminarCatering(i)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-outline-primary" (click)="agregarCatering()">
                  <i class="fas fa-plus me-2"></i>Agregar Catering
                </button>
              </div>
            </div>

            <!-- Condiciones -->
            <div class="form-section">
              <h5><i class="fas fa-calendar-alt me-2"></i>Condiciones y Políticas</h5>
              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Mínimo días</label>
                    <input type="number" class="form-control" [(ngModel)]="formularioPaquete.minDias" name="minDias" min="1" value="1">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Máximo días</label>
                    <input type="number" class="form-control" [(ngModel)]="formularioPaquete.maxDias" name="maxDias" min="1" value="30">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label>Anticipación mínima (días)</label>
                    <input type="number" class="form-control" [(ngModel)]="formularioPaquete.anticipacionMinima" name="anticipacionMinima" min="1" value="7">
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas -->
            <div class="form-section">
              <h5><i class="fas fa-sticky-note me-2"></i>Notas</h5>
              <div class="form-group">
                <label>Instrucciones Especiales</label>
                <textarea class="form-control" [(ngModel)]="formularioPaquete.instruccionesEspeciales" name="instruccionesEspeciales" rows="3" placeholder="Instrucciones o notas especiales para este paquete..."></textarea>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" 
                      [disabled]="!formularioPaquete.nombre || !formularioPaquete.descripcion || !formularioPaquete.precioBase">
                {{ modalTipo === 'crear' ? 'Crear' : 'Actualizar' }} Paquete
              </button>
            </div>
          </form>
        </div>
        
        <!-- Vista de detalles -->
        <div class="modal-body-custom" *ngIf="modalTipo === 'ver' && paqueteSeleccionado">
          <div class="paquete-details">
            <h4>{{ paqueteSeleccionado.nombre }}</h4>
            <p>{{ paqueteSeleccionado.descripcion }}</p>
            
            <div class="detail-section">
              <h5>Hotel</h5>
              <p>{{ getHotelInfo(paqueteSeleccionado) }}</p>
            </div>
            
            <div class="detail-section">
              <h5>Precio</h5>
              <p>\${{ formatearPrecio(getPrecioBase(paqueteSeleccionado)) }}</p>
            </div>
            
            <div class="detail-section" *ngIf="paqueteSeleccionado.habitaciones && paqueteSeleccionado.habitaciones.length">
              <h5>Habitaciones ({{ paqueteSeleccionado.habitaciones.length }})</h5>
              <ul>
                <li *ngFor="let hab of paqueteSeleccionado.habitaciones">
                  {{ hab.tipo }}: {{ hab.cantidad }} unidades
                </li>
              </ul>
            </div>
            
            <div class="detail-section" *ngIf="paqueteSeleccionado.salones && paqueteSeleccionado.salones.length">
              <h5>Salones ({{ paqueteSeleccionado.salones.length }})</h5>
              <ul>
                <li *ngFor="let salon of paqueteSeleccionado.salones">
                  {{ salon.nombre || 'Salón incluido' }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModal()">Cerrar</button>
            <button class="btn btn-primary" (click)="editarPaquete(paqueteSeleccionado)">Editar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./paquetes.component.css']
})
export class PaquetesComponent implements OnInit {
  // Datos
  paquetes: PaqueteAdmin[] = [];
  paquetesFiltrados: PaqueteAdmin[] = [];
  hoteles: any[] = [];
  opciones: OpcionesPaquete['opciones'] | null = null;
  
  // Control de hotel seleccionado
  hotelSeleccionado: string = '';
  
  // Estados
  cargando = true;
  mostrarSoloActivos = true;
  
  // Modal
  modalVisible = false;
  modalTipo: 'crear' | 'editar' | 'ver' = 'ver';
  paqueteSeleccionado: PaqueteAdmin | null = null;
  
  // Formulario para crear/editar paquete
  formularioPaquete: Partial<PaqueteAdmin> = {
    nombre: '',
    descripcion: '',
    precioBase: 0,
    descuentoPorcentaje: 10,
    minDias: 1,
    maxDias: 30,
    anticipacionMinima: 7,
    habitaciones: [],
    salones: [],
    servicios: [],
    catering: [],
    activo: true
  };

  constructor(
    private router: Router,
    private paqueteAdminService: PaqueteAdminService,
    private authService: AuthService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.cargarHoteles();
    this.cargarTodosPaquetes();
  }

  /**
   * Cargar todos los hoteles de la red
   */
  cargarHoteles(): void {
    this.paqueteAdminService.listarTodosLosHoteles().subscribe({
      next: (response) => {
        if (response.success) {
          this.hoteles = response.hoteles;
        }
      },
      error: (err) => {
        console.error('Error al cargar hoteles:', err);
      }
    });
  }

  /**
   * Cargar paquetes según el hotel seleccionado
   */
  cargarPaquetes(): void {
    this.cargando = true;
    
    if (this.hotelSeleccionado) {
      // Cargar paquetes de un hotel específico
      this.paqueteAdminService.listarPaquetesHotel(this.hotelSeleccionado).subscribe({
        next: (response) => {
          if (response.success && response.paquetes) {
            this.paquetes = response.paquetes;
            this.aplicarFiltros();
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar paquetes del hotel:', err);
          this.cargando = false;
        }
      });
    } else {
      // Cargar paquetes de todos los hoteles
      this.cargarTodosPaquetes();
    }
  }

  /**
   * Cargar paquetes de todos los hoteles
   */
  cargarTodosPaquetes(): void {
    this.cargando = true;
    
    this.paqueteAdminService.listarTodosPaquetes().subscribe({
      next: (response) => {
        if (response.success && response.paquetes) {
          this.paquetes = response.paquetes;
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar todos los paquetes:', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Evento cuando cambia el hotel seleccionado
   */
  onHotelChange(): void {
    this.cargarPaquetes();
    if (this.hotelSeleccionado) {
      this.cargarOpcionesPaquete();
    }
  }

  /**
   * Cargar opciones para crear paquetes (salones y habitaciones)
   */
  cargarOpcionesPaquete(): void {
    if (!this.hotelSeleccionado) return;
    
    this.paqueteAdminService.obtenerOpcionesPaquete(this.hotelSeleccionado).subscribe({
      next: (response) => {
        this.opciones = response.opciones;
      },
      error: (err) => {
        console.error('Error al cargar opciones:', err);
      }
    });
  }

  /**
   * Filtrar paquetes según los criterios
   */
  aplicarFiltros(): void {
    this.paquetesFiltrados = this.paquetes.filter(paquete => {
      if (this.mostrarSoloActivos) {
        const activo = paquete.activo !== false && paquete.estado !== 'inactivo';
        if (!activo) return false;
      }
      return true;
    });
  }

  /**
   * Evento de filtro
   */
  filtrarPaquetes(): void {
    this.aplicarFiltros();
  }

  /**
   * Obtener información del hotel de un paquete
   */
  getHotelInfo(paquete: PaqueteAdmin): string {
    if (typeof paquete.hotel === 'object' && paquete.hotel?.nombre) {
      return `${paquete.hotel.nombre} - ${paquete.hotel.ciudad || ''}`;
    }
    
    const hotel = this.hoteles.find(h => h._id === paquete.hotel);
    return hotel ? `${hotel.nombre} - ${hotel.ciudad || ''}` : 'Hotel no identificado';
  }

  /**
   * Obtener precio base de un paquete (compatibilidad)
   */
  getPrecioBase(paquete: PaqueteAdmin): number {
    return paquete.precioBase || paquete.precios?.base || 0;
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  // Métodos del modal
  /**
   * Métodos para manejar habitaciones
   */
  agregarHabitacion(): void {
    if (!this.formularioPaquete.habitaciones) {
      this.formularioPaquete.habitaciones = [];
    }
    this.formularioPaquete.habitaciones.push({
      tipo: 'individual',
      cantidad: 1,
      noches: 1,
      precioPorNoche: 0,
      incluidoEnPaquete: true
    });
  }

  eliminarHabitacion(index: number): void {
    if (this.formularioPaquete.habitaciones) {
      this.formularioPaquete.habitaciones.splice(index, 1);
    }
  }

  /**
   * Métodos para manejar salones
   */
  isSalonSeleccionado(salonId: string): boolean {
    if (!this.formularioPaquete.salones) return false;
    return this.formularioPaquete.salones.some(s => s.salonId === salonId);
  }

  toggleSalon(salon: any, event: any): void {
    if (!this.formularioPaquete.salones) {
      this.formularioPaquete.salones = [];
    }

    if (event.target.checked) {
      // Agregar salón
      this.formularioPaquete.salones.push({
        salonId: salon._id,
        nombre: salon.nombre,
        capacidad: salon.capacidad,
        horas: 4,
        configuracion: 'teatro',
        incluidoEnPaquete: true,
        precioPorHora: salon.precioPorDia / 8 // Estimado
      });
    } else {
      // Remover salón
      const index = this.formularioPaquete.salones.findIndex(s => s.salonId === salon._id);
      if (index > -1) {
        this.formularioPaquete.salones.splice(index, 1);
      }
    }
  }

  /**
        guardarPaquete() {
          if (!this.hotelSeleccionado) {
            this.mensajeError = 'Debes seleccionar un hotel antes de guardar el paquete.';
            return;
          }
          if (!this.formularioPaquete.nombre || !this.formularioPaquete.descripcion || !this.formularioPaquete.precioBase) {
            this.mensajeError = 'Completa todos los campos obligatorios.';
            return;
          }
          this.mensajeError = '';
          // Aquí iría la lógica para guardar el paquete, incluyendo el hotel seleccionado
          // const datos = { ...this.formularioPaquete, hotel: this.hotelSeleccionado };
          // this.paqueteAdminService.guardarPaquete(datos).subscribe(...)
        }
   * Métodos para manejar servicios
   */
  agregarServicio(): void {
    if (!this.formularioPaquete.servicios) {
      this.formularioPaquete.servicios = [];
    }
    this.formularioPaquete.servicios.push({
      categoria: 'audiovisual',
      nombre: '',
      descripcion: '',
      precio: 0,
      unidad: 'por_evento',
      obligatorio: false,
      disponible: true
    });
  }

  eliminarServicio(index: number): void {
    if (this.formularioPaquete.servicios) {
      this.formularioPaquete.servicios.splice(index, 1);
    }
  }

  /**
   * Métodos para manejar catering
   */
  agregarCatering(): void {
    if (!this.formularioPaquete.catering) {
      this.formularioPaquete.catering = [];
    }
    this.formularioPaquete.catering.push({
      tipo: 'coffee_break',
      descripcion: '',
      precioPorPersona: 0,
      minPersonas: 10,
      maxPersonas: 100,
      horariosSugeridos: ['10:00-10:30', '15:00-15:30'],
      incluyeServicio: true,
      opciones: []
    });
  }

  eliminarCatering(index: number): void {
    if (this.formularioPaquete.catering) {
      this.formularioPaquete.catering.splice(index, 1);
    }
  }

  abrirModalCrear(): void {
    if (!this.hotelSeleccionado) {
      alert('Selecciona un hotel primero');
      return;
    }

    this.inicializarFormulario();
    this.modalTipo = 'crear';
    this.modalVisible = true;
  }

  /**
   * Inicializar formulario de paquete
   */
  private inicializarFormulario(): void {
    this.formularioPaquete = {
      nombre: '',
      descripcion: '',
      hotel: this.hotelSeleccionado,
      tipo: 'evento_corporativo',
      capacidadMinima: 1,
      capacidadMaxima: 100,
      precioBase: 0,
      descuentoPorcentaje: 10,
      minDias: 1,
      maxDias: 30,
      anticipacionMinima: 7,
      habitaciones: [],
      salones: [],
      servicios: [],
      catering: [],
      estado: 'borrador',
      activo: true,
      instruccionesEspeciales: ''
    };
  }

  verDetalles(paquete: PaqueteAdmin): void {
    this.paqueteSeleccionado = paquete;
    this.modalTipo = 'ver';
    this.modalVisible = true;
  }

  editarPaquete(paquete: PaqueteAdmin): void {
    this.paqueteSeleccionado = paquete;
    this.formularioPaquete = { ...paquete };
    this.modalTipo = 'editar';
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.paqueteSeleccionado = null;
  }

  /**
   * Cambiar estado de un paquete
   */
  toggleEstado(paquete: PaqueteAdmin): void {
    if (!paquete._id) return;

    const nuevoEstado = paquete.activo !== false ? false : true;
    
    this.paqueteAdminService.cambiarEstadoPaquete(paquete._id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          paquete.activo = nuevoEstado;
          this.aplicarFiltros();
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar el estado del paquete');
      }
    });
  }

  /**
   * Guardar paquete (crear o editar)
   */
  guardarPaquete(): void {
    if (!this.formularioPaquete.nombre || !this.formularioPaquete.descripcion || !this.formularioPaquete.precioBase) {
      alert('Complete los campos obligatorios');
      return;
    }

    // Validar que el hotel sea un ObjectId válido (24 caracteres hex)
    const hotelId = this.formularioPaquete.hotel;
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    if (!hotelId || typeof hotelId !== 'string' || !objectIdRegex.test(hotelId)) {
      alert('Selecciona un hotel válido antes de guardar el paquete.');
      return;
    }

    // Crear el objeto de datos con la estructura correcta para el backend
    const paqueteData: any = {
      nombre: this.formularioPaquete.nombre,
      descripcion: this.formularioPaquete.descripcion,
      hotel: hotelId,
      tipo: this.formularioPaquete.tipo || 'evento_corporativo',
      capacidadMinima: this.formularioPaquete.capacidadMinima || 1,
      capacidadMaxima: this.formularioPaquete.capacidadMaxima || 100,
      habitaciones: this.formularioPaquete.habitaciones || [],
      salones: this.formularioPaquete.salones || [],
      servicios: this.formularioPaquete.servicios || [],
      catering: this.formularioPaquete.catering || [],
      precios: {
        base: this.formularioPaquete.precioBase,
        moneda: 'COP',
        calculoPor: 'paquete_completo',
        incluyeIVA: false,
        incluyeServicio: false
      },
      condiciones: {
        minDias: this.formularioPaquete.minDias || 1,
        maxDias: this.formularioPaquete.maxDias || 30,
        anticipacionMinima: this.formularioPaquete.anticipacionMinima || 7,
        anticipoRequerido: 50,
        formasPago: ['transferencia', 'tarjeta_credito']
      },
      politicas: {
        cancelacion: {
          con48Horas: 25,
          con24Horas: 50,
          menorA24Horas: 100
        },
        modificaciones: {
          permitidas: true,
          costoModificacion: 0,
          plazoLimite: 48
        }
      },
      estado: this.formularioPaquete.estado || 'borrador',
      activo: this.formularioPaquete.activo !== false,
      notas: this.formularioPaquete.instruccionesEspeciales || ''
    };

    if (this.modalTipo === 'crear') {
      this.paqueteAdminService.crearPaquete(paqueteData).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Paquete creado exitosamente');
            this.cerrarModal();
            this.cargarPaquetes();
          }
        },
        error: (err) => {
          console.error('Error al crear paquete:', err);
          alert('Error al crear el paquete. Verifique los datos.');
        }
      });
    } else if (this.modalTipo === 'editar' && this.paqueteSeleccionado?._id) {
      this.paqueteAdminService.actualizarPaquete(this.paqueteSeleccionado._id, paqueteData).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Paquete actualizado exitosamente');
            this.cerrarModal();
            this.cargarPaquetes();
          }
        },
        error: (err) => {
          console.error('Error al actualizar paquete:', err);
          alert('Error al actualizar el paquete');
        }
      });
    }
  }

  // Métodos legacy para compatibilidad
  agregarPaquete(): void {
    this.abrirModalCrear();
  }

  verPaquete(paquete: PaqueteAdmin): void {
    this.verDetalles(paquete);
  }

  eliminarPaquete(paquete: PaqueteAdmin): void {
    if (!paquete._id) return;

    if (confirm('¿Está seguro que desea eliminar el paquete "' + paquete.nombre + '"?')) {
      this.paqueteAdminService.eliminarPaquete(paquete._id, false).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarPaquetes();
          }
        },
        error: (err) => {
          console.error('Error al eliminar paquete:', err);
          alert('Error al eliminar el paquete');
        }
      });
    }
  }

  // Navegación
  irAInicio(): void {
    this.router.navigate(['/']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}