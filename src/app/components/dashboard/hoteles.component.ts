import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService, Hotel } from '../../services/hotel.service';
import { HabitacionesEditorComponent } from '../habitaciones-editor/habitaciones-editor.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule, FormsModule, HabitacionesEditorComponent],
  templateUrl: './hoteles.component.html',
  styleUrls: ['./hoteles.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HotelesComponent implements OnInit {
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  cargando = false;
  
  // Modal variables
  modalVisible = false;
  modalModo: 'crear' | 'editar' | 'ver' = 'ver';
  modalHotel: Hotel | null = null;
  
  // Modal eliminar
  modalEliminarVisible = false;
  hotelAEliminar: Hotel | null = null;
  
  // Modal habitaciones
  modalHabitacionesVisible = false;
  hotelHabitaciones: Hotel | null = null;
  habitacionesEdit: any[] = [];
  habitacionesValidas = true;

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.cargarHoteles();
  }

  cargarHoteles() {
    this.cargando = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles;
        this.hotelesFiltrados = [...this.hoteles];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar hoteles:', error);
        this.cargando = false;
      }
    });
  }

  // Métricas
  getTotalHoteles(): number {
    return this.hoteles.length;
  }

  getHotelesActivos(): number {
    return this.hoteles.filter(h => h.activo).length;
  }

  getHotelesPremium(): number {
    return this.hoteles.filter(h => h.categoria === 5).length;
  }

  // Filtros
  filtrarPorEstado(event: any) {
    const estado = event.target.value;
    if (estado === 'todos') {
      this.hotelesFiltrados = [...this.hoteles];
    } else {
      const activo = estado === 'activo';
      this.hotelesFiltrados = this.hoteles.filter(h => h.activo === activo);
    }
  }

  filtrarPorCategoria(event: any) {
    const categoria = event.target.value;
    if (categoria === 'todas') {
      this.hotelesFiltrados = [...this.hoteles];
    } else {
      this.hotelesFiltrados = this.hoteles.filter(h => h.categoria === parseInt(categoria));
    }
  }

  // Acciones de hoteles
  agregarHotel() {
    this.modalModo = 'crear';
    this.modalHotel = {
      nombre: '',
      ciudad: '',
      direccion: '',
      telefono: '',
      email: '',
      categoria: 1,
      ocupacion: 0,
      activo: true,
      habitaciones: []
    };
    this.modalVisible = true;
  }

  verHotel(hotel: Hotel) {
    this.modalModo = 'ver';
    this.modalHotel = { ...hotel };
    this.modalVisible = true;
  }

  editarHotel(hotel: Hotel) {
    this.modalModo = 'editar';
    this.modalHotel = { ...hotel };
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.modalHotel = null;
  }

  guardarEdicionHotel() {
    if (!this.modalHotel) return;
    
    this.cargando = true;
    if (this.modalModo === 'crear') {
      this.hotelService.crearHotel(this.modalHotel).subscribe({
        next: () => {
          this.cargarHoteles();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear hotel:', error);
          this.cargando = false;
        }
      });
    } else if (this.modalModo === 'editar') {
      this.hotelService.editarHotel(this.modalHotel._id!, this.modalHotel).subscribe({
        next: () => {
          this.cargarHoteles();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al editar hotel:', error);
          this.cargando = false;
        }
      });
    }
  }

  // Eliminación
  confirmarEliminarHotel(hotel: Hotel) {
    this.hotelAEliminar = hotel;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.hotelAEliminar = null;
  }

  eliminarHotel(hotel: Hotel | null) {
    if (!hotel) return;
    
    this.cargando = true;
    this.hotelService.eliminarHotel(hotel._id!).subscribe({
      next: () => {
        this.cargarHoteles();
        this.cerrarModalEliminar();
      },
      error: (error) => {
        console.error('Error al eliminar hotel:', error);
        this.cargando = false;
      }
    });
  }

  toggleEstadoHotel(hotel: Hotel) {
    this.cargando = true;
    this.hotelService.actualizarEstadoHotel(hotel._id!, !hotel.activo).subscribe({
      next: () => {
        this.cargarHoteles();
      },
      error: (error) => {
        console.error('Error al cambiar estado del hotel:', error);
        this.cargando = false;
      }
    });
  }

  // Habitaciones
  abrirModalHabitaciones(hotel: Hotel) {
    this.hotelHabitaciones = hotel;
    this.habitacionesEdit = hotel.habitaciones ? [...hotel.habitaciones] : [];
    this.modalHabitacionesVisible = true;
  }

  cerrarModalHabitaciones() {
    this.modalHabitacionesVisible = false;
    this.hotelHabitaciones = null;
    this.habitacionesEdit = [];
  }

  guardarHabitacionesEditadas() {
    if (!this.hotelHabitaciones) return;
    
    this.cargando = true;
    const hotelActualizado = { 
      ...this.hotelHabitaciones, 
      habitaciones: this.habitacionesEdit 
    };
    this.hotelService.editarHotel(this.hotelHabitaciones._id!, hotelActualizado).subscribe({
      next: () => {
        this.cargarHoteles();
        this.cerrarModalHabitaciones();
      },
      error: (error) => {
        console.error('Error al guardar habitaciones:', error);
        this.cargando = false;
      }
    });
  }

  // Utilidades
  getStarsArray(categoria: number): number[] {
    return Array(categoria).fill(0);
  }

  getNumeroHabitaciones(hotel: Hotel): number {
    return hotel.habitaciones ? hotel.habitaciones.length : 0;
  }

  trackByHotelId(index: number, hotel: Hotel): string {
    return hotel._id || index.toString();
  }
}
