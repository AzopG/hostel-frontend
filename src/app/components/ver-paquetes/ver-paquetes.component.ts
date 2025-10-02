import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaquetePublicoService } from '../../services/paquete-publico.service';

@Component({
  selector: 'app-ver-paquetes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Navegación -->
      <div class="navigation-header">
        <button (click)="volverADashboard()" class="btn-nav">
          <i class="fas fa-arrow-left me-2"></i> Volver al Dashboard
        </button>
        <button (click)="irAInicio()" class="btn-nav-secondary">
          <i class="fas fa-home me-2"></i> Inicio
        </button>
      </div>

      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-cube me-3"></i>
            Paquetes Corporativos Disponibles
          </h1>
          <p class="page-subtitle">Encuentra el paquete perfecto para tu evento empresarial</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section mb-4">
        <div class="row">
          <div class="col-md-4">
            <select [(ngModel)]="ciudadFiltro" (change)="filtrarPaquetes()" class="form-select">
              <option value="">Todas las ciudades</option>
              <option *ngFor="let ciudad of ciudades" [value]="ciudad">{{ciudad}}</option>
            </select>
          </div>
          <div class="col-md-4">
            <select [(ngModel)]="tipoEventoFiltro" (change)="filtrarPaquetes()" class="form-select">
              <option value="">Todos los tipos de evento</option>
              <option value="evento_corporativo">Evento Corporativo</option>
              <option value="reunion_negocios">Reunión de Negocios</option>
              <option value="congreso">Congreso</option>
              <option value="capacitacion">Capacitación</option>
              <option value="celebracion_empresarial">Celebración Empresarial</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de Paquetes -->
      <div class="paquetes-grid" *ngIf="paquetesFiltrados.length > 0">
        <div class="paquete-card" *ngFor="let paquete of paquetesFiltrados">
          <div class="paquete-header">
            <h3>{{paquete.nombre}}</h3>
            <span class="paquete-precio">\${{formatearPrecio(paquete.precios.base)}}</span>
          </div>
          
          <div class="paquete-info">
            <p class="paquete-descripcion">{{paquete.descripcion}}</p>
            <div class="paquete-detalles">
              <div class="detalle-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{paquete.hotel?.nombre}} - {{paquete.hotel?.ciudad}}</span>
              </div>
              <div class="detalle-item">
                <i class="fas fa-users"></i>
                <span>{{paquete.capacidadMinima}} - {{paquete.capacidadMaxima}} personas</span>
              </div>
              <div class="detalle-item">
                <i class="fas fa-calendar"></i>
                <span>Duración: {{paquete.duracionDias}} días</span>
              </div>
            </div>
          </div>

          <div class="paquete-incluye">
            <h5>Incluye:</h5>
            <div class="servicios-lista">
              <span class="servicio-tag" *ngFor="let servicio of paquete.serviciosIncluidos">
                {{servicio}}
              </span>
            </div>
          </div>

          <div class="paquete-actions">
            <button class="btn btn-primary" (click)="reservarPaquete(paquete)">
              <i class="fas fa-calendar-plus me-2"></i>
              Reservar Paquete
            </button>
            <button class="btn btn-outline-info" (click)="verDetalles(paquete)">
              <i class="fas fa-info-circle me-2"></i>
              Ver Detalles
            </button>
          </div>
        </div>
      </div>

      <!-- Sin paquetes -->
      <div class="no-paquetes" *ngIf="paquetesFiltrados.length === 0 && !cargando">
        <div class="text-center">
          <i class="fas fa-cube fa-3x text-muted mb-3"></i>
          <h4>No hay paquetes disponibles</h4>
          <p>No se encontraron paquetes que coincidan con tus criterios de búsqueda.</p>
          <div class="debug-info" style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <small>
              <strong>Debug Info:</strong><br>
              Total paquetes cargados: {{paquetes.length}}<br>
              Paquetes después del filtro: {{paquetesFiltrados.length}}<br>
              Ciudad filtro: "{{ciudadFiltro}}"<br>
              Tipo evento filtro: "{{tipoEventoFiltro}}"<br>
              Ciudades disponibles: {{ciudades.join(', ')}}
            </small>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="cargando">
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando paquetes disponibles...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 75%, #adb5bd 100%);
      min-height: 100vh;
      padding: 0;
      margin: 0;
      width: 100%;
      overflow-y: auto;
      position: relative;
    }

    .navigation-header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 1rem;
      background: rgba(255,255,255,0.1);
      padding: 1.5rem 2rem 1rem 2rem;
      border-radius: 0 0 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      margin-bottom: 0;
    }

    .btn-nav, .btn-nav-secondary {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1.2rem;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      margin-right: 0.5rem;
    }
    .btn-nav-secondary {
      background: #6c757d;
    }
    .btn-nav:hover, .btn-nav-secondary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0 2rem 0;
      margin-bottom: 2rem;
      border-radius: 0 0 20px 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      text-align: center;
    }
    .header-content {
      max-width: 700px;
      margin: 0 auto;
    }
    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(255,255,255,0.5);
    }
    .page-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0.5rem 0 0 0;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
      text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
    }

    .filters-section {
      background: rgba(255,255,255,0.9);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 6px 25px rgba(0,0,0,0.12);
      margin: 0 2rem 2rem 2rem;
      position: relative;
      z-index: 1;
    }
    .form-select {
      border-radius: 8px;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border: 1px solid #ced4da;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      margin-bottom: 0.5rem;
    }

    .paquetes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin: 0 2rem 2rem 2rem;
    }
    .paquete-card {
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      padding: 2rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.5);
    }
    .paquete-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
      border-color: rgba(255,255,255,0.8);
      background: rgba(255,255,255,0.98);
    }
    .paquete-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
    }
    .paquete-header h3 {
      font-size: 1.3rem;
      color: #1C2526;
      margin-bottom: 0.5rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .paquete-precio {
      font-size: 1.5rem;
      font-weight: 700;
      color: #28a745;
      font-family: 'Crimson Text', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .paquete-descripcion {
      color: #4A1B2F;
      line-height: 1.5;
      margin-bottom: 1rem;
      font-family: 'Crimson Text', serif;
      font-weight: 500;
    }
    .paquete-detalles {
      margin-bottom: 1rem;
    }
    .detalle-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #495057;
      font-family: 'Crimson Text', serif;
    }
    .detalle-item i {
      width: 20px;
      margin-right: 0.5rem;
      color: #667eea;
      font-size: 1.2rem;
    }
    .paquete-incluye h5 {
      color: #495057;
      margin-bottom: 0.5rem;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
    }
    .servicios-lista {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .servicio-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.7rem;
      border-radius: 15px;
      font-size: 0.95rem;
      font-family: 'Crimson Text', serif;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .paquete-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .paquete-actions .btn {
      flex: 1;
      font-size: 1rem;
      border-radius: 8px;
      font-family: 'Crimson Text', serif;
      font-weight: 600;
      padding: 0.6rem 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }
    .paquete-actions .btn-primary {
      background: #667eea;
      color: white;
      border: none;
    }
    .paquete-actions .btn-primary:hover {
      background: #5a67d8;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }
    .paquete-actions .btn-outline-info {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }
    .paquete-actions .btn-outline-info:hover {
      background: #e9ecef;
      color: #5a67d8;
      border-color: #5a67d8;
    }

    .no-paquetes, .loading {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      margin: 2rem;
      font-family: 'Crimson Text', serif;
    }

    @media (max-width: 768px) {
      .container-fluid {
        padding: 0;
        min-height: 100vh;
      }
      .navigation-header {
        padding: 1rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      .header-section {
        padding: 1.2rem 0;
      }
      .filters-section {
        padding: 1rem;
        margin: 0 0.5rem 1rem 0.5rem;
      }
      .paquetes-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 0 0.5rem 1rem 0.5rem;
      }
      .paquete-card {
        padding: 1.2rem;
      }
      .no-paquetes, .loading {
        padding: 1.5rem;
        margin: 0.5rem;
      }
    }
  `]
})
export class VerPaquetesComponent implements OnInit {
  paquetes: any[] = [];
  paquetesFiltrados: any[] = [];
  ciudades: string[] = [];
  ciudadFiltro: string = '';
  tipoEventoFiltro: string = '';
  cargando: boolean = false;

  constructor(
    private paqueteService: PaquetePublicoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPaquetes();
  }

  cargarPaquetes() {
    this.cargando = true;
    console.log('🔄 Cargando paquetes desde el servicio...');
    this.paqueteService.listarPaquetesDisponibles().subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta recibida:', response);
        if (response.success) {
          this.paquetes = response.paquetes;
          this.paquetesFiltrados = [...this.paquetes];
          console.log(`✅ ${this.paquetes.length} paquetes cargados:`, this.paquetes);
          this.extraerCiudades();
        } else {
          console.log('❌ Respuesta no exitosa:', response);
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('💥 Error al cargar paquetes:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.cargando = false;
      }
    });
  }

  extraerCiudades() {
    const ciudadesSet = new Set(this.paquetes.map(p => p.hotel?.ciudad).filter(Boolean));
    this.ciudades = Array.from(ciudadesSet);
    console.log('🏙️ Ciudades extraídas:', this.ciudades);
  }

  filtrarPaquetes() {
    console.log('🔍 Filtrando paquetes por ciudad:', this.ciudadFiltro, 'y tipo:', this.tipoEventoFiltro);
    this.paquetesFiltrados = this.paquetes.filter(paquete => {
      const cumpleCiudad = !this.ciudadFiltro || paquete.hotel?.ciudad === this.ciudadFiltro;
      const cumpleTipo = !this.tipoEventoFiltro || paquete.tipo === this.tipoEventoFiltro;
      console.log(`- Paquete ${paquete.nombre}: ciudad ${paquete.hotel?.ciudad} (${cumpleCiudad}), tipo ${paquete.tipo} (${cumpleTipo})`);
      return cumpleCiudad && cumpleTipo;
    });
    console.log(`✅ ${this.paquetesFiltrados.length} paquetes después del filtro`);
  }

  reservarPaquete(paquete: any) {
    console.log('🎯 Reservando paquete:', paquete);
    console.log('📋 ID del paquete:', paquete._id);
    // Navegar a formulario de reserva simple
    this.router.navigate(['/reservar-paquete-simple', paquete._id]);
  }

  verDetalles(paquete: any) {
    // Mostrar modal con detalles completos
    console.log('Ver detalles de:', paquete);
  }

  formatearPrecio(precio: number): string {
    return precio?.toLocaleString('es-CO') || '0';
  }

  volverADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAInicio() {
    this.router.navigate(['/']);
  }
}