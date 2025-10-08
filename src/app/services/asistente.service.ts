import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * HU19: SERVICIO PARA GESTIÓN DE ASISTENTES
 */

// Interfaces
export interface Asistente {
  _id?: string;
  nombre: string;
  email: string;
  descripcion?: string;
  confirmado?: boolean;
  fechaRegistro?: Date | string;
  fechaModificacion?: Date | string;
}

export interface EstadisticasAsistentes {
  totalAsistentes: number;
  confirmados: number;
  pendientes: number;
  capacidadMaxima: number | null;
  espaciosDisponibles: number | null;
  porcentajeOcupacion: number | null;
  bloqueado: boolean; // CA4: Si se alcanzó el límite
}

export interface RespuestaListaAsistentes {
  success: boolean;
  reserva: {
    _id: string;
    codigoReserva: string;
    nombreEvento: string;
    estado: string;
  };
  asistentes: Asistente[];
  estadisticas: EstadisticasAsistentes;
}

export interface RespuestaAsistente {
  success: boolean;
  message: string;
  asistente?: Asistente;
  estadisticas?: {
    totalAsistentes: number;
    capacidadMaxima?: number;
    espaciosDisponibles?: number;
  };
  asistenteEliminado?: {
    nombre: string;
    correo: string;
  };
  capacidadMaxima?: number;
  cantidadActual?: number;
  bloqueado?: boolean; // CA4
}

export interface RespuestaImportacion {
  success: boolean;
  message: string;
  agregados: number;
  errores: number;
  detalleErrores: Array<{
    indice: number;
    error: string;
    datos: any;
  }>;
  estadisticas: {
    totalAsistentes: number;
    capacidadMaxima: number | null;
    espaciosDisponibles: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AsistenteService {
  private apiUrl = `${environment.apiUrl}/reservas-paquetes`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener lista completa de asistentes de una reserva
   */
  obtenerAsistentes(numeroReserva: string): Observable<RespuestaListaAsistentes> {
    return this.http.get<RespuestaListaAsistentes>(
      `${this.apiUrl}/codigo/${numeroReserva}/asistentes`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * HU19 CA1: Agregar un nuevo asistente
   */
  agregarAsistente(numeroReserva: string, asistente: { nombre: string, email: string, descripcion?: string }): Observable<RespuestaAsistente> {
    return this.http.post<RespuestaAsistente>(
      `${this.apiUrl}/codigo/${numeroReserva}/asistentes`,
      asistente,
      { headers: this.getHeaders() }
    );
  }

  /**
   * HU19 CA2: Editar datos de un asistente existente
   */
  editarAsistente(
    numeroReserva: string, 
    asistenteId: string, 
    datos: { nombre?: string, email?: string, descripcion?: string, confirmado?: boolean }
  ): Observable<RespuestaAsistente> {
    return this.http.put<RespuestaAsistente>(
      `${this.apiUrl}/codigo/${numeroReserva}/asistentes/${asistenteId}`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  /**
   * HU19 CA3: Eliminar un asistente de la lista
   */
  eliminarAsistente(numeroReserva: string, asistenteId: string): Observable<RespuestaAsistente> {
    return this.http.delete<RespuestaAsistente>(
      `${this.apiUrl}/codigo/${numeroReserva}/asistentes/${asistenteId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Confirmar asistencia
   */
  confirmarAsistencia(reservaId: string, asistenteId: string): Observable<RespuestaAsistente> {
    return this.http.patch<RespuestaAsistente>(
      `${this.apiUrl}/${reservaId}/${asistenteId}/confirmar`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Importar múltiples asistentes
   */
  importarAsistentes(
    reservaId: string, 
    asistentes: Array<{ nombre: string, correo: string, notas?: string }>
  ): Observable<RespuestaImportacion> {
    return this.http.post<RespuestaImportacion>(
      `${this.apiUrl}/${reservaId}/importar`,
      { asistentes },
      { headers: this.getHeaders() }
    );
  }
}
