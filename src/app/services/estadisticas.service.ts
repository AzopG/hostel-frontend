import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EstadisticasGenerales {
  totalHoteles?: number;
  totalReservas?: number;
  totalClientes?: number;
  totalHabitaciones?: number;
  ingresosTotales?: number;
  misReservas?: number;
  reservasActivas?: number;
  totalGastado?: number;
  ocupacionPromedio?: number;
  ocupacionActual?: number;
  nombreHotel?: string;
  reservasPorMes?: any[];
  proximasReservas?: any[];
  habitacionesPorHotel?: { [hotel: string]: number };
  salasPorHotel?: { [hotel: string]: number };
  paquetesPorHotel?: { [hotel: string]: number };
}

export interface EstadisticasResponse {
  success: boolean;
  stats: EstadisticasGenerales;
  timestamp: Date;
}

export interface ReservasEstadisticas {
  success: boolean;
  reservas: any[];
  estadisticas: any[];
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener estadísticas generales según el rol del usuario
   */
  obtenerEstadisticasGenerales(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(`${this.apiUrl}/generales`);
  }

  /**
   * Obtener estadísticas de reservas por rango de fechas
   */
  obtenerEstadisticasReservas(fechaInicio?: string, fechaFin?: string): Observable<ReservasEstadisticas> {
    let url = `${this.apiUrl}/reservas`;
    const params: string[] = [];
    
    if (fechaInicio) {
      params.push(`fechaInicio=${fechaInicio}`);
    }
    if (fechaFin) {
      params.push(`fechaFin=${fechaFin}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<ReservasEstadisticas>(url);
  }

  /**
   * Obtener reporte de ocupación por rango de fechas
   */
  obtenerReporteOcupacion(fechaInicio: string, fechaFin: string): Observable<any> {
    const url = `${this.apiUrl}/ocupacion?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get<any>(url);
  }

  /**
   * Obtener reporte de eventos y asistentes en salones
   */
  obtenerReporteEventos(fechaInicio: string, fechaFin: string): Observable<any> {
    const url = `${this.apiUrl}/eventos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get<any>(url);
  }

  /**
   * Obtener KPIs de desempeño por sede
   */
  obtenerKPIsSedes(fechaInicio: string, fechaFin: string): Observable<any> {
    const url = `${this.apiUrl}/kpis-sedes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get<any>(url);
  }
}