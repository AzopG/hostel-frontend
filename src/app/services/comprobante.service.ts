import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// HU11: Interfaces
export interface ComprobanteReserva {
  reserva: {
    codigo: string;
    estado: string;
    fechaCreacion: string;
  };
  hotel: {
    nombre: string;
    ciudad: string;
    departamento: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  habitacion: {
    numero: string;
    tipo: string;
    capacidad: number;
    servicios: string[];
  };
  huesped: {
    nombre: string;
    email: string;
    telefono: string;
    documento: string;
  };
  fechas: {
    inicio: string;
    fin: string;
    noches: number;
  };
  tarifa: {
    precioPorNoche: number;
    subtotal: number;
    impuestos: number;
    total: number;
    moneda: string;
  };
  huespedes: number;
  traducciones?: any;
}

export interface ComprobanteResponse {
  success: boolean;
  comprobante: ComprobanteReserva;
  idioma: string;
}

export interface HistorialComprobanteItem {
  codigoReserva: string;
  hotel: string;
  ciudad: string;
  habitacion: string;
  fechaInicio: string;
  fechaFin: string;
  total: number;
  moneda: string;
  estado: string;
  fechaCreacion: string;
  urlVisualizacion: string;
  urlDescarga: string;
}

export interface HistorialComprobantesResponse {
  success: boolean;
  comprobantes: HistorialComprobanteItem[];
  total: number;
  traducciones?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private readonly apiUrl = `${environment.apiUrl}/comprobantes`;

  constructor(private http: HttpClient) {}

  /**
   * HU11 CA1: Obtener comprobante para visualización
   */
  obtenerComprobante(codigoReserva: string, idioma: string = 'es'): Observable<ComprobanteResponse> {
    return this.http.get<ComprobanteResponse>(`${this.apiUrl}/${codigoReserva}?idioma=${idioma}`);
  }

  /**
   * HU11 CA2: Descargar comprobante en PDF
   */
  descargarComprobantePDF(codigoReserva: string, idioma: string = 'es'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${codigoReserva}/pdf?idioma=${idioma}`, {
      responseType: 'blob'
    });
  }

  /**
   * HU11 CA4: Obtener historial de comprobantes
   */
  obtenerHistorialComprobantes(usuarioId: string, email?: string, idioma: string = 'es'): Observable<HistorialComprobantesResponse> {
    const params: any = { idioma };
    if (email) params.email = email;
    
    return this.http.get<HistorialComprobantesResponse>(
      `${this.apiUrl}/usuario/${usuarioId}/historial`,
      { params }
    );
  }

  /**
   * Función auxiliar para trigger de descarga
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
