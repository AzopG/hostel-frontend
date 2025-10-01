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
  correo: string;
  confirmado?: boolean;
  fechaRegistro?: Date | string;
  fechaModificacion?: Date | string;
  notas?: string;
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
  private apiUrl = `${environment.apiUrl}/asistentes`;

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
  obtenerAsistentes(reservaId: string): Observable<RespuestaListaAsistentes> {
    return this.http.get<RespuestaListaAsistentes>(
      `${this.apiUrl}/${reservaId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * HU19 CA1: Agregar un nuevo asistente
   */
  agregarAsistente(reservaId: string, asistente: { nombre: string, correo: string, notas?: string }): Observable<RespuestaAsistente> {
    return this.http.post<RespuestaAsistente>(
      `${this.apiUrl}/${reservaId}`,
      asistente,
      { headers: this.getHeaders() }
    );
  }

  /**
   * HU19 CA2: Editar datos de un asistente existente
   */
  editarAsistente(
    reservaId: string, 
    asistenteId: string, 
    datos: { nombre?: string, correo?: string, confirmado?: boolean, notas?: string }
  ): Observable<RespuestaAsistente> {
    return this.http.put<RespuestaAsistente>(
      `${this.apiUrl}/${reservaId}/${asistenteId}`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  /**
   * HU19 CA3: Eliminar un asistente de la lista
   */
  eliminarAsistente(reservaId: string, asistenteId: string): Observable<RespuestaAsistente> {
    return this.http.delete<RespuestaAsistente>(
      `${this.apiUrl}/${reservaId}/${asistenteId}`,
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
