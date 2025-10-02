import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaParaHotel } from '../../services/reserva.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Debug Modal Estado -->
    <div style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;" *ngIf="modalVisible">
      Modal Visible: {{modalTipo}} - Paquete: {{!!reservaPaqueteSeleccionada}} - Habitación: {{!!reservaSeleccionada}}
    </div>
    
    <!-- Modal para confirmación/rechazo -->
    <div *ngIf="modalVisible" class="modal-backdrop" (click)="cerrarModal()"></div>
    <div *ngIf="modalVisible" class="modal-container">
      <div class="modal-content-custom">
        <!-- Modal Ver Detalles -->
        <div *ngIf="modalTipo === 'ver'" class="modal-view">
          <h3 class="modal-title">
            <i class="fas fa-eye me-2"></i>
            Detalles de la Reserva
          </h3>
          <div class="reservation-details" *ngIf="reservaSeleccionada">
            <div class="detail-row">
              <span class="detail-label">Código:</span>
              <span class="detail-value code">{{ reservaSeleccionada.codigoReserva }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">{{ reservaSeleccionada.cliente }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ reservaSeleccionada.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Teléfono:</span>
              <span class="detail-value">{{ reservaSeleccionada.telefono }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Habitación:</span>
              <span class="detail-value">{{ reservaSeleccionada.habitacion }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span class="detail-value">{{ reservaSeleccionada.checkIn | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span class="detail-value">{{ reservaSeleccionada.checkOut | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Huéspedes:</span>
              <span class="detail-value">{{ reservaSeleccionada.huespedes }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Noches:</span>
              <span class="detail-value">{{ reservaSeleccionada.noches }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total:</span>
              <span class="detail-value total">{{ reservaSeleccionada.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span class="badge-modern" [ngClass]="getEstadoBadge(reservaSeleccionada.estado)">
                {{ reservaSeleccionada.estado | titlecase }}
              </span>
            </div>
            <div class="detail-row" *ngIf="reservaSeleccionada.notasHotel">
              <span class="detail-label">Notas del Hotel:</span>
              <span class="detail-value">{{ reservaSeleccionada.notasHotel }}</span>
            </div>
            <div class="detail-row" *ngIf="reservaSeleccionada.notas">
              <span class="detail-label">Notas del Cliente:</span>
              <span class="detail-value">{{ reservaSeleccionada.notas }}</span>
            </div>
          </div>
          
          <!-- Detalles de reserva de paquete -->
          <div class="reservation-details" *ngIf="reservaPaqueteSeleccionada">
            <div class="detail-row">
              <span class="detail-label">Número Reserva:</span>
              <span class="detail-value code">{{ reservaPaqueteSeleccionada.numeroReserva }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Empresa:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.datosEmpresa?.razonSocial }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">NIT:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.datosEmpresa?.nit }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.datosEmpresa?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Evento:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.nombreEvento }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo de Evento:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.tipoEvento | titlecase }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Paquete:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.paquete?.nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha del Evento:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.fechaInicio | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Asistentes:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.numeroAsistentes }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total:</span>
              <span class="detail-value total">{{ reservaPaqueteSeleccionada.precios?.total | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span class="badge-modern" [ngClass]="getEstadoBadge(reservaPaqueteSeleccionada.estado)">
                {{ reservaPaqueteSeleccionada.estado | titlecase }}
              </span>
            </div>
            <div class="detail-row" *ngIf="reservaPaqueteSeleccionada.notasHotel">
              <span class="detail-label">Notas del Hotel:</span>
              <span class="detail-value">{{ reservaPaqueteSeleccionada.notasHotel }}</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModal()">
              <i class="fas fa-times me-2"></i>Cerrar
            </button>
          </div>
        </div>

        <!-- Modal Confirmar Reserva -->
        <div *ngIf="modalTipo === 'confirmar'" class="modal-confirm">
          <h3 class="modal-title confirm">
            <i class="fas fa-check me-2"></i>
            Confirmar Reserva
          </h3>
          <div class="confirm-message" *ngIf="reservaSeleccionada">
            <p>¿Desea confirmar la reserva <strong>{{ reservaSeleccionada.codigoReserva }}</strong> de <strong>{{ reservaSeleccionada.cliente }}</strong>?</p>
            <div class="form-group">
              <label for="notasConfirmar">Notas del hotel (opcional):</label>
              <textarea 
                id="notasConfirmar"
                class="form-control" 
                [(ngModel)]="notasHotel" 
                rows="3" 
                placeholder="Agregue notas adicionales para el cliente...">
              </textarea>
            </div>
          </div>
          <div class="confirm-message" *ngIf="reservaPaqueteSeleccionada">
            <p>¿Desea confirmar la reserva de paquete <strong>{{ reservaPaqueteSeleccionada.numeroReserva }}</strong> de <strong>{{ reservaPaqueteSeleccionada.datosEmpresa?.razonSocial }}</strong>?</p>
            <div class="form-group">
              <label for="notasConfirmarPaquete">Notas del hotel (opcional):</label>
              <textarea 
                id="notasConfirmarPaquete"
                class="form-control" 
                [(ngModel)]="notasHotel" 
                rows="3" 
                placeholder="Agregue notas adicionales para la empresa...">
              </textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModal()">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
            <button class="btn btn-success" (click)="reservaSeleccionada ? ejecutarConfirmacion() : ejecutarConfirmacionPaquete()">
              <i class="fas fa-check me-2"></i>Confirmar Reserva
            </button>
          </div>
        </div>

        <!-- Modal Rechazar Reserva -->
        <div *ngIf="modalTipo === 'rechazar'" class="modal-reject">
          <h3 class="modal-title reject">
            <i class="fas fa-times me-2"></i>
            Rechazar Reserva
          </h3>
          <div class="reject-message" *ngIf="reservaSeleccionada">
            <p>¿Desea rechazar la reserva <strong>{{ reservaSeleccionada.codigoReserva }}</strong> de <strong>{{ reservaSeleccionada.cliente }}</strong>?</p>
            <div class="form-group">
              <label for="motivoRechazo">Motivo del rechazo *:</label>
              <textarea 
                id="motivoRechazo"
                class="form-control" 
                [(ngModel)]="motivoRechazo" 
                rows="3" 
                placeholder="Explique el motivo por el cual se rechaza la reserva..."
                required>
              </textarea>
            </div>
            <div class="form-group">
              <label for="notasRechazar">Notas adicionales (opcional):</label>
              <textarea 
                id="notasRechazar"
                class="form-control" 
                [(ngModel)]="notasHotel" 
                rows="2" 
                placeholder="Notas internas del hotel...">
              </textarea>
            </div>
          </div>
          <div class="reject-message" *ngIf="reservaPaqueteSeleccionada">
            <p>¿Desea rechazar la reserva de paquete <strong>{{ reservaPaqueteSeleccionada.numeroReserva }}</strong> de <strong>{{ reservaPaqueteSeleccionada.datosEmpresa?.razonSocial }}</strong>?</p>
            <div class="form-group">
              <label for="motivoRechazoPaquete">Motivo del rechazo *:</label>
              <textarea 
                id="motivoRechazoPaquete"
                class="form-control" 
                [(ngModel)]="motivoRechazo" 
                rows="3" 
                placeholder="Explique el motivo por el cual se rechaza la reserva de paquete..."
                required>
              </textarea>
            </div>
            <div class="form-group">
              <label for="notasRechazarPaquete">Notas adicionales (opcional):</label>
              <textarea 
                id="notasRechazarPaquete"
                class="form-control" 
                [(ngModel)]="notasHotel" 
                rows="2" 
                placeholder="Notas internas del hotel...">
              </textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModal()">
              <i class="fas fa-arrow-left me-2"></i>Cancelar
            </button>
            <button class="btn btn-danger" (click)="reservaSeleccionada ? ejecutarRechazo() : ejecutarRechazoPaquete()" [disabled]="!motivoRechazo.trim()">
              <i class="fas fa-times me-2"></i>Rechazar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">
              <i class="fas fa-calendar-check me-3"></i>
              Gestión de Reservas
            </h1>
            <p class="page-subtitle">Administra y confirma las reservas de tu hotel</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary btn-modern" (click)="nuevaReserva()">
              <i class="fas fa-plus me-2"></i>Nueva Reserva
            </button>
            <button class="btn btn-outline-secondary btn-modern" (click)="cargarReservas()">
              <i class="fas fa-sync me-2"></i>Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje de carga -->
      <div *ngIf="cargando" class="loading-section">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="loading-text">Cargando reservas...</p>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="error" class="alert alert-danger" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="cargarReservas()">
          <i class="fas fa-retry me-1"></i>Reintentar
        </button>
      </div>

      <!-- Estadísticas superiores -->
      <div class="stats-row" *ngIf="!cargando">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-number">{{ totalReservas }}</div>
          <div class="stat-label">Total Reservas</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-number">{{ reservasConfirmadas }}</div>
          <div class="stat-label">Confirmadas</div>
        </div>
        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-number">{{ reservasPendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card stat-danger">
          <div class="stat-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-number">{{ reservasCanceladas }}</div>
          <div class="stat-label">Canceladas</div>
        </div>
        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-number">{{ ingresosMes | currency:'COP':'symbol-narrow':'1.0-0' }}</div>
          <div class="stat-label">Ingresos del mes</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section" *ngIf="!cargando">
        <div class="filters-container">
          <div class="filters-row">
            <div class="filter-group">
              <label class="form-label">Fecha desde</label>
              <input 
                type="date" 
                class="form-control" 
                [(ngModel)]="fechaDesde"
                (change)="actualizarFiltros()">
            </div>
            <div class="filter-group">
              <label class="form-label">Fecha hasta</label>
              <input 
                type="date" 
                class="form-control" 
                [(ngModel)]="fechaHasta"
                (change)="actualizarFiltros()">
            </div>
            <div class="filter-group">
              <label class="form-label">Estado</label>
              <select 
                class="form-select" 
                [(ngModel)]="estadoFiltro"
                (change)="actualizarFiltros()">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
            <div class="filter-actions">
              <button class="btn btn-primary" (click)="actualizarFiltros()">
                <i class="fas fa-search me-2"></i>Filtrar
              </button>
              <button class="btn btn-outline-secondary" (click)="limpiarFiltros()">
                <i class="fas fa-eraser me-2"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestañas de navegación -->
      <div class="tabs-section" *ngIf="!cargando">
        <div class="tabs-container">
          <button 
            class="tab-button" 
            [class.active]="tabActiva === 'habitaciones'"
            (click)="cambiarTab('habitaciones')">
            <i class="fas fa-bed me-2"></i>
            Reservas de Habitaciones
          </button>
          <button 
            class="tab-button" 
            [class.active]="tabActiva === 'paquetes'"
            (click)="cambiarTab('paquetes')">
            <i class="fas fa-box me-2"></i>
            Reservas de Paquetes
          </button>
        </div>
      </div>

      <!-- Tabla de reservas de habitaciones -->
      <div class="table-section" *ngIf="!cargando && tabActiva === 'habitaciones'">
        <div class="card table-card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-list me-2"></i>
              Lista de Reservas de Habitaciones ({{ reservasFiltradas.length }})
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0 w-100">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Hotel</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let reserva of reservasFiltradas" class="table-row">
                    <td><strong class="codigo-reserva">#{{ reserva.codigoReserva }}</strong></td>
                    <td>
                      <div class="client-info">
                        <div class="avatar-circle">{{ reserva.cliente.charAt(0) }}</div>
                        <div class="client-details">
                          <div class="client-name">{{ reserva.cliente }}</div>
                          <div class="client-email">{{ reserva.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="hotel-name">{{ reserva.hotel }}</td>
                    <td><span class="room-number">{{ reserva.habitacion }}</span></td>
                    <td class="date-cell">{{ reserva.checkIn | date:'dd/MM/yyyy' }}</td>
                    <td class="date-cell">{{ reserva.checkOut | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <span class="badge-modern" [ngClass]="getEstadoBadge(reserva.estado)">
                        {{ reserva.estado | titlecase }}
                      </span>
                    </td>
                    <td class="amount-cell">
                      <strong>{{ reserva.total | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          class="btn btn-action btn-action-view" 
                          (click)="verReserva(reserva)" 
                          title="Ver detalles">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          *ngIf="reserva.estado === 'pendiente'"
                          class="btn btn-action btn-action-confirm" 
                          (click)="confirmarReserva(reserva)"
                          title="Confirmar reserva">
                          <i class="fas fa-check"></i>
                        </button>
                        <button 
                          *ngIf="reserva.estado === 'pendiente'"
                          class="btn btn-action btn-action-reject" 
                          (click)="rechazarReserva(reserva)"
                          title="Rechazar reserva">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="reservasFiltradas.length === 0">
                    <td colspan="9" class="text-center py-4">
                      <div class="no-data">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No se encontraron reservas</h5>
                        <p class="text-muted">Ajusta los filtros o verifica que haya reservas en el sistema</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de reservas de paquetes -->
      <div class="table-section" *ngIf="!cargando && tabActiva === 'paquetes'">
        <div class="card table-card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-list me-2"></i>
              Lista de Reservas de Paquetes ({{ reservasPaquetesFiltradas.length }})
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Número Reserva</th>
                    <th>Empresa</th>
                    <th>Evento</th>
                    <th>Paquete</th>
                    <th>Fecha Evento</th>
                    <th>Asistentes</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let reserva of reservasPaquetesFiltradas" class="table-row">
                    <td class="code-cell">{{ reserva.numeroReserva }}</td>
                    <td>
                      <div class="client-info">
                        <strong>{{ reserva.datosEmpresa?.razonSocial }}</strong>
                        <small class="text-muted d-block">{{ reserva.datosEmpresa?.email }}</small>
                      </div>
                    </td>
                    <td>
                      <div class="event-info">
                        <strong>{{ reserva.nombreEvento }}</strong>
                        <small class="text-muted d-block">{{ reserva.tipoEvento | titlecase }}</small>
                      </div>
                    </td>
                    <td>{{ reserva.paquete?.nombre }}</td>
                    <td class="date-cell">{{ reserva.fechaInicio | date:'dd/MM/yyyy' }}</td>
                    <td class="text-center">{{ reserva.numeroAsistentes }}</td>
                    <td>
                      <span class="badge-modern" [ngClass]="getEstadoBadge(reserva.estado)">
                        {{ reserva.estado | titlecase }}
                      </span>
                    </td>
                    <td class="amount-cell">
                      <strong>{{ reserva.precios?.total | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button 
                          type="button"
                          class="btn btn-sm btn-outline-primary" 
                          (click)="verReservaPaquete(reserva)"
                          title="Ver detalles">
                          👁️ Ver
                        </button>
                        <button 
                          *ngIf="reserva.estado === 'pendiente'"
                          type="button"
                          class="btn btn-sm btn-success" 
                          (click)="confirmarReservaPaquete(reserva)"
                          title="Confirmar reserva">
                          ✅ Confirmar
                        </button>
                        <button 
                          *ngIf="reserva.estado === 'pendiente'"
                          type="button"
                          class="btn btn-sm btn-danger" 
                          (click)="rechazarReservaPaquete(reserva)"
                          title="Rechazar reserva">
                          ❌ Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="reservasPaquetesFiltradas.length === 0">
                    <td colspan="9" class="text-center py-5">
                      <div class="no-data">
                        <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">No se encontraron reservas de paquetes</h5>
                        <p class="text-muted">No hay reservas de paquetes con los filtros aplicados</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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

    .d-flex.justify-content-between {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .header-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-left {
      flex: 1;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      color: #6b7280;
      font-size: 1rem;
      margin: 0;
      font-weight: 400;
    }

    .h2::before {
      font-family: "Font Awesome 6 Free";
      content: "\\f0cb";
      font-weight: 900;
      margin-right: 1rem;
      font-size: 2rem;
      color: #0A3161;
    }

    .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #8B2C6E;
      border: none;
      box-shadow: 0 4px 15px rgba(139, 44, 110, 0.3);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      background: #6B2454;
      box-shadow: 0 8px 25px rgba(139, 44, 110, 0.4);
    }

    .text-primary, .spinner-border.text-primary {
      color: #8B2C6E !important;
    }

    .spinner-border.text-primary {
      border-color: #8B2C6E;
      border-right-color: transparent;
    }

    .btn-modern {
      border-radius: 12px;
      font-weight: 600;
      padding: 12px 24px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .btn-primary.btn-modern {
      background: #8B2C6E;
      border: none;
      box-shadow: 0 4px 15px rgba(139, 44, 110, 0.3);
    }

    .btn-primary.btn-modern:hover {
      background: #6B2454;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 44, 110, 0.4);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(184, 151, 120, 0.2);
      transition: all 0.3s ease;
      border: 2px solid rgba(184, 151, 120, 0.3);
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(184, 151, 120, 0.3);
      border-color: #B89778;
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #0A3161;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      filter: drop-shadow(0 0 8px rgba(10, 49, 97, 0.4));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon i {
      font-size: 3rem;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      color: #1C2526;
      font-family: 'Cormorant Garamond', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .stat-label {
      color: #4A1B2F;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.875rem;
      font-family: 'Crimson Text', serif;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
    }

    .row.mb-3 {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .filters-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(10, 49, 97, 0.1);
    }

    .filters-row {
      display: flex;
      align-items: end;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-actions {
      display: flex;
      gap: 0.75rem;
      align-items: end;
    }

    .filter-actions .btn {
      min-width: 120px;
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .form-label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-select, .form-control {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-select:focus, .form-control:focus {
      border-color: #8B2C6E;
      box-shadow: 0 0 0 3px rgba(139, 44, 110, 0.1);
    }

    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
      width: 100%;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .table-section {
      width: 100%;
      margin-bottom: 2rem;
    }

    .table-card {
      width: 100%;
      max-width: 100%;
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
      font-family: "Font Awesome 6 Free";
      content: "\\f594";
      font-weight: 900;
      margin-right: 0.5rem;
      color: #0A3161;
    }

    /* Estilos para las pestañas */
    .tabs-section {
      margin: 2rem 0 1rem 0;
    }

    .tabs-container {
      display: flex;
      background: white;
      border-radius: 15px;
      padding: 0.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      gap: 0.5rem;
    }

    .tab-button {
      flex: 1;
      background: transparent;
      border: none;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      color: #64748b;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tab-button:hover {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      transform: translateY(-2px);
    }

    .tab-button.active {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .tab-button.active:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
    
    .table {
      margin: 0;
      width: 100%;
      table-layout: fixed;
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

    .table th:nth-child(1) { width: 8%; }   /* Código */
    .table th:nth-child(2) { width: 20%; }  /* Cliente */
    .table th:nth-child(3) { width: 12%; }  /* Hotel */
    .table th:nth-child(4) { width: 10%; }  /* Habitación */
    .table th:nth-child(5) { width: 10%; }  /* Check-in */
    .table th:nth-child(6) { width: 10%; }  /* Check-out */
    .table th:nth-child(7) { width: 10%; }  /* Estado */
    .table th:nth-child(8) { width: 10%; }  /* Total */
    .table th:nth-child(9) { width: 10%; }  /* Acciones */

    .table td {
      padding: 1.5rem 1rem;
      border: none;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
      word-wrap: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .table tbody tr:hover {
      background: linear-gradient(90deg, rgba(139, 44, 110, 0.05), rgba(107, 36, 84, 0.05));
      transform: scale(1.01);
      transition: all 0.3s ease;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      background: #8B2C6E;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .room-number {
      padding: 0.3rem 0.8rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 15px;
      font-weight: 600;
      font-size: 0.875rem;
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

    .bg-success {
      background: linear-gradient(135deg, #48bb78, #38a169) !important;
      color: white;
    }

    .bg-warning {
      background: linear-gradient(135deg, #ed8936, #dd6b20) !important;
      color: white;
    }

    .bg-danger {
      background: linear-gradient(135deg, #f56565, #e53e3e) !important;
      color: white;
    }

    .bg-secondary {
      background: linear-gradient(135deg, #a0aec0, #718096) !important;
      color: white;
    }
    
    .btn-group .btn {
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
      background: rgba(139, 44, 110, 0.1);
      color: #8B2C6E;
      border: none;
    }

    .btn-outline-primary:hover {
      background: rgba(139, 44, 110, 0.2);
      transform: scale(1.1);
      color: #6B2454;
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
      overflow-x: auto;
      overflow-y: visible;
      max-height: none;
      width: 100%;
    }

    .client-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 100%;
    }

    .client-details {
      flex: 1;
      min-width: 0;
    }

    .client-name {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .client-email {
      font-size: 0.8rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hotel-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date-cell {
      font-family: monospace;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .amount-cell {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      flex-wrap: nowrap;
    }

    .btn-action {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .btn-action-view {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .btn-action-view:hover {
      background: rgba(59, 130, 246, 0.2);
      transform: scale(1.1);
    }

    .btn-action-confirm {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .btn-action-confirm:hover {
      background: rgba(34, 197, 94, 0.2);
      transform: scale(1.1);
    }

    .btn-action-reject {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .btn-action-reject:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.1);
    }

    /* Animaciones de entrada */
    .card, .stat-card {
      animation: slideInUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    .stat-card:nth-child(2) { animation-delay: 0.1s; }
    .stat-card:nth-child(3) { animation-delay: 0.2s; }
    .stat-card:nth-child(4) { animation-delay: 0.3s; }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Efectos especiales */
    td strong {
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }

    @media (max-width: 768px) {
      .container-fluid {
        margin: -10px;
        padding: 10px;
      }

      .d-flex.justify-content-between {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .header-section {
        padding: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
      }

      .header-left {
        text-align: center;
      }

      .header-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .h2, .page-title {
        font-size: 2rem;
        justify-content: center;
      }

      .page-subtitle {
        text-align: center;
      }

      .stats-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-icon {
        font-size: 2rem;
      }

      .stat-icon i {
        font-size: 2rem;
      }

      .stat-number {
        font-size: 2rem;
      }

      .filters-container {
        padding: 1.5rem;
        margin: 0 -0.5rem;
      }

      .filters-row {
        flex-direction: column;
        gap: 1rem;
      }

      .filter-group {
        min-width: 100%;
      }

      .filter-actions {
        width: 100%;
        justify-content: space-between;
      }

      .filter-actions .btn {
        flex: 1;
        min-width: auto;
        max-width: 48%;
      }

      .row.mb-3 {
        margin-left: 0;
        margin-right: 0;
      }

      .table-responsive {
        border-radius: 0;
        overflow-x: auto;
      }
    .table-responsive {
      border-radius: 0 0 20px 20px;
      overflow-x: auto;
    }

      .table {
        min-width: 800px;
      }

      .table th, .table td {
        padding: 1rem 0.5rem;
        font-size: 0.875rem;
      }

      .client-info {
        gap: 0.5rem;
      }

      .avatar-circle {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }

      .btn-action {
        width: 30px;
        height: 30px;
        font-size: 0.75rem;
      }

      .action-buttons {
        gap: 0.2rem;
      }
    }

    @media (max-width: 992px) and (min-width: 769px) {
      .filters-row {
        flex-wrap: wrap;
      }

      .filter-group {
        min-width: calc(50% - 0.75rem);
      }

      .filter-actions {
        width: 100%;
        justify-content: center;
        margin-top: 1rem;
      }
    }

    @media (max-width: 576px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .filters-container {
        padding: 1.5rem;
        margin: 0 -0.5rem;
      }

      .filters-row {
        flex-direction: column;
        gap: 1rem;
      }

      .filter-group {
        min-width: 100%;
      }

      .filter-actions {
        width: 100%;
        justify-content: space-between;
      }

      .filter-actions .btn {
        flex: 1;
        min-width: auto;
        max-width: 48%;
      }

      .table th, .table td {
        padding: 1rem 0.5rem;
        font-size: 0.875rem;
      }

      .btn-group {
        flex-direction: column;
        gap: 0.25rem;
      }
    }

    /* Estilos del Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1040;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }

    .modal-content-custom {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalShow 0.3s ease-out;
    }

    @keyframes modalShow {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 1.5rem 0;
      padding: 2rem 2rem 0 2rem;
      display: flex;
      align-items: center;
    }

    .modal-view {
      padding: 0 2rem 2rem 2rem;
    }

    .modal-confirm {
      padding: 2rem;
    }

    .modal-reject {
      padding: 2rem;
    }

    .reservation-details {
      background: #f8fafc;
      border-radius: 15px;
      padding: 1.5rem;
      margin: 1rem 0;
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
      font-size: 0.875rem;
    }

    .detail-value {
      color: #2d3748;
      font-weight: 500;
    }

    .detail-value.code {
      font-family: 'Courier New', monospace;
      background: #e2e8f0;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .detail-value.total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #059669;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .confirm-message, .reject-message {
      margin: 1rem 0;
    }

    .form-group {
      margin: 1rem 0;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      outline: none;
    }
  `]
})
export class ReservasComponent implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  estadoFiltro = '';
  cargando = true;
  error = '';
  
  // Datos dinámicos
  totalReservas = 0;
  reservasConfirmadas = 0;
  reservasPendientes = 0;
  reservasCanceladas = 0;
  ingresosMes = 0;

  reservas: ReservaParaHotel[] = [];
  reservasFiltradas: ReservaParaHotel[] = [];

  // Reservas de paquetes
  reservasPaquetes: any[] = [];
  reservasPaquetesFiltradas: any[] = [];
  cargandoPaquetes = false;
  
  // Pestañas
  tabActiva: 'habitaciones' | 'paquetes' = 'habitaciones';

  // Modal para confirmación/rechazo
  modalVisible = false;
  modalTipo: 'confirmar' | 'rechazar' | 'ver' = 'ver';
  reservaSeleccionada: ReservaParaHotel | null = null;
  reservaPaqueteSeleccionada: any = null;
  motivoRechazo = '';
  notasHotel = '';

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarReservasPaquetes();
    this.configurarFechasPorDefecto();
  }

  configurarFechasPorDefecto(): void {
    const hoy = new Date();
    const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    this.fechaDesde = primerDiaDelMes.toISOString().split('T')[0];
    this.fechaHasta = ultimoDiaDelMes.toISOString().split('T')[0];
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';
    
    this.reservaService.obtenerTodasReservas().subscribe({
      next: (response) => {
        if (response.success && response.reservas) {
          this.procesarReservas(response.reservas);
          this.calcularEstadisticas();
          this.filtrarReservas();
        } else {
          this.error = 'No se pudieron cargar las reservas';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.error = 'Error de conexión al cargar las reservas';
        this.cargando = false;
      }
    });
  }

  procesarReservas(reservasRaw: any[]): void {
    this.reservas = reservasRaw.map(reserva => ({
      _id: reserva._id,
      codigoReserva: reserva.codigoReserva,
      cliente: `${reserva.datosHuesped.nombre} ${reserva.datosHuesped.apellido}`,
      email: reserva.datosHuesped.email,
      telefono: reserva.datosHuesped.telefono,
      hotel: reserva.hotel?.nombre || 'Hotel no especificado',
      habitacion: reserva.habitacion?.numero || reserva.salon?.nombre || 'N/A',
      checkIn: new Date(reserva.fechaInicio),
      checkOut: new Date(reserva.fechaFin),
      estado: reserva.estado as 'pendiente' | 'confirmada' | 'cancelada' | 'completada',
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

  calcularEstadisticas(): void {
    this.totalReservas = this.reservas.length;
    this.reservasConfirmadas = this.reservas.filter(r => r.estado === 'confirmada').length;
    this.reservasPendientes = this.reservas.filter(r => r.estado === 'pendiente').length;
    this.reservasCanceladas = this.reservas.filter(r => r.estado === 'cancelada').length;
    
    // Calcular ingresos del mes actual
    const hoy = new Date();
    const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    this.ingresosMes = this.reservas
      .filter(r => r.estado === 'confirmada' && 
                   r.fechaCreacion >= primerDiaDelMes && 
                   r.fechaCreacion <= ultimoDiaDelMes)
      .reduce((total, r) => total + r.total, 0);
  }

  // =====================================================
  // GESTIÓN DE RESERVAS DE PAQUETES
  // =====================================================

  cargarReservasPaquetes(): void {
    this.cargandoPaquetes = true;
    this.reservaService.obtenerReservasPaquetesHotel().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservasPaquetes = response.reservas;
          this.aplicarFiltrosPaquetes();
          console.log('📦 Reservas de paquetes cargadas:', this.reservasPaquetes.length);
        } else {
          console.error('Error en la respuesta:', response);
          this.error = 'Error al cargar reservas de paquetes';
        }
        this.cargandoPaquetes = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas de paquetes:', error);
        this.error = 'Error al cargar reservas de paquetes';
        this.cargandoPaquetes = false;
      }
    });
  }

  aplicarFiltrosPaquetes(): void {
    let filtradas = [...this.reservasPaquetes];
    
    // Filtrar por estado
    if (this.estadoFiltro) {
      filtradas = filtradas.filter(r => r.estado === this.estadoFiltro);
    }
    
    // Filtrar por fechas
    if (this.fechaDesde) {
      const fechaDesdeObj = new Date(this.fechaDesde);
      filtradas = filtradas.filter(r => new Date(r.fechaInicio) >= fechaDesdeObj);
    }
    
    if (this.fechaHasta) {
      const fechaHastaObj = new Date(this.fechaHasta);
      filtradas = filtradas.filter(r => new Date(r.fechaInicio) <= fechaHastaObj);
    }
    
    this.reservasPaquetesFiltradas = filtradas;
  }

  cambiarTab(tab: 'habitaciones' | 'paquetes'): void {
    this.tabActiva = tab;
    this.cerrarModal();
  }

  filtrarReservas(): void {
    let filtradas = [...this.reservas];
    
    // Filtrar por fechas si están definidas
    if (this.fechaDesde) {
      const fechaDesdeObj = new Date(this.fechaDesde);
      filtradas = filtradas.filter(r => r.checkIn >= fechaDesdeObj);
    }
    
    if (this.fechaHasta) {
      const fechaHastaObj = new Date(this.fechaHasta);
      filtradas = filtradas.filter(r => r.checkOut <= fechaHastaObj);
    }
    
    // Filtrar por estado
    if (this.estadoFiltro) {
      filtradas = filtradas.filter(r => r.estado === this.estadoFiltro);
    }
    
    this.reservasFiltradas = filtradas;
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'cancelada': return 'bg-danger';
      case 'completada': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  nuevaReserva(): void {
    console.log('Crear nueva reserva - funcionalidad por implementar');
    alert('Funcionalidad de crear nueva reserva por implementar');
  }

  verReserva(reserva: ReservaParaHotel): void {
    this.reservaSeleccionada = reserva;
    this.modalTipo = 'ver';
    this.modalVisible = true;
  }

  confirmarReserva(reserva: ReservaParaHotel): void {
    this.reservaSeleccionada = reserva;
    this.modalTipo = 'confirmar';
    this.notasHotel = '';
    this.modalVisible = true;
  }

  rechazarReserva(reserva: ReservaParaHotel): void {
    this.reservaSeleccionada = reserva;
    this.modalTipo = 'rechazar';
    this.motivoRechazo = '';
    this.notasHotel = '';
    this.modalVisible = true;
  }

  ejecutarConfirmacion(): void {
    if (!this.reservaSeleccionada) return;
    
    this.reservaService.confirmarReservaPendiente(this.reservaSeleccionada._id, this.notasHotel)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Reserva confirmada exitosamente');
            this.cerrarModal();
            this.cargarReservas();
          } else {
            alert(response.message || 'Error al confirmar la reserva');
          }
        },
        error: (err) => {
          console.error('Error al confirmar reserva:', err);
          alert('Error de conexión al confirmar la reserva');
        }
      });
  }

  ejecutarRechazo(): void {
    if (!this.reservaSeleccionada || !this.motivoRechazo.trim()) {
      alert('Debe proporcionar un motivo para el rechazo');
      return;
    }
    
    this.reservaService.rechazarReservaPendiente(
      this.reservaSeleccionada._id, 
      this.motivoRechazo, 
      this.notasHotel
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Reserva rechazada exitosamente');
          this.cerrarModal();
          this.cargarReservas();
        } else {
          alert(response.message || 'Error al rechazar la reserva');
        }
      },
      error: (err) => {
        console.error('Error al rechazar reserva:', err);
        alert('Error de conexión al rechazar la reserva');
      }
    });
  }

  // =====================================================
  // GESTIÓN DE MODALES PARA RESERVAS DE PAQUETES
  // =====================================================

  verReservaPaquete(reserva: any): void {
    alert('Ver reserva de paquete: ' + reserva.numeroReserva);
    console.log('👁️ Ver reserva de paquete:', reserva);
    this.reservaPaqueteSeleccionada = reserva;
    this.reservaSeleccionada = null;
    this.modalTipo = 'ver';
    this.modalVisible = true;
  }

  confirmarReservaPaquete(reserva: any): void {
    alert('Confirmar reserva de paquete: ' + reserva.numeroReserva);
    console.log('🔄 Confirmando reserva de paquete:', reserva);
    this.reservaPaqueteSeleccionada = reserva;
    this.reservaSeleccionada = null;
    this.modalTipo = 'confirmar';
    this.notasHotel = '';
    this.modalVisible = true;
    
    // Debug
    console.log('📋 Estado después de confirmar:', {
      modalVisible: this.modalVisible,
      modalTipo: this.modalTipo,
      reservaPaqueteSeleccionada: !!this.reservaPaqueteSeleccionada,
      reservaSeleccionada: !!this.reservaSeleccionada
    });
    
    // Forzar detección de cambios
    setTimeout(() => {
      console.log('⏰ Estado después de timeout:', {
        modalVisible: this.modalVisible,
        modalTipo: this.modalTipo
      });
    }, 100);
  }

  rechazarReservaPaquete(reserva: any): void {
    alert('Rechazar reserva de paquete: ' + reserva.numeroReserva);
    console.log('❌ Rechazar reserva de paquete:', reserva);
    this.reservaPaqueteSeleccionada = reserva;
    this.reservaSeleccionada = null;
    this.modalTipo = 'rechazar';
    this.motivoRechazo = '';
    this.notasHotel = '';
    this.modalVisible = true;
  }

  ejecutarConfirmacionPaquete(): void {
    console.log('✅ Ejecutando confirmación de paquete:', this.reservaPaqueteSeleccionada);
    if (!this.reservaPaqueteSeleccionada) {
      console.error('❌ No hay reserva de paquete seleccionada');
      return;
    }
    
    console.log('🌐 Llamando al servicio para confirmar:', this.reservaPaqueteSeleccionada._id);
    this.reservaService.confirmarReservaPaquete(this.reservaPaqueteSeleccionada._id, this.notasHotel)
      .subscribe({
        next: (response) => {
          console.log('📥 Respuesta del servidor:', response);
          if (response.success) {
            alert('Reserva de paquete confirmada exitosamente');
            this.cerrarModal();
            this.cargarReservasPaquetes();
          } else {
            alert(response.message || 'Error al confirmar la reserva de paquete');
          }
        },
        error: (err) => {
          console.error('💥 Error al confirmar reserva de paquete:', err);
          alert('Error de conexión al confirmar la reserva de paquete');
        }
      });
  }

  ejecutarRechazoPaquete(): void {
    if (!this.reservaPaqueteSeleccionada || !this.motivoRechazo.trim()) {
      alert('Por favor, ingrese el motivo del rechazo');
      return;
    }
    
    this.reservaService.rechazarReservaPaquete(this.reservaPaqueteSeleccionada._id, this.motivoRechazo, this.notasHotel)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Reserva de paquete rechazada exitosamente');
            this.cerrarModal();
            this.cargarReservasPaquetes();
          } else {
            alert(response.message || 'Error al rechazar la reserva de paquete');
          }
        },
        error: (err) => {
          console.error('Error al rechazar reserva de paquete:', err);
          alert('Error de conexión al rechazar la reserva de paquete');
        }
      });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.reservaSeleccionada = null;
    this.reservaPaqueteSeleccionada = null;
    this.motivoRechazo = '';
    this.notasHotel = '';
  }

  actualizarFiltros(): void {
    this.filtrarReservas();
    this.aplicarFiltrosPaquetes();
  }

  limpiarFiltros(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.estadoFiltro = '';
    this.configurarFechasPorDefecto();
    this.filtrarReservas();
    this.aplicarFiltrosPaquetes();
  }
}