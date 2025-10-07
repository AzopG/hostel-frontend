import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface PaqueteDisponible {
  _id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  capacidadMinima: number;
  capacidadMaxima: number;
  precios: {
    base: number;
    moneda: string;
    calculoPor: string;
  };
  hotel: {
    _id: string;
    nombre: string;
    ciudad: string;
    direccion: string;
  };
  habitaciones: any[];
  salones: any[];
  servicios: any[];
  catering: any[];
}

export interface ReservaPaquete {
  _id?: string;
  numeroReserva?: string;
  paquete: string;
  hotel?: string;
  nombreEvento: string;
  descripcionEvento?: string;
  tipoEvento: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  numeroAsistentes: number;
  detallesAsistentes?: {
    ejecutivos: number;
    empleados: number;
    invitados: number;
  };
  habitacionesReservadas?: any[];
  salonesReservados?: any[];
  serviciosAdicionales?: any[];
  cateringSeleccionado?: any[];
  metodoPago?: {
    tipo: string;
    anticipoPorcentaje: number;
  };
  datosEmpresa: {
    razonSocial: string;
    nit: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    contactoPrincipal?: {
      nombre: string;
      cargo: string;
      telefono: string;
      email: string;
    };
  };
  requerimientosEspeciales?: {
    alimentarios?: string[];
    accesibilidad?: string[];
    tecnologia?: string[];
    seguridad?: string[];
    otros?: string;
  };
  cronograma?: any[];
  estado?: string;
  estadoPago?: string;
  precios?: {
    subtotalPaquete: number;
    subtotalHabitaciones: number;
    subtotalSalones: number;
    subtotalServicios: number;
    subtotalCatering: number;
    descuentos: number;
    impuestos: number;
    total: number;
  };
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaPaqueteService {
  private apiUrl = `${environment.apiUrl}/reservas-paquetes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Listar paquetes disponibles para reservar
   */
  listarPaquetesDisponibles(filtros?: {
    hotelId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    numeroAsistentes?: number;
  }): Observable<{success: boolean, paquetes: PaqueteDisponible[]}> {
    let params = '';
    if (filtros) {
      const queryParams = new URLSearchParams();
      if (filtros.hotelId) queryParams.append('hotelId', filtros.hotelId);
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin);
      if (filtros.numeroAsistentes) queryParams.append('numeroAsistentes', filtros.numeroAsistentes.toString());
      params = queryParams.toString() ? '?' + queryParams.toString() : '';
    }

    return this.http.get<{success: boolean, paquetes: PaqueteDisponible[]}>
      (`${this.apiUrl}/disponibles${params}`, { headers: this.getHeaders() });
  }

  /**
   * Obtener detalles de un paquete específico
   */
  obtenerDetallePaquete(paqueteId: string): Observable<{success: boolean, paquete: PaqueteDisponible}> {
    return this.http.get<{success: boolean, paquete: PaqueteDisponible}>
      (`${this.apiUrl}/paquete/${paqueteId}`, { headers: this.getHeaders() });
  }

  /**
   * Crear nueva reserva de paquete
   */
  crearReservaPaquete(reservaData: ReservaPaquete): Observable<{success: boolean, message: string, reserva: ReservaPaquete}> {
    return this.http.post<{success: boolean, message: string, reserva: ReservaPaquete}>
      (this.apiUrl, reservaData, { headers: this.getHeaders() });
  }

  /**
   * Listar mis reservas de paquetes
   */
  listarMisReservasPaquetes(filtros?: {
    estado?: string;
    limit?: number;
    offset?: number;
  }): Observable<{
    success: boolean, 
    reservas: ReservaPaquete[], 
    total: number, 
    pagina: number, 
    totalPaginas: number
  }> {
    let params = '';
    if (filtros) {
      const queryParams = new URLSearchParams();
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.limit) queryParams.append('limit', filtros.limit.toString());
      if (filtros.offset) queryParams.append('offset', filtros.offset.toString());
      params = queryParams.toString() ? '?' + queryParams.toString() : '';
    }

    return this.http.get<{
      success: boolean, 
      reservas: ReservaPaquete[], 
      total: number, 
      pagina: number, 
      totalPaginas: number
    }>(`${this.apiUrl}/mis-reservas${params}`, { headers: this.getHeaders() });
  }

  /**
   * Obtener detalle de una reserva específica
   */
  obtenerDetalleReserva(reservaId: string): Observable<{success: boolean, reserva: ReservaPaquete}> {
    return this.http.get<{success: boolean, reserva: ReservaPaquete}>
      (`${this.apiUrl}/${reservaId}`, { headers: this.getHeaders() });
  }

  /**
   * Modificar reserva de paquete
   */
  modificarReservaPaquete(reservaId: string, modificaciones: Partial<ReservaPaquete>): Observable<{success: boolean, message: string, reserva: ReservaPaquete}> {
    return this.http.put<{success: boolean, message: string, reserva: ReservaPaquete}>
      (`${this.apiUrl}/${reservaId}`, modificaciones, { headers: this.getHeaders() });
  }

  /**
   * Cancelar reserva de paquete
   */
  cancelarReservaPaquete(reservaId: string, motivo: string): Observable<{success: boolean, message: string, penalizacion: number}> {
    return this.http.delete<{success: boolean, message: string, penalizacion: number}>
      (`${this.apiUrl}/${reservaId}`, { 
        headers: this.getHeaders(),
        body: { motivo }
      });
  }
}