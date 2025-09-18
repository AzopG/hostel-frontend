import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Mis Reservas</h1>
        <button class="btn btn-primary" routerLink="/dashboard/reservas">
          <i class="fas fa-plus"></i> Nueva Reserva
        </button>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-6" *ngFor="let reserva of misReservas">
                  <div class="card mb-3">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 class="card-title">{{ reserva.hotel }}</h5>
                          <p class="card-text">
                            <strong>Habitación:</strong> {{ reserva.habitacion }}<br>
                            <strong>Check-in:</strong> {{ reserva.checkIn | date:'short' }}<br>
                            <strong>Check-out:</strong> {{ reserva.checkOut | date:'short' }}<br>
                            <strong>Total:</strong> {{ reserva.total | currency:'USD':'symbol':'1.0-0' }}
                          </p>
                        </div>
                        <span class="badge" [ngClass]="getEstadoBadge(reserva.estado)">
                          {{ reserva.estado | titlecase }}
                        </span>
                      </div>
                      <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" (click)="verDetalles(reserva)">
                          <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="cancelarReserva(reserva)"
                                [disabled]="reserva.estado === 'cancelada'">
                          <i class="fas fa-times"></i> Cancelar
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
  `]
})
export class MisReservasComponent {
  misReservas = [
    {
      id: 1001,
      hotel: 'Hotel Boutique Central',
      habitacion: '101',
      checkIn: new Date('2025-09-20'),
      checkOut: new Date('2025-09-23'),
      estado: 'confirmada',
      total: 540
    },
    {
      id: 1005,
      hotel: 'Hotel Plaza Mayor',
      habitacion: '205',
      checkIn: new Date('2025-10-15'),
      checkOut: new Date('2025-10-18'),
      estado: 'pendiente',
      total: 720
    }
  ];

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'cancelada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  verDetalles(reserva: any): void {
    console.log('Ver detalles de reserva:', reserva);
  }

  cancelarReserva(reserva: any): void {
    console.log('Cancelar reserva:', reserva);
  }
}