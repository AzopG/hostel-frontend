import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalonService, Salon } from '../../services/salon.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-salones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div *ngIf="modalVisible" class="modal-backdrop" (click)="cerrarModal()"></div>
    
    <!-- Modal -->
    <div *ngIf="modalVisible" class="modal-container">
      <div class="modal-content-custom">
        <!-- Modal Ver Salón -->
        <div *ngIf="modalTipo === 'ver'" class="modal-view">
          <h3 class="modal-title">
            <i class="fas fa-eye me-2"></i>
            Detalles del Salón
          </h3>
          <div class="salon-details" *ngIf="salonSeleccionado">
            <div class="detail-row">
              <span class="detail-label">Nombre:</span>
              <span class="detail-value">{{ salonSeleccionado.nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Capacidad:</span>
              <span class="detail-value">{{ salonSeleccionado.capacidad }} personas</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Precio por día:</span>
              <span class="detail-value">{{ salonSeleccionado.precioPorDia | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span class="badge-modern" [ngClass]="getEstadoBadge(salonSeleccionado.disponible)">
                {{ getEstadoTexto(salonSeleccionado.disponible) }}
              </span>
            </div>
            <div class="detail-row" *ngIf="salonSeleccionado.descripcion">
              <span class="detail-label">Descripción:</span>
              <span class="detail-value">{{ salonSeleccionado.descripcion }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Equipamiento:</span>
              <div class="detail-value">
                <span *ngFor="let equipo of salonSeleccionado.equipamiento" class="badge bg-secondary me-1">{{ equipo }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModal()">
              <i class="fas fa-times me-2"></i>Cerrar
            </button>
          </div>
        </div>

        <!-- Modal Crear/Editar Salón -->
        <div *ngIf="modalTipo === 'crear' || modalTipo === 'editar'" class="modal-form">
          <h3 class="modal-title">
            <i class="fas fa-plus me-2" *ngIf="modalTipo === 'crear'"></i>
            <i class="fas fa-edit me-2" *ngIf="modalTipo === 'editar'"></i>
            {{ modalTipo === 'crear' ? 'Crear Salón' : 'Editar Salón' }}
          </h3>
          <form (ngSubmit)="guardarSalon()" class="salon-form">
            <div class="form-group">
              <label for="nombre">Nombre *:</label>
              <input 
                id="nombre"
                type="text" 
                class="form-control" 
                [(ngModel)]="formularioSalon.nombre" 
                name="nombre"
                required>
            </div>
            <div class="form-group">
              <label for="capacidad">Capacidad *:</label>
              <input 
                id="capacidad"
                type="number" 
                class="form-control" 
                [(ngModel)]="formularioSalon.capacidad" 
                name="capacidad"
                min="1"
                required>
            </div>
            <div class="form-group">
              <label for="precio">Precio por día *:</label>
              <input 
                id="precio"
                type="number" 
                class="form-control" 
                [(ngModel)]="formularioSalon.precioPorDia" 
                name="precio"
                min="0"
                required>
            </div>
            <div class="form-group">
              <label for="descripcion">Descripción:</label>
              <textarea 
                id="descripcion"
                class="form-control" 
                [(ngModel)]="formularioSalon.descripcion" 
                name="descripcion"
                rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="equipamiento">Equipamiento (separado por comas):</label>
              <input 
                id="equipamiento"
                type="text" 
                class="form-control" 
                [(ngModel)]="formularioSalon.equipamiento" 
                name="equipamiento"
                placeholder="Proyector, Sistema de Audio, WiFi">
            </div>
            <div class="form-group">
              <label for="servicios">Servicios incluidos (separado por comas):</label>
              <input 
                id="servicios"
                type="text" 
                class="form-control" 
                [(ngModel)]="formularioSalon.serviciosIncluidos" 
                name="servicios"
                placeholder="Catering, Limpieza, Seguridad">
            </div>
            <div class="form-group">
              <div class="form-check">
                <input 
                  id="disponible"
                  type="checkbox" 
                  class="form-check-input" 
                  [(ngModel)]="formularioSalon.disponible" 
                  name="disponible">
                <label class="form-check-label" for="disponible">
                  Disponible para reservas
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">
                <i class="fas fa-times me-2"></i>Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save me-2"></i>Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="navigation-header">
      <button (click)="irAInicio()" class="btn-home-nav">
        🏠 Inicio
      </button>
      <button (click)="irADashboard()" class="btn-dashboard-nav">
        📊 Dashboard
      </button>
    </div>

    <div class="container-fluid">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-glass-cheers me-3"></i>
            Gestión de Salones
          </h1>
          <p class="page-subtitle">Administra los salones de eventos de tu hotel</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-modern" (click)="agregarSalon()">
            <i class="fas fa-plus me-2"></i>Agregar Salón
          </button>
          <button class="btn btn-outline-secondary btn-modern" (click)="cargarSalones()">
            <i class="fas fa-sync me-2"></i>Actualizar
          </button>
        </div>
      </div>

      <!-- Mensaje de carga -->
      <div *ngIf="cargando" class="loading-section">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="loading-text">Cargando salones...</p>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="error" class="alert alert-warning" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-warning ms-3" (click)="cargarSalones()">
          <i class="fas fa-retry me-1"></i>Reintentar
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-section" *ngIf="!cargando">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Buscar salón</label>
            <input 
              type="text" 
              class="form-control" 
              [(ngModel)]="filtroBusqueda"
              (input)="aplicarFiltros()"
              placeholder="Buscar por nombre o descripción...">
          </div>
          <div class="col-md-3">
            <label class="form-label">Estado</label>
            <select 
              class="form-select" 
              [(ngModel)]="filtroEstado"
              (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="no_disponible">No disponible</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Tipo</label>
            <select 
              class="form-select" 
              [(ngModel)]="filtroTipo"
              (change)="aplicarFiltros()">
              <option value="">Todos los tipos</option>
              <option value="privado">Privado</option>
              <option value="conferencia">Conferencia</option>
              <option value="eventos">Eventos</option>
              <option value="banquetes">Banquetes</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" (click)="limpiarFiltros()">
              <i class="fas fa-eraser me-2"></i>Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de salones -->
      <div class="salones-grid" *ngIf="!cargando">
        <div class="salon-card" *ngFor="let salon of salones">
          <div class="salon-header">
            <h3 class="salon-name">{{ salon.nombre }}</h3>
            <span class="badge-modern" [ngClass]="getEstadoBadge(salon.disponible)">
              {{ getEstadoTexto(salon.disponible) }}
            </span>
          </div>
          
          <div class="salon-info">
            <div class="info-row">
              <i class="fas fa-users text-primary"></i>
              <span>Capacidad: {{ salon.capacidad }} personas</span>
            </div>
            
            <div class="info-row">
              <i class="fas fa-tag text-success"></i>
              <span>Tipo: {{ getTipoSalon(salon.capacidad) }}</span>
            </div>
            
            <div class="info-row">
              <i class="fas fa-dollar-sign text-warning"></i>
              <span>{{ salon.precioPorDia | currency:'COP':'symbol-narrow':'1.0-0' }} / día</span>
            </div>
            
            <div class="info-row" *ngIf="salon.descripcion">
              <i class="fas fa-info-circle text-info"></i>
              <span>{{ salon.descripcion }}</span>
            </div>
          </div>

          <div class="salon-equipment" *ngIf="salon.equipamiento?.length">
            <h6>Equipamiento:</h6>
            <div class="equipment-tags">
              <span *ngFor="let equipo of salon.equipamiento" class="equipment-tag">
                {{ equipo }}
              </span>
            </div>
          </div>

          <div class="salon-actions">
            <button class="btn btn-action btn-view" (click)="verSalon(salon)" title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-action btn-edit" (click)="editarSalon(salon)" title="Editar salón">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-action btn-delete" (click)="eliminarSalon(salon)" title="Eliminar salón">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Mensaje cuando no hay salones -->
        <div *ngIf="salones.length === 0" class="no-salones">
          <i class="fas fa-glass-cheers fa-3x text-muted mb-3"></i>
          <h4 class="text-muted">No se encontraron salones</h4>
          <p class="text-muted">Ajusta los filtros o agrega un nuevo salón</p>
          <button class="btn btn-primary" (click)="agregarSalon()">
            <i class="fas fa-plus me-2"></i>Agregar Primer Salón
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      min-height: 100vh;
      margin: -20px;
      padding: 20px;
    }

    /* Navigation Header */
    .navigation-header {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
    }

    .btn-home-nav, .btn-dashboard-nav {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(102, 126, 234, 0.3);
      border-radius: 25px;
      padding: 8px 16px;
      font-weight: 600;
      color: #4a5568;
      text-decoration: none;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-home-nav:hover, .btn-dashboard-nav:hover {
      background: rgba(102, 126, 234, 0.1);
      border-color: #667eea;
      transform: translateY(-2px);
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1040;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1050;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content-custom {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      min-width: 500px;
      max-width: 700px;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #2d3748;
      display: flex;
      align-items: center;
    }

    .salon-details {
      background: #f7fafc;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #4a5568;
      min-width: 120px;
    }

    .detail-value {
      color: #2d3748;
      text-align: right;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #4a5568;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
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

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    /* Header Styles */
    .header-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      margin-top: 60px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      color: #718096;
      font-size: 1.1rem;
      margin: 0.5rem 0 0 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    /* Loading and Error Styles */
    .loading-section {
      text-align: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      margin-bottom: 2rem;
    }

    .loading-text {
      margin-top: 1rem;
      color: #4a5568;
      font-size: 1.1rem;
    }

    /* Button Styles */
    .btn-modern {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #e2e8f0;
      border: none;
      color: #4a5568;
    }

    .btn-outline-secondary {
      border: 2px solid #e2e8f0;
      color: #4a5568;
      background: transparent;
    }

    /* Filters Section */
    .filters-section {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
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

    .form-select {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Salones Grid */
    .salones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .salon-card {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
    }

    .salon-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .salon-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .salon-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .salon-info {
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: #4a5568;
    }

    .salon-equipment {
      margin-bottom: 1rem;
    }

    .salon-equipment h6 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .equipment-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .equipment-tag {
      background: #e2e8f0;
      color: #4a5568;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .salon-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 0.875rem;
    }

    .btn-view {
      background: rgba(66, 153, 225, 0.1);
      color: #3182ce;
    }

    .btn-view:hover {
      background: rgba(66, 153, 225, 0.2);
      transform: scale(1.1);
    }

    .btn-edit {
      background: rgba(237, 137, 54, 0.1);
      color: #dd6b20;
    }

    .btn-edit:hover {
      background: rgba(237, 137, 54, 0.2);
      transform: scale(1.1);
    }

    .btn-delete {
      background: rgba(245, 101, 101, 0.1);
      color: #e53e3e;
    }

    .btn-delete:hover {
      background: rgba(245, 101, 101, 0.2);
      transform: scale(1.1);
    }

    /* Badge Styles */
    .badge-modern {
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

    .bg-danger {
      background: linear-gradient(135deg, #f56565, #e53e3e) !important;
      color: white;
    }

    /* No Salones State */
    .no-salones {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container-fluid {
        margin: -10px;
        padding: 10px;
      }

      .header-section {
        flex-direction: column;
        text-align: center;
        margin-top: 80px;
      }

      .page-title {
        font-size: 2rem;
      }

      .salones-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .modal-content-custom {
        min-width: auto;
        margin: 1rem;
        max-width: calc(100vw - 2rem);
      }

      .navigation-header {
        position: relative;
        top: auto;
        left: auto;
        margin-bottom: 1rem;
      }
    }

    /* Animation */
    .salon-card {
      animation: slideInUp 0.6s ease-out forwards;
    }

    .salon-card:nth-child(2) { animation-delay: 0.1s; }
    .salon-card:nth-child(3) { animation-delay: 0.2s; }
    .salon-card:nth-child(4) { animation-delay: 0.3s; }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class SalonesComponent implements OnInit {
  salones: Salon[] = [];
  salonesOriginales: Salon[] = [];
  cargando = true;
  error = '';
  hotelId = '';
  
  // Filtros
  filtroEstado = '';
  filtroTipo = '';
  filtroBusqueda = '';
  
  // Modal
  modalVisible = false;
  modalTipo: 'crear' | 'editar' | 'ver' = 'ver';
  salonSeleccionado: any = null;
  
  // Formulario para crear/editar salón
  formularioSalon = {
    nombre: '',
    capacidad: 0,
    precioPorDia: 0,
    descripcion: '',
    equipamiento: '',
    serviciosIncluidos: '',
    disponible: true
  };

  constructor(
    private router: Router,
    private salonService: SalonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerHotelId();
    this.cargarSalones();
  }

  obtenerHotelId(): void {
    // En un escenario real, obtendríamos el hotel del usuario autenticado
    // Por ahora usaremos un hotel por defecto
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.tipo === 'admin_hotel') {
      // Aquí deberíamos obtener el hotel asociado al usuario
      // Por ahora usaremos el primer hotel disponible
      this.hotelId = '66e9b7b5b6c1234567890123'; // ID de ejemplo
    }
  }

  cargarSalones(): void {
    if (!this.hotelId) {
      this.error = 'No se pudo determinar el hotel asociado';
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.error = '';
    
    this.salonService.listarSalonesHotel(this.hotelId).subscribe({
      next: (response) => {
        if (response.success && response.salones) {
          this.salones = response.salones;
          this.salonesOriginales = [...response.salones];
        } else {
          this.salones = [];
          this.error = 'No se encontraron salones para este hotel';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar salones:', err);
        this.error = 'Error de conexión al cargar los salones';
        this.cargando = false;
        // Usar datos de prueba si hay error
        this.usarDatosPrueba();
      }
    });
  }

  usarDatosPrueba(): void {
    // Datos de prueba en caso de que no funcione el backend
    this.salones = [
      {
        _id: '1',
        hotel: {
          _id: '1',
          nombre: 'Hotel Boutique Central'
        },
        nombre: 'Salón Ejecutivo',
        capacidad: 50,
        precioPorDia: 150000,
        equipamiento: ['Proyector', 'Sistema de Audio', 'WiFi'],
        disponible: true,
        descripcion: 'Salón ideal para reuniones corporativas'
      },
      {
        _id: '2',
        hotel: {
          _id: '1',
          nombre: 'Hotel Boutique Central'
        },
        nombre: 'Salón Crystal',
        capacidad: 120,
        precioPorDia: 300000,
        equipamiento: ['Sonido profesional', 'Iluminación LED', 'Escenario'],
        disponible: true,
        descripcion: 'Salón para eventos y celebraciones'
      }
    ];
    this.salonesOriginales = [...this.salones];
    this.cargando = false;
  }

  aplicarFiltros(): void {
    let salonesFiltered = [...this.salonesOriginales];
    
    // Filtro por búsqueda
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      salonesFiltered = salonesFiltered.filter(salon => 
        salon.nombre.toLowerCase().includes(busqueda) ||
        salon.descripcion?.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por disponibilidad
    if (this.filtroEstado) {
      const disponible = this.filtroEstado === 'disponible';
      salonesFiltered = salonesFiltered.filter(salon => salon.disponible === disponible);
    }
    
    this.salones = salonesFiltered;
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.filtroBusqueda = '';
    this.salones = [...this.salonesOriginales];
  }

  getTipoBadge(equipamiento: string[]): string {
    if (equipamiento.some(e => e.toLowerCase().includes('proyector') || e.toLowerCase().includes('audio'))) {
      return 'bg-primary';
    }
    if (equipamiento.some(e => e.toLowerCase().includes('escenario') || e.toLowerCase().includes('sonido'))) {
      return 'bg-success';
    }
    return 'bg-secondary';
  }

  getEstadoBadge(disponible: boolean): string {
    return disponible ? 'bg-success' : 'bg-danger';
  }

  getEstadoTexto(disponible: boolean): string {
    return disponible ? 'Disponible' : 'No disponible';
  }

  getTipoSalon(capacidad: number): string {
    if (capacidad <= 30) return 'Privado';
    if (capacidad <= 80) return 'Conferencia';
    if (capacidad <= 150) return 'Eventos';
    return 'Banquetes';
  }

  irAInicio(): void {
    this.router.navigate(['/']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  agregarSalon(): void {
    this.formularioSalon = {
      nombre: '',
      capacidad: 0,
      precioPorDia: 0,
      descripcion: '',
      equipamiento: '',
      serviciosIncluidos: '',
      disponible: true
    };
    this.modalTipo = 'crear';
    this.modalVisible = true;
  }

  verSalon(salon: Salon): void {
    this.salonSeleccionado = salon;
    this.modalTipo = 'ver';
    this.modalVisible = true;
  }

  editarSalon(salon: Salon): void {
    this.salonSeleccionado = salon;
    this.formularioSalon = {
      nombre: salon.nombre,
      capacidad: salon.capacidad,
      precioPorDia: salon.precioPorDia,
      descripcion: salon.descripcion || '',
      equipamiento: salon.equipamiento.join(', '),
      serviciosIncluidos: salon.serviciosIncluidos?.join(', ') || '',
      disponible: salon.disponible
    };
    this.modalTipo = 'editar';
    this.modalVisible = true;
  }

  guardarSalon(): void {
    const datosParaGuardar = {
      ...this.formularioSalon,
      hotelId: this.hotelId,
      equipamiento: this.formularioSalon.equipamiento.split(',').map(e => e.trim()).filter(e => e),
      serviciosIncluidos: this.formularioSalon.serviciosIncluidos.split(',').map(s => s.trim()).filter(s => s)
    };

    if (this.modalTipo === 'crear') {
      this.salonService.crearSalon(datosParaGuardar).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Salón creado exitosamente');
            this.cerrarModal();
            this.cargarSalones();
          } else {
            alert('Error al crear el salón');
          }
        },
        error: (err) => {
          console.error('Error al crear salón:', err);
          alert('Error de conexión al crear el salón');
        }
      });
    } else if (this.modalTipo === 'editar' && this.salonSeleccionado) {
      this.salonService.actualizarSalon(this.salonSeleccionado._id, datosParaGuardar).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Salón actualizado exitosamente');
            this.cerrarModal();
            this.cargarSalones();
          } else {
            alert('Error al actualizar el salón');
          }
        },
        error: (err) => {
          console.error('Error al actualizar salón:', err);
          alert('Error de conexión al actualizar el salón');
        }
      });
    }
  }

  eliminarSalon(salon: Salon): void {
    if (confirm(`¿Está seguro de eliminar el salón "${salon.nombre}"?`)) {
      // Por ahora solo mostramos un mensaje
      alert('Funcionalidad de eliminar salón por implementar');
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.salonSeleccionado = null;
  }
}