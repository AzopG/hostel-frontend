import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * HU18: SERVICIO PARA PAQUETES CORPORATIVOS
 */

// Interfaces para HU18
export interface OpcionesPaquete {
  success: boolean;
  message: string;
  hotel: {
    _id: string;
    nombre: string;
    ciudad: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  fechas: {
    inicio: string;
    fin: string;
    dias: number;
  };
  componentes: {
    salones: Array<{
      _id: string;
      nombre: string;
      capacidad: number;
      area: number;
      precio: number;
      equipamiento: string[];
      layouts: any[];
    }>;
    habitaciones: Array<{
      tipo: string;
      cantidad: number;
      precio: number;
      capacidad: number;
      ejemplos: Array<{
        _id: string;
        numero: string;
        capacidad: number;
      }>;
    }>;
    catering: Array<{
      tipo: string;
      descripcion: string;
      precioPorPersona: number;
      duracion: string;
    }>;
  };
  descuentoPaquete: number;
  notasImportantes: string[];
}

export interface ValidacionPaquete {
  success: boolean;
  todosDisponibles: boolean;
  validacion: {
    salonDisponible: boolean;
    habitacionesDisponibles: boolean;
    cateringDisponible: boolean;
    fechaValidacion: string;
  };
  detalles: {
    salon: {
      _id: string;
      nombre: string;
      disponible: boolean;
    } | null;
    habitaciones: Array<{
      tipo: string;
      solicitadas: number;
      disponibles: number;
      suficientes: boolean;
      ids: string[];
    }>;
    catering: {
      tipo: string;
      numeroPersonas: number;
      disponible: boolean;
    } | null;
  };
  inconsistencias?: Array<{
    componente: string;
    motivo: string;
    alternativaOfrecida: string;
  }>;
  alternativas?: {
    salones: Array<{
      _id: string;
      nombre: string;
      capacidad: number;
      precio: number;
    }>;
    habitaciones: Array<{
      tipo: string;
      cantidad: number;
      precio: number;
    }>;
    mensaje: string;
  };
  message?: string;
}

export interface SolicitudPaquete {
  hotelId: string;
  salonId: string;
  habitaciones: Array<{
    tipo: string;
    cantidad: number;
  }>;
  catering?: {
    tipo: string;
    numeroPersonas: number;
  };
  fechaInicio: string;
  fechaFin: string;
  horarioEvento?: {
    inicio: string;
    fin: string;
  };
}

export interface ConfirmacionPaquete {
  hotelId: string;
  salonId: string;
  habitaciones: Array<{
    habitacionId: string;
    tipo: string;
  }>;
  catering?: {
    incluido: boolean;
    tipo?: string;
    numeroPersonas?: number;
    precioPorPersona?: number;
    menuSeleccionado?: string;
    restriccionesAlimentarias?: string;
  };
  fechaInicio: string;
  fechaFin: string;
  datosEvento: {
    nombreEvento: string;
    tipoEvento: string;
    horarioInicio: string;
    horarioFin: string;
    responsable: string;
    cargoResponsable?: string;
    telefonoResponsable?: string;
    layoutSeleccionado: string;
    capacidadLayout: number;
    serviciosAdicionales?: Array<{
      nombre: string;
      costo: number;
    }>;
    requiremientosEspeciales?: string;
  };
  datosContacto: {
    nombre: string;
    apellido?: string;
    email: string;
    telefono: string;
    documento?: string;
    pais?: string;
    ciudad?: string;
  };
  politicasAceptadas: boolean;
}

export interface RespuestaPaquete {
  success: boolean;
  message: string;
  paquete: {
    _id: string;
    codigoReserva: string;
    codigoPaquete: string;
    datosHuesped: any;
    datosEvento: any;
    componentes: {
      salon: {
        _id: string;
        nombre: string;
        capacidad: number;
      };
      habitaciones: Array<{
        codigo: string;
        habitacion: string;
        tipo: string;
      }>;
      catering: any;
    };
    hotel: {
      _id: string;
      nombre: string;
      ciudad: string;
      direccion: string;
      telefono: string;
    };
    fechaInicio: string;
    fechaFin: string;
    dias: number;
    desglose: {
      costoSalon: number;
      costoHabitaciones: number;
      costoCatering: number;
      totalSinDescuento: number;
      descuento: number;
      descuentoPorcentaje: number;
      subtotal: number;
      impuestos: number;
      total: number;
    };
    tarifa: {
      precioPorNoche: number;
      subtotal: number;
      impuestos: number;
      total: number;
      moneda: string;
    };
    estado: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaqueteService {
  private apiUrl = `${environment.apiUrl}/paquetes`;

  constructor(private http: HttpClient) { }

  /**
   * HU18 CA1: Iniciar selección de paquete corporativo
   */
  iniciarPaqueteCorporativo(hotelId: string, fechaInicio: string, fechaFin: string): Observable<OpcionesPaquete> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<OpcionesPaquete>(
      `${this.apiUrl}/${hotelId}/iniciar`,
      { fechaInicio, fechaFin },
      { headers }
    );
  }

  /**
   * HU18 CA2 & CA3: Validar disponibilidad conjunta
   */
  validarDisponibilidadPaquete(solicitud: SolicitudPaquete): Observable<ValidacionPaquete> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ValidacionPaquete>(
      `${this.apiUrl}/validar-disponibilidad`,
      solicitud,
      { headers }
    );
  }

  /**
   * HU18 CA4: Confirmar paquete corporativo
   */
  confirmarPaqueteCorporativo(confirmacion: ConfirmacionPaquete): Observable<RespuestaPaquete> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<RespuestaPaquete>(
      `${this.apiUrl}/confirmar`,
      confirmacion,
      { headers }
    );
  }
}
