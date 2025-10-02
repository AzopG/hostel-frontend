import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// Interfaz para Hotel
export interface Hotel {
  _id?: string;
  nombre: string;
  descripcion: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
  categoria: number;
  servicios: string[];
  habitaciones: any[];
  salones: any[];
  fotos: string[];
  activo: boolean;
  ocupacion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = 'http://localhost:5000/api/admin/hoteles';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Listar todos los hoteles
   */
  listarHoteles(): Observable<{success: boolean, hoteles: any[]}> {
    return this.http.get<{success: boolean, hoteles: any[]}>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

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