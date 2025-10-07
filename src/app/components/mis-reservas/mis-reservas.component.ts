import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mis-reservas-container">
      <!-- Header with Title -->
      <div class="reservas-header">
        <div class="header-content">
          <div class="title-section">
            <div class="title-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h1>Mis Reservas</h1>
          </div>
          <button class="btn-actualizar" (click)="cargarReservas()">
            <i class="fas fa-sync-alt"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- Type Selector -->
      <div class="type-selector">
        <div class="selector-item active">
          <i class="fas fa-bed"></i> Habitaciones ({{getReservasPorTipo('habitacion').length}})
        </div>
        <div class="selector-item">
          <i class="fas fa-briefcase"></i> Paquetes Corporativos ({{getReservasPorTipo('paquete').length}})
        </div>
      </div>
      
      <!-- Tabs Navigation -->
      <div class="tabs-navigation">
        <div 
          class="tab-item" 
          [class.active]="filtroActual === 'todas'" 
          (click)="cambiarFiltro('todas')">
          Todas ({{reservas.length}})
        </div>
        <div 
          class="tab-item" 
          [class.active]="filtroActual === 'confirmadas'" 
          (click)="cambiarFiltro('confirmadas')">
          <i class="fas fa-check-circle"></i>
          Confirmadas ({{getReservasPorEstado('confirmada').length}})
        </div>
        <div 
          class="tab-item" 
          [class.active]="filtroActual === 'pendientes'" 
          (click)="cambiarFiltro('pendientes')">
          <i class="fas fa-hourglass-half"></i>
          Pendientes ({{getReservasPorEstado('pendiente').length}})
        </div>
        <div 
          class="tab-item" 
          [class.active]="filtroActual === 'canceladas'" 
          (click)="cambiarFiltro('canceladas')">
          <i class="fas fa-times-circle"></i>
          Canceladas ({{getReservasPorEstado('cancelada').length}})
        </div>
        <div 
          class="tab-item" 
          [class.active]="filtroActual === 'completadas'" 
          (click)="cambiarFiltro('completadas')">
          <i class="fas fa-check-double"></i>
          Completadas ({{getReservasPorEstado('completada').length}})
        </div>
      </div>

      <!-- Search Box -->
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Buscar por código, hotel o tipo de habitación..." 
          [(ngModel)]="busqueda"
          (input)="aplicarFiltros()"
          class="search-input">
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="cargando">
        <div class="spinner"></div>
        <p>Cargando tus reservas...</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="error" (click)="cargarReservas()">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button class="btn-retry">Reintentar</button>
      </div>

      <!-- Empty State -->
      <div class="empty-container" *ngIf="!cargando && !error && reservasFiltradas.length === 0">
        <div class="empty-icon-container">
          <img src="assets/images/mailbox.png" class="empty-icon" alt="No hay reservas" />
        </div>
        <h2>No hay reservas de habitaciones</h2>
        <p>Aún no has realizado ninguna reserva de habitación.</p>
        <div class="info-message">
          <i class="fas fa-info-circle"></i> Se muestran solo las reservas más recientes con datos completos
        </div>
        <button class="btn-buscar" (click)="irABuscarHabitaciones()">
          <i class="fas fa-search"></i> Buscar Habitaciones
        </button>
      </div>

      <!-- Reservas List -->
      <div class="reservas-list" *ngIf="!cargando && !error && reservasFiltradas.length > 0">
        <div class="reserva-card" *ngFor="let reserva of reservasFiltradas">
          <div class="reserva-header">
            <div class="reserva-codigo">
              <span class="codigo-label">Reserva #</span>
              <span class="codigo-valor">{{ reserva.codigoReserva }}</span>
            </div>
            <div class="reserva-estado" [ngClass]="'estado-' + reserva.estado">
              {{ reserva.estado | titlecase }}
            </div>
          </div>
          
          <div class="reserva-body">
            <div class="hotel-info">
              <div class="hotel-icon">
                <i class="fas fa-hotel"></i>
              </div>
              <div class="hotel-details">
                <h3 class="hotel-nombre">{{ reserva.hotel }}</h3>
                <p class="hotel-habitacion">{{ reserva.habitacion }}</p>
              </div>
            </div>
            
            <div class="reserva-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Check-in:</span>
                  <span class="detail-value">{{ reserva.checkIn | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Check-out:</span>
                  <span class="detail-value">{{ reserva.checkOut | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Huéspedes:</span>
                  <span class="detail-value">{{ reserva.huespedes }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Noches:</span>
                  <span class="detail-value">{{ reserva.noches }}</span>
                </div>
              </div>
            </div>
            
            <div class="price-section">
              <div class="price-label">Precio total:</div>
              <div class="price-value">{{ reserva.total | currency:'COP':'symbol-narrow':'1.0-0' }}</div>
            </div>
            
            <!-- Estado pendiente - puede cancelar -->
            <div class="action-buttons" *ngIf="reserva.estado === 'pendiente'">
              <button class="btn-ver" (click)="verReserva(reserva)">
                <i class="fas fa-eye"></i> Ver Detalles
              </button>
              <button class="btn-cancelar" (click)="confirmarCancelacion(reserva)">
                <i class="fas fa-times"></i> Cancelar Reserva
              </button>
            </div>
            
            <!-- Estado confirmada - puede generar comprobante -->
            <div class="action-buttons" *ngIf="reserva.estado === 'confirmada'">
              <button class="btn-ver" (click)="verReserva(reserva)">
                <i class="fas fa-eye"></i> Ver Detalles
              </button>
              <button class="btn-comprobante" (click)="generarComprobante(reserva)">
                <i class="fas fa-file-pdf"></i> Comprobante
              </button>
            </div>
            
            <!-- Estados cancelada o completada - solo ver -->
            <div class="action-buttons" *ngIf="reserva.estado === 'cancelada' || reserva.estado === 'completada'">
              <button class="btn-ver btn-full" (click)="verReserva(reserva)">
                <i class="fas fa-eye"></i> Ver Detalles
              </button>
            </div>
            
            <!-- Mensaje del hotel -->
            <div class="hotel-message" *ngIf="reserva.notasHotel">
              <div class="message-icon">
                <i class="fas fa-comment-alt"></i>
              </div>
              <div class="message-content">
                <div class="message-title">Mensaje del hotel:</div>
                <div class="message-text">{{ reserva.notasHotel }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de cancelación -->
      <div class="modal-backdrop" *ngIf="modalCancelacionVisible" (click)="cerrarModal()"></div>
      <div class="modal-container" *ngIf="modalCancelacionVisible">
        <div class="modal-content">
          <div class="modal-header">
            <h3>
              <i class="fas fa-exclamation-triangle"></i>
              Cancelar Reserva
            </h3>
            <button class="btn-close" (click)="cerrarModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="warning-text">¿Estás seguro de que deseas cancelar esta reserva?</p>
            <div class="reservation-summary">
              <p><strong>Hotel:</strong> {{ reservaSeleccionada?.hotel }}</p>
              <p><strong>Habitación:</strong> {{ reservaSeleccionada?.habitacion }}</p>
              <p><strong>Fechas:</strong> {{ reservaSeleccionada?.checkIn | date:'dd/MM/yyyy' }} al {{ reservaSeleccionada?.checkOut | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="form-group">
              <label for="motivoCancelacion">Motivo de la cancelación:</label>
              <textarea 
                id="motivoCancelacion"
                [(ngModel)]="motivoCancelacion" 
                class="form-control"
                placeholder="Por favor, indique el motivo de la cancelación...">
              </textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="cerrarModal()">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
            <button 
              class="btn-danger" 
              [disabled]="!motivoCancelacion.trim()" 
              (click)="cancelarReserva()">
              <i class="fas fa-times"></i> Confirmar Cancelación
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de detalles -->
      <div class="modal-backdrop" *ngIf="modalDetallesVisible" (click)="cerrarModal()"></div>
      <div class="modal-container" *ngIf="modalDetallesVisible">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>
              <i class="fas fa-info-circle"></i>
              Detalles de la Reserva
            </h3>
            <button class="btn-close" (click)="cerrarModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="reservation-details" *ngIf="reservaSeleccionada">
              <div class="detail-header">
                <div class="codigo-reserva-grande">
                  # {{ reservaSeleccionada.codigoReserva }}
                </div>
                <div class="estado-badge" [ngClass]="'estado-' + reservaSeleccionada.estado">
                  {{ reservaSeleccionada.estado | titlecase }}
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Información del Hotel</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">Hotel:</div>
                    <div class="detail-value">{{ reservaSeleccionada.hotel }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Habitación:</div>
                    <div class="detail-value">{{ reservaSeleccionada.habitacion }}</div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Fechas y Detalles</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">Check-in:</div>
                    <div class="detail-value">{{ reservaSeleccionada.checkIn | date:'dd/MM/yyyy' }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Check-out:</div>
                    <div class="detail-value">{{ reservaSeleccionada.checkOut | date:'dd/MM/yyyy' }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Huéspedes:</div>
                    <div class="detail-value">{{ reservaSeleccionada.huespedes }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Noches:</div>
                    <div class="detail-value">{{ reservaSeleccionada.noches }}</div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Información de Precio</h4>
                <div class="price-details">
                  <div class="price-row">
                    <div class="price-concept">Precio por noche:</div>
                    <div class="price-amount">{{ reservaSeleccionada.total / reservaSeleccionada.noches | currency:'COP':'symbol-narrow':'1.0-0' }}</div>
                  </div>
                  <div class="price-row">
                    <div class="price-concept">Número de noches:</div>
                    <div class="price-amount">{{ reservaSeleccionada.noches }}</div>
                  </div>
                  <div class="price-row total">
                    <div class="price-concept">Total:</div>
                    <div class="price-amount">{{ reservaSeleccionada.total | currency:'COP':'symbol-narrow':'1.0-0' }}</div>
                  </div>
                </div>
              </div>

              <div class="detail-section" *ngIf="reservaSeleccionada.notas || reservaSeleccionada.notasHotel">
                <h4 class="section-title">Notas</h4>
                <div class="notes-container">
                  <div class="note-item" *ngIf="reservaSeleccionada.notas">
                    <div class="note-label">Tus notas:</div>
                    <div class="note-content">{{ reservaSeleccionada.notas }}</div>
                  </div>
                  <div class="note-item" *ngIf="reservaSeleccionada.notasHotel">
                    <div class="note-label">Notas del hotel:</div>
                    <div class="note-content">{{ reservaSeleccionada.notasHotel }}</div>
                  </div>
                </div>
              </div>

              <div class="detail-section" *ngIf="reservaSeleccionada.motivoCancelacion">
                <h4 class="section-title">Información de Cancelación</h4>
                <div class="cancellation-info">
                  <div class="cancellation-date" *ngIf="reservaSeleccionada.fechaCancelacion">
                    Cancelada el {{ reservaSeleccionada.fechaCancelacion | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                  <div class="cancellation-reason">
                    <div class="reason-label">Motivo:</div>
                    <div class="reason-text">{{ reservaSeleccionada.motivoCancelacion }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="cerrarModal()">
              <i class="fas fa-times"></i> Cerrar
            </button>
            <button 
              *ngIf="reservaSeleccionada && reservaSeleccionada.estado === 'confirmada'" 
              class="btn-primary"
              (click)="generarComprobante(reservaSeleccionada)">
              <i class="fas fa-file-pdf"></i> Generar Comprobante
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mis-reservas-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background-color: transparent;
    }

    .reservas-header {
      background: white;
      border-radius: 15px;
      padding: 15px 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .title-icon {
      color: #4a5568;
      font-size: 24px;
    }

    .title-section h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: #2d3748;
    }

    .btn-actualizar {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      cursor: pointer;
    }

    .btn-actualizar:hover {
      background: #2980b9;
    }

    /* Type Selector */
    .type-selector {
      display: flex;
      margin-bottom: 20px;
      background: transparent;
      border-radius: 10px;
      overflow: hidden;
    }

    .selector-item {
      flex: 1;
      padding: 15px;
      text-align: center;
      background: white;
      color: #4a5568;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .selector-item:first-child {
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
      background: #5e72e4;
      color: white;
    }

    .selector-item:last-child {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
    
    .selector-item.active {
      background: #5e72e4;
      color: white;
    }

    /* Tabs Navigation */
    .tabs-navigation {
      display: flex;
      background: white;
      border-radius: 12px;
      margin-bottom: 20px;
      overflow-x: auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .tab-item {
      padding: 15px 25px;
      white-space: nowrap;
      font-weight: 500;
      color: #4a5568;
      cursor: pointer;
      border-bottom: none;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-item i {
      font-size: 16px;
    }

    .tab-item:hover {
      color: #2d3748;
      background: #f7fafc;
    }

    .tab-item.active {
      color: #3498db;
      background-color: #f8f9fa;
      font-weight: 600;
      border-radius: 20px;
    }

    /* Search Container */
    .search-container {
      margin-bottom: 20px;
    }

    .search-input {
      width: 100%;
      padding: 15px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      font-size: 14px;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    /* Loading State */
    .loading-container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(102, 126, 234, 0.1);
      border-radius: 50%;
      border-top: 4px solid #667eea;
      margin: 0 auto 20px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error State */
    .error-container {
      text-align: center;
      padding: 40px;
      background: #fff5f5;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      color: #e53e3e;
    }

    .error-container i {
      font-size: 40px;
      margin-bottom: 20px;
    }

    .btn-retry {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      margin-top: 20px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-retry:hover {
      background: #c53030;
    }

    /* Empty State */
    .empty-container {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .empty-icon-container {
      margin: 0 auto 20px;
      width: 120px;
      height: 120px;
    }

    .empty-icon {
      max-width: 100%;
    }

    .empty-container h2 {
      font-size: 22px;
      color: #2d3748;
      margin-bottom: 10px;
    }

    .empty-container p {
      color: #718096;
      margin-bottom: 20px;
    }
    
    .info-message {
      background-color: #f8f9fa;
      color: #6c757d;
      padding: 10px;
      font-size: 12px;
      border-radius: 8px;
      margin: 20px auto;
      max-width: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-buscar {
      background: #2ecc71;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      cursor: pointer;
      margin-top: 20px;
    }

    .btn-buscar:hover {
      background: #27ae60;
    }

    /* Reservas List */
    .reservas-list {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 450px), 1fr));
    }

    .reserva-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      transition: all 0.3s;
    }

    .reserva-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }

    .reserva-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: #f7fafc;
      border-bottom: 1px solid #edf2f7;
    }

    .reserva-codigo {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .codigo-label {
      font-size: 13px;
      color: #718096;
    }

    .codigo-valor {
      font-weight: 600;
      color: #2d3748;
    }

    .reserva-estado {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .estado-pendiente {
      background: #fefcbf;
      color: #975a16;
    }

    .estado-confirmada {
      background: #c6f6d5;
      color: #276749;
    }

    .estado-cancelada {
      background: #fed7d7;
      color: #9b2c2c;
    }

    .estado-completada {
      background: #e9d8fd;
      color: #553c9a;
    }

    .reserva-body {
      padding: 20px;
    }

    .hotel-info {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .hotel-icon {
      width: 50px;
      height: 50px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .hotel-details {
      flex: 1;
    }

    .hotel-nombre {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 5px 0;
    }

    .hotel-habitacion {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .reserva-details {
      background: #f7fafc;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      margin-bottom: 10px;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-item {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 5px;
    }

    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #edf2f7;
    }

    .price-label {
      font-size: 14px;
      color: #718096;
    }

    .price-value {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .btn-ver, .btn-cancelar, .btn-comprobante {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-ver {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .btn-ver:hover {
      background: rgba(102, 126, 234, 0.2);
    }

    .btn-cancelar {
      background: rgba(245, 101, 101, 0.1);
      color: #f56565;
    }

    .btn-cancelar:hover {
      background: rgba(245, 101, 101, 0.2);
    }

    .btn-comprobante {
      background: rgba(56, 178, 172, 0.1);
      color: #38b2ac;
    }

    .btn-comprobante:hover {
      background: rgba(56, 178, 172, 0.2);
    }

    .btn-full {
      flex: 1;
    }

    .hotel-message {
      display: flex;
      gap: 15px;
      background: #fffaf0;
      border-radius: 8px;
      padding: 15px;
      border-left: 3px solid #ed8936;
    }

    .message-icon {
      color: #ed8936;
      font-size: 18px;
    }

    .message-content {
      flex: 1;
    }

    .message-title {
      font-size: 14px;
      font-weight: 600;
      color: #ed8936;
      margin-bottom: 5px;
    }

    .message-text {
      font-size: 14px;
      color: #744210;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 100;
    }

    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 101;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      animation: modalFadeIn 0.3s;
    }

    .modal-lg {
      max-width: 700px;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #edf2f7;
    }

    .modal-header h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .modal-header i {
      color: #667eea;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #718096;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s;
    }

    .btn-close:hover {
      background: #f7fafc;
      color: #2d3748;
    }

    .modal-body {
      padding: 20px;
    }

    .warning-text {
      font-size: 16px;
      color: #e53e3e;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .reservation-summary {
      background: #f7fafc;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .reservation-summary p {
      margin: 10px 0;
      color: #4a5568;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 8px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 16px;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #edf2f7;
    }

    .btn-secondary, .btn-danger, .btn-primary {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-secondary {
      background: #edf2f7;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      color: #2d3748;
    }

    .btn-danger {
      background: #f56565;
      color: white;
    }

    .btn-danger:hover {
      background: #e53e3e;
    }

    .btn-danger:disabled {
      background: #feb2b2;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
    }

    /* Detalles Reserva Modal */
    .reservation-details {
      padding: 10px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .codigo-reserva-grande {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
    }

    .estado-badge {
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .detail-section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #edf2f7;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 5px;
    }

    .detail-value {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
    }

    .price-details {
      background: #f7fafc;
      border-radius: 8px;
      padding: 15px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #edf2f7;
    }

    .price-row:last-child {
      border-bottom: none;
    }

    .price-row.total {
      border-top: 2px solid #e2e8f0;
      margin-top: 10px;
      padding-top: 15px;
    }

    .price-concept {
      color: #4a5568;
    }

    .price-amount {
      font-weight: 600;
      color: #2d3748;
    }

    .price-row.total .price-concept,
    .price-row.total .price-amount {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
    }

    .notes-container {
      background: #f7fafc;
      border-radius: 8px;
      padding: 15px;
    }

    .note-item {
      margin-bottom: 15px;
    }

    .note-item:last-child {
      margin-bottom: 0;
    }

    .note-label {
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 5px;
    }

    .note-content {
      color: #2d3748;
    }

    .cancellation-info {
      background: #fff5f5;
      border-radius: 8px;
      padding: 15px;
    }

    .cancellation-date {
      font-size: 14px;
      color: #e53e3e;
      margin-bottom: 10px;
    }

    .cancellation-reason {
      display: flex;
      flex-direction: column;
    }

    .reason-label {
      font-size: 14px;
      font-weight: 600;
      color: #e53e3e;
      margin-bottom: 5px;
    }

    .reason-text {
      color: #c53030;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .mis-reservas-container {
        padding: 15px 10px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .title-text {
        flex-direction: column;
        gap: 15px;
      }

      .tabs-navigation {
        flex-wrap: wrap;
      }

      .tab-item {
        flex: 1;
        min-width: 40%;
        justify-content: center;
        text-align: center;
        padding: 10px;
      }

      .detail-row {
        flex-direction: column;
        gap: 10px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .price-section {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .price-value {
        font-size: 18px;
      }

      .hotel-message {
        flex-direction: column;
        gap: 10px;
      }

      .message-icon {
        text-align: center;
      }

      .modal-content {
        max-height: 85vh;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MisReservasComponent implements OnInit {
  // Variables de estado
  cargando = true;
  error = '';
  reservas: any[] = [];
  reservasFiltradas: any[] = [];
  filtroActual: 'todas' | 'confirmadas' | 'pendientes' | 'canceladas' | 'completadas' = 'todas';
  busqueda = '';
  mensajeVacio = '';

  // Variables para modales
  modalCancelacionVisible = false;
  modalDetallesVisible = false;
  reservaSeleccionada: any = null;
  motivoCancelacion = '';

  constructor(
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';

    this.reservaService.obtenerMisReservas().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservas = this.procesarReservas(response.reservas);
          this.aplicarFiltros();
        } else {
          this.error = 'No se pudieron cargar tus reservas';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.error = 'Error de conexión al cargar tus reservas';
        this.cargando = false;
      }
    });
  }

  procesarReservas(reservasRaw: any[]): any[] {
    return reservasRaw.map(reserva => ({
      _id: reserva._id,
      codigoReserva: reserva.codigoReserva,
      cliente: `${reserva.datosHuesped?.nombre} ${reserva.datosHuesped?.apellido}`,
      email: reserva.datosHuesped?.email,
      telefono: reserva.datosHuesped?.telefono,
      hotel: reserva.hotel?.nombre || 'Hotel no especificado',
      habitacion: reserva.habitacion?.numero || reserva.salon?.nombre || 'N/A',
      tipoHabitacion: reserva.habitacion?.tipo || '',
      checkIn: new Date(reserva.fechaInicio),
      checkOut: new Date(reserva.fechaFin),
      estado: reserva.estado,
      total: reserva.tarifa?.total || 0,
      huespedes: reserva.huespedes || 1,
      noches: reserva.noches || 1,
      fechaCreacion: new Date(reserva.createdAt),
      fechaConfirmacion: reserva.fechaConfirmacion ? new Date(reserva.fechaConfirmacion) : undefined,
      fechaCancelacion: reserva.fechaCancelacion ? new Date(reserva.fechaCancelacion) : undefined,
      motivoCancelacion: reserva.motivoCancelacion,
      notasHotel: reserva.notasHotel,
      notas: reserva.notas
    }));
  }

  cambiarFiltro(filtro: 'todas' | 'confirmadas' | 'pendientes' | 'canceladas' | 'completadas'): void {
    this.filtroActual = filtro;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let filtradas = [...this.reservas];
    
    // Aplicar filtro por estado
    if (this.filtroActual !== 'todas') {
      const estadoFiltro = this.filtroActual.slice(0, -1); // quitar la 's' final
      filtradas = filtradas.filter(r => r.estado === estadoFiltro);
    }
    
    // Aplicar búsqueda
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      filtradas = filtradas.filter(r => 
        r.codigoReserva.toLowerCase().includes(busquedaLower) ||
        r.hotel.toLowerCase().includes(busquedaLower) ||
        r.habitacion.toLowerCase().includes(busquedaLower) ||
        r.tipoHabitacion?.toLowerCase().includes(busquedaLower)
      );
    }
    
    this.reservasFiltradas = filtradas;
    
    // Establecer mensaje para estado vacío
    switch (this.filtroActual) {
      case 'todas':
        this.mensajeVacio = '';
        break;
      case 'confirmadas':
        this.mensajeVacio = 'confirmadas';
        break;
      case 'pendientes':
        this.mensajeVacio = 'pendientes';
        break;
      case 'canceladas':
        this.mensajeVacio = 'canceladas';
        break;
      case 'completadas':
        this.mensajeVacio = 'completadas';
        break;
    }
  }

  getReservasPorEstado(estado: string): any[] {
    return this.reservas.filter(r => r.estado === estado);
  }
  
  getReservasPorTipo(tipo: string): any[] {
    if (tipo === 'habitacion') {
      return this.reservas.filter(r => !r.paquete);
    } else if (tipo === 'paquete') {
      return this.reservas.filter(r => !!r.paquete);
    }
    return [];
  }

  verReserva(reserva: any): void {
    this.reservaSeleccionada = reserva;
    this.modalDetallesVisible = true;
  }

  confirmarCancelacion(reserva: any): void {
    this.reservaSeleccionada = reserva;
    this.modalCancelacionVisible = true;
    this.motivoCancelacion = '';
  }

  cancelarReserva(): void {
    if (!this.reservaSeleccionada || !this.motivoCancelacion.trim()) return;
    
    this.reservaService.cancelarReserva(
      this.reservaSeleccionada._id, 
      { motivo: this.motivoCancelacion }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Reserva cancelada correctamente');
          this.cerrarModal();
          this.cargarReservas();
        } else {
          alert(response.message || 'Error al cancelar la reserva');
        }
      },
      error: (err) => {
        console.error('Error al cancelar reserva:', err);
        alert('Error de conexión al cancelar la reserva');
      }
    });
  }

  generarComprobante(reserva: any): void {
    // Implementar la generación de comprobante
    alert(`Se generará el comprobante para la reserva ${reserva.codigoReserva}`);
  }

  cerrarModal(): void {
    this.modalCancelacionVisible = false;
    this.modalDetallesVisible = false;
    this.reservaSeleccionada = null;
    this.motivoCancelacion = '';
  }

  irABuscarHabitaciones(): void {
    this.router.navigate(['/buscar-habitaciones']);
  }
}