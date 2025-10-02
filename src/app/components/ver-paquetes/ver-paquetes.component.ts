import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
          <i class="fas fa-arrow-left me-2"></i>Volver al Dashboard
        </button>
        <button (click)="irAInicio()" class="btn-nav-secondary">
          <i class="fas fa-home me-2"></i>Inicio
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
    .navigation-header {
      background: #f8f9fa;
      padding: 1rem;
      margin-bottom: 0;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      gap: 1rem;
    }
    
    .btn-nav {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-nav:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }
    
    .btn-nav-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-nav-secondary:hover {
      background: #5a6268;
      transform: translateY(-1px);
    }
    
    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
      border-radius: 0 0 20px 20px;
    }
    
    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }
    
    .page-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0.5rem 0 0 0;
    }
    
    .paquetes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 2rem;
    }
    
    .paquete-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      padding: 1.5rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .paquete-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }
    
    .paquete-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f8f9fa;
    }
    
    .paquete-precio {
      font-size: 1.5rem;
      font-weight: 700;
      color: #28a745;
    }
    
    .paquete-descripcion {
      color: #6c757d;
      margin-bottom: 1rem;
    }
    
    .paquete-detalles {
      margin-bottom: 1rem;
    }
    
    .detalle-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .detalle-item i {
      width: 20px;
      margin-right: 0.5rem;
      color: #667eea;
    }
    
    .paquete-incluye h5 {
      color: #495057;
      margin-bottom: 0.5rem;
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
      padding: 0.25rem 0.5rem;
      border-radius: 15px;
      font-size: 0.85rem;
    }
    
    .paquete-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .paquete-actions .btn {
      flex: 1;
    }
    
    .filters-section {
      background: white;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .no-paquetes, .loading {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
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