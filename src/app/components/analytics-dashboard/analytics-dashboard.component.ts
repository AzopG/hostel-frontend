import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  registerables
} from 'chart.js';

import { AppState } from '../../store';
import * as HotelActions from '../../store/actions/hotel.actions';
import * as HotelSelectors from '../../store/selectors/hotel.selectors';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

interface DashboardMetrics {
  totalReservas: number;
  ingresosTotales: number;
  ocupacionPromedio: number;
  calificacionPromedio: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>📊 Dashboard de Analytics</h1>
        <div class="header-actions">
          <button class="refresh-btn" (click)="refreshData()" [disabled]="isLoading">
            <span *ngIf="!isLoading">🔄</span>
            <span *ngIf="isLoading" class="loading-spinner">⏳</span>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Métricas Principales -->
      <div class="metrics-grid" *ngIf="dashboardSummary$ | async as summary">
        <div class="metric-card">
          <div class="metric-icon">🏨</div>
          <div class="metric-content">
            <div class="metric-value">{{ summary.totalReservas }}</div>
            <div class="metric-label">Total Reservas</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <div class="metric-value">\${{ (ingresosTotales | number:'1.0-0') || '0' }}</div>
            <div class="metric-label">Ingresos Totales</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">📈</div>
          <div class="metric-content">
            <div class="metric-value">{{ summary.ocupacionPromedio | number:'1.1-1' }}%</div>
            <div class="metric-label">Ocupación Promedio</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">⭐</div>
          <div class="metric-content">
            <div class="metric-value">{{ calificacionPromedio | number:'1.1-1' }}</div>
            <div class="metric-label">Calificación Promedio</div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        
        <!-- Reservas por Mes -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Reservas por Mes</h3>
            <div class="chart-controls">
              <select (change)="changeChartType($event, 'reservas')">
                <option value="line">Línea</option>
                <option value="bar">Barras</option>
                <option value="area">Área</option>
              </select>
            </div>
          </div>
          <div class="chart-container">
            <canvas #reservasChart></canvas>
          </div>
        </div>

        <!-- Ocupación por Hotel -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Ocupación por Hotel</h3>
          </div>
          <div class="chart-container">
            <canvas #ocupacionChart></canvas>
          </div>
        </div>

        <!-- Ingresos por Tipo de Habitación -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Ingresos por Tipo</h3>
          </div>
          <div class="chart-container">
            <canvas #tipoChart></canvas>
          </div>
        </div>

        <!-- Tendencia de Calificaciones -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Tendencia de Calificaciones</h3>
          </div>
          <div class="chart-container">
            <canvas #calificacionesChart></canvas>
          </div>
        </div>
      </div>

