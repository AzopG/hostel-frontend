import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habitaciones-editor',
  templateUrl: './habitaciones-editor.component.html',
  styleUrls: ['./habitaciones-editor.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HabitacionesEditorComponent {
  @Input() habitaciones: any[] = [];
  @Output() habitacionesChange = new EventEmitter<any[]>();
  serviciosDisponibles: string[] = ['WiFi', 'TV', 'Aire acondicionado', 'Baño privado', 'Desayuno', 'Caja fuerte'];

  mostrarTodas = false;

  agregarHabitacion() {
    const nuevoNumero = this.habitaciones.length > 0
      ? Math.max(...this.habitaciones.map(h => Number(h.numero) || 0)) + 1
      : 1;
    if (this.habitaciones.some(h => h.numero === nuevoNumero)) {
      window.alert('Ya existe una habitación con ese número.');
      return;
    }
    this.habitaciones.push({
      numero: nuevoNumero,
      servicios: [],
      tipo: 'estándar',
      capacidad: 1,
      precio: 100000,
      disponible: true
    });
    this.emitirCambio();
  }

  validarNumeroUnico(index: number) {
    const numero = this.habitaciones[index].numero;
    if (this.habitaciones.filter(h => h.numero === numero).length > 1) {
      window.alert('No puede haber habitaciones con el mismo número.');
      this.habitaciones[index].numero = '';
    }
    this.emitirCambio();
  }

  eliminarHabitacion(index: number) {
    this.habitaciones.splice(index, 1);
    this.emitirCambio();
  }

  toggleServicio(habitacion: any, servicio: string) {
    const idx = habitacion.servicios.indexOf(servicio);
    if (idx > -1) {
      habitacion.servicios.splice(idx, 1);
    } else {
      habitacion.servicios.push(servicio);
    }
    this.emitirCambio();
  }

  emitirCambio() {
    this.habitacionesChange.emit(this.habitaciones);
  }
}
