import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  /**
   * Obtener todas las habitaciones
   */
  obtenerHabitaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Crear nueva habitación
   */
  crearHabitacion(habitacion: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, habitacion);
  }

  /**
   * Actualizar habitación
   */
  actualizarHabitacion(id: string, habitacion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, habitacion);
  }

  /**
   * Eliminar habitación
   */
  eliminarHabitacion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
