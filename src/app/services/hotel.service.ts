import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Habitacion {
  _id?: string;
  numero: number;
  servicios: string[];
}

export interface Salon {
  _id?: string;
  nombre: string;
  capacidad: number;
  servicios?: string[];
}

export interface Hotel {
  _id?: string;
  nombre: string;
  descripcion?: string;
  ciudad: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  categoria: number;
  servicios?: string[];
  habitaciones: Habitacion[];
  salones?: Salon[];
  fotos?: string[];
  activo: boolean;
  ocupacion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly apiUrl = `${environment.apiUrl}/admin/hoteles`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  listarHoteles(): Observable<{ success: boolean; hoteles: Hotel[] }> {
    return this.http.get<{ success: boolean; hoteles: Hotel[] }>(this.apiUrl, { headers: this.getHeaders() });
  }

  getHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearHotel(hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotel, { headers: this.getHeaders() });
  }

  actualizarEstadoHotel(id: string, activo: boolean): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/estado`, { activo }, { headers: this.getHeaders() });
  }

  editarHotel(id: string, hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotel, { headers: this.getHeaders() });
  }

  eliminarHotel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
