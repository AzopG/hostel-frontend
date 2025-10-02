import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Hotel, HotelService } from '../../services/hotel.service';
import { HabitacionesEditorComponent } from '../habitaciones-editor';

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule, FormsModule, HabitacionesEditorComponent],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './hoteles.component.html',
  styleUrls: ['./hoteles.component.css']
})
export class HotelesComponent implements OnInit {
  guardarHabitacionesEditadas(): void {
    if (!this.hotelHabitaciones || !this.habitacionesValidas) return;
    this.cargando = true;
    // Actualiza la cantidad de habitaciones en el backend
    const habitacionesPayload = this.habitacionesEdit.map((h: any) => ({
      _id: h._id,
      numero: h.numero,
      tipo: h.tipo,
      capacidad: h.capacidad,
      precio: h.precio,
      servicios: h.servicios,
      disponible: h.disponible,
      descripcion: h.descripcion,
      fotos: h.fotos
    }));
    this.hotelService.editarHotel(this.hotelHabitaciones._id, { habitaciones: habitacionesPayload }).subscribe({
      next: (hotelActualizado) => {
        this.hotelService.getHoteles().subscribe({
          next: (hoteles) => {
            this.hoteles = hoteles;
            this.aplicarFiltros();
            this.cargando = false;
            window.alert('¡Habitaciones y servicios guardados correctamente!');
            this.cerrarModalHabitaciones();
            window.location.reload();
          },
          error: () => {
            this.cargando = false;
            window.alert('¡Habitaciones y servicios guardados correctamente!');
            this.cerrarModalHabitaciones();
            window.location.reload();
          }
        });
      },
      error: (err) => {
        this.cargando = false;
          window.alert('Error al guardar habitaciones: ' + (err?.error?.message || 'Intenta de nuevo'));
      }
    });
  }
  // Propiedades para el modal de habitaciones
  abrirModalHabitaciones(hotel: any): void {
    this.hotelHabitaciones = hotel;
    // Solo clona habitaciones que ya son objetos completos
    this.habitacionesEdit = Array.isArray(hotel.habitaciones)
      ? hotel.habitaciones.map((h: unknown) => typeof h === 'object' && h !== null ? { ...(h as any) } : null).filter((h: any) => h)
      : [];
    this.modalHabitacionesVisible = true;
  }
  modalHabitacionesVisible = false;
  hotelHabitaciones: any = null;
  habitacionesEdit: any[] = [];
  cerrarModalHabitaciones(): void {
    this.modalHabitacionesVisible = false;
    this.hotelHabitaciones = null;
    this.habitacionesEdit = [];
  }
  get habitacionesValidas(): boolean {
  return Array.isArray(this.habitacionesEdit) && this.habitacionesEdit.every((h: any) => h.numero && h.numero > 0 && h.servicios);
  }
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  filtroEstado = 'todos';
  filtroCategoria = 'todas';
  cargando = true;
  modalVisible = false;
  modalHotel: any = null;
  modalModo: 'ver' | 'editar' | 'crear' = 'ver';
  // Modal de eliminación
  modalEliminarVisible = false;
  hotelAEliminar: any = null;
  confirmarEliminarHotel(hotel: any): void {
    this.hotelAEliminar = hotel;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar(): void {
    this.modalEliminarVisible = false;
    this.hotelAEliminar = null;
  }

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.hotelService.getHoteles().subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  // Métodos de estadísticas
  getTotalHoteles(): number {
    return this.hoteles.length;
  }

  getHotelesActivos(): number {
    return this.hoteles.filter(hotel => hotel.activo).length;
  }

  getHotelesPremium(): number {
    return this.hoteles.filter(hotel => hotel.categoria === 5).length;
  }

  // Métodos de filtrado
  filtrarPorEstado(event: any): void {
    this.filtroEstado = event.target.value;
    this.aplicarFiltros();
  }

  filtrarPorCategoria(event: any): void {
    this.filtroCategoria = event.target.value;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.hotelesFiltrados = this.hoteles.filter(hotel => {
      // Filtro por estado
      let pasaFiltroEstado = true;
      if (this.filtroEstado === 'activo') {
        pasaFiltroEstado = hotel.activo;
      } else if (this.filtroEstado === 'inactivo') {
        pasaFiltroEstado = !hotel.activo;
      }

      // Filtro por categoría
      let pasaFiltroCategoria = true;
      if (this.filtroCategoria !== 'todas') {
        pasaFiltroCategoria = hotel.categoria === parseInt(this.filtroCategoria);
      }

      return pasaFiltroEstado && pasaFiltroCategoria;
    });
  }

  // Métodos de utilidad
  getStarsArray(categoria: number): number[] {
    return Array.from({ length: categoria }, (_, i) => i);
  }

    getNumeroHabitaciones(hotel: any): number {
      return Array.isArray(hotel.habitaciones) ? hotel.habitaciones.length : 0;
    }

  trackByHotelId(index: number, hotel: Hotel): string | undefined {
    return hotel._id;
  }

  // Métodos de acciones
  agregarHotel(): void {
    this.modalHotel = {
      nombre: '',
      ciudad: '',
      direccion: '',
      telefono: '',
      email: '',
      categoria: 3,
      activo: true,
      habitaciones: 0,
      ocupacion: 0
    };
    this.modalModo = 'crear';
    this.modalVisible = true;
  }

  guardarCreacionHotel(): void {
    if (!this.modalHotel) return;
    this.cargando = true;
    // Clonar el objeto y eliminar 'habitaciones' antes de enviar
    const hotelData = { ...this.modalHotel };
    delete hotelData.habitaciones;
    this.hotelService.crearHotel(hotelData).subscribe({
      next: (hotel) => {
        this.hoteles.push(hotel);
        this.aplicarFiltros();
        this.cargando = false;
        this.cerrarModal();
        alert('¡Hotel creado correctamente!');
      },
      error: () => {
        this.cargando = false;
        alert('Error al crear el hotel');
      }
    });
  }

  verHotel(hotel: any): void {
    this.modalHotel = { ...hotel };
    this.modalModo = 'ver';
    this.modalVisible = true;
  }

  editarHotel(hotel: any): void {
    this.modalHotel = { ...hotel };
    this.modalModo = 'editar';
    this.modalVisible = true;
  }

  guardarEdicionHotel(): void {
    if (!this.modalHotel) return;
    if (this.modalModo === 'crear') {
      this.guardarCreacionHotel();
      return;
    }
    this.cargando = true;
    // Eliminar habitaciones del payload si no se está editando habitaciones
    const hotelData = { ...this.modalHotel };
    if ('habitaciones' in hotelData) {
      delete hotelData.habitaciones;
    }
    this.hotelService.editarHotel(this.modalHotel._id, hotelData).subscribe({
      next: () => {
        window.location.reload();
      },
      error: () => {
        this.cargando = false;
        alert('Error al editar el hotel');
      }
    });
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalHotel = null;
  }


  eliminarHotel(hotel: any): void {
    this.cargando = true;
    this.hotelService.eliminarHotel(hotel._id).subscribe({
      next: () => {
        window.location.reload();
      },
      error: () => {
        this.cargando = false;
        alert('Error al eliminar el hotel');
      }
    });
  }

  toggleEstadoHotel(hotel: any): void {
    const nuevoEstado = !hotel.activo;
    this.cargando = true;
    this.hotelService.actualizarEstadoHotel(hotel._id, nuevoEstado).subscribe({
      next: (hotelActualizado) => {
        hotel.activo = hotelActualizado.activo;
        if (!hotel.activo) {
          hotel.ocupacion = 0;
        }
        this.aplicarFiltros();
        this.cargando = false;
        alert('¡Estado del hotel actualizado correctamente!');
      },
      error: () => {
        this.cargando = false;
        alert('Error al actualizar el estado del hotel');
      }
    });
  }
}