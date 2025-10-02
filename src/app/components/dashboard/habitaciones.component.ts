import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitacionService } from '../../services/habitacion.service';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent implements OnInit {
  habitaciones: any[] = [];
  hoteles: any[] = [];
  
  // Filtros
  filtroHotelId: string = '';
  filtroTipo: string = '';
  filtroCapacidad: number | null = null;
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroDisponible: boolean | undefined = undefined;
  
  // Filtros avanzados
  mostrarAvanzados: boolean = false;
  serviciosDisponibles: string[] = [
    'WiFi', 'Aire acondicionado', 'Desayuno', 'TV', 'Piscina', 
    'Gimnasio', 'Mascotas', 'Restaurante', 'Bar', 'Spa', 
    'Parqueadero', 'Lavander�a'
  ];
  serviciosSeleccionados: { [key: string]: boolean } = {};

  constructor(
    private habitacionService: HabitacionService,
    private hotelService: HotelService
  ) {
    // Inicializar servicios seleccionados
    this.serviciosDisponibles.forEach(servicio => {
      this.serviciosSeleccionados[servicio] = false;
    });
  }

  ngOnInit() {
    this.cargarHoteles();
    this.cargarHabitaciones();
  }

  cargarHoteles() {
    this.hotelService.getHoteles().subscribe({
      next: (response: any) => {
        this.hoteles = response.hoteles || [];
      },
      error: (error: any) => {
        console.error('Error al cargar hoteles:', error);
      }
    });
  }

  cargarHabitaciones() {
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (response: any) => {
        this.habitaciones = response.habitaciones || [];
      },
      error: (error: any) => {
        console.error('Error al cargar habitaciones:', error);
      }
    });
  }

  buscarHabitaciones() {
    // Crear objeto de filtros
    const filtros: any = {};
    
    if (this.filtroHotelId) filtros.hotelId = this.filtroHotelId;
    if (this.filtroTipo) filtros.tipo = this.filtroTipo;
    if (this.filtroCapacidad) filtros.capacidad = this.filtroCapacidad;
    if (this.filtroPrecioMin) filtros.precioMin = this.filtroPrecioMin;
    if (this.filtroPrecioMax) filtros.precioMax = this.filtroPrecioMax;
    if (this.filtroDisponible !== undefined) filtros.disponible = this.filtroDisponible;
    
    // Agregar servicios seleccionados
    const serviciosActivos = Object.keys(this.serviciosSeleccionados)
      .filter(servicio => this.serviciosSeleccionados[servicio]);
    if (serviciosActivos.length > 0) {
      filtros.servicios = serviciosActivos;
    }

    this.habitacionService.buscarHabitaciones(filtros).subscribe({
      next: (response: any) => {
        this.habitaciones = response.habitaciones || [];
      },
      error: (error: any) => {
        console.error('Error al buscar habitaciones:', error);
      }
    });
  }
}
