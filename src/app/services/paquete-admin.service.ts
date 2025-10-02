import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * SERVICIO PARA GESTIÓN ADMINISTRATIVA DE PAQUETES
 * Para admin de hotel crear y gestionar paquetes corporativos
 */

// Interfaces para gestión de paquetes
export interface PaqueteAdmin {
  _id?: string;
  nombre: string;
  descripcion: string;
  hotel: string | {_id: string, nombre: string, ciudad: string}; // Puede ser ID o objeto poblado
  tipo?: string;
  capacidadMinima?: number;
  capacidadMaxima?: number;
  habitaciones?: Array<{
    tipo: string;
    cantidad: number;
    precio?: number;
    noches?: number;
    precioPorNoche?: number;
    incluidoEnPaquete?: boolean;
    descripcion?: string;
  }>;
  salones?: Array<{
    salonId: string;
    nombre?: string;
    capacidad?: number;
    horas?: number;
    configuracion?: string;
    incluidoEnPaquete?: boolean;
    precioPorHora?: number;
    equipamientoIncluido?: any[];
  }>;
  servicios?: Array<{
    categoria?: string;
    nombre: string;
    descripcion: string;
    precio: number;
    unidad?: string;
    obligatorio: boolean;
    disponible?: boolean;
  }>;
  catering?: Array<{
    tipo: string;
    nombre?: string;
    descripcion: string;
    precioPorPersona: number;
    minPersonas: number;
    maxPersonas: number;
    horariosSugeridos?: string[];
    incluyeServicio?: boolean;
    opciones?: any[];
  }>;
  precios?: {
    base: number;
    moneda?: string;
    calculoPor?: string;
    incluyeIVA?: boolean;
    incluyeServicio?: boolean;
    descuentos?: any[];
  };
  condiciones?: {
    minDias: number;
    maxDias: number;
    anticipacionMinima: number;
    anticipacionMaxima?: number;
    anticipoRequerido?: number;
    formasPago?: string[];
  };
  politicas?: {
    cancelacion?: any;
    modificaciones?: any;
  };
  disponibilidad?: {
    diasSemana?: number[];
    horariosPreferidos?: any[];
    fechasNoDisponibles?: Date[];
    temporadaAlta?: any[];
  };
  estado: string;
  publicado?: boolean;
  fechaPublicacion?: string;
  visibilidad?: {
    publico?: boolean;
    soloEmpresas?: boolean;
    empresasAutorizadas?: string[];
  };
  fechaCreacion?: string;
  ultimaModificacion?: string;
  creadoPor?: any;
  modificadoPor?: any;
  version?: number;
  estadisticas?: {
    vecesReservado?: number;
    ingresosTotales?: number;
    calificacionPromedio?: number;
    ultimaReserva?: Date;
  };
  notasInternas?: string;
  instruccionesEspeciales?: string;
  
  // Campos legacy para compatibilidad
  precioBase?: number;
  descuentoPorcentaje?: number;
  precioMinimo?: number;
  minDias?: number;
  maxDias?: number;
  anticipacionMinima?: number;
  activo?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  terminosEspeciales?: string;
  politicaCancelacion?: string;
}

export interface OpcionesPaquete {
  success: boolean;
  opciones: {
    salones: Array<{
      _id: string;
      nombre: string;
      capacidad: number;
      equipamiento: string[];
      serviciosIncluidos: string[];
      precioPorDia: number;
    }>;
    habitaciones: Array<{
      tipo: string;
      cantidad: number;
      precioPromedio: number;
      capacidadPromedio: number;
      ejemplos: Array<{
        _id: string;
        numero: string;
        capacidad: number;
        precio: number;
        servicios: string[];
      }>;
    }>;
    serviciosEstandar: Array<{
      nombre: string;
      descripcion: string;
      precio: number;
    }>;
    cateringEstandar: Array<{
      tipo: string;
      descripcion: string;
      precioPorPersona: number;
      minPersonas: number;
      maxPersonas: number;
    }>;
  };
}

export interface RespuestaPaqueteAdmin {
  success: boolean;
  message: string;
  paquete?: PaqueteAdmin;
  paquetes?: PaqueteAdmin[];
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaqueteAdminService {
  private apiUrl = `${environment.apiUrl}/admin/paquetes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Listar todos los hoteles de la red (para admin_hotel)
   */
  listarTodosLosHoteles(): Observable<{success: boolean, hoteles: any[], total: number}> {
    return this.http.get<{success: boolean, hoteles: any[], total: number}>(
      `${this.apiUrl}/hoteles`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Listar paquetes de todos los hoteles (para admin_hotel)
   */
  listarTodosPaquetes(activo?: boolean): Observable<RespuestaPaqueteAdmin> {
    let url = `${this.apiUrl}/todos`;
    if (activo !== undefined) {
      url += `?activo=${activo}`;
    }
    
    return this.http.get<RespuestaPaqueteAdmin>(url, { headers: this.getHeaders() });
  }

  /**
   * Obtener opciones para crear un paquete (salones y habitaciones disponibles)
   */
  obtenerOpcionesPaquete(hotelId: string): Observable<OpcionesPaquete> {
    return this.http.get<OpcionesPaquete>(
      `${this.apiUrl}/opciones/${hotelId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Listar todos los paquetes de un hotel
   */
  listarPaquetesHotel(hotelId: string, activo?: boolean): Observable<RespuestaPaqueteAdmin> {
    let url = `${this.apiUrl}/hotel/${hotelId}`;
    if (activo !== undefined) {
      url += `?activo=${activo}`;
    }
    
    return this.http.get<RespuestaPaqueteAdmin>(url, { headers: this.getHeaders() });
  }

  /**
   * Obtener detalles de un paquete específico
   */
  obtenerPaquete(paqueteId: string): Observable<RespuestaPaqueteAdmin> {
    return this.http.get<RespuestaPaqueteAdmin>(
      `${this.apiUrl}/${paqueteId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crear nuevo paquete corporativo
   */
  crearPaquete(paquete: PaqueteAdmin): Observable<RespuestaPaqueteAdmin> {
    return this.http.post<RespuestaPaqueteAdmin>(
      this.apiUrl,
      paquete,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar paquete existente
   */
  actualizarPaquete(paqueteId: string, datos: Partial<PaqueteAdmin>): Observable<RespuestaPaqueteAdmin> {
    return this.http.put<RespuestaPaqueteAdmin>(
      `${this.apiUrl}/${paqueteId}`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cambiar estado del paquete (activar/desactivar)
   */
  cambiarEstadoPaquete(paqueteId: string, activo: boolean): Observable<RespuestaPaqueteAdmin> {
    return this.http.patch<RespuestaPaqueteAdmin>(
      `${this.apiUrl}/${paqueteId}/estado`,
      { activo },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Eliminar paquete (desactivar o eliminar definitivamente)
   */
  eliminarPaquete(paqueteId: string, eliminarDefinitivamente: boolean = false): Observable<RespuestaPaqueteAdmin> {
    let url = `${this.apiUrl}/${paqueteId}`;
    if (eliminarDefinitivamente) {
      url += '?eliminarDefinitivamente=true';
    }
    
    return this.http.delete<RespuestaPaqueteAdmin>(url, { headers: this.getHeaders() });
  }
}