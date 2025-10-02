import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DetalleHabitacion, HabitacionService } from '../../services/habitacion.service';
import { Hotel, HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent implements OnInit {
  // ...existing code...

  guardarHabitaciones(): void {
    // Solo crear las habitaciones que no tienen _id
    const nuevas = this.habitaciones.filter(h => !h._id);
    const existentes = this.habitaciones.filter(h => !!h._id);

    nuevas.forEach(h => {
      this.habitacionService.crearHabitacion(h).subscribe({
        next: () => {
          // Recargar habitaciones después de crear
          this.buscarHabitaciones();
        },
        error: (err) => {
          console.error('Error al crear habitación:', err);
        }
      });
    });

    existentes.forEach(h => {
      this.habitacionService.actualizarHabitacion(h._id, h).subscribe({
        next: () => {
          // Recargar habitaciones después de actualizar
          this.buscarHabitaciones();
        },
        error: (err) => {
          console.error('Error al actualizar habitación:', err);
        }
      });
    });
  }
  public habitaciones: DetalleHabitacion[] = [];
  public mostrarEditor: boolean = false;
  public hoteles: Hotel[] = [];

  // Filtros para la búsqueda
  public filtroTipo: string = '';
  public filtroCapacidad?: number;
  public filtroPrecioMin?: number;
  public filtroPrecioMax?: number;
  public filtroDisponible?: boolean;
  public filtroHotelId: string = '';

  // Filtros avanzados
  public mostrarAvanzados: boolean = false;
  public serviciosDisponibles: string[] = [
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
    'Lavandería'
  ];
  public serviciosSeleccionados: { [servicio: string]: boolean } = {};

  constructor(
    private habitacionService: HabitacionService,
    private hotelService: HotelService
  ) {}
  ngOnInit(): void {
    // Cargar hoteles reales al iniciar
    this.hotelService.getHoteles().subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles;
      },
      error: (err) => {
        console.error('Error al cargar hoteles:', err);
      }
    });
    // Opcional: cargar habitaciones iniciales
    this.buscarHabitaciones();
  }

  buscarHabitaciones(): void {
    // Obtener servicios seleccionados
    const serviciosFiltrar = Object.keys(this.serviciosSeleccionados)
      .filter(s => this.serviciosSeleccionados[s]);

    const filtros: any = {
      tipo: this.filtroTipo || undefined,
      capacidad: this.filtroCapacidad,
      precioMin: this.filtroPrecioMin,
      precioMax: this.filtroPrecioMax,
      disponible: this.filtroDisponible,
      hotelId: this.filtroHotelId || undefined
    };
    if (serviciosFiltrar.length > 0) {
      filtros.servicios = serviciosFiltrar;
    }
    this.habitacionService.buscarHabitacionesFiltradas(filtros).subscribe({
      next: (result) => {
        this.habitaciones = result;
      },
      error: (err) => {
        // Manejo de error peludito
        console.error('Error al buscar habitaciones:', err);
      }
    });
  }

  onHabitacionesChange(event: any): void {
    this.habitaciones = event;
  }
}
