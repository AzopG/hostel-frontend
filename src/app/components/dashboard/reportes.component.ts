import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService, EstadisticasGenerales } from '../../services/estadisticas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" style="position: relative;">
        <h1 class="h2"><i class="fas fa-chart-bar me-3"></i>Reportes</h1>
        <button class="btn btn-success" (click)="exportarReporte()" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%);">
          <i class="fas fa-download"></i> Exportar
        </button>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0"><i class="fas fa-chart-line me-2"></i>Reservas por Mes</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Reservas</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let mes of reservasPorMes">
                      <td>{{ mes.nombre }}</td>
                      <td>{{ mes.reservas }}</td>
                      <td>{{ mes.ingresos | currency:'USD':'symbol':'1.0-0' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0"><i class="fas fa-hotel me-2"></i>Top Hoteles</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Reservas</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let hotel of topHoteles">
                      <td>{{ hotel.nombre }}</td>
                      <td>{{ hotel.reservas }}</td>
                      <td>
                        <span class="badge bg-success">{{ hotel.rating }} <i class="fas fa-star"></i></span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
      padding-top: 0; /* Eliminar espacio superior */
      padding-bottom: 0; /* Eliminar espacio inferior */
    }

    .d-flex.justify-content-between {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 0.5rem; /* Reducir aún más el espacio */
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 0; /* Eliminar completamente el margen inferior */
    }

    .h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .btn-success {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #48bb78, #38a169);
      border: none;
      box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
      transition: all 0.3s ease;
    }

    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
      background: linear-gradient(135deg, #38a169, #2f855a);
    }
    
    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .card.text-white {
      background: linear-gradient(135deg, var(--card-color), var(--card-color-dark)) !important;
      position: relative;
      overflow: hidden;
    }

    .card.text-white::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><circle cx="20" cy="20" r="2" fill="white"/><circle cx="80" cy="20" r="2" fill="white"/><circle cx="20" cy="80" r="2" fill="white"/><circle cx="80" cy="80" r="2" fill="white"/><circle cx="50" cy="50" r="3" fill="white"/></svg>');
      pointer-events: none;
    }

    .bg-primary {
      --card-color: #667eea;
      --card-color-dark: #5a6fd8;
    }

    .bg-success {
      --card-color: #48bb78;
      --card-color-dark: #38a169;
    }

    .bg-info {
      --card-color: #4299e1;
      --card-color-dark: #3182ce;
    }

    .bg-warning {
      --card-color: #ed8936;
      --card-color-dark: #dd6b20;
    }
    
    .card-body {
      padding: 2rem;
      position: relative;
      z-index: 2;
    }
    
    .card-body h4 {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      animation: numberPulse 2s ease-in-out infinite;
    }

    @keyframes numberPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .card-body p {
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }

    .fa-2x {
      font-size: 3rem !important;
      opacity: 0.8;
      animation: iconFloat 3s ease-in-out infinite;
    }

    @keyframes iconFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
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
    
    .table {
      margin: 0;
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

    .table td {
      padding: 1.5rem 1rem;
      border: none;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .table tbody tr:hover {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      transform: scale(1.01);
      transition: all 0.3s ease;
    }

    .badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
    }

    .bg-success.badge {
      background: linear-gradient(135deg, #48bb78, #38a169) !important;
      color: white;
    }

    .row {
      margin-bottom: 2rem;
    }

    .table-responsive {
      border-radius: 0 0 20px 20px;
      overflow: hidden;
    }

    /* Animaciones personalizadas */
    .card:nth-child(1) { animation-delay: 0.1s; }
    .card:nth-child(2) { animation-delay: 0.2s; }
    .card:nth-child(3) { animation-delay: 0.3s; }
    .card:nth-child(4) { animation-delay: 0.4s; }

    .card {
      animation: slideInUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Efectos de gradiente en movimiento */
    .card.text-white {
      background-size: 200% 200%;
      animation: gradientShift 4s ease infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
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

      .h2 {
        font-size: 2rem;
      }

      .card-body h4 {
        font-size: 2rem;
      }

      .fa-2x {
        font-size: 2rem !important;
      }

      .table-responsive {
        border-radius: 0;
      }
    }

    .card.text-white.bg-info {
      padding: 16px; /* Reducir el padding para disminuir el espacio */
    }

    .card.text-white.bg-primary {
      padding: 16px; /* Reducir el padding para disminuir el espacio */
    }

    .d-flex.justify-content-between {
      padding: 16px; /* Reducir el padding para disminuir el espacio */
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

  constructor(
    private estadisticasService: EstadisticasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarDatosReportes();
  }

  cargarDatosReportes(): void {
    this.isLoading = true;
    this.error = '';
    
    this.estadisticasService.obtenerEstadisticasGenerales().subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticas = response.stats;
          this.actualizarDatosReportes();
        } else {
          this.error = 'Error al cargar datos de reportes';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos de reportes:', error);
        this.error = 'Error de conexi\u00f3n al cargar reportes';
        this.isLoading = false;
        this.usarDatosPorDefecto();
      }
    });
  }

  actualizarDatosReportes(): void {
    this.totalReservas = this.estadisticas.totalReservas || 0;
    this.ingresosTotales = this.estadisticas.ingresosTotales || 0;
    this.ocupacionPromedio = this.estadisticas.ocupacionPromedio || 0;
    this.usuariosActivos = this.estadisticas.totalClientes || 0;
    
    // Si hay datos de reservas por mes, usarlos; si no, usar datos por defecto
    if (this.estadisticas.reservasPorMes && this.estadisticas.reservasPorMes.length > 0) {
      this.reservasPorMes = this.estadisticas.reservasPorMes.map(item => ({
        nombre: this.getNombreMes(item._id.month),
        reservas: item.count,
        ingresos: item.totalIngresos || 0
      }));
    } else {
      this.usarDatosPorDefectoReservas();
    }
  }

  usarDatosPorDefecto(): void {
    this.totalReservas = 0;
    this.ingresosTotales = 0;
    this.ocupacionPromedio = 0;
    this.usuariosActivos = 0;
    this.usarDatosPorDefectoReservas();
    this.usarDatosPorDefectoHoteles();
  }

  usarDatosPorDefectoReservas(): void {
    this.reservasPorMes = [
      { nombre: 'Enero', reservas: 0, ingresos: 0 },
      { nombre: 'Febrero', reservas: 0, ingresos: 0 },
      { nombre: 'Marzo', reservas: 0, ingresos: 0 },
      { nombre: 'Abril', reservas: 0, ingresos: 0 },
      { nombre: 'Mayo', reservas: 0, ingresos: 0 },
      { nombre: 'Junio', reservas: 0, ingresos: 0 }
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
    console.log('Exportando reporte...');
    // Implementar lógica para exportar reporte
  }
}