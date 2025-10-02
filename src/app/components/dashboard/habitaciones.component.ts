import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitacionService } from '../../services/habitacion.service';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service';

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
            <p class="page-subtitle">Administra las habitaciones de los hoteles</p>
          </div>
          <div class="action-section">
            <button class="btn-primary" (click)="abrirModalAgregar()">
              <span class="btn-icon">➕</span>
              Nueva Habitación
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros avanzados -->
      <div class="filters-card">
        <div class="filters-header">
          <h3>
            <span class="filter-icon">🔍</span>
            Filtros de Búsqueda
          </h3>
          <button class="btn-link" (click)="limpiarFiltros()">
            Limpiar filtros
          </button>
        </div>
        
        <div class="filters-grid">
          <div class="filter-group">
            <label>Hotel</label>
            <select [(ngModel)]="filtroHotel" class="form-select">
              <option value="">Todos los hoteles</option>
              <option *ngFor="let hotel of hoteles" [value]="hotel.nombre">
                {{hotel.nombre}}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Tipo de Habitación</label>
            <select [(ngModel)]="filtroTipo" class="form-select">
              <option value="">Todos los tipos</option>
              <option *ngFor="let tipo of tiposHabitacion" [value]="tipo.value">
                {{tipo.label}}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Estado</label>
            <select [(ngModel)]="filtroEstado" class="form-select">
              <option value="">Todos los estados</option>
              <option *ngFor="let estado of estadosHabitacion" [value]="estado.value">
                {{estado.label}}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="error" class="alert alert-error">
        <span class="alert-icon">⚠️</span>
        {{error}}
        <button class="alert-close" (click)="error = ''">×</button>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando habitaciones...</p>
      </div>

      <!-- Lista de habitaciones -->
      <div *ngIf="!isLoading" class="habitaciones-grid">
        <div *ngFor="let habitacion of habitacionesFiltradas" 
             class="habitacion-card" 
             [class.ocupada]="habitacion.estado === 'ocupada'"
             [class.mantenimiento]="habitacion.estado === 'mantenimiento'">
          
          <div class="card-header">
            <div class="room-info">
              <h3 class="room-number">
                {{getTipoIcon(habitacion.tipo)}} 
                Habitación {{habitacion.numero}}
              </h3>
              <span class="hotel-name">{{habitacion.hotel?.nombre || 'Hotel no especificado'}}</span>
            </div>
            <div class="status-badge" [class]="'status-' + habitacion.estado">
              {{getStatusIcon(habitacion.estado)}} 
              {{getStatusLabel(habitacion.estado)}}
            </div>
          </div>

          <div class="card-content">
            <div class="room-details">
              <div class="detail-item">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">{{getTipoLabel(habitacion.tipo)}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Capacidad:</span>
                <span class="detail-value">{{habitacion.capacidad}} personas</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Precio:</span>
                <span class="detail-value precio">\${{habitacion.precio}}/noche</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-outline btn-sm" (click)="verHabitacion(habitacion)">
              <span class="btn-icon">👁️</span>
              Ver Detalles
            </button>
            <button class="btn-outline btn-sm" (click)="abrirModalEditar(habitacion)">
              <span class="btn-icon">✏️</span>
              Editar
            </button>
            <button class="btn-danger btn-sm" (click)="eliminarHabitacion(habitacion._id)">
              <span class="btn-icon">🗑️</span>
              Eliminar
            </button>
          </div>
        </div>

        <!-- Estado vacío -->
        <div *ngIf="habitacionesFiltradas.length === 0" class="empty-state">
          <div class="empty-icon">🛏️</div>
          <h3>No hay habitaciones</h3>
          <p>No se encontraron habitaciones que coincidan con los filtros seleccionados.</p>
          <button class="btn-primary" (click)="abrirModalAgregar()">
            Crear primera habitación
          </button>
        </div>
      </div>

      <!-- Modal Agregar Habitación -->
      <div *ngIf="showModalAgregar" class="modal-overlay" (click)="cerrarModalAgregar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nueva Habitación</h2>
            <button class="modal-close" (click)="cerrarModalAgregar()">×</button>
          </div>
          
          <div class="modal-body">
            <form class="habitacion-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Número de Habitación *</label>
                  <input type="text" 
                         [(ngModel)]="nuevaHabitacion.numero" 
                         name="numero"
                         class="form-input" 
                         placeholder="Ej: 101, A-25">
                </div>
                
                <div class="form-group">
                  <label>Hotel *</label>
                  <select [(ngModel)]="nuevaHabitacion.hotelId" 
                          name="hotelId"
                          class="form-select">
                    <option value="">Seleccionar hotel</option>
                    <option *ngFor="let hotel of hoteles" [value]="hotel._id">
                      {{hotel.nombre}}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Tipo de Habitación *</label>
                  <select [(ngModel)]="nuevaHabitacion.tipo" 
                          name="tipo"
                          class="form-select">
                    <option *ngFor="let tipo of tiposHabitacion" [value]="tipo.value">
                      {{tipo.label}}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Capacidad *</label>
                  <input type="number" 
                         [(ngModel)]="nuevaHabitacion.capacidad" 
                         name="capacidad"
                         class="form-input" 
                         min="1" max="10">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Precio por Noche *</label>
                  <input type="number" 
                         [(ngModel)]="nuevaHabitacion.precio" 
                         name="precio"
                         class="form-input" 
                         min="0" step="0.01"
                         placeholder="0.00">
                </div>
                
                <div class="form-group">
                  <label>Estado</label>
                  <select [(ngModel)]="nuevaHabitacion.estado" 
                          name="estado"
                          class="form-select">
                    <option *ngFor="let estado of estadosHabitacion" [value]="estado.value">
                      {{estado.label}}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Descripción</label>
                <textarea [(ngModel)]="nuevaHabitacion.descripcion" 
                          name="descripcion"
                          class="form-textarea" 
                          rows="3"
                          placeholder="Descripción opcional de la habitación..."></textarea>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button class="btn-outline" (click)="cerrarModalAgregar()">
              Cancelar
            </button>
            <button class="btn-primary" 
                    (click)="agregarHabitacion()"
                    [disabled]="isLoading">
              <span *ngIf="isLoading" class="btn-spinner"></span>
              {{isLoading ? 'Creando...' : 'Crear Habitación'}}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Editar Habitación -->
      <div *ngIf="showModalEditar && habitacionSeleccionada" class="modal-overlay" (click)="cerrarModalEditar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Habitación {{habitacionSeleccionada.numero}}</h2>
            <button class="modal-close" (click)="cerrarModalEditar()">×</button>
          </div>
          
          <div class="modal-body">
            <form class="habitacion-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Número de Habitación *</label>
                  <input type="text" 
                         [(ngModel)]="habitacionSeleccionada.numero" 
                         name="numero"
                         class="form-input">
                </div>
                
                <div class="form-group">
                  <label>Tipo de Habitación *</label>
                  <select [(ngModel)]="habitacionSeleccionada.tipo" 
                          name="tipo"
                          class="form-select">
                    <option *ngFor="let tipo of tiposHabitacion" [value]="tipo.value">
                      {{tipo.label}}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Capacidad *</label>
                  <input type="number" 
                         [(ngModel)]="habitacionSeleccionada.capacidad" 
                         name="capacidad"
                         class="form-input" 
                         min="1" max="10">
                </div>
                
                <div class="form-group">
                  <label>Precio por Noche *</label>
                  <input type="number" 
                         [(ngModel)]="habitacionSeleccionada.precio" 
                         name="precio"
                         class="form-input" 
                         min="0" step="0.01">
                </div>
              </div>

              <div class="form-group">
                <label>Estado</label>
                <select [(ngModel)]="habitacionSeleccionada.estado" 
                        name="estado"
                        class="form-select">
                  <option *ngFor="let estado of estadosHabitacion" [value]="estado.value">
                    {{estado.label}}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Descripción</label>
                <textarea [(ngModel)]="habitacionSeleccionada.descripcion" 
                          name="descripcion"
                          class="form-textarea" 
                          rows="3"></textarea>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button class="btn-outline" (click)="cerrarModalEditar()">
              Cancelar
            </button>
            <button class="btn-primary" 
                    (click)="guardarEdicion()"
                    [disabled]="isLoading">
              <span *ngIf="isLoading" class="btn-spinner"></span>
              {{isLoading ? 'Guardando...' : 'Guardar Cambios'}}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Detalle Habitación -->
      <div *ngIf="showModalDetalle && habitacionSeleccionada" class="modal-overlay" (click)="cerrarModalDetalle()">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalles de Habitación {{habitacionSeleccionada.numero}}</h2>
            <button class="modal-close" (click)="cerrarModalDetalle()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="detalle-grid">
              <div class="detalle-section">
                <h3>Información General</h3>
                <div class="detalle-item">
                  <span class="detalle-label">Número:</span>
                  <span class="detalle-value">{{habitacionSeleccionada.numero}}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Hotel:</span>
                  <span class="detalle-value">{{habitacionSeleccionada.hotel?.nombre || 'No especificado'}}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Tipo:</span>
                  <span class="detalle-value">{{getTipoLabel(habitacionSeleccionada.tipo)}}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Capacidad:</span>
                  <span class="detalle-value">{{habitacionSeleccionada.capacidad}} personas</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Estado:</span>
                  <span class="detalle-value status-badge" [class]="'status-' + habitacionSeleccionada.estado">
                    {{getStatusIcon(habitacionSeleccionada.estado)}} {{getStatusLabel(habitacionSeleccionada.estado)}}
                  </span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Precio:</span>
                  <span class="detalle-value precio">\${{habitacionSeleccionada.precio}}/noche</span>
                </div>
              </div>

              <div class="detalle-section" *ngIf="habitacionSeleccionada.descripcion">
                <h3>Descripción</h3>
                <p class="descripcion-text">{{habitacionSeleccionada.descripcion}}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-outline" (click)="cerrarModalDetalle()">
              Cerrar
            </button>
            <button class="btn-primary" (click)="abrirModalEditar(habitacionSeleccionada); cerrarModalDetalle()">
              Editar Habitación
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .habitaciones-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 1rem;
      padding: 2rem;
      color: white;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .title-section {
      flex: 1;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-icon {
      font-size: 3rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    .page-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .action-section {
      display: flex;
      gap: 1rem;
    }

    .filters-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filters-header h3 {
      margin: 0;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-icon {
      font-size: 1.2rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .habitaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
    }

    .habitacion-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .habitacion-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #10b981, #3b82f6);
    }

    .habitacion-card.ocupada::before {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .habitacion-card.mantenimiento::before {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .habitacion-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.12);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .room-info h3 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .hotel-name {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-disponible {
      background: #d1fae5;
      color: #065f46;
    }

    .status-ocupada {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-mantenimiento {
      background: #fef3c7;
      color: #92400e;
    }

    .status-fuera_servicio {
      background: #f3f4f6;
      color: #374151;
    }

    .card-content {
      margin-bottom: 1.5rem;
    }

    .room-details {
      display: grid;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .detail-value {
      font-weight: 600;
      color: #1f2937;
    }

    .detail-value.precio {
      color: #059669;
      font-size: 1.1rem;
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* Botones */
    .btn-primary, .btn-outline, .btn-danger, .btn-link {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-outline {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
      transform: translateY(-2px);
    }

    .btn-link {
      background: none;
      color: #667eea;
      padding: 0.5rem;
    }

    .btn-link:hover {
      color: #764ba2;
    }

    .btn-icon {
      font-size: 1rem;
    }

    .btn-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Forms */
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .habitacion-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .modal-large {
      max-width: 800px;
    }

    .modal-header {
      padding: 2rem 2rem 1rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
      font-size: 1.5rem;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      color: #374151;
    }

    .modal-body {
      padding: 2rem;
    }

    .modal-footer {
      padding: 1rem 2rem 2rem 2rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    /* Detalle */
    .detalle-grid {
      display: grid;
      gap: 2rem;
    }

    .detalle-section h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .detalle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .detalle-item:last-child {
      border-bottom: none;
    }

    .detalle-label {
      color: #6b7280;
      font-weight: 500;
    }

    .detalle-value {
      font-weight: 600;
      color: #1f2937;
    }

    .descripcion-text {
      color: #4b5563;
      line-height: 1.6;
      margin: 0;
    }

    /* Estados */
    .loading-container {
      text-align: center;
      padding: 4rem;
    }

    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
      font-size: 1.1rem;
    }

    .alert {
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .alert-error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .alert-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      cursor: pointer;
      margin-left: auto;
      padding: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .habitaciones-container {
        padding: 1rem;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .page-title {
        font-size: 2rem;
      }
      
      .habitaciones-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .card-actions {
        flex-direction: column;
      }
      
      .modal-overlay {
        padding: 1rem;
      }
    }
  `]
})
export class HabitacionesComponent implements OnInit {
  filtroHotel = '';
  filtroTipo = '';
  filtroEstado = '';
  currentUser: any = null;
  isLoading = false;
  error = '';

  hoteles: any[] = [];
  habitaciones: any[] = [];

  // Modal states
  showModalAgregar = false;
  showModalEditar = false;
  showModalDetalle = false;
  habitacionSeleccionada: any = null;

  // Nueva habitación form
  nuevaHabitacion = {
    numero: '',
    hotelId: '',
    tipo: 'individual',
    capacidad: 1,
    precio: 0,
    descripcion: '',
    comodidades: [],
    estado: 'disponible'
  };

  tiposHabitacion = [
    { value: 'individual', label: 'Individual' },
    { value: 'doble', label: 'Doble' },
    { value: 'triple', label: 'Triple' },
    { value: 'suite', label: 'Suite' },
    { value: 'presidencial', label: 'Presidencial' }
  ];

  estadosHabitacion = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio' }
  ];

  constructor(
    private habitacionService: HabitacionService,
    private hotelService: HotelService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarHoteles();
    this.cargarHabitaciones();
  }

  cargarHoteles(): void {
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: any[]) => {
        if (this.currentUser?.rol === 'admin_hotel') {
          // Si es admin de hotel, solo mostrar su hotel
          this.hoteles = hoteles.filter((hotel: any) => hotel.admin === this.currentUser.id);
        } else {
          // Si es admin central, mostrar todos los hoteles
          this.hoteles = hoteles;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar hoteles:', error);
        this.error = 'Error al cargar la lista de hoteles';
      }
    });
  }

  cargarHabitaciones(): void {
    this.isLoading = true;
    this.error = '';

    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (habitaciones: any[]) => {
        if (this.currentUser?.rol === 'admin_hotel') {
          // Filtrar habitaciones del hotel del usuario
          const hotelAdmin = this.hoteles.find((hotel: any) => hotel.admin === this.currentUser.id);
          if (hotelAdmin) {
            this.habitaciones = habitaciones.filter((hab: any) => hab.hotelId === hotelAdmin._id);
          }
        } else {
          this.habitaciones = habitaciones;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar habitaciones:', error);
        this.error = 'Error al cargar las habitaciones';
        this.isLoading = false;
      }
    });
  }

  get habitacionesFiltradas() {
    return this.habitaciones.filter(habitacion => {
      const cumpleFiltroHotel = !this.filtroHotel || 
        habitacion.hotel?.nombre?.toLowerCase().includes(this.filtroHotel.toLowerCase());
      const cumpleFiltroTipo = !this.filtroTipo || habitacion.tipo === this.filtroTipo;
      const cumpleFiltroEstado = !this.filtroEstado || habitacion.estado === this.filtroEstado;
      
      return cumpleFiltroHotel && cumpleFiltroTipo && cumpleFiltroEstado;
    });
  }

  abrirModalAgregar(): void {
    this.nuevaHabitacion = {
      numero: '',
      hotelId: '',
      tipo: 'individual',
      capacidad: 1,
      precio: 0,
      descripcion: '',
      comodidades: [],
      estado: 'disponible'
    };
    this.showModalAgregar = true;
  }

  cerrarModalAgregar(): void {
    this.showModalAgregar = false;
  }

  agregarHabitacion(): void {
    if (!this.nuevaHabitacion.numero || !this.nuevaHabitacion.hotelId || !this.nuevaHabitacion.precio) {
      this.error = 'Todos los campos obligatorios deben estar completos';
      return;
    }

    this.isLoading = true;
    this.habitacionService.crearHabitacion(this.nuevaHabitacion).subscribe({
      next: (response: any) => {
        console.log('Habitación creada exitosamente');
        this.cargarHabitaciones();
        this.cerrarModalAgregar();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al crear habitación:', error);
        this.error = 'Error al crear la habitación';
        this.isLoading = false;
      }
    });
  }

  abrirModalEditar(habitacion: any): void {
    this.habitacionSeleccionada = { ...habitacion };
    this.showModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.showModalEditar = false;
    this.habitacionSeleccionada = null;
  }

  guardarEdicion(): void {
    if (!this.habitacionSeleccionada) return;

    this.isLoading = true;
    this.habitacionService.actualizarHabitacion(this.habitacionSeleccionada._id, this.habitacionSeleccionada).subscribe({
      next: (response: any) => {
        console.log('Habitación actualizada exitosamente');
        this.cargarHabitaciones();
        this.cerrarModalEditar();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al actualizar habitación:', error);
        this.error = 'Error al actualizar la habitación';
        this.isLoading = false;
      }
    });
  }

  verHabitacion(habitacion: any): void {
    this.habitacionSeleccionada = habitacion;
    this.showModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.showModalDetalle = false;
    this.habitacionSeleccionada = null;
  }

  eliminarHabitacion(id: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      return;
    }

    this.isLoading = true;
    this.habitacionService.eliminarHabitacion(id).subscribe({
      next: () => {
        console.log('Habitación eliminada exitosamente');
        this.cargarHabitaciones();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al eliminar habitación:', error);
        this.error = 'Error al eliminar la habitación';
        this.isLoading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroHotel = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'individual': return '🛏️';
      case 'doble': return '🛏️🛏️';
      case 'triple': return '🏠';
      case 'suite': return '🏨';
      case 'presidencial': return '👑';
      default: return '🏠';
    }
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposHabitacion.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'disponible': return '✅';
      case 'ocupada': return '🔴';
      case 'mantenimiento': return '🔧';
      case 'fuera_servicio': return '❌';
      default: return '❓';
    }
  }

  getStatusLabel(estado: string): string {
    const estadoObj = this.estadosHabitacion.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }
}