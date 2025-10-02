import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para HU07
export interface DetalleHabitacion {
  _id: string;
  numero: string;
  tipo: string;
  capacidad: number;
  servicios: string[];
  disponible: boolean;
  hotel: {
    _id: string;
    nombre: string;
    ciudad: string;
    direccion: string;
    telefono: string;
    email: string;
    calificacion: number;
    politicas: {
      checkIn: string;
      checkOut: string;
      cancelacion: string;
      mascotas: boolean;
      fumadores: boolean;
    };
    fotos: string[];
  };
  fotos: string[];
  descripcion: string;
  precio: number;
  reservas: any[];
}

export interface DetalleHabitacionResponse {
  success: boolean;
  habitacion: DetalleHabitacion;
}

export interface DisponibilidadResponse {
  success: boolean;
  disponible: boolean;
  mensaje: string;
  reservasConflicto?: any[];
}

export interface TarifaDesglose {
  precioPorNoche: number;
  subtotal: number;
  impuestos: {
    concepto: string;
    monto: number;
  };
  total: number;
}

export interface TarifaResponse {
  success: boolean;
  tarifa: {
    habitacion: {
      _id: string;
      numero: string;
      tipo: string;
      hotel: any;
    };
    fechaInicio: string;
    fechaFin: string;
    noches: number;
    desglose: TarifaDesglose;
    moneda: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private readonly apiUrl = `${environment.apiUrl}/habitaciones`;

  constructor(private http: HttpClient) {}

  /**
   * Buscar habitaciones por filtros y obtener detalles del hotel y disponibilidad
   * @param filtros { tipo, capacidad, precioMin, precioMax, disponible, hotelId }
   */
  buscarHabitacionesFiltradas(filtros: {
    tipo?: string;
    capacidad?: number;
    precioMin?: number;
    precioMax?: number;
    disponible?: boolean;
    hotelId?: string;
    servicios?: string[];
  }): Observable<DetalleHabitacion[]> {
    let params = new HttpParams();
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.capacidad) params = params.set('capacidad', filtros.capacidad.toString());
    if (filtros.precioMin) params = params.set('precioMin', filtros.precioMin.toString());
    if (filtros.precioMax) params = params.set('precioMax', filtros.precioMax.toString());
    if (filtros.disponible !== undefined) params = params.set('disponible', filtros.disponible ? 'true' : 'false');
    if (filtros.hotelId) params = params.set('hotelId', filtros.hotelId);
    if (filtros.servicios && filtros.servicios.length > 0) {
      filtros.servicios.forEach(servicio => {
        params = params.append('servicios', servicio);
      });
    }
    return this.http.get<DetalleHabitacion[]>(`${this.apiUrl}/buscar`, { params });
  }
  crearHabitacion(habitacion: any) {
    return this.http.post(`${this.apiUrl}`, habitacion);
  }

  actualizarHabitacion(id: string, habitacion: any) {
    return this.http.put(`${this.apiUrl}/${id}`, habitacion);
  }

  obtenerHabitaciones(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<any>(`${this.apiUrl}`, { params: httpParams });
  }

  buscarHabitaciones(filtros: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.hotelId) params = params.set('hotelId', filtros.hotelId);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.capacidad) params = params.set('capacidad', filtros.capacidad.toString());
    if (filtros.precioMin) params = params.set('precioMin', filtros.precioMin.toString());
    if (filtros.precioMax) params = params.set('precioMax', filtros.precioMax.toString());
    if (filtros.disponible !== undefined) params = params.set('disponible', filtros.disponible ? 'true' : 'false');
    if (filtros.servicios && filtros.servicios.length > 0) {
      filtros.servicios.forEach((servicio: string) => {
        params = params.append('servicios', servicio);
      });
    }
    
    return this.http.get<any>(`${this.apiUrl}/buscar`, { params });
  }
  /**
   * HU07 CA1: Obtener detalle completo de una habitación
   */
  obtenerDetalle(id: string): Observable<DetalleHabitacionResponse> {
    return this.http.get<DetalleHabitacionResponse>(`${this.apiUrl}/${id}/detalle`);
  }

  /**
   * HU07 CA2: Verificar disponibilidad dinámica
   */
  verificarDisponibilidad(id: string, fechaInicio: string, fechaFin: string): Observable<DisponibilidadResponse> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/${id}/disponibilidad`, { params });
  }

  /**
   * HU07 CA3: Calcular tarifa con desglose
   */
  calcularTarifa(id: string, fechaInicio: string, fechaFin: string): Observable<TarifaResponse> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<TarifaResponse>(`${this.apiUrl}/${id}/tarifa`, { params });
  }
}
