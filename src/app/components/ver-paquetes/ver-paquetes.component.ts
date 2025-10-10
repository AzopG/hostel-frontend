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
        <button (click)="testModal()" class="btn-test" *ngIf="paquetesFiltrados.length > 0">
          🧪 TEST MODAL
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

      <!-- Modal de detalles del paquete -->
      <div class="modal" 
           [class.fade]="true"
           [class.show]="modalDetalleVisible" 
           [style.display]="modalDetalleVisible ? 'block' : 'none'" 
           [attr.aria-hidden]="!modalDetalleVisible"
           tabindex="-1" 
           *ngIf="modalDetalleVisible"
           role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ paqueteSeleccionado?.nombre }}</h5>
              <button type="button" class="btn-close" (click)="cerrarModalDetalle()"></button>
            </div>
            <div class="modal-body" *ngIf="paqueteSeleccionado">
              <div class="detalle-paquete">
                <div class="mb-4">
                  <h6><i class="fas fa-info-circle me-2"></i>Información General</h6>
                  <p>{{ paqueteSeleccionado.descripcion }}</p>
                  <div class="row">
                    <div class="col-md-6">
                      <strong>Tipo:</strong> {{ getTipoEventoLabel(paqueteSeleccionado.tipo) }}
                    </div>
                    <div class="col-md-6">
                      <strong>Capacidad:</strong> {{ paqueteSeleccionado.capacidadMinima }} - {{ paqueteSeleccionado.capacidadMaxima }} personas
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.habitaciones?.length">
                  <h6><i class="fas fa-bed me-2"></i>Habitaciones Incluidas</h6>
                  <div class="list-group">
                    <div *ngFor="let hab of paqueteSeleccionado.habitaciones" class="list-group-item">
                      <strong>{{ getTipoHabitacionLabel(hab.tipo) }}</strong>
                      - {{ hab.cantidad }} unidades por {{ hab.noches }} noche(s)
                      <span class="badge bg-success ms-2">\${{ formatearPrecio(hab.precioPorNoche) }}/noche</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.salones?.length">
                  <h6><i class="fas fa-building me-2"></i>Salones Incluidos</h6>
                  <div class="list-group">
                    <div *ngFor="let salon of paqueteSeleccionado.salones" class="list-group-item">
                      <strong>{{ salon.nombre }}</strong>
                      - Capacidad: {{ salon.capacidad }} personas
                      <span class="badge bg-info ms-2">{{ salon.horas }}h incluidas</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.servicios?.length">
                  <h6><i class="fas fa-concierge-bell me-2"></i>Servicios Adicionales</h6>
                  <div class="list-group">
                    <div *ngFor="let servicio of paqueteSeleccionado.servicios" class="list-group-item">
                      <strong>{{ servicio.nombre }}</strong>
                      <span class="text-muted">- {{ servicio.categoria }}</span>
                      <span class="badge bg-warning ms-2">\${{ formatearPrecio(servicio.precio) }}</span>
                    </div>
                  </div>
                </div>

                <div class="mb-4" *ngIf="paqueteSeleccionado.catering?.length">
                  <h6><i class="fas fa-utensils me-2"></i>Opciones de Catering</h6>
                  <div class="list-group">
                    <div *ngFor="let catering of paqueteSeleccionado.catering" class="list-group-item">
                      <strong>{{ getCateringLabel(catering.tipo) }}</strong>
                      <p class="mb-1 text-muted">{{ catering.descripcion }}</p>
                      <span class="badge bg-primary">\${{ formatearPrecio(catering.precioPorPersona) }}/persona</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="cerrarModalDetalle()">Cerrar</button>
              <button class="btn btn-primary" (click)="reservarPaquete(paqueteSeleccionado!)">
                <i class="fas fa-calendar-plus me-2"></i>Reservar Paquete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" 
           [class.show]="modalDetalleVisible" 
           *ngIf="modalDetalleVisible"
           (click)="cerrarModalDetalle()"></div>

      <!-- Modal Simple para Testing -->
      <div *ngIf="modalDetalleVisible && paqueteSeleccionado" class="modal-simple-test">
        <div class="modal-simple-content">
          <h3>{{ paqueteSeleccionado.nombre }}</h3>
          <p><strong>Descripción:</strong> {{ paqueteSeleccionado.descripcion }}</p>
          <p><strong>Hotel:</strong> {{ paqueteSeleccionado.hotel?.nombre }} - {{ paqueteSeleccionado.hotel?.ciudad }}</p>
          <p><strong>Tipo:</strong> {{ getTipoEventoLabel(paqueteSeleccionado.tipo) }}</p>
          <p><strong>Capacidad:</strong> {{ paqueteSeleccionado.capacidadMinima }} - {{ paqueteSeleccionado.capacidadMaxima }} personas</p>
          <p><strong>Precio:</strong> \${{ formatearPrecio(paqueteSeleccionado.precios?.base) }} {{ paqueteSeleccionado.precios?.moneda }}</p>
          
          <div class="modal-simple-buttons">
            <button class="btn-simple-reservar" (click)="reservarPaquete(paqueteSeleccionado!)">
              Reservar
            </button>
            <button class="btn-simple-cerrar" (click)="cerrarModalDetalle()">
              Cerrar
            </button>
          </div>
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

    .btn-nav, .btn-nav-secondary, .btn-test {
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
    .btn-test {
      background: #ffc107;
      color: #000;
      font-weight: 700;
    }
    .btn-nav:hover, .btn-nav-secondary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }
    .btn-test:hover {
      background: #e0a800;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 193, 7, 0.3);
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

    /* ==================== MODALES ==================== */
    .modal {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 9999 !important;
      width: 100% !important;
      height: 100% !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      outline: 0 !important;
    }

    .modal.fade {
      transition: opacity 0.15s linear;
      opacity: 0;
    }

    .modal.show {
      opacity: 1 !important;
      display: block !important;
    }

    .modal-backdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 9998 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.7) !important;
      backdrop-filter: blur(8px);
    }

    .modal-backdrop.fade {
      opacity: 0;
      transition: opacity 0.15s linear;
    }

    .modal-backdrop.show {
      opacity: 1 !important;
    }

    .modal-dialog {
      position: relative !important;
      width: auto !important;
      margin: 2rem auto !important;
      max-width: 800px !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      min-height: calc(100% - 4rem) !important;
    }

    .modal-content {
      border-radius: 25px;
      border: 3px solid #667eea;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      pointer-events: auto;
      background-clip: padding-box;
    }

    .modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 22px 22px 0 0;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      border-bottom: none;
      font-family: 'Playfair Display', serif;
    }

    .modal-title {
      font-size: 2rem;
      font-weight: 800;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .modal-body {
      padding: 2.5rem;
      background: linear-gradient(135deg, white 0%, rgba(248, 241, 233, 0.3) 100%);
    }

    .detalle-paquete h6 {
      color: #667eea;
      font-weight: 700;
      font-size: 1.3rem;
      font-family: 'Playfair Display', serif;
      border-bottom: 3px solid #e3f2fd;
      padding-bottom: 0.8rem;
      margin-bottom: 1.5rem;
      position: relative;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .list-group-item {
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 12px !important;
      margin-bottom: 0.8rem;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.9);
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 500;
    }

    .list-group-item:hover {
      background: rgba(102, 126, 234, 0.1);
      border-color: #667eea;
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .modal-footer {
      padding: 2rem;
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.5) 0%, #f8f9fa 100%);
      border-top: 2px solid #e3f2fd;
      display: flex;
      justify-content: center;
      gap: 1.5rem;
    }

    /* MODAL SIMPLE DE TESTING */
    .modal-simple-test {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(255, 0, 0, 0.9) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: auto !important;
    }

    .modal-simple-content {
      background: white !important;
      padding: 30px !important;
      border-radius: 15px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
      max-width: 90vw !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      min-width: 500px !important;
      border: 5px solid #007bff !important;
      position: relative !important;
      z-index: 1000000 !important;
    }

    .modal-simple-content h3 {
      color: #667eea !important;
      font-family: 'Playfair Display', serif !important;
      margin-bottom: 20px !important;
      font-size: 1.8rem !important;
      text-align: center !important;
    }

    .modal-simple-content p {
      margin-bottom: 10px !important;
      color: #495057 !important;
      line-height: 1.5 !important;
      font-family: 'Crimson Text', serif !important;
    }

    .modal-simple-buttons {
      margin-top: 30px !important;
      display: flex !important;
      gap: 15px !important;
      justify-content: center !important;
    }

    .btn-simple-reservar {
      background: #28a745 !important;
      color: white !important;
      border: none !important;
      padding: 12px 25px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      font-family: 'Crimson Text', serif !important;
    }

    .btn-simple-reservar:hover {
      background: #218838 !important;
      transform: translateY(-2px) !important;
    }

    .btn-simple-cerrar {
      background: #6c757d !important;
      color: white !important;
      border: none !important;
      padding: 12px 25px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      font-family: 'Crimson Text', serif !important;
    }

    .btn-simple-cerrar:hover {
      background: #545b62 !important;
      transform: translateY(-2px) !important;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
      border: none;
      color: white;
      font-size: 1.5rem;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
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
  
  // Modal
  modalDetalleVisible = false;
  paqueteSeleccionado: any = null;

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
    console.log('🔍 Abriendo detalles del paquete:', paquete.nombre);
    console.log('Ver detalles de:', paquete);
    
    this.paqueteSeleccionado = paquete;
    this.modalDetalleVisible = true;
    
    console.log('✅ Modal debería estar visible:', this.modalDetalleVisible);
    console.log('📋 Paquete seleccionado:', this.paqueteSeleccionado?.nombre);
    
    // Forzar detección de cambios y debugging extensivo
    setTimeout(() => {
      console.log('🔄 DEBUGGING COMPLETO:');
      console.log('   - modalDetalleVisible:', this.modalDetalleVisible);
      console.log('   - paqueteSeleccionado:', this.paqueteSeleccionado?.nombre);
      
      const modalSimple = document.querySelector('.modal-simple-test');
      const modalBootstrap = document.querySelector('.modal');
      const backdrop = document.querySelector('.modal-backdrop');
      
      console.log('🎭 ELEMENTOS EN DOM:');
      console.log('   - Modal simple:', modalSimple);
      console.log('   - Modal Bootstrap:', modalBootstrap);
      console.log('   - Backdrop:', backdrop);
      
      if (modalSimple) {
        console.log('📏 Estilos del modal simple:', window.getComputedStyle(modalSimple));
        console.log('   - Display:', window.getComputedStyle(modalSimple).display);
        console.log('   - Position:', window.getComputedStyle(modalSimple).position);
        console.log('   - Z-index:', window.getComputedStyle(modalSimple).zIndex);
        
        // Intentar forzar la visibilidad del modal simple
        (modalSimple as HTMLElement).style.display = 'flex';
        (modalSimple as HTMLElement).style.position = 'fixed';
        (modalSimple as HTMLElement).style.top = '0';
        (modalSimple as HTMLElement).style.left = '0';
        (modalSimple as HTMLElement).style.width = '100vw';
        (modalSimple as HTMLElement).style.height = '100vh';
        (modalSimple as HTMLElement).style.zIndex = '99999';
        (modalSimple as HTMLElement).style.background = 'rgba(255, 0, 0, 0.8)';
        console.log('🚨 MODAL FORZADO A SER VISIBLE');
      }
    }, 200);
  }

  /**
   * Cerrar modal de detalles
   */
  cerrarModalDetalle(): void {
    console.log('🚪 Cerrando modal');
    this.modalDetalleVisible = false;
    this.paqueteSeleccionado = null;
  }

  /**
   * Método de test para forzar apertura del modal
   */
  testModal(): void {
    console.log('🧪 TEST: Forzando apertura del modal');
    
    if (this.paquetesFiltrados.length > 0) {
      const paquetePrueba = this.paquetesFiltrados[0];
      console.log('🧪 Usando paquete de prueba:', paquetePrueba.nombre);
      
      this.paqueteSeleccionado = paquetePrueba;
      this.modalDetalleVisible = true;
      
      console.log('🧪 Variables establecidas:');
      console.log('   - modalDetalleVisible:', this.modalDetalleVisible);
      console.log('   - paqueteSeleccionado:', this.paqueteSeleccionado?.nombre);
      
      // Forzar actualización del DOM
      setTimeout(() => {
        const modalElement = document.querySelector('.modal-simple-test');
        if (modalElement) {
          console.log('🧪 Modal encontrado, forzando estilos...');
          (modalElement as HTMLElement).style.display = 'flex';
          (modalElement as HTMLElement).style.position = 'fixed';
          (modalElement as HTMLElement).style.zIndex = '999999';
          (modalElement as HTMLElement).style.background = 'rgba(255, 0, 0, 0.9)';
        } else {
          console.log('🚨 ERROR: Modal no encontrado en DOM');
        }
      }, 100);
    } else {
      console.log('🚨 No hay paquetes disponibles');
      alert('No hay paquetes para mostrar');
    }
  }

  /**
   * Obtener etiqueta del tipo de evento
   */
  getTipoEventoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'evento_corporativo': 'Evento Corporativo',
      'reunion_negocios': 'Reunión de Negocios',
      'congreso': 'Congreso',
      'capacitacion': 'Capacitación',
      'celebracion_empresarial': 'Celebración Empresarial'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Obtener etiqueta del tipo de habitación
   */
  getTipoHabitacionLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'individual': 'Individual',
      'doble': 'Doble',
      'triple': 'Triple',
      'suite_junior': 'Suite Junior',
      'suite_ejecutiva': 'Suite Ejecutiva',
      'suite_presidencial': 'Suite Presidencial'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Obtener etiqueta del catering
   */
  getCateringLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'coffee_break': 'Coffee Break',
      'desayuno_continental': 'Desayuno Continental',
      'desayuno_americano': 'Desayuno Americano',
      'almuerzo_ejecutivo': 'Almuerzo Ejecutivo',
      'almuerzo_buffet': 'Almuerzo Buffet',
      'cena_formal': 'Cena Formal',
      'coctel': 'Cóctel',
      'brunch': 'Brunch'
    };
    return tipos[tipo] || tipo;
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