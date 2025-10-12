import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { AuthService } from '../../services/auth.service';
import { EstadisticasGenerales, EstadisticasService } from '../../services/estadisticas.service';
import { ReportesBarChartComponent } from './reportes-bar-chart.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportesBarChartComponent],
  template: `
    <div class="reportes-container">
      <div class="reportes-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="header-text">
            <h1 class="reportes-title">Reportes Avanzados</h1>
            <p class="reportes-subtitle">Análisis completo de rendimiento y estadísticas</p>
          </div>
          <button class="btn-exportar" (click)="exportarReporte()">
            <i class="fas fa-download"></i>
            <span>Exportar</span>
          </button>
        </div>
        <div class="header-decoration"></div>
      </div>

      <div class="reportes-grid">
        <div class="reporte-card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-chart-bar"></i>
              Reservas por Mes
            </h5>
          </div>
          <div class="card-body">
            <app-reportes-bar-chart
              [labels]="labelsReservasPorMes"
              [data]="dataReservasPorMes"
              title="Reservas por Mes">
            </app-reportes-bar-chart>
          </div>
        </div>

        <div class="reporte-card">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-dollar-sign"></i>
              Ingresos por Mes
            </h5>
          </div>
          <div class="card-body">
            <app-reportes-bar-chart
              [labels]="labelsReservasPorMes"
              [data]="dataIngresosPorMes"
              title="Ingresos por Mes">
            </app-reportes-bar-chart>
          </div>
        </div>

        <div class="reporte-card" *ngIf="labelsTopHoteles.length > 0">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-hotel"></i>
              Top Hoteles por Reservas
            </h5>
          </div>
          <div class="card-body">
            <app-reportes-bar-chart
              [labels]="labelsTopHoteles"
              [data]="dataTopHoteles"
              title="Reservas por Hotel">
            </app-reportes-bar-chart>
          </div>
        </div>

        <div class="reporte-card dual-content" *ngIf="labelsHabitaciones.length > 0">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-bed"></i>
              Habitaciones por Hotel
            </h5>
          </div>
          <div class="card-body dual-layout">
            <div class="chart-section">
              <app-reportes-bar-chart
                [labels]="labelsHabitaciones"
                [data]="dataHabitaciones"
                title="Habitaciones por Hotel">
              </app-reportes-bar-chart>
            </div>
            <div class="table-section">
              <div class="elegant-table">
                <div class="table-header">
                  <div class="header-cell">Hotel</div>
                  <div class="header-cell"># Habitaciones</div>
                </div>
                <div class="table-body">
                  <div class="table-row" *ngFor="let hotel of labelsHabitaciones; let i = index">
                    <div class="table-cell">{{ hotel }}</div>
                    <div class="table-cell number">{{ dataHabitaciones[i] }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="reporte-card dual-content" *ngIf="labelsSalas.length > 0">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-building"></i>
              Salas por Hotel
            </h5>
          </div>
          <div class="card-body dual-layout">
            <div class="chart-section">
              <app-reportes-bar-chart
                [labels]="labelsSalas"
                [data]="dataSalas"
                title="Salas por Hotel">
              </app-reportes-bar-chart>
            </div>
            <div class="table-section">
              <div class="elegant-table">
                <div class="table-header">
                  <div class="header-cell">Hotel</div>
                  <div class="header-cell"># Salas</div>
                </div>
                <div class="table-body">
                  <div class="table-row" *ngFor="let hotel of labelsSalas; let i = index">
                    <div class="table-cell">{{ hotel }}</div>
                    <div class="table-cell number">{{ dataSalas[i] }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="reporte-card dual-content" *ngIf="labelsPaquetes.length > 0">
          <div class="card-header">
            <h5 class="card-title">
              <i class="fas fa-gift"></i>
              Paquetes por Hotel
            </h5>
          </div>
          <div class="card-body dual-layout">
            <div class="chart-section">
              <app-reportes-bar-chart
                [labels]="labelsPaquetes"
                [data]="dataPaquetes"
                title="Paquetes por Hotel">
              </app-reportes-bar-chart>
            </div>
            <div class="table-section">
              <div class="elegant-table">
                <div class="table-header">
                  <div class="header-cell">Hotel</div>
                  <div class="header-cell"># Paquetes</div>
                </div>
                <div class="table-body">
                  <div class="table-row" *ngFor="let hotel of labelsPaquetes; let i = index">
                    <div class="table-cell">{{ hotel }}</div>
                    <div class="table-cell number">{{ dataPaquetes[i] }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Reportes Avanzados -->
      <div class="reportes-avanzados-section">
        <div class="section-header">
          <h2 class="section-title">Reportes Estratégicos</h2>
          <div class="date-range-controls">
            <label>Desde:</label>
            <input type="date" [(ngModel)]="fechaInicio" (change)="onFechasChange()" class="date-input">
            <label>Hasta:</label>
            <input type="date" [(ngModel)]="fechaFin" (change)="onFechasChange()" class="date-input">
          </div>
        </div>

        <!-- Navegación por pestañas -->
        <div class="tabs-navigation">
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'general'"
            (click)="changeTab('general')">
            <i class="fas fa-chart-line"></i>
            General
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'ocupacion'"
            (click)="changeTab('ocupacion')">
            <i class="fas fa-calendar-check"></i>
            Ocupación
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'eventos'"
            (click)="changeTab('eventos')">
            <i class="fas fa-users"></i>
            Eventos
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'kpis'"
            (click)="changeTab('kpis')">
            <i class="fas fa-trophy"></i>
            KPIs
          </button>
        </div>

        <!-- Contenido de pestañas -->
        <div class="tab-content">
          
          <!-- Pestaña General (la que ya existía) -->
          <div class="tab-pane" [class.active]="activeTab === 'general'">
            <!-- El contenido actual ya está arriba -->
          </div>

          <!-- Pestaña Reporte de Ocupación -->
          <div class="tab-pane" [class.active]="activeTab === 'ocupacion'">
            <div class="reporte-ocupacion" *ngIf="!isLoadingOcupacion">
              <div class="reporte-header-section">
                <h3>Reporte de Ocupación por Sede</h3>
                <p>Análisis de ocupación en el periodo seleccionado</p>
              </div>

              <!-- Gráfica de Ocupación -->
              <div class="chart-section" *ngIf="reporteOcupacion.length > 0">
                <app-reportes-bar-chart
                  [labels]="labelsOcupacion"
                  [data]="dataOcupacion"
                  title="Ocupación por Sede (%)">
                </app-reportes-bar-chart>
              </div>
              
              <div class="ocupacion-grid" *ngIf="reporteOcupacion.length > 0">
                <div class="ocupacion-card" *ngFor="let sede of reporteOcupacion">
                  <div class="card-header-ocupacion">
                    <h4>{{ sede.hotel }}</h4>
                    <div class="ocupacion-badge" [ngClass]="'ocupacion-' + (sede.ocupacionPromedio >= 80 ? 'alta' : sede.ocupacionPromedio >= 50 ? 'media' : 'baja')">
                      {{ sede.ocupacionPromedio }}%
                    </div>
                  </div>
                  <div class="ocupacion-metrics">
                    <div class="metric">
                      <span class="metric-label">Habitaciones</span>
                      <span class="metric-value">{{ sede.totalHabitaciones }}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Reservas</span>
                      <span class="metric-value">{{ sede.reservasConfirmadas }}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Ingresos</span>
                      <span class="metric-value">\${{ sede.ingresosTotales | number:'1.0-0' }}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Días Periodo</span>
                      <span class="metric-value">{{ sede.diasRango }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="no-data" *ngIf="reporteOcupacion.length === 0">
                <i class="fas fa-calendar-times"></i>
                <p>No hay datos de ocupación para el periodo seleccionado</p>
              </div>
            </div>
            
            <div class="loading-indicator" *ngIf="isLoadingOcupacion">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Cargando reporte de ocupación...</p>
            </div>
          </div>

          <!-- Pestaña Reporte de Eventos -->
          <div class="tab-pane" [class.active]="activeTab === 'eventos'">
            <div class="reporte-eventos" *ngIf="!isLoadingEventos">
              <div class="reporte-header-section">
                <h3>Reporte de Eventos y Asistentes</h3>
                <p>Análisis de uso de salones y eventos corporativos</p>
              </div>

              <!-- Resumen de eventos -->
              <div class="eventos-resumen" *ngIf="resumenEventos.totalEventos">
                <div class="resumen-card">
                  <div class="resumen-metric">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                      <span class="metric-number">{{ resumenEventos.totalEventos }}</span>
                      <span class="metric-label">Eventos</span>
                    </div>
                  </div>
                </div>
                <div class="resumen-card">
                  <div class="resumen-metric">
                    <i class="fas fa-users"></i>
                    <div>
                      <span class="metric-number">{{ resumenEventos.totalAsistentes }}</span>
                      <span class="metric-label">Asistentes</span>
                    </div>
                  </div>
                </div>
                <div class="resumen-card">
                  <div class="resumen-metric">
                    <i class="fas fa-building"></i>
                    <div>
                      <span class="metric-number">{{ resumenEventos.totalSalones }}</span>
                      <span class="metric-label">Salones</span>
                    </div>
                  </div>
                </div>
                <div class="resumen-card">
                  <div class="resumen-metric">
                    <i class="fas fa-dollar-sign"></i>
                    <div>
                      <span class="metric-number">\${{ resumenEventos.ingresosEventos | number:'1.0-0' }}</span>
                      <span class="metric-label">Ingresos</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfica de Eventos por Salón -->
              <div class="chart-section" *ngIf="reporteEventos.length > 0">
                <app-reportes-bar-chart
                  [labels]="labelsEventos"
                  [data]="dataEventos"
                  title="Eventos por Salón">
                </app-reportes-bar-chart>
              </div>

              <!-- Listado de salones y eventos -->
              <div class="eventos-detalle" *ngIf="reporteEventos.length > 0">
                <div class="salon-card" *ngFor="let salon of reporteEventos">
                  <div class="salon-header">
                    <h4>{{ salon.hotel }} - {{ salon.salon }}</h4>
                    <div class="salon-stats">
                      <span class="stat">Capacidad: {{ salon.capacidadSalon }}</span>
                      <span class="stat">Utilización: {{ salon.utilizacionPromedio }}%</span>
                    </div>
                  </div>
                  
                  <div class="eventos-list">
                    <div class="evento-item" *ngFor="let evento of salon.eventos">
                      <div class="evento-fecha">
                        {{ evento.fecha | date:'dd/MM/yyyy HH:mm' }}
                      </div>
                      <div class="evento-cliente">
                        <strong>{{ evento.cliente }}</strong>
                        <small>{{ evento.empresa }}</small>
                      </div>
                      <div class="evento-metrics">
                        <span class="asistentes">{{ evento.asistentes }} personas</span>
                        <span class="duracion">{{ evento.duracion }}h</span>
                        <span class="ingresos">\${{ evento.ingresos | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="no-data" *ngIf="reporteEventos.length === 0">
                <i class="fas fa-calendar-times"></i>
                <p>No hay eventos programados para el periodo seleccionado</p>
              </div>
            </div>
            
            <div class="loading-indicator" *ngIf="isLoadingEventos">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Cargando reporte de eventos...</p>
            </div>
          </div>

          <!-- Pestaña KPIs por Sede -->
          <div class="tab-pane" [class.active]="activeTab === 'kpis'">
            <div class="reporte-kpis" *ngIf="!isLoadingKPIs">
              <div class="reporte-header-section">
                <h3>KPIs de Desempeño por Sede</h3>
                <p>Monitoreo de indicadores clave de rendimiento</p>
              </div>

              <!-- Resumen Global -->
              <div class="kpis-resumen" *ngIf="resumenKPIs.totalSedes">
                <div class="resumen-global">
                  <div class="global-metric">
                    <i class="fas fa-building"></i>
                    <div>
                      <span class="metric-number">{{ resumenKPIs.totalSedes }}</span>
                      <span class="metric-label">Sedes</span>
                    </div>
                  </div>
                  <div class="global-metric">
                    <i class="fas fa-chart-line"></i>
                    <div>
                      <span class="metric-number">{{ resumenKPIs.ocupacionPromedioGlobal }}%</span>
                      <span class="metric-label">Ocupación Global</span>
                    </div>
                  </div>
                  <div class="global-metric">
                    <i class="fas fa-trophy"></i>
                    <div>
                      <span class="metric-label">Mejor Sede</span>
                      <span class="metric-value">{{ resumenKPIs.mejorSede }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfica de Ingresos por Sede -->
              <div class="chart-section" *ngIf="kpisSedes.length > 0">
                <app-reportes-bar-chart
                  [labels]="labelsKPIs"
                  [data]="dataKPIs"
                  title="Ingresos Totales por Sede">
                </app-reportes-bar-chart>
              </div>

              <!-- Tabla de KPIs por sede -->
              <div class="kpis-table" *ngIf="kpisSedes.length > 0">
                <div class="table-container">
                  <table class="kpis-data-table">
                    <thead>
                      <tr>
                        <th>Ranking</th>
                        <th>Sede</th>
                        <th>Reservas</th>
                        <th>Ingresos</th>
                        <th>Ocupación</th>
                        <th>RevPAR</th>
                        <th>Calificación</th>
                        <th>Tendencia</th>
                        <th>Desempeño</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let sede of kpisSedes" class="kpi-row">
                        <td class="ranking">
                          <span class="ranking-badge ranking-{{ sede.ranking }}">{{ sede.ranking }}</span>
                        </td>
                        <td class="sede-info">
                          <strong>{{ sede.sede }}</strong>
                          <small>{{ sede.ubicacion }}</small>
                        </td>
                        <td class="reservas">{{ sede.totalReservas }}</td>
                        <td class="ingresos">\${{ sede.ingresosTotales | number:'1.0-0' }}</td>
                        <td class="ocupacion">{{ sede.tasaOcupacionHabitaciones }}%</td>
                        <td class="revpar">\${{ sede.revPAR | number:'1.0-0' }}</td>
                        <td class="calificacion">
                          <div class="rating">
                            <span class="rating-value">{{ sede.calificacionPromedio }}</span>
                            <i class="fas fa-star"></i>
                          </div>
                        </td>
                        <td class="tendencia">
                          <div class="tendencia-indicator">
                            <i [ngClass]="getTendenciaIcon(sede.tendenciaReservas)"></i>
                            <span>{{ sede.tendenciaReservas }}%</span>
                          </div>
                        </td>
                        <td class="desempeño">
                          <span class="nivel-badge" [ngClass]="getNivelClass(sede['nivelDesempeño'])">
                            {{ sede['nivelDesempeño'] }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="no-data" *ngIf="kpisSedes.length === 0">
                <i class="fas fa-chart-line"></i>
                <p>No hay datos de KPIs para el periodo seleccionado</p>
              </div>
            </div>
            
            <div class="loading-indicator" *ngIf="isLoadingKPIs">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Cargando KPIs de sedes...</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .reportes-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem;
      font-family: 'Playfair Display', 'Georgia', serif;
    }

    .reportes-header {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 60px rgba(218, 165, 32, 0.3);
      border: 2px solid #FFD700;
      position: relative;
      overflow: hidden;
    }

    .reportes-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
      border-radius: 20px 20px 0 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      color: #FFFFFF;
      font-size: 2rem;
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .header-text {
      flex: 1;
    }

    .reportes-title {
      color: #FFFFFF;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      letter-spacing: 1px;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .reportes-subtitle {
      color: #FFFFFF;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
      opacity: 0.95;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .btn-exportar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.9);
      color: #2C1810;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
      backdrop-filter: blur(10px);
      text-shadow: none;
    }

    .btn-exportar:hover {
      background: rgba(255, 255, 255, 1);
      border-color: rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.4);
      color: #1C2526;
    }

    .header-decoration {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(184, 151, 120, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      z-index: 1;
    }

    .reportes-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .reporte-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      box-shadow: 0 15px 40px rgba(28, 37, 38, 0.08);
      border: 1px solid rgba(184, 151, 120, 0.15);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .reporte-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 60px rgba(28, 37, 38, 0.12);
    }

    .card-header {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 215, 0, 0.3);
    }

    .card-title {
      color: #FFFFFF;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Playfair Display', serif;
      letter-spacing: 0.5px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .card-title i {
      color: #FFFFFF;
      font-size: 1.2rem;
      filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
    }

    .card-body {
      padding: 2rem;
    }

    .dual-content .card-body {
      padding: 1rem 2rem 2rem 2rem;
    }

    .dual-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      align-items: start;
    }

    .chart-section {
      min-height: 300px;
    }

    .table-section {
      display: flex;
      flex-direction: column;
    }

    .elegant-table {
      background: rgba(248, 241, 233, 0.3);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(184, 151, 120, 0.2);
    }

    .table-header {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      display: grid;
      grid-template-columns: 1fr auto;
      color: #FFFFFF;
    }

    .header-cell {
      padding: 1rem;
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
    }

    .table-body {
      max-height: 200px;
      overflow-y: auto;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr auto;
      border-bottom: 1px solid rgba(184, 151, 120, 0.1);
      transition: all 0.2s ease;
    }

    .table-row:hover {
      background: rgba(184, 151, 120, 0.1);
    }

    .table-cell {
      padding: 0.75rem 1rem;
      color: #1C2526;
      font-weight: 500;
      font-family: 'Crimson Text', serif;
    }

    .table-cell.number {
      text-align: center;
      font-weight: 700;
      color: #4A1B2F;
    }

    /* Scrollbar personalizada para tablas */
    .table-body::-webkit-scrollbar {
      width: 6px;
    }

    .table-body::-webkit-scrollbar-track {
      background: rgba(248, 241, 233, 0.3);
      border-radius: 3px;
    }

    .table-body::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #B89778, #4A1B2F);
      border-radius: 3px;
    }

    .table-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #4A1B2F, #1C2526);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .dual-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .table-section {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .reportes-container {
        padding: 1rem;
      }

      .reportes-header {
        padding: 2rem 1.5rem;
        margin-bottom: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .icon-wrapper {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }

      .reportes-title {
        font-size: 2rem;
      }

      .reportes-subtitle {
        font-size: 1rem;
      }

      .reportes-grid {
        gap: 1.5rem;
      }

      .card-body {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .reportes-container {
        padding: 0.5rem;
      }

      .reportes-header {
        padding: 1.5rem 1rem;
        border-radius: 15px;
      }

      .reportes-title {
        font-size: 1.8rem;
      }

      .reportes-subtitle {
        font-size: 0.95rem;
      }

      .reporte-card {
        border-radius: 15px;
      }

      .card-body {
        padding: 1rem;
      }
    }

    /* === ESTILOS PARA REPORTES AVANZADOS === */

    .reportes-avanzados-section {
      margin-top: 2rem;
    }

    .section-header {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      backdrop-filter: blur(20px);
      border-radius: 15px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 30px rgba(218, 165, 32, 0.3);
      border: 1px solid #FFD700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      color: #FFFFFF;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .date-range-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .date-range-controls label {
      color: #FFFFFF;
      font-weight: 600;
      font-size: 0.9rem;
      font-family: 'Crimson Text', serif;
    }

    .date-input {
      padding: 8px 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      color: #2C1810;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
      min-width: 140px;
    }

    .date-input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
    }

    /* === ESTILOS PARA NAVEGACIÓN POR PESTAÑAS === */

    .tabs-navigation {
      display: flex;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      padding: 0.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 25px rgba(28, 37, 38, 0.08);
      border: 1px solid rgba(184, 151, 120, 0.15);
      overflow-x: auto;
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 12px 18px;
      border: none;
      background: transparent;
      color: #666;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      font-family: 'Crimson Text', serif;
      min-width: fit-content;
    }

    .tab-button:hover {
      background: rgba(218, 165, 32, 0.1);
      color: #DAA520;
    }

    .tab-button.active {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 15px rgba(218, 165, 32, 0.3);
    }

    .tab-button i {
      font-size: 1rem;
    }

    /* === CONTENIDO DE PESTAÑAS === */

    .tab-content {
      position: relative;
    }

    .tab-pane {
      display: none;
      animation: fadeIn 0.3s ease-in;
    }

    .tab-pane.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* === ESTILOS PARA REPORTE DE OCUPACIÓN === */

    .reporte-ocupacion,
    .reporte-eventos,
    .reporte-kpis {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 15px 40px rgba(28, 37, 38, 0.08);
      border: 1px solid rgba(184, 151, 120, 0.15);
    }

    .reporte-header-section {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(218, 165, 32, 0.2);
    }

    .reporte-header-section h3 {
      color: #2C1810;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      font-family: 'Playfair Display', serif;
    }

    .reporte-header-section p {
      color: #666;
      font-size: 1rem;
      margin: 0;
      font-family: 'Crimson Text', serif;
    }

    .ocupacion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .ocupacion-card {
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 8px 25px rgba(28, 37, 38, 0.1);
      border: 1px solid rgba(184, 151, 120, 0.2);
      transition: all 0.3s ease;
    }

    .ocupacion-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(28, 37, 38, 0.15);
    }

    .card-header-ocupacion {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(218, 165, 32, 0.2);
    }

    .card-header-ocupacion h4 {
      color: #2C1810;
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      font-family: 'Playfair Display', serif;
    }

    .ocupacion-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 700;
      color: #FFFFFF;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .ocupacion-badge.ocupacion-alta {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .ocupacion-badge.ocupacion-media {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .ocupacion-badge.ocupacion-baja {
      background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
    }

    .ocupacion-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 10px;
      border: 1px solid rgba(184, 151, 120, 0.1);
    }

    .metric-label {
      color: #666;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
      font-family: 'Crimson Text', serif;
    }

    .metric-value {
      color: #2C1810;
      font-size: 1.1rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }

    /* === ESTILOS PARA REPORTE DE EVENTOS === */

    .eventos-resumen {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .resumen-card {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      border-radius: 15px;
      padding: 1.5rem;
      color: #FFFFFF;
      text-align: center;
      box-shadow: 0 8px 25px rgba(218, 165, 32, 0.3);
    }

    .resumen-metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .resumen-metric i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .metric-number {
      font-size: 1.8rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }

    .metric-label {
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
    }

    .eventos-detalle {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .salon-card {
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 8px 25px rgba(28, 37, 38, 0.1);
      border: 1px solid rgba(184, 151, 120, 0.2);
    }

    .salon-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(218, 165, 32, 0.2);
    }

    .salon-header h4 {
      color: #2C1810;
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      font-family: 'Playfair Display', serif;
    }

    .salon-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      color: #666;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Crimson Text', serif;
    }

    .eventos-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .evento-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 10px;
      border: 1px solid rgba(184, 151, 120, 0.1);
      transition: all 0.2s ease;
    }

    .evento-item:hover {
      background: rgba(255, 255, 255, 1);
      transform: translateX(5px);
    }

    .evento-fecha {
      color: #666;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Crimson Text', serif;
      min-width: 140px;
    }

    .evento-cliente {
      display: flex;
      flex-direction: column;
    }

    .evento-cliente strong {
      color: #2C1810;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }

    .evento-cliente small {
      color: #666;
      font-size: 0.8rem;
      font-family: 'Crimson Text', serif;
    }

    .evento-metrics {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .asistentes,
    .duracion,
    .ingresos {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      font-family: 'Crimson Text', serif;
    }

    .asistentes {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }

    .duracion {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .ingresos {
      background: rgba(218, 165, 32, 0.1);
      color: #DAA520;
    }

    /* === ESTILOS PARA KPIs === */

    .kpis-resumen {
      margin-bottom: 2rem;
    }

    .resumen-global {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .global-metric {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      border-radius: 15px;
      padding: 1.5rem;
      color: #FFFFFF;
      text-align: center;
      box-shadow: 0 8px 25px rgba(218, 165, 32, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .global-metric i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .global-metric .metric-number {
      font-size: 1.8rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }

    .global-metric .metric-value {
      font-size: 1.1rem;
      font-weight: 600;
      font-family: 'Playfair Display', serif;
    }

    .kpis-table {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(28, 37, 38, 0.1);
      border: 1px solid rgba(184, 151, 120, 0.2);
    }

    .table-container {
      overflow-x: auto;
    }

    .kpis-data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .kpis-data-table th {
      background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
      color: #FFFFFF;
      padding: 1rem;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
    }

    .kpis-data-table td {
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid rgba(184, 151, 120, 0.1);
      font-family: 'Crimson Text', serif;
    }

    .kpi-row:hover {
      background: rgba(218, 165, 32, 0.05);
    }

    .ranking-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .ranking-badge.ranking-1 {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #2C1810;
    }

    .ranking-badge.ranking-2 {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
      color: #2C1810;
    }

    .ranking-badge.ranking-3 {
      background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
    }

    .sede-info {
      text-align: left !important;
    }

    .sede-info strong {
      color: #2C1810;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }

    .sede-info small {
      display: block;
      color: #666;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .rating {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    .rating-value {
      font-weight: 700;
      color: #2C1810;
    }

    .rating i {
      color: #ffc107;
    }

    .tendencia-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    .tendencia-indicator i.fa-arrow-up {
      color: #28a745;
    }

    .tendencia-indicator i.fa-arrow-down {
      color: #dc3545;
    }

    .tendencia-indicator i.fa-minus {
      color: #6c757d;
    }

    .nivel-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #FFFFFF;
    }

    .nivel-badge.excelente {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .nivel-badge.bueno {
      background: linear-gradient(135deg, #17a2b8 0%, #6610f2 100%);
    }

    .nivel-badge.regular {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .nivel-badge.deficiente {
      background: linear-gradient(135deg, #dc3545 0%, #e83e8c 100%);
    }

    /* === INDICADORES DE CARGA Y DATOS VACÍOS === */

    .loading-indicator,
    .no-data {
      text-align: center;
      padding: 3rem 2rem;
      color: #666;
    }

    .loading-indicator i,
    .no-data i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #DAA520;
    }

    .loading-indicator p,
    .no-data p {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      font-family: 'Crimson Text', serif;
    }

    .loading-indicator i.fa-spin {
      animation: spin 1s linear infinite;
    }

    /* === RESPONSIVE PARA REPORTES AVANZADOS === */

    @media (max-width: 1200px) {
      .ocupacion-grid {
        grid-template-columns: 1fr;
      }

      .eventos-resumen {
        grid-template-columns: repeat(2, 1fr);
      }

      .resumen-global {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .date-range-controls {
        justify-content: center;
      }

      .tabs-navigation {
        flex-wrap: wrap;
        justify-content: center;
      }

      .tab-button {
        flex: 1;
        min-width: 120px;
      }

      .eventos-resumen,
      .resumen-global {
        grid-template-columns: 1fr;
      }

      .ocupacion-metrics {
        grid-template-columns: 1fr;
      }

      .evento-item {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 0.5rem;
      }

      .evento-fecha {
        min-width: auto;
      }

      .table-container {
        font-size: 0.8rem;
      }

      .kpis-data-table th,
      .kpis-data-table td {
        padding: 0.5rem 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .reporte-ocupacion,
      .reporte-eventos,
      .reporte-kpis {
        padding: 1rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .date-input {
        min-width: 120px;
      }

      .tab-button {
        padding: 10px 12px;
        font-size: 0.85rem;
      }

      .ocupacion-card,
      .salon-card {
        padding: 1rem;
      }

      .card-header-ocupacion {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
        gap: 0.5rem;
      }
    }
  `]
})
export class ReportesComponent implements OnInit {
  // Propiedades para datos reales
  estadisticas: EstadisticasGenerales = {};
  isLoading = true;
  error = '';
  currentUser: any = null;

