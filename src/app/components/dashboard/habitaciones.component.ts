import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'app-habitaciones',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	templateUrl: './habitaciones.component.html',
	styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent {
	@Input() habitaciones: any[] = [];
	@Input() hotel: any;
	@Output() habitacionesChange = new EventEmitter<any[]>();

	// Filtros y datos para el template
	filtroHotelId: string = '';
	filtroTipo: string = '';
	filtroCapacidad: number | null = null;
	filtroPrecioMin: number | null = null;
	filtroPrecioMax: number | null = null;
	filtroDisponible: boolean | undefined = undefined;
	mostrarAvanzados: boolean = false;
	hoteles: any[] = [];
	serviciosDisponibles: string[] = [
		'WiFi', 'Aire acondicionado', 'Desayuno', 'TV', 'Piscina', 'Gimnasio', 'Mascotas', 'Restaurante', 'Bar', 'Spa', 'Parqueadero', 'Lavandería'
	];
	serviciosSeleccionados: { [key: string]: boolean } = {};

	buscarHabitaciones() {
		// Aquí iría la lógica para filtrar habitaciones según los filtros
		// Puedes implementar la llamada al servicio o filtrar el array local
	}

}
