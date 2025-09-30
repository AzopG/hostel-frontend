import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * HU05 + HU06 - Interfaz para filtros de búsqueda
 */
export interface FiltrosHabitacion {
  fechaInicio: string;  // YYYY-MM-DD
  fechaFin: string;     // YYYY-MM-DD
  huespedes: number;
  ciudad?: string;
  servicios?: string[];  // HU06: Servicios adicionales
}

/**
 * HU05 - Interfaz para habitación en resultados
 */
export interface HabitacionResultado {
  _id: string;
  numero: string;
  tipo: string;
  precio: number;
  capacidad: number;
  descripcion: string;
  servicios: string[];
  hotel: {
    _id: string;
    nombre: string;
    ciudad: string;
    direccion: string;
  };
}

/**
 * HU05 + HU06 - Interfaz para respuesta de búsqueda
 */
export interface BusquedaHabitacionesResponse {
  success: boolean;
  msg: string;
  habitaciones: HabitacionResultado[];
  total: number;
  filtros?: {
    fechaInicio: string;
    fechaFin: string;
    huespedes: number;
    ciudad: string;
    servicios?: string[];  // HU06
  };
  error?: string;
  limite?: number;
}

/**
 * Servicio para filtrar y buscar habitaciones
 */
@Injectable({
  providedIn: 'root'
})
export class FiltrosService {
  private apiUrl = `${environment.apiUrl}/filtros`;

  constructor(private http: HttpClient) {}

  /**
   * HU05 + HU06: Buscar habitaciones disponibles por fechas, huéspedes y servicios
   */
  buscarHabitaciones(filtros: FiltrosHabitacion): Observable<BusquedaHabitacionesResponse> {
    let params = new HttpParams()
      .set('fechaInicio', filtros.fechaInicio)
      .set('fechaFin', filtros.fechaFin)
      .set('huespedes', filtros.huespedes.toString());

    if (filtros.ciudad) {
      params = params.set('ciudad', filtros.ciudad);
    }

    // HU06 CA1: Agregar servicios al query
    if (filtros.servicios && filtros.servicios.length > 0) {
      params = params.set('servicios', filtros.servicios.join(','));
    }

    return this.http.get<BusquedaHabitacionesResponse>(`${this.apiUrl}/habitaciones`, { params });
  }

  /**
   * Helper: Validar que fecha fin sea posterior a fecha inicio (CA2)
   */
  validarFechas(fechaInicio: string, fechaFin: string): { valido: boolean; error?: string } {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return {
        valido: false,
        error: 'Formato de fecha inválido'
      };
    }

    if (fin <= inicio) {
      return {
        valido: false,
        error: 'La fecha de fin debe ser posterior a la fecha de inicio'
      };
    }

    return { valido: true };
  }

  /**
   * Helper: Validar número de huéspedes (CA4)
   */
  validarHuespedes(huespedes: number, max: number = 10): { valido: boolean; error?: string } {
    if (huespedes < 1) {
      return {
        valido: false,
        error: 'El número de huéspedes debe ser al menos 1'
      };
    }

    if (huespedes > max) {
      return {
        valido: false,
        error: `El número máximo de huéspedes es ${max}`
      };
    }

    return { valido: true };
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
   * Helper: Obtener fecha de hoy
   */
  getFechaHoy(): string {
    return this.formatDate(new Date());
  }

  /**
   * Helper: Obtener fecha de mañana (para fecha fin mínima)
   */
  getFechaManana(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return this.formatDate(manana);
  }

  /**
   * Helper: Calcular número de noches entre dos fechas
   */
  calcularNoches(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin.getTime() - inicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Helper: Formatear precio en pesos colombianos
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}
