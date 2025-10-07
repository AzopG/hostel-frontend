import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaquetePublicoService {
  private apiUrl = `${environment.apiUrl}/paquetes`;

  constructor(private http: HttpClient) {}

  /**
   * Listar paquetes disponibles para empresas (sin autenticación)
   */
  listarPaquetesDisponibles(): Observable<{success: boolean, paquetes: any[]}> {
    const url = `${this.apiUrl}/disponibles`;
    console.log('🌐 Realizando petición GET a:', url);
    return this.http.get<{success: boolean, paquetes: any[]}>(url);
  }

  /**
   * Obtener detalles de un paquete específico
   */
  obtenerPaqueteDisponible(id: string): Observable<{success: boolean, paquete: any}> {
    return this.http.get<{success: boolean, paquete: any}>(`${this.apiUrl}/disponibles/${id}`);
  }
}