      <!-- Tabla de Datos Detallados -->
      <div class="data-table-section">
        <div class="table-header">
          <h3>Datos Detallados</h3>
          <div class="table-actions">
            <button class="export-btn" (click)="exportData()">
              📥 Exportar CSV
            </button>
          </div>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Reservas</th>
                <th>Ingresos</th>
                <th>Ocupación %</th>
                <th>Calificación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let data of monthlyData">
                <td>{{ data.mes }}</td>
                <td>{{ data.reservas }}</td>
                <td>\${{ data.ingresos | number:'1.0-0' }}</td>
                <td>{{ data.ocupacion }}%</td>
                <td>{{ data.calificacion | number:'1.1-1' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-content">
          <div class="loading-spinner-large">⏳</div>
          <div class="loading-text">Cargando datos...</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      position: relative;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .metric-card {
      display: flex;
      align-items: center;
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .metric-icon {
      font-size: 3rem;
      margin-right: 20px;
    }

    .metric-content {
      flex: 1;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      line-height: 1;
      margin-bottom: 8px;
    }

    .metric-label {
      color: #718096;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .chart-card:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
    }

    .chart-controls select {
      padding: 6px 12px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 0.9rem;
      background: white;
    }

    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .chart-container canvas {
      max-height: 300px;
    }

    .data-table-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .table-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
    }

    .export-btn {
      padding: 8px 16px;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .export-btn:hover {
      background: #38a169;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table th {
      background: #f7fafc;
      font-weight: 600;
      color: #2d3748;
    }

    .data-table tbody tr:hover {
      background: #f7fafc;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .loading-content {
      text-align: center;
    }

    .loading-spinner-large {
      font-size: 3rem;
      animation: spin 2s linear infinite;
      margin-bottom: 16px;
    }

    .loading-text {
      font-size: 1.1rem;
      color: #4a5568;
      font-weight: 500;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }
      
      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
      
      .dashboard-header h1 {
        font-size: 2rem;
      }
      
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      
      .charts-grid {
        grid-template-columns: 1fr;
      }
      
      .chart-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('reservasChart') reservasChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ocupacionChart') ocupacionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tipoChart') tipoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('calificacionesChart') calificacionesChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store<AppState>);

  // Charts
  private reservasChart?: Chart;
  private ocupacionChart?: Chart;
  private tipoChart?: Chart;
  private calificacionesChart?: Chart;

  // Observables
  dashboardData$!: Observable<any>;
  dashboardSummary$!: Observable<any>;
  isLoading$!: Observable<boolean>;

  // Component state
  isLoading = false;
  ingresosTotales = 400000;
  calificacionPromedio = 4.5;
  
  monthlyData = [
    { mes: 'Enero', reservas: 45, ingresos: 67500, ocupacion: 75, calificacion: 4.3 },
    { mes: 'Febrero', reservas: 52, ingresos: 78000, ocupacion: 82, calificacion: 4.4 },
    { mes: 'Marzo', reservas: 48, ingresos: 72000, ocupacion: 78, calificacion: 4.5 },
    { mes: 'Abril', reservas: 61, ingresos: 91500, ocupacion: 85, calificacion: 4.6 },
    { mes: 'Mayo', reservas: 55, ingresos: 82500, ocupacion: 80, calificacion: 4.4 },
    { mes: 'Junio', reservas: 68, ingresos: 102000, ocupacion: 92, calificacion: 4.7 }
  ];

  ngOnInit(): void {
    this.initializeObservables();
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private initializeObservables(): void {
    this.dashboardData$ = this.store.select(HotelSelectors.selectDashboardData);
    this.dashboardSummary$ = this.store.select(HotelSelectors.selectDashboardSummary);
    this.isLoading$ = this.store.select(HotelSelectors.selectAnalyticsLoading);

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.isLoading = loading;
      this.cdr.markForCheck();
    });

    this.dashboardData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data) {
        this.updateChartsWithData(data);
      }
    });
  }

  private loadData(): void {
    this.store.dispatch(HotelActions.loadDashboardData());
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'dashboard_viewed',
      properties: { timestamp: new Date().toISOString() }
    }));
  }

  private initializeCharts(): void {
    this.createReservasChart();
    this.createOcupacionChart();
    this.createTipoChart();
    this.createCalificacionesChart();
  }

  private createReservasChart(): void {
    const ctx = this.reservasChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.reservasChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlyData.map(d => d.mes),
        datasets: [{
          label: 'Reservas',
          data: this.monthlyData.map(d => d.reservas),
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }, {
          label: 'Ingresos (x1000)',
          data: this.monthlyData.map(d => d.ingresos / 1000),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Mes'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  private createOcupacionChart(): void {
    const ctx = this.ocupacionChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.ocupacionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Hotel Paradise', 'Mountain Resort', 'City Center Hotel'],
        datasets: [{
          data: [85, 92, 78],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            'rgb(102, 126, 234)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  }

  private createTipoChart(): void {
    const ctx = this.tipoChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.tipoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Suite', 'Doble', 'Individual'],
        datasets: [{
          label: 'Ingresos ($)',
          data: [180000, 120000, 100000],
          backgroundColor: [
            'rgba(139, 69, 19, 0.8)',
            'rgba(75, 85, 99, 0.8)',
            'rgba(59, 130, 246, 0.8)'
          ],
          borderColor: [
            'rgb(139, 69, 19)',
            'rgb(75, 85, 99)',
            'rgb(59, 130, 246)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ingresos ($)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tipo de Habitación'
            }
          }
        }
      }
    });
  }

  private createCalificacionesChart(): void {
    const ctx = this.calificacionesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.calificacionesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlyData.map(d => d.mes),
        datasets: [{
          label: 'Calificación Promedio',
          data: this.monthlyData.map(d => d.calificacion),
          borderColor: 'rgb(245, 101, 101)',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(245, 101, 101)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 4.0,
            max: 5.0,
            title: {
              display: true,
              text: 'Calificación (⭐)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          }
        }
      }
    });
  }

  private updateChartsWithData(data: any): void {
    if (data.reservasPorMes && this.reservasChart) {
      this.reservasChart.data.datasets[0].data = data.reservasPorMes.map((d: any) => d.reservas);
      this.reservasChart.data.datasets[1].data = data.reservasPorMes.map((d: any) => d.ingresos / 1000);
      this.reservasChart.update();
    }

    if (data.ocupacionPorHotel && this.ocupacionChart) {
      this.ocupacionChart.data.datasets[0].data = data.ocupacionPorHotel.map((d: any) => d.ocupacion);
      this.ocupacionChart.update();
    }

    if (data.ingresosPorTipo && this.tipoChart) {
      this.tipoChart.data.datasets[0].data = data.ingresosPorTipo.map((d: any) => d.ingresos);
      this.tipoChart.update();
    }

    if (data.estadisticasGenerales) {
      this.ingresosTotales = data.estadisticasGenerales.ingresosTotales;
      this.calificacionPromedio = data.estadisticasGenerales.calificacionPromedio;
      this.cdr.markForCheck();
    }
  }

  private destroyCharts(): void {
    this.reservasChart?.destroy();
    this.ocupacionChart?.destroy();
    this.tipoChart?.destroy();
    this.calificacionesChart?.destroy();
  }

  refreshData(): void {
    this.store.dispatch(HotelActions.loadDashboardData());
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'dashboard_refreshed',
      properties: { timestamp: new Date().toISOString() }
    }));
  }

  changeChartType(event: any, chartName: string): void {
    const newType = event.target.value as string;
    
    if (chartName === 'reservas' && this.reservasChart) {
      this.reservasChart.destroy();
      
      const ctx = this.reservasChartRef.nativeElement.getContext('2d');
      if (!ctx) return;

      // Create new chart configuration
      const chartType = newType === 'area' ? 'line' : newType as ChartType;
      const config: any = {
        type: chartType,
        data: {
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
          datasets: [{
            label: 'Reservas',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: '#667eea',
            backgroundColor: newType === 'area' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.8)',
            fill: newType === 'area',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
      
      this.reservasChart = new Chart(ctx, config);
    }

    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'chart_type_changed',
      properties: { chartName, newType }
    }));
  }

  exportData(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'data_exported',
      properties: { format: 'csv', timestamp: new Date().toISOString() }
    }));
  }

  private generateCSV(): string {
    const headers = ['Mes', 'Reservas', 'Ingresos', 'Ocupación %', 'Calificación'];
    const rows = this.monthlyData.map(data => [
      data.mes,
      data.reservas.toString(),
      data.ingresos.toString(),
      data.ocupacion.toString(),
      data.calificacion.toString()
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}