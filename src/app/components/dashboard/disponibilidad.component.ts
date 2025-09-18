import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <h1 class="h2">Disponibilidad en Tiempo Real</h1>
        <div class="btn-group">
          <button class="btn btn-primary" (click)="actualizarDisponibilidad()">
            <i class="fas fa-sync" [class.fa-spin]="actualizando"></i> 
            {{ actualizando ? 'Actualizando...' : 'Actualizar' }}
          </button>
          <button class="btn btn-outline-primary" (click)="exportarCalendario()">
            <i class="fas fa-download"></i> Exportar
          </button>
        </div>
      </div>

      <!-- Filtros por ciudad -->
      <div class="filter-section">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Ciudad</label>
            <select class="form-select" [(ngModel)]="ciudadSeleccionada" (change)="filtrarPorCiudad()">
              <option value="">Todas las ciudades</option>
              <option value="Bogotá">Bogotá</option>
              <option value="Medellín">Medellín</option>
              <option value="Cali">Cali</option>
              <option value="Cartagena">Cartagena</option>
              <option value="Barranquilla">Barranquilla</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Mes</label>
            <select class="form-select" [(ngModel)]="mesSeleccionado" (change)="cambiarMes()">
              <option *ngFor="let mes of meses; let i = index" [value]="i">{{ mes }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Año</label>
            <select class="form-select" [(ngModel)]="anioSeleccionado" (change)="cambiarAnio()">
              <option *ngFor="let anio of anios" [value]="anio">{{ anio }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Vista</label>
            <div class="btn-group w-100" role="group">
              <button type="button" class="btn" 
                      [class.btn-primary]="vistaActiva === 'habitaciones'"
                      [class.btn-outline-primary]="vistaActiva !== 'habitaciones'"
                      (click)="cambiarVista('habitaciones')">
                <i class="fas fa-bed"></i> Habitaciones
              </button>
              <button type="button" class="btn" 
                      [class.btn-primary]="vistaActiva === 'salones'"
                      [class.btn-outline-primary]="vistaActiva !== 'salones'"
                      (click)="cambiarVista('salones')">
                <i class="fas fa-users"></i> Salones
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <div class="row">
          <div class="col-md-3">
            <div class="stat-card disponible">
              <div class="stat-icon">✅</div>
              <div class="stat-number">{{ estadisticas.disponibles }}</div>
              <div class="stat-label">Disponibles {{ vistaActiva === 'habitaciones' ? 'Habitaciones' : 'Salones' }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card ocupado">
              <div class="stat-icon">🔴</div>
              <div class="stat-number">{{ estadisticas.ocupados }}</div>
              <div class="stat-label">Ocupados</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card mantenimiento">
              <div class="stat-icon">🔧</div>
              <div class="stat-number">{{ estadisticas.mantenimiento }}</div>
              <div class="stat-label">En Mantenimiento</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card ocupacion">
              <div class="stat-icon">📊</div>
              <div class="stat-number">{{ estadisticas.porcentajeOcupacion }}%</div>
              <div class="stat-label">Ocupación</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario interactivo -->
      <div class="calendar-section">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-calendar-alt"></i> 
              Calendario {{ vistaActiva === 'habitaciones' ? 'de Habitaciones' : 'de Salones' }}
              - {{ meses[mesSeleccionado] }} {{ anioSeleccionado }}
              <span class="ciudad-badge" *ngIf="ciudadSeleccionada">{{ ciudadSeleccionada }}</span>
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="calendar-grid">
              <!-- Encabezados de días -->
              <div class="calendar-header">
                <div class="day-header" *ngFor="let dia of diasSemana">{{ dia }}</div>
              </div>
              
              <!-- Días del calendario -->
              <div class="calendar-body">
                <div class="calendar-day" 
                     *ngFor="let dia of diasCalendario" 
                     [class.today]="dia.esHoy"
                     [class.other-month]="!dia.mesActual"
                     [class.has-events]="dia.eventos && dia.eventos.length > 0"
                     (click)="seleccionarDia(dia)">
                  
                  <div class="day-number">{{ dia.numero }}</div>
                  
                  <!-- Indicadores de disponibilidad -->
                  <div class="availability-indicators" *ngIf="dia.mesActual">
                    <div class="indicator disponible" 
                         *ngIf="dia.disponibles > 0"
                         [title]="dia.disponibles + ' disponibles'">
                      {{ dia.disponibles }}
                    </div>
                    <div class="indicator ocupado" 
                         *ngIf="dia.ocupados > 0"
                         [title]="dia.ocupados + ' ocupados'">
                      {{ dia.ocupados }}
                    </div>
                    <div class="indicator mantenimiento" 
                         *ngIf="dia.mantenimiento > 0"
                         [title]="dia.mantenimiento + ' en mantenimiento'">
                      🔧
                    </div>
                  </div>

                  <!-- Eventos del día -->
                  <div class="day-events" *ngIf="dia.eventos && dia.eventos.length > 0">
                    <div class="event-dot" 
                         *ngFor="let evento of dia.eventos.slice(0, 3)" 
                         [class]="evento.tipo"
                         [title]="evento.titulo">
                    </div>
                    <div class="more-events" *ngIf="dia.eventos.length > 3">
                      +{{ dia.eventos.length - 3 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalles del día seleccionado -->
      <div class="day-details-section" *ngIf="diaSeleccionado">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-info-circle"></i> 
              Detalles del {{ diaSeleccionado.fecha.toLocaleDateString() }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>{{ vistaActiva === 'habitaciones' ? 'Habitaciones' : 'Salones' }} Disponibles</h6>
                <div class="list-group">
                  <div class="list-group-item" *ngFor="let item of diaSeleccionado.disponiblesDetalle">
                    <div class="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>{{ item.numero || item.nombre }}</strong>
                        <small class="text-muted d-block">{{ item.hotel }} - {{ item.tipo }}</small>
                      </span>
                      <span class="badge bg-success">Disponible</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6>Reservas y Eventos</h6>
                <div class="list-group">
                  <div class="list-group-item" *ngFor="let evento of diaSeleccionado.eventos">
                    <div class="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>{{ evento.titulo }}</strong>
                        <small class="text-muted d-block">{{ evento.hora }} - {{ evento.cliente }}</small>
                      </span>
                      <span class="badge" [class]="'bg-' + evento.tipo">{{ evento.estado }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de hoteles por ciudad (si hay ciudad seleccionada) -->
      <div class="hotels-section" *ngIf="ciudadSeleccionada">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-building"></i> 
              Hostel {{ ciudadSeleccionada }} - Estado Actual
            </h5>
          </div>
          <div class="card-body">
            <div class="hotel-status">
              <div class="hotel-info">
                <h6>{{ hotelDetalles.nombre }}</h6>
                <p class="text-muted">{{ hotelDetalles.direccion }}</p>
                <p class="text-muted">📞 {{ hotelDetalles.telefono }}</p>
              </div>
              <div class="capacity-bars">
                <div class="capacity-bar">
                  <label>Habitaciones</label>
                  <div class="progress">
                    <div class="progress-bar bg-success" 
                         [style.width.%]="(estadisticas.disponibles / hotelDetalles.totalHabitaciones) * 100">
                    </div>
                    <div class="progress-bar bg-danger" 
                         [style.width.%]="(estadisticas.ocupados / hotelDetalles.totalHabitaciones) * 100">
                    </div>
                    <div class="progress-bar bg-warning" 
                         [style.width.%]="(estadisticas.mantenimiento / hotelDetalles.totalHabitaciones) * 100">
                    </div>
                  </div>
                  <small>{{ estadisticas.disponibles }}/{{ hotelDetalles.totalHabitaciones }} disponibles</small>
                </div>
                <div class="capacity-bar">
                  <label>Salones</label>
                  <div class="progress">
                    <div class="progress-bar bg-success" 
                         [style.width.%]="(hotelDetalles.salonesDisponibles / hotelDetalles.totalSalones) * 100">
                    </div>
                    <div class="progress-bar bg-danger" 
                         [style.width.%]="(hotelDetalles.salonesOcupados / hotelDetalles.totalSalones) * 100">
                    </div>
                  </div>
                  <small>{{ hotelDetalles.salonesDisponibles }}/{{ hotelDetalles.totalSalones }} disponibles</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      margin: -20px;
      padding: 20px;
    }

    .d-flex.justify-content-between {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .h2::before {
      content: '📅';
      margin-right: 1rem;
      font-size: 2rem;
    }

    .filter-section {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .stats-section {
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-bottom: 1rem;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .stat-card.disponible { border-left: 5px solid #48bb78; }
    .stat-card.ocupado { border-left: 5px solid #f56565; }
    .stat-card.mantenimiento { border-left: 5px solid #ed8936; }
    .stat-card.ocupacion { border-left: 5px solid #667eea; }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .card-header {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-bottom: 1px solid #e2e8f0;
      padding: 1.5rem;
    }

    .ciudad-badge {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.875rem;
      margin-left: 1rem;
    }

    .calendar-grid {
      width: 100%;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .day-header {
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .calendar-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .calendar-day {
      min-height: 120px;
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      background: white;
    }

    .calendar-day:hover {
      background: #f7fafc;
      transform: scale(1.02);
      z-index: 10;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .calendar-day.today {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-color: #667eea;
    }

    .calendar-day.other-month {
      background: #f8f9fa;
      color: #adb5bd;
    }

    .calendar-day.has-events {
      border-left: 4px solid #667eea;
    }

    .day-number {
      font-weight: 600;
      font-size: 1.1rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .availability-indicators {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .indicator {
      font-size: 0.75rem;
      padding: 0.15rem 0.4rem;
      border-radius: 10px;
      font-weight: 600;
      color: white;
    }

    .indicator.disponible { background: #48bb78; }
    .indicator.ocupado { background: #f56565; }
    .indicator.mantenimiento { background: #ed8936; }

    .day-events {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .event-dot {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: #667eea;
    }

    .event-dot.reserva { background: #48bb78; }
    .event-dot.evento { background: #667eea; }
    .event-dot.mantenimiento { background: #ed8936; }

    .more-events {
      font-size: 0.7rem;
      color: #6c757d;
      text-align: center;
      margin-top: 0.25rem;
    }

    .hotel-status {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      align-items: center;
    }

    .capacity-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .capacity-bar label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
      display: block;
    }

    .progress {
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
      background: #e2e8f0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    @media (max-width: 768px) {
      .container-fluid {
        margin: -10px;
        padding: 10px;
      }

      .calendar-day {
        min-height: 80px;
        font-size: 0.875rem;
      }

      .hotel-status {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stats-section .row > div {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class DisponibilidadComponent implements OnInit, OnDestroy {
  ciudadSeleccionada = '';
  mesSeleccionado = new Date().getMonth();
  anioSeleccionado = new Date().getFullYear();
  vistaActiva: 'habitaciones' | 'salones' = 'habitaciones';
  actualizando = false;
  diaSeleccionado: any = null;
  
  private subscriptions: Subscription[] = [];

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  anios = [2024, 2025, 2026];

  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  diasCalendario: any[] = [];

  estadisticas = {
    disponibles: 142,
    ocupados: 18,
    mantenimiento: 5,
    porcentajeOcupacion: 75
  };

  hotelDetalles = {
    nombre: 'Hostel Bogotá Centro',
    direccion: 'Zona Rosa, Calle 82 #12-15',
    telefono: '+57 1 234 5678',
    totalHabitaciones: 60,
    totalSalones: 4,
    salonesDisponibles: 3,
    salonesOcupados: 1
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.generarCalendario();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  generarCalendario(): void {
    const primerDia = new Date(this.anioSeleccionado, this.mesSeleccionado, 1);
    const ultimoDia = new Date(this.anioSeleccionado, this.mesSeleccionado + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    this.diasCalendario = [];

    // Días del mes anterior
    const mesAnterior = new Date(this.anioSeleccionado, this.mesSeleccionado, 0);
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      this.diasCalendario.push({
        numero: mesAnterior.getDate() - i,
        mesActual: false,
        fecha: new Date(this.anioSeleccionado, this.mesSeleccionado - 1, mesAnterior.getDate() - i),
        disponibles: 0,
        ocupados: 0,
        mantenimiento: 0,
        eventos: []
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(this.anioSeleccionado, this.mesSeleccionado, dia);
      const esHoy = this.esHoy(fecha);
      
      this.diasCalendario.push({
        numero: dia,
        mesActual: true,
        fecha: fecha,
        esHoy: esHoy,
        disponibles: Math.floor(Math.random() * 20) + 10,
        ocupados: Math.floor(Math.random() * 15) + 5,
        mantenimiento: Math.floor(Math.random() * 3),
        eventos: this.generarEventosAleatorios(),
        disponiblesDetalle: this.generarDetallesDisponibles()
      });
    }

    // Completar semanas
    const totalCeldas = this.diasCalendario.length;
    const celdasRestantes = 42 - totalCeldas; // 6 semanas * 7 días
    
    for (let i = 1; i <= celdasRestantes; i++) {
      this.diasCalendario.push({
        numero: i,
        mesActual: false,
        fecha: new Date(this.anioSeleccionado, this.mesSeleccionado + 1, i),
        disponibles: 0,
        ocupados: 0,
        mantenimiento: 0,
        eventos: []
      });
    }
  }

  private esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  private generarEventosAleatorios(): any[] {
    const eventos = [];
    const tiposEvento = ['reserva', 'evento', 'mantenimiento'];
    const numEventos = Math.floor(Math.random() * 4);

    for (let i = 0; i < numEventos; i++) {
      eventos.push({
        titulo: `Evento ${i + 1}`,
        tipo: tiposEvento[Math.floor(Math.random() * tiposEvento.length)],
        hora: `${9 + i * 2}:00`,
        cliente: 'Cliente Ejemplo',
        estado: 'confirmado'
      });
    }

    return eventos;
  }

  private generarDetallesDisponibles(): any[] {
    const detalles = [];
    const tipos = ['estándar', 'doble', 'suite', 'presidencial'];
    const hoteles = ['Hostel Bogotá Centro', 'Hostel Medellín El Poblado'];

    for (let i = 0; i < 5; i++) {
      detalles.push({
        numero: `${i + 101}`,
        nombre: `Salón ${i + 1}`,
        hotel: hoteles[Math.floor(Math.random() * hoteles.length)],
        tipo: tipos[Math.floor(Math.random() * tipos.length)]
      });
    }

    return detalles;
  }

  filtrarPorCiudad(): void {
    this.actualizarEstadisticas();
    this.actualizarHotelDetalles();
  }

  cambiarMes(): void {
    this.generarCalendario();
  }

  cambiarAnio(): void {
    this.generarCalendario();
  }

  cambiarVista(vista: 'habitaciones' | 'salones'): void {
    this.vistaActiva = vista;
    this.actualizarEstadisticas();
  }

  seleccionarDia(dia: any): void {
    if (dia.mesActual) {
      this.diaSeleccionado = dia;
    }
  }

  actualizarDisponibilidad(): void {
    this.actualizando = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.generarCalendario();
      this.actualizarEstadisticas();
      this.actualizando = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  exportarCalendario(): void {
    console.log('Exportando calendario...');
    // Implementar exportación a Excel/PDF
  }

  private actualizarEstadisticas(): void {
    if (this.vistaActiva === 'habitaciones') {
      this.estadisticas = {
        disponibles: 142,
        ocupados: 18,
        mantenimiento: 5,
        porcentajeOcupacion: 75
      };
    } else {
      this.estadisticas = {
        disponibles: 15,
        ocupados: 3,
        mantenimiento: 2,
        porcentajeOcupacion: 65
      };
    }
  }

  private actualizarHotelDetalles(): void {
    const hotelesPorCiudad: any = {
      'Bogotá': {
        nombre: 'Hostel Bogotá Centro',
        direccion: 'Zona Rosa, Calle 82 #12-15',
        telefono: '+57 1 234 5678'
      },
      'Medellín': {
        nombre: 'Hostel Medellín El Poblado',
        direccion: 'El Poblado, Carrera 35 #7-108',
        telefono: '+57 4 456 7890'
      },
      'Cali': {
        nombre: 'Hostel Cali Zona Norte',
        direccion: 'Zona Norte, Avenida 6N #25-43',
        telefono: '+57 2 789 0123'
      },
      'Cartagena': {
        nombre: 'Hostel Cartagena Centro Histórico',
        direccion: 'Centro Histórico, Calle del Arsenal',
        telefono: '+57 5 345 6789'
      },
      'Barranquilla': {
        nombre: 'Hostel Barranquilla Norte',
        direccion: 'Zona Norte, Carrera 52 #76-45',
        telefono: '+57 5 678 9012'
      }
    };

    if (this.ciudadSeleccionada && hotelesPorCiudad[this.ciudadSeleccionada]) {
      this.hotelDetalles = {
        ...hotelesPorCiudad[this.ciudadSeleccionada],
        totalHabitaciones: 60,
        totalSalones: 4,
        salonesDisponibles: 3,
        salonesOcupados: 1
      };
    }
  }
}