import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paquetes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Paquetes Turísticos</h1>
        <button class="btn btn-primary" (click)="crearPaquete()">
          <i class="fas fa-plus"></i> Crear Paquete
        </button>
      </div>

      <div class="row">
        <div class="col-md-4" *ngFor="let paquete of paquetes">
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">{{ paquete.nombre }}</h5>
              <p class="card-text">{{ paquete.descripcion }}</p>
              <ul class="list-unstyled">
                <li *ngFor="let servicio of paquete.servicios">
                  <i class="fas fa-check text-success me-2"></i>{{ servicio }}
                </li>
              </ul>
              <div class="d-flex justify-content-between align-items-center">
                <span class="h4 text-primary">{{ paquete.precio | currency:'USD':'symbol':'1.0-0' }}</span>
                <span class="badge bg-info">{{ paquete.duracion }}</span>
              </div>
              <div class="mt-3">
                <button class="btn btn-outline-primary me-2" (click)="verPaquete(paquete)">
                  <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn btn-outline-warning" (click)="editarPaquete(paquete)">
                  <i class="fas fa-edit"></i> Editar
                </button>
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
      height: 100%;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .list-unstyled li {
      padding: 2px 0;
    }
  `]
})
export class PaquetesComponent {
  paquetes = [
    {
      id: 1,
      nombre: 'Escapada Romántica',
      descripcion: 'Perfecto para parejas que buscan un momento especial',
      servicios: ['Habitación con vista', 'Cena romántica', 'Spa para parejas', 'Champagne de bienvenida'],
      precio: 450,
      duracion: '2 noches'
    },
    {
      id: 2,
      nombre: 'Negocios Ejecutivo',
      descripcion: 'Todo lo necesario para viajes de negocios',
      servicios: ['Habitación ejecutiva', 'Desayuno incluido', 'WiFi premium', 'Sala de reuniones'],
      precio: 320,
      duracion: '1 noche'
    },
    {
      id: 3,
      nombre: 'Aventura Familiar',
      descripción: 'Diversión para toda la familia',
      servicios: ['Habitación familiar', 'Actividades para niños', 'Piscina', 'Buffet completo'],
      precio: 280,
      duracion: '3 noches'
    }
  ];

  crearPaquete(): void {
    console.log('Crear nuevo paquete');
  }

  verPaquete(paquete: any): void {
    console.log('Ver paquete:', paquete);
  }

  editarPaquete(paquete: any): void {
    console.log('Editar paquete:', paquete);
  }
}