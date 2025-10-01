import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Habitacion {
  _id?: string;
  numero: number;
  servicios: string[];
}

export interface Hotel {
  _id?: string;
  nombre: string;
  ciudad: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  categoria: number;
  activo: boolean;
  habitaciones: Habitacion[];
  ocupacion: number;
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly apiUrl = `${environment.apiUrl}/hoteles`;

  constructor(private http: HttpClient) {}

  getHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  crearHotel(hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotel);
  }

  actualizarEstadoHotel(id: string, activo: boolean): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/estado`, { activo });
  }

  editarHotel(id: string, hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotel);
  }

  eliminarHotel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
