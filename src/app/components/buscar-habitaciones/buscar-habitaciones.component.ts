import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FiltrosService, FiltrosHabitacion, HabitacionResultado } from '../../services/filtros.service';
import { DisponibilidadService, Ciudad } from '../../services/disponibilidad.service';
import { SERVICIOS_DISPONIBLES, ServicioDisponible } from '../../constants/servicios';

@Component({
  selector: 'app-buscar-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="navigation-header">
      <button (click)="irAInicio()" class="btn-home-nav">
        <i class="fas fa-home"></i> Inicio
      </button>
      <button (click)="irADashboard()" class="btn-dashboard-nav">
        <i class="fas fa-chart-bar"></i> Dashboard
      </button>
    </div>

    <div class="busqueda-container">
      <!-- Header -->
      <div class="header">
        <h1><i class="fas fa-search"></i> Buscar Habitaciones</h1>
        <p class="subtitle">Encuentra la habitación perfecta para tu estadía</p>
      </div>

      <!-- Formulario de Búsqueda -->
      <div class="formulario-busqueda">
        <h2>Filtros de Búsqueda</h2>
        
        <form (ngSubmit)="buscar()" #busquedaForm="ngForm">
          <div class="form-grid">
            <!-- Ciudad (Opcional) -->
            <div class="form-group">
              <label for="ciudad">
                <span class="label-icon"><i class="fas fa-city"></i></span>
                Ciudad
              </label>
              <select 
                id="ciudad" 
                name="ciudad" 
                [(ngModel)]="filtros.ciudad"
                class="form-control"
              >
                <option value="">Todas las ciudades</option>
                <option *ngFor="let ciudad of ciudades" [value]="ciudad.ciudad">
                  {{ ciudad.ciudad }} ({{ ciudad.totalHoteles }} hoteles)
                </option>
              </select>
            </div>

            <!-- CA2: Fecha de Inicio -->
            <div class="form-group">
              <label for="fechaInicio">
                <span class="label-icon"><i class="fas fa-calendar-alt"></i></span>
                Check-in *
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                [(ngModel)]="filtros.fechaInicio"
                [min]="fechaMinima"
                required
                class="form-control"
                [class.error]="errorFechas"
              />
            </div>

            <!-- CA2: Fecha de Fin -->
            <div class="form-group">
              <label for="fechaFin">
                <span class="label-icon"><i class="fas fa-calendar-alt"></i></span>
                Check-out *
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                [(ngModel)]="filtros.fechaFin"
                [min]="fechaMinimaFin"
                required
                class="form-control"
                [class.error]="errorFechas"
              />
              <small class="info-text" *ngIf="calcularNoches() > 0">
                {{ calcularNoches() }} noche(s)
              </small>
            </div>

            <!-- CA4: Número de Huéspedes -->
            <div class="form-group">
              <label for="huespedes">
                <span class="label-icon"><i class="fas fa-users"></i></span>
                Huéspedes *
              </label>
              <div class="huespedes-control">
                <button
                  type="button"
                  class="btn-cantidad"
                  (click)="decrementarHuespedes()"
                  [disabled]="filtros.huespedes <= 1"
                >
                  -
                </button>
                <input
                  type="number"
                  id="huespedes"
                  name="huespedes"
                  [(ngModel)]="filtros.huespedes"
                  min="1"
                  [max]="CAPACIDAD_MAXIMA"
                  required
                  class="form-control huespedes-input"
                  [class.error]="errorHuespedes"
                />
                <button
                  type="button"
                  class="btn-cantidad"
                  (click)="incrementarHuespedes()"
                  [disabled]="filtros.huespedes >= CAPACIDAD_MAXIMA"
                >
                  +
                </button>
              </div>
              <small class="info-text">
                Máximo {{ CAPACIDAD_MAXIMA }} huéspedes
              </small>
            </div>
          </div>

          <!-- CA2: Error de Fechas -->
          <div class="error-message" *ngIf="errorFechas">
            <span class="error-icon"><i class="fas fa-exclamation-triangle"></i></span>
            <p>{{ errorFechas }}</p>
          </div>

          <!-- CA4: Error de Huéspedes -->
          <div class="error-message" *ngIf="errorHuespedes">
            <span class="error-icon"><i class="fas fa-exclamation-triangle"></i></span>
            <p>{{ errorHuespedes }}</p>
          </div>

          <!-- Botón de Búsqueda -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn-buscar"
              [disabled]="isLoading || !busquedaForm.valid"
            >
              <span *ngIf="!isLoading"><i class="fas fa-search"></i> Buscar Habitaciones</span>
              <span *ngIf="isLoading">
                <span class="spinner-small"></span>
                Buscando...
              </span>
            </button>
            <button
              type="button"
              class="btn-limpiar"
              (click)="limpiarFiltros()"
              [disabled]="isLoading"
            >
              <i class="fas fa-trash"></i> Limpiar
            </button>
          </div>
        </form>
      </div>

      <!-- HU06: Filtros por Servicios Adicionales -->
      <div class="filtros-servicios" *ngIf="!isLoading">
        <h2>
          <i class="fas fa-star"></i> Servicios Adicionales
          <span class="badge-servicios" *ngIf="serviciosSeleccionados.length > 0">
            {{ serviciosSeleccionados.length }} seleccionado{{ serviciosSeleccionados.length !== 1 ? 's' : '' }}
          </span>
        </h2>
        <p class="subtitle-servicios">
          Selecciona servicios para afinar tu búsqueda. Solo se mostrarán habitaciones con <strong>todos</strong> los servicios marcados.
        </p>
        
        <!-- HU06 CA1, CA2: Checkboxes de servicios -->
        <div class="servicios-grid">
          <label 
            *ngFor="let servicio of serviciosDisponibles" 
            class="servicio-checkbox"
            [class.checked]="isServicioSeleccionado(servicio.id)"
          >
            <input
              type="checkbox"
              [value]="servicio.id"
              [checked]="isServicioSeleccionado(servicio.id)"
              (change)="toggleServicio(servicio.id)"
            />
            <span class="checkbox-custom"></span>
            <span class="servicio-info">
              <span class="servicio-icono" [innerHTML]="servicio.icono"></span>
              <span class="servicio-texto">
                <strong>{{ servicio.nombre }}</strong>
                <small>{{ servicio.descripcion }}</small>
              </span>
            </span>
          </label>
        </div>

        <!-- HU06 CA2: Botón para limpiar solo servicios -->
        <div class="servicios-actions" *ngIf="serviciosSeleccionados.length > 0">
          <button class="btn-limpiar-servicios" (click)="limpiarServicios()">
            <i class="fas fa-trash"></i> Quitar todos los filtros de servicios
          </button>
          <button class="btn-aplicar-servicios" (click)="aplicarFiltrosServicios()">
            <i class="fas fa-check"></i> Aplicar filtros ({{ serviciosSeleccionados.length }})
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Buscando habitaciones disponibles...</p>
      </div>

      <!-- CA1: Resultados de Búsqueda -->
      <div class="resultados-section" *ngIf="!isLoading && busquedaRealizada">
        <div class="resultados-header">
          <h2>Resultados de Búsqueda</h2>
          <span class="badge-resultados" *ngIf="habitaciones.length > 0">
            {{ habitaciones.length }} habitación{{ habitaciones.length !== 1 ? 'es' : '' }} disponible{{ habitaciones.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Resumen de Filtros Aplicados -->
        <div class="filtros-aplicados" *ngIf="habitaciones.length > 0">
          <h3>Filtros Aplicados:</h3>
          <div class="tags">
            <span class="tag" *ngIf="filtrosAplicados?.ciudad && filtrosAplicados.ciudad !== 'Todas'">
              <i class="fas fa-map-marker-alt"></i> {{ filtrosAplicados.ciudad }}
            </span>
            <span class="tag">
              <i class="fas fa-calendar-alt"></i> {{ formatearFecha(filtrosAplicados?.fechaInicio || '') }} - {{ formatearFecha(filtrosAplicados?.fechaFin || '') }}
            </span>
            <span class="tag">
              <i class="fas fa-users"></i> {{ filtrosAplicados?.huespedes }} huésped{{ (filtrosAplicados?.huespedes || 0) > 1 ? 'es' : '' }}
            </span>
            <!-- HU06: Mostrar servicios aplicados -->
            <span 
              class="tag" 
              *ngFor="let servicio of filtrosAplicados?.servicios"
              style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: #667eea;"
            >
              <i class="fas fa-star"></i> {{ servicio }}
            </span>
          </div>
        </div>

        <!-- HU05 CA3 + HU06 CA3: Sin Resultados -->
        <div class="sin-resultados" *ngIf="habitaciones.length === 0">
          <div class="icono-vacio"><i class="fas fa-hotel fa-3x"></i></div>
          <h3>No hay habitaciones disponibles con esos criterios</h3>
          <p>Intenta ajustar tus filtros de búsqueda:</p>
          <ul>
            <li>Cambia las fechas de tu estadía</li>
            <li>Reduce el número de huéspedes</li>
            <li>Selecciona otra ciudad</li>
            <li *ngIf="serviciosSeleccionados.length > 0">
              <strong>Quita algunos servicios</strong> ({{ serviciosSeleccionados.length }} seleccionado{{ serviciosSeleccionados.length !== 1 ? 's' : '' }})
            </li>
          </ul>
          <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
            <button class="btn-modificar" (click)="scrollToTop()">
              Modificar Búsqueda
            </button>
            <button 
              class="btn-limpiar-todo" 
              (click)="limpiarFiltros()"
              *ngIf="serviciosSeleccionados.length > 0"
            >
              <i class="fas fa-trash"></i> Limpiar Todo
            </button>
          </div>
        </div>

        <!-- CA1: Lista de Habitaciones -->
        <div class="habitaciones-grid" *ngIf="habitaciones.length > 0">
          <div
            *ngFor="let habitacion of habitaciones"
            class="habitacion-card"
          >
            <!-- Imagen Placeholder -->
            <div class="habitacion-imagen">
              <div class="tipo-badge">{{ habitacion.tipo }}</div>
              <div class="precio-badge">
                {{ formatearPrecio(habitacion.precio) }}/noche
              </div>
            </div>

            <!-- Información -->
            <div class="habitacion-info">
              <h3>{{ habitacion.hotel.nombre }}</h3>
              <p class="hotel-ubicacion">
                <i class="fas fa-map-marker-alt"></i> {{ habitacion.hotel.ciudad }} - {{ habitacion.hotel.direccion }}
              </p>
              
              <div class="habitacion-detalles">
                <h4>Habitación {{ habitacion.numero }}</h4>
                <p class="descripcion">{{ habitacion.descripcion }}</p>
                
                <div class="caracteristicas">
                  <span class="caracteristica">
                    <span class="icon"><i class="fas fa-users"></i></span>
                    Hasta {{ habitacion.capacidad }} personas
                  </span>
                  <span class="caracteristica">
                    <span class="icon"><i class="fas fa-dollar-sign"></i></span>
                    {{ formatearPrecio(habitacion.precio) }}
                  </span>
                </div>

                <!-- Servicios -->
                <div class="servicios" *ngIf="habitacion.servicios && habitacion.servicios.length > 0">
                  <h5>Servicios incluidos:</h5>
                  <div class="servicios-tags">
                    <span
                      *ngFor="let servicio of habitacion.servicios"
                      class="servicio-tag"
                    >
                      {{ servicio }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Cálculo de Precio Total -->
              <div class="precio-total" *ngIf="calcularNoches() > 0">
                <span class="label">Total por {{ calcularNoches() }} noche(s):</span>
                <span class="valor">{{ formatearPrecio(habitacion.precio * calcularNoches()) }}</span>
              </div>

              <!-- Acciones -->
              <div class="habitacion-acciones">
                <button class="btn-reservar" (click)="reservar(habitacion)">
                  <i class="fas fa-check"></i> Reservar Ahora
                </button>
                <button class="btn-ver-mas" (click)="verDetalles(habitacion)">
                  <i class="fas fa-eye"></i> Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error General -->
      <div class="error-general" *ngIf="errorGeneral">
        <span class="error-icon"><i class="fas fa-times-circle fa-3x"></i></span>
        <p>{{ errorGeneral }}</p>
        <button class="btn-reintentar" (click)="buscar()">
          <i class="fas fa-redo"></i> Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ========== NAVEGACIÓN HEADER ========== */
    .navigation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      margin-bottom: 20px;
      border-radius: 12px;
      max-width: 1400px;
      margin: 0 auto 20px auto;
    }

    .btn-home-nav,
    .btn-dashboard-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      font-size: 0.95rem;
    }

    .btn-home-nav {
      background: rgba(56, 178, 172, 0.1);
      color: #38b2ac;
      border: 2px solid rgba(56, 178, 172, 0.2);
    }

    .btn-home-nav:hover {
      background: #38b2ac;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(56, 178, 172, 0.3);
    }

    .btn-dashboard-nav {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 2px solid rgba(102, 126, 234, 0.2);
    }

    .btn-dashboard-nav:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .busqueda-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 32px;
    }

    .subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    /* Formulario de Búsqueda */
    .formulario-busqueda {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 40px;
    }

    .formulario-busqueda h2 {
      margin: 0 0 24px 0;
      color: #333;
      font-size: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .label-icon {
      font-size: 18px;
    }

    .form-control {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .info-text {
      color: #666;
      font-size: 12px;
      margin-top: 4px;
    }

    /* Control de Huéspedes */
    .huespedes-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-cantidad {
      width: 40px;
      height: 40px;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 8px;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cantidad:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .btn-cantidad:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .huespedes-input {
      flex: 1;
      text-align: center;
      font-weight: 600;
    }

    /* Mensajes de Error */
    .error-message {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #721c24;
    }

    .error-icon {
      font-size: 20px;
    }

    .error-message p {
      margin: 0;
      font-size: 14px;
    }

    /* Acciones del Formulario */
    .form-actions {
      display: flex;
      gap: 12px;
    }

    .btn-buscar,
    .btn-limpiar {
      flex: 1;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-buscar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-buscar:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-buscar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-limpiar {
      background: #f5f5f5;
      color: #666;
    }

    .btn-limpiar:hover:not(:disabled) {
      background: #e0e0e0;
    }

    /* Loading */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* HU06: Filtros de Servicios */
    .filtros-servicios {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .filtros-servicios h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 22px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge-servicios {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .subtitle-servicios {
      color: #666;
      font-size: 14px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .servicios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }

    .servicio-checkbox {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      background: white;
    }

    .servicio-checkbox:hover {
      border-color: #667eea;
      background: #f8f9ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .servicio-checkbox.checked {
      border-color: #667eea;
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .servicio-checkbox input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .checkbox-custom {
      width: 24px;
      height: 24px;
      border: 2px solid #ccc;
      border-radius: 6px;
      position: relative;
      transition: all 0.3s;
      flex-shrink: 0;
    }

    .servicio-checkbox.checked .checkbox-custom {
      background: #667eea;
      border-color: #667eea;
    }

    .servicio-checkbox.checked .checkbox-custom::after {
      content: "✓";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 16px;
      font-weight: bold;
    }

    .servicio-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .servicio-icono {
      font-size: 24px;
      flex-shrink: 0;
    }

    .servicio-texto {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .servicio-texto strong {
      color: #333;
      font-size: 14px;
    }

    .servicio-texto small {
      color: #666;
      font-size: 11px;
      line-height: 1.3;
    }

    .servicios-actions {
      display: flex;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .btn-limpiar-servicios,
    .btn-aplicar-servicios {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-limpiar-servicios {
      background: #f5f5f5;
      color: #666;
      flex: 1;
    }

    .btn-limpiar-servicios:hover {
      background: #e0e0e0;
      transform: translateY(-2px);
    }

    .btn-aplicar-servicios {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex: 2;
    }

    .btn-aplicar-servicios:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
    }

    /* Resultados */
    .resultados-section {
      animation: fadeIn 0.5s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .resultados-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .resultados-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .badge-resultados {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    /* Filtros Aplicados */
    .filtros-aplicados {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .filtros-aplicados h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
      font-weight: 600;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      background: white;
      border: 1px solid #e0e0e0;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      color: #333;
    }

    /* Sin Resultados */
    .sin-resultados {
      background: white;
      border-radius: 12px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .icono-vacio {
      color: #ccc;
      margin-bottom: 20px;
      opacity: 0.6;
    }

    .sin-resultados h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 24px;
    }

    .sin-resultados p {
      color: #666;
      margin: 0 0 16px 0;
    }

    .sin-resultados ul {
      list-style: none;
      padding: 0;
      margin: 0 0 24px 0;
      color: #666;
    }

    .sin-resultados li {
      margin: 8px 0;
    }

    .sin-resultados li::before {
      content: "•";
      color: #667eea;
      font-weight: bold;
      margin-right: 8px;
    }

    .btn-modificar,
    .btn-limpiar-todo {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-modificar {
      background: #667eea;
      color: white;
    }

    .btn-modificar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-limpiar-todo {
      background: #dc3545;
      color: white;
    }

    .btn-limpiar-todo:hover {
      background: #c82333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    }

    /* Grid de Habitaciones */
    .habitaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .habitacion-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
    }

    .habitacion-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .habitacion-imagen {
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
    }

    .habitacion-imagen::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      content: "\\f594";
      font-size: 64px;
      opacity: 0.3;
    }

    .tipo-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .precio-badge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.95);
      color: #333;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 700;
    }

    .habitacion-info {
      padding: 20px;
    }

    .habitacion-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
    }

    .hotel-ubicacion {
      color: #666;
      font-size: 13px;
      margin: 0 0 16px 0;
    }

    .habitacion-detalles h4 {
      margin: 0 0 8px 0;
      color: #667eea;
      font-size: 16px;
    }

    .descripcion {
      color: #666;
      font-size: 14px;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .caracteristicas {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .caracteristica {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 14px;
    }

    .caracteristica .icon {
      font-size: 16px;
    }

    .servicios h5 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 13px;
      font-weight: 600;
    }

    .servicios-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }

    .servicio-tag {
      background: #f5f5f5;
      color: #666;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
    }

    .precio-total {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .precio-total .label {
      color: #666;
      font-size: 13px;
    }

    .precio-total .valor {
      color: #28a745;
      font-size: 18px;
      font-weight: 700;
    }

    .habitacion-acciones {
      display: flex;
      gap: 8px;
    }

    .btn-reservar,
    .btn-ver-mas {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-reservar {
      background: #28a745;
      color: white;
    }

    .btn-reservar:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .btn-ver-mas {
      background: #f5f5f5;
      color: #666;
    }

    .btn-ver-mas:hover {
      background: #e0e0e0;
    }

    /* Error General */
    .error-general {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      color: #721c24;
    }

    .error-general .error-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }

    .error-general p {
      margin: 0 0 20px 0;
      font-size: 16px;
    }

    .btn-reintentar {
      padding: 12px 24px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-reintentar:hover {
      background: #c82333;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .busqueda-container {
        padding: 16px;
      }

      .header h1 {
        font-size: 24px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .habitaciones-grid {
        grid-template-columns: 1fr;
      }

      .resultados-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]
})
export class BuscarHabitacionesComponent implements OnInit {
  // Constantes
  readonly CAPACIDAD_MAXIMA = 10; // HU05 CA4: Límite global del sistema
  readonly STORAGE_KEY = 'hu06_filtros_servicios'; // HU06 CA4: Persistencia

  // HU05: Filtros básicos
  filtros: FiltrosHabitacion = {
    fechaInicio: '',
    fechaFin: '',
    huespedes: 2,
    ciudad: '',
    servicios: [] // HU06: Servicios adicionales
  };

  // HU06: Servicios disponibles y seleccionados
  serviciosDisponibles: ServicioDisponible[] = SERVICIOS_DISPONIBLES;
  serviciosSeleccionados: string[] = [];

  // Estado
  isLoading = false;
  busquedaRealizada = false;
  habitaciones: HabitacionResultado[] = [];
  ciudades: Ciudad[] = [];
  filtrosAplicados: any = null;

  // Fechas mínimas
  fechaMinima: string = '';
  fechaMinimaFin: string = '';

  // Errores
  errorFechas = '';
  errorHuespedes = '';
  errorGeneral = '';

  constructor(
    private filtrosService: FiltrosService,
    private disponibilidadService: DisponibilidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarCiudades();
    this.cargarFiltrosGuardados(); // HU06 CA4: Restaurar filtros persistentes
  }

  /**
   * Inicializar fechas por defecto
   */
  inicializarFechas(): void {
    this.fechaMinima = this.filtrosService.getFechaHoy();
    this.fechaMinimaFin = this.filtrosService.getFechaManana();
    
    // Valores por defecto: hoy y mañana
    this.filtros.fechaInicio = this.fechaMinima;
    this.filtros.fechaFin = this.fechaMinimaFin;
  }

  /**
   * Cargar lista de ciudades
   */
  cargarCiudades(): void {
    this.disponibilidadService.getCiudades().subscribe({
      next: (response) => {
        if (response.success) {
          this.ciudades = response.ciudades;
        }
      },
      error: (error) => {
        console.error('Error cargando ciudades:', error);
      }
    });
  }

  /**
   * CA1: Buscar habitaciones con los filtros aplicados
   */
  buscar(): void {
    // Limpiar errores previos
    this.errorFechas = '';
    this.errorHuespedes = '';
    this.errorGeneral = '';

    // CA2: Validar fechas (servidor/servicio también valida, esto evita bypass por input manual)
    const fechaInicioISO = this.filtros.fechaInicio || '';
    const fechaFinISO = this.filtros.fechaFin || '';

    const validacionFechas = this.filtrosService.validarFechas(
      fechaInicioISO,
      fechaFinISO
    );

    if (!validacionFechas.valido) {
      this.errorFechas = validacionFechas.error || 'Error en las fechas';
      return;
    }

    // CA4: Validar huéspedes
    const validacionHuespedes = this.filtrosService.validarHuespedes(
      this.filtros.huespedes,
      this.CAPACIDAD_MAXIMA
    );

    if (!validacionHuespedes.valido) {
      this.errorHuespedes = validacionHuespedes.error || 'Error en el número de huéspedes';
      return;
    }

    // Ejecutar búsqueda
    this.isLoading = true;
    this.busquedaRealizada = true;

    this.filtrosService.buscarHabitaciones(this.filtros).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.habitaciones = response.habitaciones;
          this.filtrosAplicados = response.filtros;
          
          // CA3: Sin resultados
          if (this.habitaciones.length === 0) {
            console.log('No se encontraron habitaciones disponibles');
          }
        } else {
          // CA2 o CA4: Error del servidor
          if (response.error === 'FECHA_INVALIDA') {
            this.errorFechas = response.msg;
          } else if (response.error === 'CAPACIDAD_MAXIMA_EXCEDIDA') {
            this.errorHuespedes = response.msg;
          } else {
            this.errorGeneral = response.msg;
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorGeneral = error.error?.msg || 'Error al buscar habitaciones';
        console.error('Error en búsqueda:', error);
      }
    });
  }

  /**
   * CA4: Incrementar huéspedes
   */
  incrementarHuespedes(): void {
    if (this.filtros.huespedes < this.CAPACIDAD_MAXIMA) {
      this.filtros.huespedes++;
      this.errorHuespedes = '';
    } else {
      this.errorHuespedes = `El número máximo de huéspedes es ${this.CAPACIDAD_MAXIMA}`;
    }
  }

  /**
   * Decrementar huéspedes
   */
  decrementarHuespedes(): void {
    if (this.filtros.huespedes > 1) {
      this.filtros.huespedes--;
      this.errorHuespedes = '';
    }
  }

  /**
   * Limpiar filtros y resultados
   */
  limpiarFiltros(): void {
    this.inicializarFechas();
    this.filtros.huespedes = 2;
    this.filtros.ciudad = '';
    this.filtros.servicios = []; // HU06: Limpiar servicios
    this.serviciosSeleccionados = []; // HU06: Limpiar selección
    sessionStorage.removeItem(this.STORAGE_KEY); // HU06 CA4: Limpiar storage
    this.habitaciones = [];
    this.busquedaRealizada = false;
    this.errorFechas = '';
    this.errorHuespedes = '';
    this.errorGeneral = '';
  }

  /**
   * Calcular número de noches
   */
  calcularNoches(): number {
    if (!this.filtros.fechaInicio || !this.filtros.fechaFin) {
      return 0;
    }
    return this.filtrosService.calcularNoches(
      this.filtros.fechaInicio,
      this.filtros.fechaFin
    );
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return this.filtrosService.formatearPrecio(precio);
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  /**
   * Scroll to top para modificar búsqueda
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navegar a reserva (placeholder)
   */
  reservar(habitacion: HabitacionResultado): void {
    console.log('Reservar habitación:', habitacion);
    
    // Verificar que hay fechas seleccionadas
    if (!this.filtros.fechaInicio || !this.filtros.fechaFin) {
      alert('Por favor, selecciona las fechas de tu estadía antes de reservar.');
      return;
    }

    // Navegar directamente a la página de reserva con los parámetros
    this.router.navigate(['/reservar', habitacion._id], {
      queryParams: {
        fechaInicio: this.filtros.fechaInicio,
        fechaFin: this.filtros.fechaFin,
        huespedes: this.filtros.huespedes
      }
    });
  }

  /**
   * HU07 CA4: Ver detalles de habitación conservando filtros
   */
  verDetalles(habitacion: HabitacionResultado): void {
    // HU07 CA4: Navegar al detalle pasando todos los queryParams actuales
    // para que al volver con "← Volver" se conserven los filtros
    this.router.navigate(['/habitacion', habitacion._id], {
      queryParams: {
        fechaInicio: this.filtros.fechaInicio,
        fechaFin: this.filtros.fechaFin,
        huespedes: this.filtros.huespedes,
        ciudad: this.filtros.ciudad || undefined,
        // No enviamos servicios como array en la URL, solo en la navegación de vuelta
      }
    });
  }

  // ==================== HU06: FILTROS POR SERVICIOS ====================

  /**
   * HU06 CA4: Cargar filtros guardados en sessionStorage
   */
  cargarFiltrosGuardados(): void {
    try {
      const filtrosGuardados = sessionStorage.getItem(this.STORAGE_KEY);
      if (filtrosGuardados) {
        this.serviciosSeleccionados = JSON.parse(filtrosGuardados);
        this.filtros.servicios = [...this.serviciosSeleccionados];
      }
    } catch (error) {
      console.error('Error cargando filtros guardados:', error);
    }
  }

  /**
   * HU06 CA4: Guardar filtros en sessionStorage
   */
  guardarFiltros(): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.serviciosSeleccionados));
    } catch (error) {
      console.error('Error guardando filtros:', error);
    }
  }

  /**
   * HU06 CA1, CA2: Toggle servicio (marcar/desmarcar)
   */
  toggleServicio(servicioId: string): void {
    const index = this.serviciosSeleccionados.indexOf(servicioId);
    
    if (index > -1) {
      // HU06 CA2: Quitar servicio
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      // HU06 CA1: Agregar servicio
      this.serviciosSeleccionados.push(servicioId);
    }

    // HU06 CA4: Guardar estado
    this.guardarFiltros();

    // Auto-aplicar filtros si ya hay resultados
    if (this.busquedaRealizada) {
      this.aplicarFiltrosServicios();
    }
  }

  /**
   * HU06: Verificar si servicio está seleccionado
   */
  isServicioSeleccionado(servicioId: string): boolean {
    return this.serviciosSeleccionados.includes(servicioId);
  }

  /**
   * HU06 CA1: Aplicar filtros de servicios (re-ejecutar búsqueda)
   */
  aplicarFiltrosServicios(): void {
    // Actualizar filtros con servicios seleccionados
    this.filtros.servicios = [...this.serviciosSeleccionados];
    
    // Re-ejecutar búsqueda
    this.buscar();
  }

  /**
   * HU06 CA2: Limpiar solo servicios
   */
  limpiarServicios(): void {
    this.serviciosSeleccionados = [];
    this.filtros.servicios = [];
    
    // HU06 CA4: Limpiar storage
    sessionStorage.removeItem(this.STORAGE_KEY);
    
    // Re-aplicar filtros si ya hay resultados
    if (this.busquedaRealizada) {
      this.buscar();
    }
  }

  /**
   * Navegar al inicio
   */
  irAInicio(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navegar al dashboard
   */
  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}