  // Datos de reportes
  totalReservas = 0;
  ingresosTotales = 0;
  ocupacionPromedio = 0;
  usuariosActivos = 0;

  reservasPorMes: any[] = [];
  topHoteles: any[] = [];

  // Propiedades para gráficas
  labelsReservasPorMes: string[] = [];
  dataReservasPorMes: number[] = [];
  dataIngresosPorMes: number[] = [];
  labelsTopHoteles: string[] = [];
  dataTopHoteles: number[] = [];
  labelsHabitaciones: string[] = [];
  dataHabitaciones: number[] = [];
  labelsSalas: string[] = [];
  dataSalas: number[] = [];
  labelsPaquetes: string[] = [];
  dataPaquetes: number[] = [];

  // Propiedades para gráficas de reportes avanzados
  labelsOcupacion: string[] = [];
  dataOcupacion: number[] = [];
  labelsEventos: string[] = [];
  dataEventos: number[] = [];
  labelsKPIs: string[] = [];
  dataKPIs: number[] = [];

  // Nuevas propiedades para reportes avanzados
  // Rango de fechas para reportes
  fechaInicio: string = '';
  fechaFin: string = '';
  
  // Datos de reporte de ocupación
  reporteOcupacion: any[] = [];
  isLoadingOcupacion = false;
  
