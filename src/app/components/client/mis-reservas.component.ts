import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservaPaqueteService } from '../../services/reserva-paquete.service';
import { ReservaCreada, ReservaService } from '../../services/reserva.service';
import { ModalAsistentesComponent } from './modal-asistentes.component';

type EstadoFiltro = 'todas' | 'confirmada' | 'cancelada' | 'completada' | 'pendiente';
type TipoVista = 'habitaciones' | 'paquetes';

interface ReservaConAcciones extends ReservaCreada {
  puedeModificar?: boolean;
  horasHastaCheckIn?: number;
  puedeCancelar?: boolean;
}

@Component({
  selector: 'app-mis-reservas-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAsistentesComponent],
  template: `<ng-container>
    <!-- Esta es la sección específica de contenido que se mostrará dentro del dashboard -->
    <div class="client-reservas-container">
      <!-- Header -->
      <div class="header">
        <h1><i class="fas fa-calendar-check"></i> Mis Reservas</h1>
        <button class="btn-recargar" (click)="recargar()" [disabled]="cargando || cargandoPaquetes">
          <i class="fas fa-sync"></i> {{ (cargando || cargandoPaquetes) ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>

      <!-- Pestañas de tipo de reserva -->
      <div class="tabs-section">
        <button 
          class="tab-btn" 
          [class.activo]="vistaActual === 'habitaciones'"
          (click)="cambiarVista('habitaciones')">
          <i class="fas fa-hotel"></i> Habitaciones ({{ reservas.length }})
        </button>
        <button 
          *ngIf="esCliente === false"
          class="tab-btn" 
          [class.activo]="vistaActual === 'paquetes'"
          (click)="cambiarVista('paquetes')">
          <i class="fas fa-box"></i> Paquetes Corporativos ({{ reservasPaquetes.length }})
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filtros-section">
        <!-- Filtros por Estado -->
        <div class="filtros-estado">
          <button 
            class="filtro-btn" 
            [class.activo]="estadoFiltro === 'todas'"
            (click)="cambiarFiltro('todas')">
            Todas ({{ vistaActual === 'habitaciones' ? contarPorEstado('todas') : contarPaquetesPorEstado('todas') }})
          </button>
          <button 
            class="filtro-btn" 
            [class.activo]="estadoFiltro === 'confirmada'"
            (click)="cambiarFiltro('confirmada')">
            <i class="fas fa-check"></i> Confirmadas ({{ vistaActual === 'habitaciones' ? contarPorEstado('confirmada') : contarPaquetesPorEstado('confirmada') }})

          </button>
          <button 
            class="filtro-btn" 
            [class.activo]="estadoFiltro === 'pendiente'"
            (click)="cambiarFiltro('pendiente')">
            <i class="fas fa-hourglass-half"></i> Pendientes ({{ vistaActual === 'habitaciones' ? contarPorEstado('pendiente') : contarPaquetesPorEstado('pendiente') }})
          </button>
          <button 
            class="filtro-btn" 
            [class.activo]="estadoFiltro === 'cancelada'"
            (click)="cambiarFiltro('cancelada')">
            <i class="fas fa-times"></i> Canceladas ({{ vistaActual === 'habitaciones' ? contarPorEstado('cancelada') : contarPaquetesPorEstado('cancelada') }})
          </button>
          <button 
            class="filtro-btn" 
            [class.activo]="estadoFiltro === 'completada'"
            (click)="cambiarFiltro('completada')">
            <i class="fas fa-check-double"></i> Completadas ({{ vistaActual === 'habitaciones' ? contarPorEstado('completada') : contarPaquetesPorEstado('completada') }})
          </button>
        </div>

        <!-- Barra de Búsqueda -->
        <div class="busqueda">
          <input 
            type="text" 
            class="input-busqueda" 
            placeholder="Buscar por código, hotel o tipo de habitación..."
            [(ngModel)]="busquedaCodigo"
            (input)="buscar()">
          <button 
            class="btn-limpiar" 
            *ngIf="busquedaCodigo"
            (click)="limpiarBusqueda()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading">
        <div class="spinner"></div>
        <p>Cargando reservas...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !cargando" class="error-message">
        <p><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
        <button class="btn-reintentar" (click)="recargar()">Reintentar</button>
      </div>
      
      <!-- Lista Vacía - Habitaciones -->
      <div *ngIf="vistaActual === 'habitaciones' && !cargando && !error && reservasFiltradas.length === 0" class="lista-vacia">
        <div class="icono-vacio"><i class="fas fa-inbox"></i></div>
        <h3>No hay reservas de habitaciones</h3>
        <p *ngIf="busquedaCodigo">No se encontraron resultados para "{{ busquedaCodigo }}"</p>
        <p *ngIf="!busquedaCodigo && estadoFiltro !== 'todas'">
          No tienes reservas de habitaciones en estado "{{ estadoFiltro }}"
        </p>
        <p *ngIf="!busquedaCodigo && estadoFiltro === 'todas'">
          Aún no has realizado ninguna reserva de habitación.
        </p>
        <div class="info-filtro">
          <small><i class="fas fa-lightbulb"></i> Se muestran solo las reservas más recientes con datos completos</small>
        </div>
        <button class="btn-buscar-habitaciones" (click)="irABuscar()">
          <i class="fas fa-search"></i> Buscar Habitaciones
        </button>
      </div>

      <!-- Lista Vacía - Paquetes -->
      <div *ngIf="vistaActual === 'paquetes' && !cargandoPaquetes && !error && reservasPaquetesFiltradas.length === 0" class="lista-vacia">
        <div class="icono-vacio"><i class="fas fa-box-open"></i></div>
        <h3>No hay reservas de paquetes</h3>
        <p *ngIf="busquedaCodigo">No se encontraron resultados para "{{ busquedaCodigo }}"</p>
        <p *ngIf="!busquedaCodigo && estadoFiltro !== 'todas'">
          No tienes reservas de paquetes en estado "{{ estadoFiltro }}"
        </p>
        <p *ngIf="!busquedaCodigo && estadoFiltro === 'todas'">
          Aún no has realizado ninguna reserva de paquete corporativo.
        </p>
        <button class="btn-buscar-habitaciones" (click)="irAPaquetes()">
          <i class="fas fa-cube"></i> Ver Paquetes Disponibles
        </button>
      </div>

      <!-- Lista de Reservas de Habitaciones -->
      <div *ngIf="vistaActual === 'habitaciones' && !cargando && !error && reservasFiltradas.length > 0" class="reservas-grid">
        <div *ngFor="let reserva of reservasFiltradas" class="reserva-card">
          <!-- Header de Card -->
          <div class="card-header">
            <div class="codigo-estado">
              <span class="codigo">{{ reserva.codigoReserva }}</span>
              <span class="estado-badge" [ngClass]="getEstadoClase(reserva.estado)">
                {{ getEstadoIcono(reserva.estado) }} {{ reserva.estado }}
              </span>
            </div>
            <div class="tiempo-restante" *ngIf="reserva.estado === 'confirmada' && reserva.horasHastaCheckIn && reserva.horasHastaCheckIn > 0">
              <i class="fas fa-clock"></i> {{ getTiempoRestante(reserva) }}
            </div>
          </div>

          <!-- Información Principal -->
          <div class="card-body">
            <!-- Hotel y Habitación -->
            <div class="info-principal">
              <h3 class="hotel-nombre"><i class="fas fa-hotel"></i> {{ reserva.hotel.nombre }}</h3>
              <p class="hotel-ubicacion"><i class="fas fa-map-marker-alt"></i> {{ reserva.hotel.ciudad }}, {{ reserva.hotel.departamento }}</p>
              <p class="habitacion-tipo"><i class="fas fa-bed"></i> {{ reserva.habitacion.tipo }} - Habitación {{ reserva.habitacion.numero }}</p>
            </div>

            <!-- Fechas -->
            <div class="info-fechas">
              <div class="fecha-item">
                <span class="fecha-label">Check-in:</span>
                <span class="fecha-valor">{{ formatearFecha(reserva.fechaInicio) }}</span>
              </div>
              <div class="fecha-item">
                <span class="fecha-label">Check-out:</span>
                <span class="fecha-valor">{{ formatearFecha(reserva.fechaFin) }}</span>
              </div>
              <div class="fecha-item">
                <span class="fecha-label">Noches:</span>
                <span class="fecha-valor">{{ reserva.noches }}</span>
              </div>
            </div>

            <!-- Tarifa -->
            <div class="info-tarifa">
              <div class="tarifa-total">
                <span class="tarifa-label">Total:</span>
                <span class="tarifa-valor">{{ formatearPrecio(reserva.tarifa.total) }}</span>
              </div>
            </div>

            <!-- Alertas de Acción -->
            <div class="alertas" *ngIf="reserva.estado === 'confirmada'">
              <!-- Alerta: No puede modificar (< 24h) -->
              <div class="alerta alerta-warning" *ngIf="!reserva.puedeModificar && reserva.horasHastaCheckIn && reserva.horasHastaCheckIn < 24 && reserva.horasHastaCheckIn > 0">
                <i class="fas fa-exclamation-triangle"></i> No puedes modificar esta reserva (faltan menos de 24h para el check-in)
              </div>

              <!-- Alerta: Puede modificar -->
              <div class="alerta alerta-info" *ngIf="reserva.puedeModificar">
                <i class="fas fa-info-circle"></i> Puedes modificar las fechas hasta 24h antes del check-in
              </div>
            </div>
          </div>

          <!-- Footer de Card: Botones de Acción -->
          <div class="card-footer">
            <!-- HU11: Botón Descargar Recibo -->
            <button 
              class="btn btn-recibo" 
              *ngIf="reserva.estado === 'confirmada' || reserva.estado === 'completada'"
              (click)="verRecibo(reserva)"
              title="Ver y descargar recibo de pago">
              <i class="fas fa-file-invoice"></i> Ver Recibo
            </button>

            <button class="btn btn-secondary" (click)="verDetalle(reserva)">
              <i class="fas fa-eye"></i> Ver Detalle
            </button>

            <!-- HU09: Botón Modificar Fechas -->
            <button 
              class="btn btn-primary" 
              *ngIf="reserva.estado === 'confirmada'"
              [disabled]="!reserva.puedeModificar"
              [title]="!reserva.puedeModificar ? 'No se puede modificar esta reserva' : 'Modificar fechas de la reserva'"
              (click)="modificarFechas(reserva)">
              <i class="fas fa-calendar-alt"></i> Modificar
            </button>

            <!-- HU10: Botón Cancelar -->
            <button 
              class="btn btn-danger" 
              *ngIf="reserva.estado === 'confirmada'"
              [disabled]="!reserva.puedeCancelar"
              [title]="!reserva.puedeCancelar ? 'No se puede cancelar esta reserva' : 'Cancelar reserva'"
              (click)="abrirModalCancelar(reserva)">
              <i class="fas fa-times"></i> Cancelar
            </button>

            <!-- Estado no permite acciones -->
            <span class="sin-acciones" *ngIf="reserva.estado !== 'confirmada' && reserva.estado !== 'completada'">
              {{ reserva.estado === 'cancelada' ? 'Reserva cancelada' : 'Reserva en proceso' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Lista de Reservas de Paquetes -->
      <div *ngIf="vistaActual === 'paquetes' && !cargandoPaquetes && !error && reservasPaquetesFiltradas.length > 0" class="reservas-grid">
        <div *ngFor="let reserva of reservasPaquetesFiltradas" class="reserva-card paquete-card">
          <!-- Header de Card -->
          <div class="card-header">
            <div class="codigo-estado">
              <span class="codigo">{{ reserva.numeroReserva }}</span>
              <span class="estado-badge" [ngClass]="getEstadoClase(reserva.estado)">
                {{ getEstadoIcono(reserva.estado) }} {{ reserva.estado }}
              </span>
            </div>
            <div class="tipo-evento">
              <i class="fas fa-clipboard-list"></i> {{ reserva.tipoEvento }}
            </div>
          </div>

          <!-- Información Principal -->
          <div class="card-body">
            <!-- Evento y Empresa -->
            <div class="info-principal">
              <h3 class="evento-nombre"><i class="fas fa-bullseye"></i> {{ reserva.nombreEvento }}</h3>
              <p class="empresa-nombre"><i class="fas fa-building"></i> {{ reserva.datosEmpresa?.razonSocial }}</p>
              <p class="hotel-ubicacion"><i class="fas fa-map-marker-alt"></i> Hotel: {{ reserva.paquete?.hotel?.nombre }} - {{ reserva.paquete?.hotel?.ciudad }}</p>
            </div>

            <!-- Fechas -->
            <div class="info-fechas">
              <div class="fecha-item">
                <span class="fecha-label"><i class="fas fa-calendar-day"></i> Fecha del Evento:</span>
                <span class="fecha-valor">{{ formatearFecha(reserva.fechaInicio) }}</span>
              </div>
              <!-- Asistentes section removed -->
            </div>

            <!-- Información Adicional -->
            <div class="info-adicional">
              <div class="info-item">
                <span class="info-label"><i class="fas fa-envelope"></i> Email:</span>
                <span class="info-valor">{{ reserva.datosEmpresa?.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label"><i class="fas fa-phone"></i> Teléfono:</span>
                <span class="info-valor">{{ reserva.datosEmpresa?.telefono }}</span>
              </div>
            </div>

            <!-- Precio Total -->
            <div class="precio-total" *ngIf="reserva.precios?.total">
              <span class="precio-label">Total:</span>
              <span class="precio-valor">{{ formatearPrecio(reserva.precios.total) }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="card-actions">
            <button 
              class="btn btn-outline-primary btn-sm"
              [title]="'Ver detalles completos de la reserva ' + reserva.numeroReserva"
              (click)="verDetallePaquete(reserva)">
              <i class="fas fa-eye"></i> Ver Detalles
            </button>

            <button 
              *ngIf="reserva.estado === 'confirmada'"
              class="btn btn-outline-success btn-sm"
              [title]="'Gestionar asistentes de la reserva ' + reserva.numeroReserva"
              (click)="gestionarAsistentes(reserva)">
              <i class="fas fa-users"></i> Gestionar asistentes
            </button>

            <button 
              *ngIf="reserva.estado === 'confirmada'"
              class="btn btn-outline-warning btn-sm"
              [title]="'Modificar reserva ' + reserva.numeroReserva"
              (click)="modificarPaquete(reserva)">
              <i class="fas fa-pencil-alt"></i> Modificar
            </button>

            <button 
              *ngIf="reserva.estado === 'confirmada'"
              class="btn btn-outline-danger btn-sm"
              [title]="'Cancelar reserva ' + reserva.numeroReserva"
              (click)="cancelarPaquete(reserva)">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Asistentes para paquetes corporativos -->
      <app-modal-asistentes
        *ngIf="mostrarModalAsistentes && reservaIdAsistentes"
        [numeroReserva]="reservaIdAsistentes"
        (cerrar)="cerrarModalAsistentes()">
      </app-modal-asistentes>

      <!-- Modal de Cancelación -->
      <div class="modal-overlay" *ngIf="mostrarModalCancelar" (click)="cerrarModalCancelar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-ban"></i> Cancelar Reserva</h2>
            <button class="btn-cerrar-modal" (click)="cerrarModalCancelar()"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-body">
            <!-- HU10: Loading mientras verifica políticas -->
            <div *ngIf="verificandoPoliticas" class="modal-loading">
              <div class="spinner-small"></div>
              <p>Verificando políticas de cancelación...</p>
            </div>

            <!-- Contenido del modal cuando ya se verificaron políticas -->
            <div *ngIf="!verificandoPoliticas && politicaCancelacion">
              <p class="modal-advertencia">
                <i class="fas fa-exclamation-triangle"></i> Estás a punto de cancelar la siguiente reserva:
              </p>

              <div class="reserva-resumen" *ngIf="reservaACancelar">
                <p><strong>Código:</strong> {{ reservaACancelar.codigoReserva }}</p>
                <p><strong>Hotel:</strong> {{ reservaACancelar.hotel.nombre }}</p>
                <p><strong>Habitación:</strong> {{ reservaACancelar.habitacion.tipo }}</p>
                <p><strong>Fechas:</strong> {{ formatearFecha(reservaACancelar.fechaInicio) }} - {{ formatearFecha(reservaACancelar.fechaFin) }}</p>
                <p><strong>Total pagado:</strong> {{ formatearPrecio(reservaACancelar.tarifa.total) }}</p>
              </div>

              <!-- HU10 CA1 + CA2: Información de Penalización -->
              <div class="politica-cancelacion">
                <h4><i class="fas fa-clipboard-list"></i> Política de Cancelación</h4>
                
                <!-- CA1: Cancelación Gratuita -->
                <div *ngIf="politicaCancelacion.dentroVentanaGratuita" class="alerta alerta-success">
                  <strong><i class="fas fa-check-circle"></i> Cancelación Gratuita</strong>
                  <p>{{ politicaCancelacion.mensaje }}</p>
                  <div class="detalle-reembolso">
                    <span>Reembolso completo:</span>
                    <strong class="monto-reembolso">{{ formatearPrecio(politicaCancelacion.montoReembolso) }}</strong>
                  </div>
                </div>

                <!-- CA2: Con Penalización -->
                <div *ngIf="!politicaCancelacion.dentroVentanaGratuita" class="alerta alerta-warning-penalizacion">
                  <strong><i class="fas fa-exclamation-triangle"></i> Penalización Aplicable</strong>
                  <p>{{ politicaCancelacion.mensaje }}</p>
                  
                  <div class="desglose-penalizacion">
                    <div class="linea-desglose">
                      <span>Total pagado:</span>
                      <span>{{ formatearPrecio(reservaACancelar?.tarifa?.total || 0) }}</span>
                    </div>
                    <div class="linea-desglose penalizacion">
                      <span>Penalización ({{ politicaCancelacion.porcentajePenalizacion }}%):</span>
                      <span class="monto-negativo">-{{ formatearPrecio(politicaCancelacion.montoPenalizacion) }}</span>
                    </div>
                    <div class="linea-desglose total-reembolso">
                      <span><strong>Reembolso:</strong></span>
                      <strong class="monto-reembolso">{{ formatearPrecio(politicaCancelacion.montoReembolso) }}</strong>
                    </div>
                  </div>

                  <!-- CA2: Checkbox de confirmación de penalización -->
                  <div class="confirmacion-penalizacion">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="aceptaPenalizacion"
                        [disabled]="cancelando">
                      <span>Acepto la penalización del {{ politicaCancelacion.porcentajePenalizacion }}% y entiendo que recibiré {{ formatearPrecio(politicaCancelacion.montoReembolso) }} de reembolso.</span>
                    </label>
                  </div>
                </div>

                <!-- Información adicional -->
                <div class="info-tiempo">
                  <p><strong><i class="fas fa-clock"></i> Tiempo hasta check-in:</strong> {{ politicaCancelacion.horasHastaCheckIn }} horas ({{ politicaCancelacion.diasHastaCheckIn }} días)</p>
                </div>

                <div class="detalles-politica">
                  <p class="titulo-detalles"><strong>Ventanas de cancelación:</strong></p>
                  <ul>
                    <li>{{ politicaCancelacion.detalles.ventanaGratuita }}: Sin penalización</li>
                    <li>{{ politicaCancelacion.detalles.penalizacion50 }}: 50% de penalización</li>
                    <li>{{ politicaCancelacion.detalles.penalizacion100 }}: 100% de penalización</li>
                  </ul>
                </div>
              </div>

              <!-- Motivo de cancelación -->
              <div class="form-group">
                <label for="motivoCancelacion">Motivo de la cancelación: *</label>
                <textarea 
                  id="motivoCancelacion"
                  class="textarea-motivo"
                  [(ngModel)]="motivoCancelacion"
                  placeholder="Por favor, indica el motivo de la cancelación..."
                  rows="3"
                  [disabled]="cancelando"></textarea>
              </div>

              <!-- HU10 CA4: Nota sobre notificación -->
              <p class="modal-nota">
                <i class="fas fa-info-circle"></i> Recibirás un correo electrónico de confirmación con los detalles de la cancelación.
              </p>
            </div>
          </div>

          <div class="modal-footer" *ngIf="!verificandoPoliticas">
            <button 
              class="btn btn-secondary" 
              (click)="cerrarModalCancelar()"
              [disabled]="cancelando">
              Volver
            </button>
            <button 
              class="btn btn-danger" 
              (click)="confirmarCancelacion()"
              [disabled]="cancelando || !motivoCancelacion.trim() || (politicaCancelacion && politicaCancelacion.montoPenalizacion > 0 && !aceptaPenalizacion)">
              {{ cancelando ? 'Cancelando...' : 'Confirmar Cancelación' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </ng-container>`,
  styles: [`
    /* Contenedor principal */
    .client-reservas-container {
      padding: 20px;
      max-width: 100%;
      margin: 0 auto;
      height: 100%;
      min-height: calc(100vh - 70px);
      overflow-y: auto !important;
      scrollbar-width: thin !important;
      scrollbar-color: rgba(102, 126, 234, 0.5) rgba(248, 249, 250, 0.6) !important;
    }
    
    .client-reservas-container::-webkit-scrollbar {
      width: 8px !important;
      display: block !important;
    }
    
    .client-reservas-container::-webkit-scrollbar-track {
      background: rgba(248, 249, 250, 0.6) !important;
      border-radius: 10px !important;
    }
    
    .client-reservas-container::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.5) !important;
      border-radius: 10px !important;
    }
    
    .client-reservas-container::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 126, 234, 0.7) !important;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header h1 i {
      color: #667eea;
    }

    .btn-recargar {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #f5f5f5;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      color: #555;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-recargar:hover {
      background-color: #e0e0e0;
    }

    .btn-recargar:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-recargar i {
      font-size: 14px;
    }

    /* Pestañas */
    .tabs-section {
      display: flex;
      margin-bottom: 20px;
      gap: 10px;
    }

    .tab-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      background-color: #f5f5f5;
      color: #666;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn i {
      font-size: 16px;
    }

    .tab-btn.activo {
      background-color: #667eea;
      color: white;
    }

    .tab-btn:hover:not(.activo) {
      background-color: #e0e0e0;
    }

    /* Filtros y Búsqueda */
    .filtros-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #e9ecef;
    }

    .filtros-estado {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filtro-btn {
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background-color: white;
      color: #555;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .filtro-btn i {
      font-size: 12px;
    }

    .filtro-btn.activo {
      background-color: #667eea;
      border-color: #5a6ebd;
      color: white;
    }

    .filtro-btn:hover:not(.activo) {
      background-color: #f1f3f5;
    }

    .busqueda {
      position: relative;
      max-width: 500px;
    }

    .input-busqueda {
      width: 100%;
      padding: 10px 16px;
      padding-right: 40px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      font-size: 14px;
    }

    .btn-limpiar {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #adb5bd;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-limpiar:hover {
      color: #495057;
    }

    /* Loading */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(102, 126, 234, 0.2);
      border-left-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error */
    .error-message {
      background-color: #fff5f5;
      color: #c53030;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 20px;
    }

    .error-message p {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-reintentar {
      background-color: #c53030;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-reintentar:hover {
      background-color: #9b2c2c;
    }

    /* Lista Vacía */
    .lista-vacia {
      background-color: #f8f9fa;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .icono-vacio {
      font-size: 60px;
      color: #adb5bd;
      margin-bottom: 20px;
    }

    .icono-vacio i {
      font-size: 60px;
    }

    .lista-vacia h3 {
      color: #495057;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .lista-vacia p {
      color: #6c757d;
      margin-bottom: 8px;
    }

    .info-filtro {
      margin: 12px 0;
    }

    .info-filtro small {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6c757d;
    }

    .btn-buscar-habitaciones {
      margin-top: 16px;
      background-color: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-buscar-habitaciones:hover {
      background-color: #5a6ebd;
      transform: translateY(-2px);
    }

    /* Grid de Reservas */
    .reservas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    /* Card de Reserva */
    .reserva-card {
      background-color: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .reserva-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      padding: 16px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .codigo-estado {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .codigo {
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .estado-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .estado-confirmada {
      background-color: #d4edda;
      color: #28a745;
    }

    .estado-pendiente {
      background-color: #fff3cd;
      color: #ffc107;
    }

    .estado-cancelada {
      background-color: #f8d7da;
      color: #dc3545;
    }

    .estado-completada {
      background-color: #e2e3e5;
      color: #6c757d;
    }

    .tiempo-restante {
      background-color: #e2e3e5;
      color: #495057;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tiempo-restante i {
      font-size: 12px;
    }

    .card-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-principal {
      margin-bottom: 8px;
    }

    .hotel-nombre {
      font-size: 16px;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hotel-ubicacion,
    .habitacion-tipo {
      font-size: 14px;
      color: #6c757d;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-fechas {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px;
      background-color: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .fecha-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 90px;
    }

    .fecha-label {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }

    .fecha-valor {
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }

    .info-tarifa {
      margin-top: auto;
    }

    .tarifa-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background-color: #f1f3f5;
      border-radius: 8px;
    }

    .tarifa-label {
      font-size: 14px;
      color: #495057;
      font-weight: 500;
    }

    .tarifa-valor {
      font-size: 16px;
      color: #212529;
      font-weight: 700;
    }

    .alertas {
      margin-top: 12px;
    }

    .alerta {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .alerta i {
      margin-top: 2px;
    }

    .alerta-warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .alerta-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .card-footer {
      padding: 16px;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn i {
      font-size: 14px;
    }

    .btn-recibo {
      background-color: #f8f9fa;
      color: #495057;
      border: 1px solid #ced4da;
    }

    .btn-recibo:hover {
      background-color: #e9ecef;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background-color: #5a6ebd;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .sin-acciones {
      font-size: 14px;
      color: #6c757d;
      font-style: italic;
      margin-right: auto;
    }

    /* Paquetes */
    .paquete-card {
      border-left: 4px solid #667eea;
    }

    .tipo-evento {
      font-size: 13px;
      color: #667eea;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .evento-nombre {
      font-size: 16px;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empresa-nombre {
      font-size: 14px;
      color: #495057;
      font-weight: 500;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-adicional {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
      color: #6c757d;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-label {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .precio-total {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #dee2e6;
    }

    .precio-label {
      font-size: 14px;
      color: #495057;
      font-weight: 600;
    }

    .precio-valor {
      font-size: 16px;
      color: #212529;
      font-weight: 700;
    }

    .card-actions {
      padding: 12px 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .btn-outline-primary {
      background-color: transparent;
      border: 1px solid #667eea;
      color: #667eea;
    }

    .btn-outline-primary:hover {
      background-color: #667eea;
      color: white;
    }

    .btn-outline-warning {
      background-color: transparent;
      border: 1px solid #ffc107;
      color: #856404;
    }

    .btn-outline-warning:hover {
      background-color: #ffc107;
      color: #212529;
    }

    .btn-outline-danger {
      background-color: transparent;
      border: 1px solid #dc3545;
      color: #dc3545;
    }

    .btn-outline-danger:hover {
      background-color: #dc3545;
      color: white;
    }

    /* Modal de Cancelación */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #dc3545;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-cerrar-modal {
      background: none;
      border: none;
      color: #6c757d;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .btn-cerrar-modal:hover {
      background-color: #f8f9fa;
      color: #495057;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 0;
      gap: 16px;
    }

    .spinner-small {
      width: 30px;
      height: 30px;
      border: 3px solid rgba(102, 126, 234, 0.2);
      border-left-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .modal-advertencia {
      color: #721c24;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .reserva-resumen {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .reserva-resumen p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .politica-cancelacion {
      margin-bottom: 20px;
    }

    .politica-cancelacion h4 {
      margin: 0 0 12px 0;
      color: #495057;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .alerta-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }

    .alerta-success strong {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .alerta-warning-penalizacion {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }

    .alerta-warning-penalizacion strong {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .detalle-reembolso {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed rgba(0, 0, 0, 0.1);
    }

    .monto-reembolso {
      font-size: 16px;
      color: #28a745;
    }

    .desglose-penalizacion {
      margin-top: 12px;
      background-color: rgba(255, 255, 255, 0.7);
      padding: 10px;
      border-radius: 6px;
    }

    .linea-desglose {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .penalizacion {
      color: #dc3545;
    }

    .monto-negativo {
      color: #dc3545;
      font-weight: 600;
    }

    .total-reembolso {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      font-weight: 600;
    }

    .confirmacion-penalizacion {
      margin-top: 12px;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      margin-top: 2px;
    }

    .checkbox-label span {
      font-size: 14px;
    }

    .info-tiempo {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin: 12px 0;
    }

    .info-tiempo p {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detalles-politica {
      font-size: 14px;
      color: #6c757d;
      margin-top: 12px;
    }

    .titulo-detalles {
      margin: 0 0 8px 0;
    }

    .detalles-politica ul {
      margin: 0;
      padding-left: 20px;
    }

    .detalles-politica li {
      margin-bottom: 4px;
    }

    .form-group {
      margin: 16px 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .textarea-motivo {
      width: 100%;
      padding: 10px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
    }

    .modal-nota {
      font-size: 13px;
      color: #6c757d;
      margin: 12px 0 0 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .modal-footer {
      padding: 16px;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .filtros-section {
        gap: 12px;
        padding: 12px;
      }
      
      .filtros-estado {
        overflow-x: auto;
        padding-bottom: 4px;
        flex-wrap: nowrap;
      }
      
      .filtro-btn {
        white-space: nowrap;
      }
      
      .reservas-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MisReservasClientComponent implements OnInit {
  mostrarModalAsistentes: boolean = false;
  reservaIdAsistentes: string | null = null;
  // Tipo de vista actual
  vistaActual: TipoVista = 'habitaciones';
  
  // Reservas de habitaciones
  reservas: ReservaConAcciones[] = [];
  reservasFiltradas: ReservaConAcciones[] = [];
  
  // Reservas de paquetes
  reservasPaquetes: any[] = [];
  reservasPaquetesFiltradas: any[] = [];
  
  // Filtros
  estadoFiltro: EstadoFiltro = 'todas';
  busquedaCodigo = '';
  
  // Estados de carga
  cargando = true;
  cargandoPaquetes = false;
  error = '';
  
  // Modal de cancelación (HU10)
  mostrarModalCancelar = false;
  reservaACancelar: ReservaConAcciones | null = null;
  motivoCancelacion = '';
  cancelando = false;
  
  // HU10: Información de penalización
  verificandoPoliticas = false;
  politicaCancelacion: any = null;
  aceptaPenalizacion = false;
  
  // Control de vista según tipo de usuario
  esCliente = true;

  constructor(
    private reservaService: ReservaService,
    private reservaPaqueteService: ReservaPaqueteService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // Determinar tipo de usuario
    const currentUser = this.authService.getCurrentUser();
    const tipoUsuario = currentUser?.tipo?.toLowerCase() || 'cliente';
    this.esCliente = tipoUsuario === 'cliente';
    
    // console.log('🔍 Debug: Tipo de usuario:', tipoUsuario, 'Es cliente:', this.esCliente);
    // console.log('🎯 BOTONES ACTUALIZADOS - VERSION 2025-10-07');
    
    // Cargar reservas de habitaciones siempre
    this.cargarReservas();
    
    // Cargar paquetes solo si no es cliente
    if (!this.esCliente) {
      // console.log('🔄 Cargando paquetes para empresa...');
      this.cargarReservasPaquetes();
    }
  }

  /**
   * Cargar todas las reservas del usuario
   * Nota: En producción, esto debería filtrar por usuario autenticado
   */
  private cargarReservas(): void {
    this.cargando = true;
    this.error = '';

    // Usar el nuevo servicio que filtra las reservas
    this.reservaService.obtenerMisReservas().subscribe({
      next: (response: any) => {
        // Filtrar reservas con datos completos
        this.reservas = (response.reservas || []).filter((reserva: any) => 
          reserva && 
          reserva.datosHuesped && 
          reserva.datosHuesped.nombre && 
          reserva.habitacion && 
          reserva.hotel &&
          reserva.codigoReserva
        );
        
        // Verificar acciones disponibles para cada reserva
        this.reservas.forEach(reserva => {
          this.verificarAccionesDisponibles(reserva);
        });

        this.aplicarFiltros();
        this.cargando = false;
        
        // console.log('Reservas cargadas:', this.reservas.length);
      },
      error: (err: any) => {
        console.error('Error al cargar reservas:', err);
        this.error = 'No se pudieron cargar las reservas. Por favor, intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  /**
   * Cargar reservas de paquetes del usuario
   */
  cargarReservasPaquetes(): void {
    this.cargandoPaquetes = true;
    this.reservaPaqueteService.listarMisReservasPaquetes().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservasPaquetes = response.reservas;
          this.aplicarFiltrosPaquetes();
        } else {
          console.error('Error en la respuesta:', response);
          this.error = 'Error al cargar reservas de paquetes';
        }
        this.cargandoPaquetes = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas de paquetes:', error);
        this.error = 'No se pudieron cargar las reservas de paquetes. Por favor, intenta de nuevo.';
        this.cargandoPaquetes = false;
      }
    });
  }

  /**
   * Verificar qué acciones puede realizar sobre la reserva
   */
  private verificarAccionesDisponibles(reserva: ReservaConAcciones): void {
    // Calcular horas hasta check-in
    const ahora = new Date();
    const fechaInicio = new Date(reserva.fechaInicio);
    const horasHastaCheckIn = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    reserva.horasHastaCheckIn = horasHastaCheckIn;
    
    // CA1 + CA4: Puede modificar si estado=confirmada y >= 24h
    reserva.puedeModificar = 
      reserva.estado === 'confirmada' && 
      horasHastaCheckIn >= 24;
    
    // Puede cancelar si estado=confirmada y no ha pasado el check-in
    reserva.puedeCancelar = 
      reserva.estado === 'confirmada' && 
      horasHastaCheckIn > 0;
  }

  /**
   * Aplicar filtros de estado y búsqueda
   */
  aplicarFiltros(): void {
    if (this.vistaActual === 'habitaciones') {
      this.aplicarFiltrosHabitaciones();
    } else {
      this.aplicarFiltrosPaquetes();
    }
  }

  /**
   * Aplicar filtros para habitaciones
   */
  aplicarFiltrosHabitaciones(): void {
    let resultado = [...this.reservas];

    // Filtro por estado
    if (this.estadoFiltro !== 'todas') {
      resultado = resultado.filter(r => r.estado === this.estadoFiltro);
    }

    // Filtro por código (búsqueda)
    if (this.busquedaCodigo.trim()) {
      const busqueda = this.busquedaCodigo.trim().toLowerCase();
      resultado = resultado.filter(r => 
        r.codigoReserva.toLowerCase().includes(busqueda) ||
        r.hotel.nombre.toLowerCase().includes(busqueda) ||
        r.habitacion.tipo.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar por fecha de check-in (más reciente primero)
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaInicio).getTime();
      const fechaB = new Date(b.fechaInicio).getTime();
      return fechaB - fechaA;
    });

    this.reservasFiltradas = resultado;
  }

  /**
   * Cambiar filtro de estado
   */
  cambiarFiltro(estado: EstadoFiltro): void {
    this.estadoFiltro = estado;
    this.aplicarFiltros();
  }

  /**
   * Búsqueda por código
   */
  buscar(): void {
    this.aplicarFiltros();
  }

  /**
   * Limpiar búsqueda
   */
  limpiarBusqueda(): void {
    this.busquedaCodigo = '';
    this.aplicarFiltros();
  }

  /**
   * Navegar a detalle de reserva
   */
  verDetalle(reserva: ReservaConAcciones): void {
    // Verificar si estamos en el contexto del dashboard para mantener el layout
    if (this.router.url.includes('/dashboard')) {
      // Redirigir manteniendo el contexto del dashboard
      this.router.navigate(['/dashboard/detalle-reserva', reserva.codigoReserva]);
    } else {
      // Redirigir a la vista standalone
      this.router.navigate(['/detalle-reserva', reserva.codigoReserva]);
    }
  }

  /**
   * HU11: Navegar a ver recibo
   */
  verRecibo(reserva: ReservaConAcciones): void {
    // Verificar si estamos en el contexto del dashboard para mantener el layout
    if (this.router.url.includes('/dashboard')) {
      // Redirigir manteniendo el contexto del dashboard
      this.router.navigate(['/dashboard/recibo', reserva._id]);
    } else {
      // Redirigir a la vista standalone
      this.router.navigate(['/recibo', reserva._id]);
    }
  }

  /**
   * Navegar a modificar fechas (HU09)
   */
  modificarFechas(reserva: ReservaConAcciones): void {
    if (!reserva.puedeModificar) {
      alert('No se puede modificar esta reserva en este momento.');
      return;
    }
    // Navegar usando el código de reserva
    this.router.navigate(['/modificar-reserva', reserva.codigoReserva]);
  }

  /**
   * HU10: Abrir modal de cancelación y verificar políticas
   */
  abrirModalCancelar(reserva: ReservaConAcciones): void {
    if (!reserva.puedeCancelar) {
      alert('No se puede cancelar esta reserva.');
      return;
    }
    
    this.reservaACancelar = reserva;
    this.motivoCancelacion = '';
    this.politicaCancelacion = null;
    this.aceptaPenalizacion = false;
    this.mostrarModalCancelar = true;
    this.verificandoPoliticas = true;
    
    // HU10 CA2: Verificar políticas de cancelación
    this.reservaService.verificarPoliticasCancelacion(reserva._id).subscribe({
      next: (response: any) => {
        this.verificandoPoliticas = false;
        
        if (!response.puedeCancelar) {
          // CA3: No puede cancelar (ya cancelada, completada, etc.)
          alert(response.mensaje || 'No se puede cancelar esta reserva');
          this.cerrarModalCancelar();
          return;
        }
        
        this.politicaCancelacion = response.politicaCancelacion;
      },
      error: (err: any) => {
        this.verificandoPoliticas = false;
        console.error('Error al verificar políticas:', err);
        alert('Error al verificar las políticas de cancelación');
        this.cerrarModalCancelar();
      }
    });
  }

  /**
   * Cerrar modal de cancelación
   */
  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.reservaACancelar = null;
    this.motivoCancelacion = '';
    this.cancelando = false;
    this.verificandoPoliticas = false;
    this.politicaCancelacion = null;
    this.aceptaPenalizacion = false;
  }

  /**
   * HU10: Confirmar cancelación de reserva (CA1 + CA2 + CA3 + CA4)
   */
  confirmarCancelacion(): void {
    if (!this.reservaACancelar || !this.politicaCancelacion) return;

    // Validar motivo
    if (!this.motivoCancelacion.trim()) {
      alert('Por favor, indica el motivo de la cancelación.');
      return;
    }

    // CA2: Si hay penalización, debe aceptarla
    if (this.politicaCancelacion.montoPenalizacion > 0 && !this.aceptaPenalizacion) {
      alert('Debes aceptar la penalización para continuar con la cancelación.');
      return;
    }

    this.cancelando = true;

    const datos = {
      motivo: this.motivoCancelacion,
      confirmacionPenalizacion: this.aceptaPenalizacion
    };

    this.reservaService.cancelarReserva(this.reservaACancelar._id, datos).subscribe({
      next: (response: any) => {
        // CA4: Mostrar mensaje con información de notificación
        const mensaje = response.cancelacion?.notificacionEnviada
          ? `${response.message}\n\nSe ha enviado un correo de confirmación a ${this.reservaACancelar?.datosHuesped?.email || 'tu correo'}.`
          : response.message;
        
        alert(mensaje);
        this.cerrarModalCancelar();
        this.cargarReservas(); // Recargar lista
      },
      error: (err: any) => {
        console.error('Error al cancelar:', err);
        
        // CA3: Manejar error de reserva ya cancelada
        if (err.error?.yaCancelada) {
          alert(`Esta reserva ya fue cancelada el ${this.formatearFecha(err.error.fechaCancelacion)}`);
          this.cerrarModalCancelar();
          this.cargarReservas();
        } else {
          alert(err.error?.message || 'No se pudo cancelar la reserva. Por favor, intenta de nuevo.');
        }
        
        this.cancelando = false;
      }
    });
  }

  /**
   * Obtener clase CSS según estado
   */
  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'confirmada': 'estado-confirmada',
      'pendiente': 'estado-pendiente',
      'cancelada': 'estado-cancelada',
      'completada': 'estado-completada'
    };
    return clases[estado] || 'estado-default';
  }

  /**
   * Obtener ícono según estado
   */
  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'confirmada': '✅',
      'pendiente': '⏳',
      'cancelada': '❌',
      'completada': '✔️'
    };
    return iconos[estado] || '📋';
  }

  /**
   * Formatear fecha a formato legible
   */
  formatearFecha(fecha: string | Date): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-CO', opciones);
  }

  /**
   * Formatear precio a formato colombiano
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  /**
   * Obtener texto de tiempo restante
   */
  getTiempoRestante(reserva: ReservaConAcciones): string {
    if (!reserva.horasHastaCheckIn) return '';
    
    const horas = reserva.horasHastaCheckIn;
    
    if (horas < 0) {
      return 'Check-in pasado';
    } else if (horas < 24) {
      return `¡Menos de 24 horas!`;
    } else if (horas < 48) {
      return `${Math.floor(horas)} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      return `${dias} días`;
    }
  }

  /**
   * Contar reservas por estado
   */
  contarPorEstado(estado: EstadoFiltro): number {
    if (estado === 'todas') return this.reservas.length;
    return this.reservas.filter(r => r.estado === estado).length;
  }

  /**
   * Recargar reservas
   */
  recargar(): void {
    if (this.vistaActual === 'habitaciones') {
      this.cargarReservas();
    } else {
      this.cargarReservasPaquetes();
    }
  }

  /**
   * Cambiar entre vista de habitaciones y paquetes
   */
  cambiarVista(vista: TipoVista): void {
    // Si es cliente, solo permitir vista de habitaciones
    if (this.esCliente && vista === 'paquetes') {
      return;
    }
    
    this.vistaActual = vista;
    this.estadoFiltro = 'todas';
    this.busquedaCodigo = '';
    
    if (vista === 'paquetes' && this.reservasPaquetes.length === 0) {
      this.cargarReservasPaquetes();
    }
  }

  /**
   * Aplicar filtros para paquetes
   */
  aplicarFiltrosPaquetes(): void {
    let resultado = [...this.reservasPaquetes];

    // Filtro por estado
    if (this.estadoFiltro !== 'todas') {
      resultado = resultado.filter(r => r.estado === this.estadoFiltro);
    }

    // Filtro por código (búsqueda)
    if (this.busquedaCodigo.trim()) {
      const busqueda = this.busquedaCodigo.trim().toLowerCase();
      resultado = resultado.filter(r => 
        r.numeroReserva?.toLowerCase().includes(busqueda) ||
        r.nombreEvento?.toLowerCase().includes(busqueda) ||
        r.datosEmpresa?.razonSocial?.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar por fecha de inicio (más reciente primero)
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaInicio).getTime();
      const fechaB = new Date(b.fechaInicio).getTime();
      return fechaB - fechaA;
    });

    this.reservasPaquetesFiltradas = resultado;
  }

  /**
   * Contar paquetes por estado
   */
  contarPaquetesPorEstado(estado: EstadoFiltro): number {
    if (estado === 'todas') return this.reservasPaquetes.length;
    return this.reservasPaquetes.filter(r => r.estado === estado).length;
  }

  /**
   * Navegar al inicio
   */
  irAInicio(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navegar a buscar habitaciones
   */
  irABuscar(): void {
    // Verificamos si estamos en el contexto del dashboard y navegamos a la ruta correcta
    if (this.router.url.includes('/dashboard')) {
      // console.log('Navegando a la vista de búsqueda de habitaciones dentro del dashboard...');
      // Usar timeout para asegurar que la navegación ocurra después de cualquier proceso pendiente
      setTimeout(() => {
        this.router.navigate(['/dashboard/busqueda-habitaciones']);
      }, 100);
    } else {
      // console.log('Navegando a la vista de búsqueda de habitaciones fuera del dashboard...');
      this.router.navigate(['/buscar-habitaciones']);
    }
  }

  /**
   * Navegar al dashboard
   */
  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navegar a paquetes corporativos
   */
  irAPaquetes(): void {
    // Verificamos si estamos en el contexto del dashboard y navegamos a la ruta correcta
    if (this.router.url.includes('/dashboard')) {
      this.router.navigate(['/dashboard/paquetes-corporativos']);
    } else {
      this.router.navigate(['/ver-paquetes']);
    }
  }

  /**
   * Ver detalles de un paquete corporativo
   */
  verDetallePaquete(reserva: any): void {
    // console.log('Ver detalles del paquete:', reserva);
    
    // Crear modal con detalles completos
    const detalles = `
DETALLES DE LA RESERVA DE PAQUETE
═══════════════════════════════════

📋 Información General:
• Número de Reserva: ${reserva.numeroReserva}
• Estado: ${reserva.estado.toUpperCase()}
• Tipo de Evento: ${reserva.tipoEvento}

🏢 Empresa:
• Razón Social: ${reserva.datosEmpresa?.razonSocial || 'N/A'}
• NIT: ${reserva.datosEmpresa?.nit || 'N/A'}
• Email: ${reserva.datosEmpresa?.email || 'N/A'}
• Teléfono: ${reserva.datosEmpresa?.telefono || 'N/A'}

🎉 Evento:
• Nombre: ${reserva.nombreEvento}
• Fecha: ${new Date(reserva.fechaInicio).toLocaleDateString('es-CO')}
• Asistentes: ${reserva.numeroAsistentes} personas

💰 Información Financiera:
• Subtotal Paquete: ${this.formatearPrecio(reserva.precios?.subtotalPaquete || 0)}
• Total: ${this.formatearPrecio(reserva.precios?.total || 0)}

📝 Observaciones:
${reserva.notas || 'Sin observaciones adicionales'}
    `;
    
    alert(detalles);
  }

  /**
   * Modificar un paquete corporativo
   */
  modificarPaquete(reserva: any): void {
    // console.log('Modificar paquete:', reserva);
    
    if (reserva.estado !== 'confirmada') {
      alert('Solo se pueden modificar reservas confirmadas');
      return;
    }
    
    const nuevoNumeroAsistentes = prompt(
      `Modificar número de asistentes para ${reserva.numeroReserva}\n\nNúmero actual: ${reserva.numeroAsistentes}`,
      reserva.numeroAsistentes.toString()
    );
    
    if (nuevoNumeroAsistentes && !isNaN(parseInt(nuevoNumeroAsistentes))) {
      const numero = parseInt(nuevoNumeroAsistentes);
      if (numero > 0 && numero <= 500) {
        // TODO: Llamar al servicio real para modificar
        alert(`✅ Reserva ${reserva.numeroReserva} modificada:\nNuevo número de asistentes: ${numero}`);
        // Aquí irían las llamadas al backend
        this.cargarReservasPaquetes(); // Recargar datos
      } else {
        alert('El número de asistentes debe estar entre 1 y 500');
      }
    }
  }

  /**
   * Cancelar un paquete corporativo
   */
  cancelarPaquete(reserva: any): void {
    // console.log('Cancelar paquete:', reserva);
    
    if (reserva.estado === 'cancelada') {
      alert('Esta reserva ya está cancelada');
      return;
    }
    
    const motivo = prompt(
      `¿Estás seguro de que deseas cancelar la reserva ${reserva.numeroReserva}?\n\nPor favor, indica el motivo de la cancelación:`,
      ''
    );
    
    if (motivo && motivo.trim()) {
      // TODO: Implementar cancelación real con el backend
      alert(`✅ Reserva ${reserva.numeroReserva} cancelada exitosamente.\n\nMotivo: ${motivo}`);
      
      // Simular actualización del estado (en la implementación real esto vendría del servidor)
      reserva.estado = 'cancelada';
      reserva.motivoCancelacion = motivo;
      
      // Recargar datos
      this.cargarReservasPaquetes();
    } else if (motivo !== null) {
      alert('Debe proporcionar un motivo para la cancelación');
    }
  }

  /**
   * Gestionar asistentes de un paquete corporativo
   */
  gestionarAsistentes(reserva: any): void {
    this.reservaIdAsistentes = reserva.numeroReserva;
    this.mostrarModalAsistentes = true;
    document.body.classList.add('modal-open');
  }

  cerrarModalAsistentes(): void {
    this.mostrarModalAsistentes = false;
    this.reservaIdAsistentes = null;
    document.body.classList.remove('modal-open');
    // Opcional: recargar asistentes o reservas si es necesario
    this.cargarReservasPaquetes();
  }
}
