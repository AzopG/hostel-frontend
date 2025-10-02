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
  @Input() mostrarEditor: boolean = false;
  @Input() hoteles: any[] = [];
  @Output() habitacionesChange = new EventEmitter<any[]>();
  serviciosDisponibles: string[] = [
    'WiFi',
    'Aire acondicionado',
    'Desayuno',
    'TV',
    'Piscina',
    'Gimnasio',
    'Mascotas',
    'Restaurante',
    'Bar',
    'Spa',
    'Parqueadero',
    'Lavandería',
    'Baño privado',
    'Caja fuerte'
  ];

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
      tipo: 'estándar',
      capacidad: 1,
      precio: 100000,
      servicios: [],
      disponible: true,
      descripcion: '',
      fotos: []
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
    // Normaliza todos los campos antes de emitir, conservando _id si existe
    const habitacionesCompletas = this.habitaciones.map(h => ({
      _id: h._id,
      numero: h.numero,
      tipo: h.tipo,
      capacidad: h.capacidad,
      precio: h.precio,
      servicios: Array.isArray(h.servicios) ? h.servicios : [],
      disponible: h.disponible !== undefined ? h.disponible : true,
      descripcion: h.descripcion || '',
      fotos: Array.isArray(h.fotos) ? h.fotos.filter((f: any) => !!f) : []
    }));
    this.habitacionesChange.emit(habitacionesCompletas);
  }

  guardarConAlerta() {
    this.emitirCambio();
    setTimeout(() => {
      if (window.confirm('¡Habitaciones y servicios guardados correctamente!\n\n¿Deseas recargar la página para ver los cambios?')) {
        window.location.reload();
      }
    }, 100);
  }
}