  // Datos de reporte de eventos
  reporteEventos: any[] = [];
  resumenEventos: any = {};
  isLoadingEventos = false;
  
  // Datos de KPIs por sede
  kpisSedes: any[] = [];
  resumenKPIs: any = {};
  isLoadingKPIs = false;
  
  // Control de pestañas
  activeTab: string = 'general';

  constructor(
    private estadisticasService: EstadisticasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.inicializarFechas();
    this.cargarDatosReportes();
  }

  inicializarFechas(): void {
    const ahora = new Date();
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    
    this.fechaInicio = primerDiaMes.toISOString().split('T')[0];
    this.fechaFin = ultimoDiaMes.toISOString().split('T')[0];
  }

  cargarDatosReportes(): void {
    // console.log('🔄 Cargando datos de reportes...');
    this.isLoading = true;
    this.error = '';
    
    this.estadisticasService.obtenerEstadisticasGenerales().subscribe({
      next: (response) => {
        // console.log('✅ Respuesta del servicio recibida:', response);
        // console.log('✅ response.stats:', response.stats);
        // console.log('✅ response.stats.reservasPorMes:', response.stats?.reservasPorMes);
        
        if (response.success && response.stats) {
          this.estadisticas = response.stats;
          // console.log('📊 Estadísticas asignadas:', this.estadisticas);
          // console.log('📊 reservasPorMes asignadas:', this.estadisticas.reservasPorMes);
          this.actualizarDatosReportes();
        } else {
          // console.log('⚠️ Respuesta no válida, usando datos por defecto');
          this.error = 'Error al cargar datos de reportes';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar datos de reportes:', error);
        this.error = 'Error de conexión al cargar reportes';
        this.isLoading = false;
        this.usarDatosPorDefecto();
        // Asegurar que los datos se asignen a las gráficas
        this.labelsReservasPorMes = this.reservasPorMes.map(m => m.nombre);
        this.dataReservasPorMes = this.reservasPorMes.map(m => m.reservas);
        this.dataIngresosPorMes = this.reservasPorMes.map(m => m.ingresos);
      }
    });
  }

  actualizarDatosReportes(): void {
    // console.log('📈 INICIO actualizarDatosReportes');
    // console.log('📈 this.estadisticas:', this.estadisticas);
    // console.log('📈 this.estadisticas.reservasPorMes:', this.estadisticas.reservasPorMes);
    
    this.totalReservas = this.estadisticas.totalReservas || 0;
    this.ingresosTotales = this.estadisticas.ingresosTotales || 0;
    this.ocupacionPromedio = this.estadisticas.ocupacionPromedio || 0;
    this.usuariosActivos = this.estadisticas.totalClientes || 0;

    // Reservas por mes
    // console.log('Reservas por mes del servicio:', this.estadisticas.reservasPorMes);
    
    if (this.estadisticas.reservasPorMes && this.estadisticas.reservasPorMes.length > 0) {
      // console.log('✅ Hay datos de reservas por mes, procesando...');
      this.reservasPorMes = this.estadisticas.reservasPorMes.map(item => ({
        nombre: this.getNombreMes(item._id?.month ?? item.month ?? 1),
        reservas: item.count ?? 0,
        ingresos: item.totalIngresos ?? 0
      }));
      this.labelsReservasPorMes = this.reservasPorMes.map(m => m.nombre);
      this.dataReservasPorMes = this.reservasPorMes.map(m => m.reservas);
      this.dataIngresosPorMes = this.reservasPorMes.map(m => m.ingresos);
      
      // console.log('📊 reservasPorMes procesado:', this.reservasPorMes);
      // console.log('📊 labelsReservasPorMes:', this.labelsReservasPorMes);
      // console.log('📊 dataReservasPorMes:', this.dataReservasPorMes);
      // console.log('Datos procesados para gráfica:', {
      //   labels: this.labelsReservasPorMes,
      //   data: this.dataReservasPorMes
      // });
    } else {
      // console.log('❌ No hay datos de reservas por mes, usando datos por defecto');
      this.usarDatosPorDefectoReservas();
      this.labelsReservasPorMes = this.reservasPorMes.map(m => m.nombre);
      this.dataReservasPorMes = this.reservasPorMes.map(m => m.reservas);
      this.dataIngresosPorMes = this.reservasPorMes.map(m => m.ingresos);
    }

    // Habitaciones por hotel
    if (this.estadisticas.habitacionesPorHotel) {
      this.labelsHabitaciones = Object.keys(this.estadisticas.habitacionesPorHotel);
      this.dataHabitaciones = Object.values(this.estadisticas.habitacionesPorHotel);
    } else {
      this.labelsHabitaciones = [];
      this.dataHabitaciones = [];
    }
    // Salas por hotel
    if (this.estadisticas.salasPorHotel) {
      this.labelsSalas = Object.keys(this.estadisticas.salasPorHotel);
      this.dataSalas = Object.values(this.estadisticas.salasPorHotel);
    } else {
      this.labelsSalas = [];
      this.dataSalas = [];
    }
    // Paquetes por hotel
    if (this.estadisticas.paquetesPorHotel) {
      this.labelsPaquetes = Object.keys(this.estadisticas.paquetesPorHotel);
      this.dataPaquetes = Object.values(this.estadisticas.paquetesPorHotel);
    } else {
      this.labelsPaquetes = [];
      this.dataPaquetes = [];
    }
  }

  usarDatosPorDefecto(): void {
    this.totalReservas = 278;
    this.ingresosTotales = 834000;
    this.ocupacionPromedio = 68;
    this.usuariosActivos = 145;
    this.usarDatosPorDefectoReservas();
    this.usarDatosPorDefectoHoteles();
  }

  usarDatosPorDefectoReservas(): void {
    this.reservasPorMes = [
      { nombre: 'Enero', reservas: 15, ingresos: 45000 },
      { nombre: 'Febrero', reservas: 22, ingresos: 68000 },
      { nombre: 'Marzo', reservas: 18, ingresos: 54000 },
      { nombre: 'Abril', reservas: 28, ingresos: 84000 },
      { nombre: 'Mayo', reservas: 31, ingresos: 93000 },
      { nombre: 'Junio', reservas: 25, ingresos: 75000 },
      { nombre: 'Julio', reservas: 35, ingresos: 105000 },
      { nombre: 'Agosto', reservas: 42, ingresos: 126000 },
      { nombre: 'Septiembre', reservas: 29, ingresos: 87000 },
      { nombre: 'Octubre', reservas: 33, ingresos: 99000 }
    ];
  }

  usarDatosPorDefectoHoteles(): void {
    this.topHoteles = [];
  }

  getNombreMes(numeroMes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numeroMes - 1] || 'Mes';
  }

