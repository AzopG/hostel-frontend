import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// HU16: Layout de salón
export interface Layout {
  nombre: string;
  capacidad: number;
  descripcion?: string;
  imagen?: string;
}

export interface Salon {
  _id: string;
  hotel: {
    _id: string;
    nombre: string;
    ciudad?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  nombre: string;
  capacidad: number;
  equipamiento: string[];
  disponible: boolean;
  descripcion?: string;
  precioPorDia: number;
  serviciosIncluidos?: string[];
  fotos?: string[];
  layouts?: Layout[]; // HU16 - CA3
  dias?: number;
  precioTotal?: number;
  disponibleParaFechas?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusquedaSalonesParams {
  hotelId: string;
  capacidadMinima: number;
  fechaInicio: string; // ISO format
  fechaFin: string; // ISO format
  equipamiento?: string[];
  ordenarPor?: 'capacidad_asc' | 'capacidad_desc' | 'precio_asc' | 'precio_desc' | 'nombre';
}

export interface BusquedaSalonesResponse {
  success: boolean;
  message: string;
  salones: Salon[];
  total: number;
  filtrosAplicados: any;
  sugerencias?: {
    mensaje: string;
    recomendaciones: string[];
  };
}

export interface DisponibilidadResponse {
  success: boolean;
  disponible: boolean;
  mensaje: string;
  conflictos?: Array<{
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
  }>;
  precioInfo: {
    dias: number;
    precioPorDia: number;
    precioTotal: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private apiUrl = `${environment.apiUrl}/salones`;

  constructor(private http: HttpClient) {}

  /**
   * HU14 - CA1, CA2, CA4: Buscar salones disponibles
   */
  buscarSalonesDisponibles(params: BusquedaSalonesParams): Observable<BusquedaSalonesResponse> {
    let httpParams = new HttpParams()
      .set('hotelId', params.hotelId)
      .set('capacidadMinima', params.capacidadMinima.toString())
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin);

    if (params.ordenarPor) {
      httpParams = httpParams.set('ordenarPor', params.ordenarPor);
    }

    if (params.equipamiento && params.equipamiento.length > 0) {
      params.equipamiento.forEach(equip => {
        httpParams = httpParams.append('equipamiento', equip);
      });
    }

    return this.http.get<BusquedaSalonesResponse>(`${this.apiUrl}/buscar`, { params: httpParams });
  }

  /**
   * HU14 - CA3: Verificar disponibilidad de un salón específico
   * Se usa cuando el usuario cambia las fechas
   */
  verificarDisponibilidad(salonId: string, fechaInicio: string, fechaFin: string): Observable<DisponibilidadResponse> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<DisponibilidadResponse>(`${this.apiUrl}/${salonId}/disponibilidad`, { params });
  }

  /**
   * HU16 - CA1: Obtener detalle completo de un salón
   * Incluye capacidad, equipamiento, layouts, fotos, tarifas
   */
  obtenerDetalleSalon(salonId: string): Observable<{ success: boolean; salon: Salon }> {
    return this.http.get<{ success: boolean; salon: Salon }>(`${this.apiUrl}/${salonId}`);
  }

  /**
   * HU16 - CA2: Verificar disponibilidad detallada con estado (libre/parcial/bloqueado)
   */
  verificarDisponibilidadDetallada(salonId: string, fechaInicio: string, fechaFin: string): Observable<{
    success: boolean;
    disponibilidad: {
      estado: 'libre' | 'parcial' | 'bloqueado';
      mensaje: string;
      fechaInicio: Date;
      fechaFin: Date;
      reservasExistentes: number;
      detalleReservas: Array<{
        fechaInicio: Date;
        fechaFin: Date;
        estado: string;
      }>;
    };
  }> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.apiUrl}/${salonId}/disponibilidad-detallada`, { params });
  }

  /**
   * Listar salones de un hotel
   */
  listarSalonesHotel(hotelId: string): Observable<{ success: boolean; salones: Salon[]; total: number }> {
    return this.http.get<{ success: boolean; salones: Salon[]; total: number }>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  /**
   * Crear un nuevo salón (solo admin)
   */
  crearSalon(salon: Partial<Salon>): Observable<{ success: boolean; message: string; salon: Salon }> {
    return this.http.post<{ success: boolean; message: string; salon: Salon }>(this.apiUrl, salon);
  }

  /**
   * Actualizar salón (solo admin)
   */
  actualizarSalon(salonId: string, datos: Partial<Salon>): Observable<{ success: boolean; message: string; salon: Salon }> {
    return this.http.put<{ success: boolean; message: string; salon: Salon }>(`${this.apiUrl}/${salonId}`, datos);
  }
}
