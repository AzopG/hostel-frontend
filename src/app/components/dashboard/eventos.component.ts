import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Gestión de Eventos</h1>
        <button class="btn btn-primary" (click)="crearEvento()">
          <i class="fas fa-plus"></i> Crear Evento
        </button>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Próximos Eventos</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4" *ngFor="let evento of eventos">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h5 class="card-title">{{ evento.nombre }}</h5>
                      <p class="card-text">
                        <small class="text-muted">
                          <i class="fas fa-calendar"></i> {{ evento.fecha | date:'short' }}<br>
                          <i class="fas fa-map-marker-alt"></i> {{ evento.salon }}<br>
                          <i class="fas fa-users"></i> {{ evento.asistentes }} personas
                        </small>
                      </p>
                      <span class="badge" [ngClass]="getTipoBadge(evento.tipo)">{{ evento.tipo | titlecase }}</span>
                      <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" (click)="verEvento(evento)">
                          <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-outline-warning" (click)="editarEvento(evento)">
                          <i class="fas fa-edit"></i> Editar
                        </button>
                      </div>
                    </div>
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
    .card {
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .badge {
      font-size: 0.75rem;
    }
  `]
})
export class EventosComponent {
  eventos = [
    {
      id: 1,
      nombre: 'Conferencia Tecnológica 2025',
      fecha: new Date('2025-09-25'),
      salon: 'Salón Ejecutivo - Hotel Central',
      asistentes: 80,
      tipo: 'conferencia'
    },
    {
      id: 2,
      nombre: 'Boda García-López',
      fecha: new Date('2025-09-28'),
      salon: 'Salón Crystal - Hotel Plaza',
      asistentes: 150,
      tipo: 'social'
    },
    {
      id: 3,
      nombre: 'Reunión Anual Directivos',
      fecha: new Date('2025-10-05'),
      salon: 'Salón VIP - Hotel Ejecutivo',
      asistentes: 25,
      tipo: 'corporativo'
    }
  ];

  getTipoBadge(tipo: string): string {
    switch (tipo) {
      case 'conferencia': return 'bg-primary';
      case 'social': return 'bg-success';
      case 'corporativo': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  crearEvento(): void {
    console.log('Crear nuevo evento');
  }

  verEvento(evento: any): void {
    console.log('Ver evento:', evento);
  }

  editarEvento(evento: any): void {
    console.log('Editar evento:', evento);
  }
}