  exportarReporte(): void {
    try {
      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();
      
      // Fecha actual para el nombre del archivo
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toLocaleDateString('es-ES').replace(/\//g, '-');

      // === HOJA 1: ESTADÍSTICAS GENERALES ===
      const estadisticasGenerales = [
        ['ESTADÍSTICAS GENERALES DEL SISTEMA'],
        ['Fecha de Generación:', fechaActual.toLocaleString('es-ES')],
        ['Usuario:', this.currentUser?.nombre || 'N/A'],
        [''],
        ['Métrica', 'Valor'],
        ['Total de Reservas', this.totalReservas],
        ['Ingresos Totales', `$${this.ingresosTotales}`],
        ['Ocupación Promedio', `${this.ocupacionPromedio}%`],
        ['Usuarios Activos', this.usuariosActivos],
        [''],
        ['RESERVAS POR MES'],
        ['Mes', 'Reservas', 'Ingresos'],
        ...this.reservasPorMes.map(item => [
          item.nombre,
          item.reservas,
          `$${item.ingresos}`
        ])
      ];

      if (this.labelsTopHoteles.length > 0) {
        estadisticasGenerales.push([''], ['TOP HOTELES POR RESERVAS'], ['Hotel', 'Reservas']);
        this.labelsTopHoteles.forEach((hotel, index) => {
          estadisticasGenerales.push([hotel, this.dataTopHoteles[index]]);
        });
      }

      if (this.labelsHabitaciones.length > 0) {
        estadisticasGenerales.push([''], ['HABITACIONES POR HOTEL'], ['Hotel', 'Habitaciones']);
        this.labelsHabitaciones.forEach((hotel, index) => {
          estadisticasGenerales.push([hotel, this.dataHabitaciones[index]]);
        });
      }

      if (this.labelsSalas.length > 0) {
        estadisticasGenerales.push([''], ['SALAS POR HOTEL'], ['Hotel', 'Salas']);
        this.labelsSalas.forEach((hotel, index) => {
          estadisticasGenerales.push([hotel, this.dataSalas[index]]);
        });
      }

      if (this.labelsPaquetes.length > 0) {
        estadisticasGenerales.push([''], ['PAQUETES POR HOTEL'], ['Hotel', 'Paquetes']);
        this.labelsPaquetes.forEach((hotel, index) => {
          estadisticasGenerales.push([hotel, this.dataPaquetes[index]]);
        });
      }

      const wsGeneral = XLSX.utils.aoa_to_sheet(estadisticasGenerales);
      XLSX.utils.book_append_sheet(workbook, wsGeneral, 'Estadísticas Generales');

      // === HOJA 2: REPORTE DE OCUPACIÓN ===
      if (this.reporteOcupacion.length > 0) {
        const ocupacionData = [
          ['REPORTE DE OCUPACIÓN POR SEDE'],
          [`Periodo: ${this.fechaInicio} al ${this.fechaFin}`],
          [''],
          ['Hotel', 'Total Habitaciones', 'Reservas Confirmadas', 'Ocupación (%)', 'Ingresos Totales', 'Días del Periodo'],
          ...this.reporteOcupacion.map(sede => [
            sede.hotel,
            sede.totalHabitaciones,
            sede.reservasConfirmadas,
            sede.ocupacionPromedio,
            sede.ingresosTotales,
            sede.diasRango
          ])
        ];

        const wsOcupacion = XLSX.utils.aoa_to_sheet(ocupacionData);
        XLSX.utils.book_append_sheet(workbook, wsOcupacion, 'Reporte Ocupación');
      }

      // === HOJA 3: REPORTE DE EVENTOS ===
      if (this.reporteEventos.length > 0) {
        const eventosData = [
          ['REPORTE DE EVENTOS Y ASISTENTES'],
          [`Periodo: ${this.fechaInicio} al ${this.fechaFin}`],
          [''],
          ['RESUMEN GENERAL'],
          ['Total Eventos:', this.resumenEventos.totalEventos || 0],
          ['Total Asistentes:', this.resumenEventos.totalAsistentes || 0],
          ['Total Salones:', this.resumenEventos.totalSalones || 0],
          ['Ingresos por Eventos:', `$${this.resumenEventos.ingresosEventos || 0}`],
          [''],
          ['DETALLE POR SALÓN'],
          ['Hotel', 'Salón', 'Capacidad', 'Utilización (%)', 'Eventos', 'Total Asistentes']
        ];

        this.reporteEventos.forEach(salon => {
          eventosData.push([
            salon.hotel,
            salon.salon,
            salon.capacidadSalon,
            salon.utilizacionPromedio,
            salon.eventos.length,
            salon.eventos.reduce((sum: number, evento: any) => sum + evento.asistentes, 0)
          ]);

          // Agregar detalle de eventos del salón
          if (salon.eventos.length > 0) {
            eventosData.push(['', 'EVENTOS DEL SALÓN:', '', '', '', '']);
            eventosData.push(['', 'Fecha', 'Cliente', 'Empresa', 'Asistentes', 'Ingresos']);
            salon.eventos.forEach((evento: any) => {
              eventosData.push([
                '',
                new Date(evento.fecha).toLocaleDateString('es-ES'),
                evento.cliente,
                evento.empresa,
                evento.asistentes,
                `$${evento.ingresos}`
              ]);
            });
            eventosData.push(['']); // Línea en blanco
          }
        });

        const wsEventos = XLSX.utils.aoa_to_sheet(eventosData);
        XLSX.utils.book_append_sheet(workbook, wsEventos, 'Reporte Eventos');
      }

      // === HOJA 4: KPIS POR SEDE ===
      if (this.kpisSedes.length > 0) {
        const kpisData = [
          ['KPIS DE DESEMPEÑO POR SEDE'],
          [`Periodo: ${this.fechaInicio} al ${this.fechaFin}`],
          [''],
          ['RESUMEN GLOBAL'],
          ['Total Sedes:', this.resumenKPIs.totalSedes || 0],
          ['Ocupación Promedio Global:', `${this.resumenKPIs.ocupacionPromedioGlobal || 0}%`],
          ['Mejor Sede:', this.resumenKPIs.mejorSede || 'N/A'],
          [''],
          ['DETALLE POR SEDE'],
          [
            'Ranking', 'Sede', 'Ubicación', 'Total Reservas', 'Ingresos Totales', 
            'Ocupación (%)', 'RevPAR', 'Calificación', 'Tendencia (%)', 'Nivel de Desempeño'
          ],
          ...this.kpisSedes.map(sede => [
            sede.ranking,
            sede.sede,
            sede.ubicacion || 'N/A',
            sede.totalReservas,
            sede.ingresosTotales,
            sede.tasaOcupacionHabitaciones,
            sede.revPAR,
            sede.calificacionPromedio,
            sede.tendenciaReservas,
            sede['nivelDesempeño']
          ])
        ];

        const wsKPIs = XLSX.utils.aoa_to_sheet(kpisData);
        XLSX.utils.book_append_sheet(workbook, wsKPIs, 'KPIs por Sede');
      }

      // Generar y descargar el archivo
      const nombreArchivo = `Reportes_Hoteleros_${fechaFormateada}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);

      // Mostrar mensaje de éxito
      // console.log('✅ Reporte exportado exitosamente:', nombreArchivo);
      
      // Opcional: mostrar notificación al usuario
      this.mostrarNotificacionExportacion(nombreArchivo);

    } catch (error) {
      console.error('❌ Error al exportar reporte:', error);
      this.error = 'Error al exportar el reporte. Inténtelo nuevamente.';
    }
  }

  // ===== MÉTODOS PARA NUEVOS REPORTES =====

  changeTab(tab: string): void {
    this.activeTab = tab;
    
    // Cargar datos según la pestaña
    if (tab === 'ocupacion' && this.reporteOcupacion.length === 0) {
      this.cargarReporteOcupacion();
    } else if (tab === 'eventos' && this.reporteEventos.length === 0) {
      this.cargarReporteEventos();
    } else if (tab === 'kpis' && this.kpisSedes.length === 0) {
      this.cargarKPIsSedes();
    }
  }

  cargarReporteOcupacion(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Debe seleccionar un rango de fechas válido';
      return;
    }

    this.isLoadingOcupacion = true;
    this.estadisticasService.obtenerReporteOcupacion(this.fechaInicio, this.fechaFin).subscribe({
      next: (response) => {
        if (response.success) {
          this.reporteOcupacion = response.reporte;
          // Actualizar datos para la gráfica
          this.labelsOcupacion = this.reporteOcupacion.map(r => r.hotel);
          this.dataOcupacion = this.reporteOcupacion.map(r => r.ocupacionPromedio);
          // console.log('📊 Reporte de ocupación cargado:', this.reporteOcupacion);
        } else {
          this.error = 'Error al cargar reporte de ocupación';
        }
        this.isLoadingOcupacion = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar reporte de ocupación:', error);
        this.error = 'Error de conexión al cargar reporte de ocupación';
        this.isLoadingOcupacion = false;
      }
    });
  }

  cargarReporteEventos(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Debe seleccionar un rango de fechas válido';
      return;
    }

    this.isLoadingEventos = true;
    this.estadisticasService.obtenerReporteEventos(this.fechaInicio, this.fechaFin).subscribe({
      next: (response) => {
        if (response.success) {
          this.reporteEventos = response.reporte;
          this.resumenEventos = response.resumen;
          // Actualizar datos para la gráfica
          this.labelsEventos = this.reporteEventos.map(r => r.salon);
          this.dataEventos = this.reporteEventos.map(r => r.eventos.length);
          // console.log('🎭 Reporte de eventos cargado:', this.reporteEventos);
        } else {
          this.error = 'Error al cargar reporte de eventos';
        }
        this.isLoadingEventos = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar reporte de eventos:', error);
        this.error = 'Error de conexión al cargar reporte de eventos';
        this.isLoadingEventos = false;
      }
    });
  }

  cargarKPIsSedes(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Debe seleccionar un rango de fechas válido';
      return;
    }

    this.isLoadingKPIs = true;
    this.estadisticasService.obtenerKPIsSedes(this.fechaInicio, this.fechaFin).subscribe({
      next: (response) => {
        if (response.success) {
          this.kpisSedes = response.kpis;
          this.resumenKPIs = response.resumen;
          // Actualizar datos para la gráfica
          this.labelsKPIs = this.kpisSedes.map(k => k.sede);
          this.dataKPIs = this.kpisSedes.map(k => k.ingresosTotales);
          // console.log('📈 KPIs de sedes cargados:', this.kpisSedes);
        } else {
          this.error = 'Error al cargar KPIs de sedes';
        }
        this.isLoadingKPIs = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar KPIs de sedes:', error);
        this.error = 'Error de conexión al cargar KPIs de sedes';
        this.isLoadingKPIs = false;
      }
    });
  }

  onFechasChange(): void {
    // Limpiar datos anteriores cuando cambien las fechas
    this.reporteOcupacion = [];
    this.reporteEventos = [];
    this.kpisSedes = [];
    this.resumenEventos = {};
    this.resumenKPIs = {};
    
    // Recargar el reporte activo
    if (this.activeTab === 'ocupacion') {
      this.cargarReporteOcupacion();
    } else if (this.activeTab === 'eventos') {
      this.cargarReporteEventos();
    } else if (this.activeTab === 'kpis') {
      this.cargarKPIsSedes();
    }
  }

  getNivelClass(nivel: string): string {
    const niveles: any = {
      'Excelente': 'nivel-excelente',
      'Bueno': 'nivel-bueno', 
      'Regular': 'nivel-regular',
      'Necesita Mejora': 'nivel-malo'
    };
    return niveles[nivel] || 'nivel-regular';
  }

  private mostrarNotificacionExportacion(nombreArchivo: string): void {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
        z-index: 10000;
        font-family: 'Crimson Text', serif;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
      ">
        <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
        <div>
          <div style="font-weight: 700;">¡Reporte Exportado!</div>
          <div style="font-size: 0.9rem; opacity: 0.9;">${nombreArchivo}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Eliminar notificación después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  getTendenciaIcon(tendencia: number): string {
    if (tendencia > 0) return 'fas fa-arrow-up text-success';
    if (tendencia < 0) return 'fas fa-arrow-down text-danger';
    return 'fas fa-minus text-warning';
  }
}