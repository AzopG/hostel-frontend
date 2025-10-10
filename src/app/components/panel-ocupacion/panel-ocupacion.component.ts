import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OcupacionHotel, ReservaService } from '../../services/reserva.service';



@Component({
  selector: 'app-panel-ocupacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-ocupacion.component.html',
  styleUrl: './panel-ocupacion.component.css'
})
export class PanelOcupacionComponent implements OnInit {
  ocupacion: OcupacionHotel[] = [];
  cargando = true;
  error = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    // Inicializar con rango de fechas actual (hoy)
    const hoy = new Date();
    this.fechaInicio = this.formatearFecha(hoy);
    this.fechaFin = this.formatearFecha(hoy);
    this.cargarOcupacion();
  }

  cargarOcupacion(): void {
    this.cargando = true;
    this.reservaService.obtenerOcupacionPorHotel(this.fechaInicio, this.fechaFin).subscribe({
      next: (response: { ocupacion: OcupacionHotel[] }) => {
        this.ocupacion = response.ocupacion || [];
        this.cargando = false;
        this.error = '';
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Error al cargar ocupación';
        this.cargando = false;
      }
    });
  }

  onFechaChange(): void {
    this.cargarOcupacion();
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
