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
    departamento?: string;
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
  historialModificaciones?: ModificacionReserva[];
}

// HU09: Interfaces para modificación de fechas
export interface ModificacionReserva {
  fechaModificacion: string;
  fechaInicioAnterior: string;
  fechaFinAnterior: string;
  fechaInicioNueva: string;
  fechaFinNueva: string;
  tarifaAnterior: number;
  tarifaNueva: number;
  motivoRechazo?: string;
}

export interface VerificarModificacionResponse {
  success: boolean;
  puedeModificar: boolean;
  motivo?: string;
  mensaje?: string;
  horasRestantes?: number;
  horasHastaCheckIn?: number;
  fechaLimite?: string;
}

export interface ModificarFechasRequest {
  fechaInicioNueva: string;
  fechaFinNueva: string;
}

export interface ModificarFechasResponse {
  success: boolean;
  message: string;
  reserva?: ReservaCreada;
  conflicto?: boolean;
  disponible?: boolean;
  puedeModificar?: boolean;
  motivo?: string;
  horasRestantes?: number;
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

export interface ObtenerReservasResponse {
  success: boolean;
  reservas: ReservaCreada[];
  total?: number;
}

export interface CancelarReservaResponse {
  success: boolean;
  message: string;
  reserva?: any;
  cancelacion?: {
    fechaCancelacion: string;
    dentroVentanaGratuita: boolean;
    porcentajePenalizacion: number;
    montoPenalizacion: number;
    montoReembolso: number;
    horasAntesCancelacion: number;
    notificacionEnviada: boolean;
  };
  estadoActual?: string;
  fechaCancelacion?: string;
  yaCancelada?: boolean;
}

// HU10: Interfaces para cancelación con penalización
export interface VerificarCancelacionResponse {
  success: boolean;
  puedeCancelar: boolean;
  motivo?: string;
  mensaje?: string;
  estadoActual?: string;
  fechaCancelacion?: string;
  reserva?: {
    _id: string;
    codigoReserva: string;
    hotel: string;
    habitacion: string;
    fechaInicio: string;
    fechaFin: string;
    total: number;
    estado: string;
  };
  politicaCancelacion?: {
    dentroVentanaGratuita: boolean;
    horasHastaCheckIn: number;
    diasHastaCheckIn: number;
    porcentajePenalizacion: number;
    montoPenalizacion: number;
    montoReembolso: number;
    mensaje: string;
    detalles: {
      ventanaGratuita: string;
      penalizacion50: string;
      penalizacion100: string;
    };
  };
}

export interface CancelarReservaRequest {
  motivo: string;
  confirmacionPenalizacion?: boolean; // CA2: Confirmar que acepta penalización
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
   * Obtener todas las reservas (en producción: filtrar por usuario autenticado)
   */
  obtenerTodasReservas(): Observable<ObtenerReservasResponse> {
    return this.http.get<ObtenerReservasResponse>(this.apiUrl);
  }

  /**
   * Obtener reserva por ID
   */
  obtenerReservaPorId(id: string): Observable<ObtenerReservaResponse> {
    return this.http.get<ObtenerReservaResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * HU10 CA2: Verificar políticas de cancelación antes de cancelar
   */
  verificarPoliticasCancelacion(id: string): Observable<VerificarCancelacionResponse> {
    return this.http.get<VerificarCancelacionResponse>(`${this.apiUrl}/cancelar/${id}/verificar`);
  }

  /**
   * HU10: Cancelar reserva con cálculo de penalización (CA1 + CA2 + CA3 + CA4)
   */
  cancelarReserva(id: string, datos: CancelarReservaRequest): Observable<CancelarReservaResponse> {
    return this.http.put<CancelarReservaResponse>(`${this.apiUrl}/cancelar/${id}`, datos);
  }

  /**
   * HU09 CA1 + CA4: Verificar si una reserva puede ser modificada
   */
  verificarPuedeModificar(id: string): Observable<VerificarModificacionResponse> {
    return this.http.get<VerificarModificacionResponse>(`${this.apiUrl}/${id}/puede-modificar`);
  }

  /**
   * HU09 CA1 + CA2 + CA3: Modificar fechas de una reserva
   */
  modificarFechasReserva(id: string, datos: ModificarFechasRequest): Observable<ModificarFechasResponse> {
    return this.http.put<ModificarFechasResponse>(`${this.apiUrl}/${id}/modificar-fechas`, datos);
  }
}
