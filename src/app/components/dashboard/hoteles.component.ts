import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Hotel, HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    this.hotelService.editarHotel(this.modalHotel._id, this.modalHotel).subscribe({
      next: (hotelActualizado) => {
        // Actualiza el hotel en la lista
        const idx = this.hoteles.findIndex(h => h._id === hotelActualizado._id);
        if (idx > -1) {
          this.hoteles[idx] = hotelActualizado;
          this.aplicarFiltros();
        }
        this.cargando = false;
        this.cerrarModal();
        alert('¡Hotel editado correctamente!');
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
        const index = this.hoteles.findIndex(h => h._id === hotel._id);
        if (index > -1) {
          this.hoteles.splice(index, 1);
          this.aplicarFiltros();
        }
        this.cargando = false;
        this.cerrarModalEliminar();
        alert('¡Hotel eliminado correctamente!');
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