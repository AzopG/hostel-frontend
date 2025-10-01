import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para HU04
export interface Ciudad {
  ciudad: string;
  totalHoteles: number;
  totalHabitaciones: number;
}

export interface CiudadesResponse {
  success: boolean;
  count: number;
  ciudades: Ciudad[];
}

export interface DisponibilidadDia {
  fecha: string;
  disponible: boolean;
  habitacionesDisponibles: number;
  totalHabitaciones: number;
}

export interface HotelInfo {
  id: string;
  nombre: string;
  direccion?: string;
}

export interface DisponibilidadCiudadResponse {
  success: boolean;
  ciudad: string;
  fechaInicio: string;
  fechaFin: string;
  totalHoteles: number;
  totalHabitaciones: number;
  hoteles: HotelInfo[];
  disponibilidad: DisponibilidadDia[];
  msg?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private apiUrl = `${environment.apiUrl}/disponibilidad`;

  constructor(private http: HttpClient) {}

  /**
   * HU04 - CA1: Obtener lista de ciudades disponibles
   */
  getCiudades(): Observable<CiudadesResponse> {
    return this.http.get<CiudadesResponse>(`${this.apiUrl}/ciudades`);
  }

  /**
   * HU04 - CA1, CA2, CA3: Obtener disponibilidad por ciudad y rango de fechas
   * @param ciudad Nombre de la ciudad
   * @param fechaInicio Fecha de inicio en formato YYYY-MM-DD
   * @param fechaFin Fecha de fin en formato YYYY-MM-DD
   */
  getDisponibilidadPorCiudad(
    ciudad: string,
    fechaInicio: string,
    fechaFin: string
  ): Observable<DisponibilidadCiudadResponse> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<DisponibilidadCiudadResponse>(
      `${this.apiUrl}/ciudad/${encodeURIComponent(ciudad)}`,
      { params }
    );
  }

  /**
   * Helper: Formatear fecha a YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Obtener rango de fechas por defecto (30 días desde hoy)
   */
  getRangoFechasPorDefecto(): { fechaInicio: string; fechaFin: string } {
    const hoy = new Date();
    const fin = new Date();
    fin.setDate(hoy.getDate() + 30);

    return {
      fechaInicio: this.formatDate(hoy),
      fechaFin: this.formatDate(fin)
    };
  }
}
