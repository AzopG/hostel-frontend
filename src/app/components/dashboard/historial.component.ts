import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Historial de Actividades</h1>
        <button class="btn btn-outline-primary" (click)="exportarHistorial()">
          <i class="fas fa-download"></i> Exportar
        </button>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="timeline">
                <div class="timeline-item" *ngFor="let actividad of actividades; let i = index">
                  <div class="timeline-marker" [ngClass]="getMarkerClass(actividad.tipo)">
                    <i [class]="getIconClass(actividad.tipo)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex justify-content-between">
                      <h6 class="mb-1">{{ actividad.titulo }}</h6>
                      <small class="text-muted">{{ actividad.fecha | date:'short' }}</small>
                    </div>
                    <p class="mb-1">{{ actividad.descripcion }}</p>
                    <small class="text-muted">Por: {{ actividad.usuario }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline {
      position: relative;
      padding-left: 50px;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 25px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #dee2e6;
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 30px;
    }
    
    .timeline-marker {
      position: absolute;
      left: -37px;
      top: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }
    
    .timeline-content {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #007bff;
    }
    
    .bg-primary { background-color: #007bff !important; }
    .bg-success { background-color: #28a745 !important; }
    .bg-warning { background-color: #ffc107 !important; }
    .bg-danger { background-color: #dc3545 !important; }
    .bg-info { background-color: #17a2b8 !important; }
  `]
})
export class HistorialComponent {
  actividades = [
    {
      id: 1,
      tipo: 'reserva',
      titulo: 'Nueva reserva creada',
      descripcion: 'Reserva #1001 para Hotel Boutique Central del 20-23 Sept',
      usuario: 'Juan Pérez',
      fecha: new Date('2025-09-17T10:30:00')
    },
    {
      id: 2,
      tipo: 'pago',
      titulo: 'Pago confirmado',
      descripcion: 'Pago de $540 USD procesado exitosamente',
      usuario: 'Sistema',
      fecha: new Date('2025-09-17T09:15:00')
    },
    {
      id: 3,
      tipo: 'modificacion',
      titulo: 'Reserva modificada',
      descripcion: 'Habitación cambiada de 101 a 102 por solicitud del cliente',
      usuario: 'María García',
      fecha: new Date('2025-09-16T16:45:00')
    },
    {
      id: 4,
      tipo: 'cancelacion',
      titulo: 'Reserva cancelada',
      descripcion: 'Reserva #1004 cancelada por el cliente',
      usuario: 'Ana Martínez',
      fecha: new Date('2025-09-16T14:20:00')
    },
    {
      id: 5,
      tipo: 'login',
      titulo: 'Inicio de sesión',
      descripcion: 'Usuario admin_central ingresó al sistema',
      usuario: 'Juan Pérez',
      fecha: new Date('2025-09-16T08:00:00')
    }
  ];

  getMarkerClass(tipo: string): string {
    switch (tipo) {
      case 'reserva': return 'bg-primary';
      case 'pago': return 'bg-success';
      case 'modificacion': return 'bg-warning';
      case 'cancelacion': return 'bg-danger';
      case 'login': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getIconClass(tipo: string): string {
    switch (tipo) {
      case 'reserva': return 'fas fa-calendar-plus';
      case 'pago': return 'fas fa-credit-card';
      case 'modificacion': return 'fas fa-edit';
      case 'cancelacion': return 'fas fa-times';
      case 'login': return 'fas fa-sign-in-alt';
      default: return 'fas fa-info';
    }
  }

  exportarHistorial(): void {
    console.log('Exportar historial de actividades');
  }
}