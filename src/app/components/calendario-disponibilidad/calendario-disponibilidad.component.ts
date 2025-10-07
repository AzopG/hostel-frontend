import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisponibilidadService, Ciudad, DisponibilidadDia } from '../../services/disponibilidad.service';

@Component({
  selector: 'app-calendario-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendario-container">
      <!-- Navegación superior -->
      <div class="navigation-header">
        <button class="btn-volver" (click)="volver()" title="Volver al inicio">
          <span><i class="fas fa-arrow-left"></i> Volver al Inicio</span>
        </button>
        <button class="btn-buscar" (click)="irABuscar()" title="Buscar habitaciones">
          <span><i class="fas fa-search"></i> Buscar Habitaciones</span>
        </button>
      </div>

      <!-- Header -->
      <div class="header">
        <h1><i class="fas fa-calendar-alt"></i> Calendario de Disponibilidad</h1>
        <p class="subtitle">Selecciona una ciudad y visualiza la disponibilidad de habitaciones</p>
      </div>

      <!-- CA4: Mensaje inicial si no hay ciudad seleccionada -->
      <div *ngIf="!ciudadSeleccionada && !isLoadingCiudades" class="mensaje-inicial">
        <div class="icono-ciudad"><i class="fas fa-city"></i></div>
        <h2>Selecciona una ciudad para ver disponibilidad</h2>
        <p>Elige una ciudad del listado para consultar la disponibilidad de habitaciones</p>
      </div>

      <!-- Selector de Ciudad -->
      <div class="selector-ciudad-container">
        <!-- Loading ciudades -->
        <div *ngIf="isLoadingCiudades" class="loading-ciudades">
          <div class="spinner"></div>
          <p>Cargando ciudades...</p>
        </div>

        <!-- Lista de ciudades -->
        <div *ngIf="!isLoadingCiudades && ciudades.length > 0" class="ciudades-grid">
          <div class="seccion-header">
            <h3><i class="fas fa-map-marker-alt"></i> Ciudades Disponibles</h3>
            <span class="badge">{{ ciudades.length }} ciudad{{ ciudades.length !== 1 ? 'es' : '' }}</span>
          </div>
          
          <!-- CA1, CA2: Cards de ciudades -->
          <div class="ciudades-list">
            <div
              *ngFor="let ciudad of ciudades"
              class="ciudad-card"
              [class.selected]="ciudadSeleccionada === ciudad.ciudad"
              (click)="seleccionarCiudad(ciudad.ciudad)"
            >
              <div class="ciudad-icon"><i class="fas fa-building"></i></div>
              <div class="ciudad-info">
                <h4>{{ ciudad.ciudad }}</h4>
                <p class="ciudad-stats">
                  <span>{{ ciudad.totalHoteles }} hotel{{ ciudad.totalHoteles !== 1 ? 'es' : '' }}</span>
                  <span class="separator">•</span>
                  <span>{{ ciudad.totalHabitaciones }} habitacion{{ ciudad.totalHabitaciones !== 1 ? 'es' : '' }}</span>
                </p>
              </div>
              <div class="check-icon" *ngIf="ciudadSeleccionada === ciudad.ciudad"><i class="fas fa-check"></i></div>
            </div>
          </div>
        </div>

        <!-- Error cargando ciudades -->
        <div *ngIf="errorCiudades" class="error-message">
          <span class="error-icon"><i class="fas fa-exclamation-triangle"></i></span>
          <p>{{ errorCiudades }}</p>
          <button class="retry-btn" (click)="cargarCiudades()">Reintentar</button>
        </div>
      </div>

      <!-- Calendario de Disponibilidad -->
      <div *ngIf="ciudadSeleccionada" class="calendario-section">
        <!-- Información de la ciudad seleccionada -->
        <div class="ciudad-seleccionada-info">
          <div class="info-header">
            <h3><i class="fas fa-map-marker-alt"></i> {{ ciudadSeleccionada }}</h3>
            <button class="cambiar-btn" (click)="limpiarSeleccion()">Cambiar ciudad</button>
          </div>
          <div *ngIf="disponibilidadData" class="stats-row">
            <div class="stat-item">
              <span class="stat-label">Hoteles:</span>
              <span class="stat-value">{{ disponibilidadData.totalHoteles }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Habitaciones:</span>
              <span class="stat-value">{{ disponibilidadData.totalHabitaciones }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Período:</span>
              <span class="stat-value">{{ formatDateRange() }}</span>
            </div>
          </div>
        </div>

        <!-- Loading calendario -->
        <div *ngIf="isLoadingDisponibilidad" class="loading-calendario">
          <div class="spinner"></div>
          <p>Cargando disponibilidad...</p>
        </div>

        <!-- CA3: Calendario con días disponibles/no disponibles -->
        <div *ngIf="!isLoadingDisponibilidad && disponibilidadData" class="calendario-grid">
          <!-- Leyenda -->
          <div class="leyenda">
            <div class="leyenda-item">
              <span class="color-box disponible"></span>
              <span>Disponible</span>
            </div>
            <div class="leyenda-item">
              <span class="color-box no-disponible"></span>
              <span>Sin disponibilidad</span>
            </div>
            <div class="leyenda-item">
              <span class="color-box pasado"></span>
              <span>Fecha pasada</span>
            </div>
          </div>

          <!-- Grid de días -->
          <div class="dias-grid">
            <div
              *ngFor="let dia of disponibilidadData.disponibilidad"
              class="dia-card"
              [class.disponible]="dia.disponible"
              [class.no-disponible]="!dia.disponible"
              [class.pasado]="esFechaPasada(dia.fecha)"
              [title]="getTituloTooltip(dia)"
            >
              <div class="dia-fecha">
                <span class="dia-numero">{{ getDiaMes(dia.fecha) }}</span>
                <span class="dia-mes">{{ getMesAbreviado(dia.fecha) }}</span>
              </div>
              <div class="dia-info">
                <div class="disponibilidad-badge" [class.disponible]="dia.disponible">
                  <i [class]="dia.disponible ? 'fas fa-check' : 'fas fa-times'"></i>
                </div>
                <div class="habitaciones-count">
                  <span class="count">{{ dia.habitacionesDisponibles }}</span>
                  <span class="total">/{{ dia.totalHabitaciones }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error cargando disponibilidad -->
        <div *ngIf="errorDisponibilidad" class="error-message">
          <span class="error-icon"><i class="fas fa-exclamation-triangle"></i></span>
          <p>{{ errorDisponibilidad }}</p>
          <button class="retry-btn" (click)="cargarDisponibilidad()">Reintentar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
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

    .btn-volver,
    .btn-buscar {
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

    .btn-volver i,
    .btn-buscar i {
      font-size: 16px;
    }

    .btn-volver {
      background: rgba(56, 178, 172, 0.1);
      color: #38b2ac;
      border: 2px solid rgba(56, 178, 172, 0.2);
    }

    .btn-volver:hover {
      background: #38b2ac;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(56, 178, 172, 0.3);
    }

    .btn-buscar {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 2px solid rgba(102, 126, 234, 0.2);
    }

    .btn-buscar:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .calendario-container {
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .header h1 i {
      color: #667eea;
      font-size: 28px;
    }

    .subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    /* Mensaje inicial - CA4 */
    .mensaje-inicial {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      border-radius: 16px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .icono-ciudad {
      font-size: 80px;
      margin-bottom: 20px;
      color: #667eea;
      display: flex;
      justify-content: center;
    }

    .icono-ciudad i {
      font-size: 80px;
    }

    .mensaje-inicial h2 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .mensaje-inicial p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }

    /* Selector de Ciudad */
    .selector-ciudad-container {
      margin-bottom: 40px;
    }

    .ciudades-grid {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .seccion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .seccion-header h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .seccion-header h3 i {
      color: #667eea;
      font-size: 18px;
    }

    .badge {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .ciudades-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    /* CA1, CA2: Card de ciudad */
    .ciudad-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .ciudad-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .ciudad-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .ciudad-icon {
      font-size: 40px;
      color: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ciudad-icon i {
      font-size: 40px;
    }

    .ciudad-info {
      flex: 1;
    }

    .ciudad-info h4 {
      margin: 0 0 6px 0;
      color: #333;
      font-size: 18px;
    }

    .ciudad-stats {
      margin: 0;
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .separator {
      color: #ccc;
    }

    .check-icon {
      color: #667eea;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .check-icon i {
      font-size: 24px;
    }

    /* Loading */
    .loading-ciudades,
    .loading-calendario {
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Información de ciudad seleccionada */
    .ciudad-seleccionada-info {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .info-header h3 {
      margin: 0;
      color: #333;
      font-size: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-header h3 i {
      color: #667eea;
      font-size: 20px;
    }

    .cambiar-btn {
      padding: 8px 16px;
      background: #f5f5f5;
      border: none;
      border-radius: 6px;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cambiar-btn:hover {
      background: #667eea;
      color: white;
    }

    .stats-row {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .stat-value {
      color: #333;
      font-weight: 600;
      font-size: 14px;
    }

    /* Calendario */
    .calendario-section {
      animation: fadeIn 0.5s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .calendario-grid {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    /* Leyenda */
    .leyenda {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .color-box {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 2px solid #e0e0e0;
    }

    .color-box.disponible {
      background: #d4edda;
      border-color: #28a745;
    }

    .color-box.no-disponible {
      background: #f8d7da;
      border-color: #dc3545;
    }

    .color-box.pasado {
      background: #f5f5f5;
      border-color: #ccc;
    }

    /* CA3: Grid de días */
    .dias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
    }

    .dia-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.3s;
      cursor: pointer;
    }

    .dia-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .dia-card.disponible {
      border-color: #28a745;
      background: linear-gradient(135deg, rgba(40, 167, 69, 0.05) 0%, rgba(40, 167, 69, 0.1) 100%);
    }

    .dia-card.no-disponible {
      border-color: #dc3545;
      background: linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.1) 100%);
      opacity: 0.7;
    }

    .dia-card.pasado {
      border-color: #ccc;
      background: #f9f9f9;
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dia-fecha {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .dia-numero {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      line-height: 1;
    }

    .dia-mes {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .dia-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .disponibilidad-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
    }

    .disponibilidad-badge.disponible {
      background: #28a745;
      color: white;
    }

    .disponibilidad-badge:not(.disponible) {
      background: #dc3545;
      color: white;
    }

    .habitaciones-count {
      display: flex;
      align-items: baseline;
      gap: 2px;
      font-size: 14px;
    }

    .habitaciones-count .count {
      font-weight: bold;
      color: #333;
      font-size: 16px;
    }

    .habitaciones-count .total {
      color: #666;
      font-size: 12px;
    }

    /* Error */
    .error-message {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      color: #721c24;
    }

    .error-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 10px;
      color: #dc3545;
    }

    .error-icon i {
      font-size: 32px;
    }

    .retry-btn {
      margin-top: 12px;
      padding: 8px 20px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .retry-btn:hover {
      background: #c82333;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .calendario-container {
        padding: 16px;
      }

      .header h1 {
        font-size: 24px;
      }

      .ciudades-list {
        grid-template-columns: 1fr;
      }

      .dias-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
      }

      .leyenda {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class CalendarioDisponibilidadComponent implements OnInit {
  // CA1: Lista de ciudades
  ciudades: Ciudad[] = [];
  isLoadingCiudades = false;
  errorCiudades = '';

  // CA1, CA2: Ciudad seleccionada
  ciudadSeleccionada: string | null = null;

  // CA3: Disponibilidad
  disponibilidadData: any = null;
  isLoadingDisponibilidad = false;
  errorDisponibilidad = '';

  // Rango de fechas (30 días por defecto)
  fechaInicio: string;
  fechaFin: string;

  constructor(private disponibilidadService: DisponibilidadService) {
    const rango = this.disponibilidadService.getRangoFechasPorDefecto();
    this.fechaInicio = rango.fechaInicio;
    this.fechaFin = rango.fechaFin;
  }

  ngOnInit(): void {
    this.cargarCiudades();
  }

  /**
   * CA1: Cargar lista de ciudades disponibles
   */
  cargarCiudades(): void {
    this.isLoadingCiudades = true;
    this.errorCiudades = '';

    this.disponibilidadService.getCiudades().subscribe({
      next: (response) => {
        this.isLoadingCiudades = false;
        if (response.success) {
          this.ciudades = response.ciudades;
        } else {
          this.errorCiudades = 'No se pudieron cargar las ciudades';
        }
      },
      error: (error) => {
        this.isLoadingCiudades = false;
        this.errorCiudades = error.error?.msg || 'Error al cargar las ciudades';
        console.error('Error cargando ciudades:', error);
      }
    });
  }

  /**
   * CA1, CA2: Seleccionar una ciudad y cargar su disponibilidad
   */
  seleccionarCiudad(ciudad: string): void {
    if (this.ciudadSeleccionada === ciudad) {
      return; // Ya está seleccionada
    }

    // CA2: Cambio de ciudad - refresca el calendario
    this.ciudadSeleccionada = ciudad;
    this.cargarDisponibilidad();
  }

  /**
   * Cargar disponibilidad de la ciudad seleccionada
   */
  cargarDisponibilidad(): void {
    if (!this.ciudadSeleccionada) return;

    this.isLoadingDisponibilidad = true;
    this.errorDisponibilidad = '';
    this.disponibilidadData = null;

    this.disponibilidadService
      .getDisponibilidadPorCiudad(
        this.ciudadSeleccionada,
        this.fechaInicio,
        this.fechaFin
      )
      .subscribe({
        next: (response) => {
          this.isLoadingDisponibilidad = false;
          if (response.success) {
            this.disponibilidadData = response;
          } else {
            this.errorDisponibilidad = response.msg || 'No se pudo cargar la disponibilidad';
          }
        },
        error: (error) => {
          this.isLoadingDisponibilidad = false;
          this.errorDisponibilidad = error.error?.msg || 'Error al cargar la disponibilidad';
          console.error('Error cargando disponibilidad:', error);
        }
      });
  }

  /**
   * Limpiar selección de ciudad
   */
  limpiarSeleccion(): void {
    this.ciudadSeleccionada = null;
    this.disponibilidadData = null;
    this.errorDisponibilidad = '';
  }

  /**
   * Helper: Obtener día del mes
   */
  getDiaMes(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00');
    return date.getDate().toString();
  }

  /**
   * Helper: Obtener mes abreviado
   */
  getMesAbreviado(fecha: string): string {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const date = new Date(fecha + 'T00:00:00');
    return meses[date.getMonth()];
  }

  /**
   * Helper: Verificar si es fecha pasada
   */
  esFechaPasada(fecha: string): boolean {
    const fechaDate = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaDate < hoy;
  }

  /**
   * Helper: Obtener título tooltip para el día
   */
  getTituloTooltip(dia: DisponibilidadDia): string {
    if (this.esFechaPasada(dia.fecha)) {
      return 'Fecha pasada';
    }
    if (dia.disponible) {
      return `${dia.habitacionesDisponibles} habitación(es) disponible(s) de ${dia.totalHabitaciones}`;
    }
    return 'Sin disponibilidad';
  }

  /**
   * Helper: Formatear rango de fechas
   */
  formatDateRange(): string {
    const inicio = new Date(this.fechaInicio + 'T00:00:00');
    const fin = new Date(this.fechaFin + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${inicio.toLocaleDateString('es-ES', opciones)} - ${fin.toLocaleDateString('es-ES', opciones)}`;
  }

  /**
   * Volver al inicio
   */
  volver(): void {
    // Implementar Router
    window.location.href = '/';
  }

  /**
   * Ir a buscar habitaciones
   */
  irABuscar(): void {
    // Implementar Router
    window.location.href = '/buscar-habitaciones';
  }
}
