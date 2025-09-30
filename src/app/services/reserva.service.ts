import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para HU08
export interface DatosHuesped {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  documento?: string;
  pais?: string;
  ciudad?: string;
}

export interface TarifaReserva {
  precioPorNoche: number;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string;
}

export interface CrearReservaRequest {
  usuario?: string; // Opcional si no está logueado
  hotel: string;
  habitacion: string;
  fechaInicio: string;
  fechaFin: string;
  huespedes: number;
  datosHuesped: DatosHuesped;
  tarifa: TarifaReserva;
  politicasAceptadas: boolean;
  notas?: string;
}

export interface ReservaCreada {
  _id: string;
  codigoReserva: string;
  datosHuesped: DatosHuesped;
  habitacion: {
    _id: string;
    numero: string;
    tipo: string;
  };
  hotel: {
    _id: string;
    nombre: string;
    ciudad: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  fechaInicio: string;
  fechaFin: string;
  huespedes: number;
  noches: number;
  tarifa: TarifaReserva;
  estado: string;
  createdAt: string;
}

export interface CrearReservaResponse {
  success: boolean;
  message: string;
  reserva?: ReservaCreada;
  conflicto?: boolean; // CA3: Indica conflicto de disponibilidad
  sugerencia?: string;
}

export interface ObtenerReservaResponse {
  success: boolean;
  reserva: ReservaCreada;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  /**
   * HU08 CA1 + CA2: Crear una nueva reserva
   */
  crearReserva(datos: CrearReservaRequest): Observable<CrearReservaResponse> {
    return this.http.post<CrearReservaResponse>(this.apiUrl, datos);
  }

  /**
   * HU08: Obtener reserva por código
   */
  obtenerReservaPorCodigo(codigo: string): Observable<ObtenerReservaResponse> {
    return this.http.get<ObtenerReservaResponse>(`${this.apiUrl}/codigo/${codigo}`);
  }

  /**
   * Cancelar reserva
   */
  cancelarReserva(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancelar/${id}`, {});
  }
}
