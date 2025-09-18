import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Gestión de Inventario</h1>
        <button class="btn btn-primary" (click)="agregarItem()">
          <i class="fas fa-plus"></i> Agregar Item
        </button>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Inventario del Hotel</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Categoría</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of inventario">
                      <td>{{ item.nombre }}</td>
                      <td>{{ item.categoria }}</td>
                      <td>{{ item.cantidad }}</td>
                      <td>
                        <span class="badge" [ngClass]="getEstadoBadge(item.estado)">
                          {{ item.estado | titlecase }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2">
                          <i class="fas fa-edit"></i> Editar
                        </button>
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
  `
})
export class InventarioComponent {
  inventario = [
    { id: 1, nombre: 'Toallas', categoria: 'Baño', cantidad: 50, estado: 'disponible' },
    { id: 2, nombre: 'Sabanas', categoria: 'Dormitorio', cantidad: 30, estado: 'disponible' },
    { id: 3, nombre: 'Televisores', categoria: 'Electrónicos', cantidad: 25, estado: 'mantenimiento' }
  ];

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'disponible': return 'bg-success';
      case 'mantenimiento': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  agregarItem(): void {
    console.log('Agregar nuevo item al inventario');
  }
}