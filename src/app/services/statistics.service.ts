import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Statistics {
  totalHoteles: number;
  totalReservas: number;
  totalUsuarios: number;
  ingresosTotales: number;
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasCanceladas: number;
  notificaciones: {
    reservas: number;
    eventos: number;
    mensajes: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly API_URL = 'http://localhost:4000/api';
  
  private statisticsSubject = new BehaviorSubject<Statistics>({
    totalHoteles: 0,
    totalReservas: 0,
    totalUsuarios: 0,
    ingresosTotales: 0,
    reservasConfirmadas: 0,
    reservasPendientes: 0,
    reservasCanceladas: 0,
    notificaciones: {
      reservas: 0,
      eventos: 0,
      mensajes: 0,
      total: 0
    }
  });

  public statistics$ = this.statisticsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    // Cargar estadísticas reales desde el backend
    this.getHoteles().subscribe(hoteles => {
      this.getReservas().subscribe(reservas => {
        this.getUsuarios().subscribe(usuarios => {
          const stats: Statistics = {
            totalHoteles: hoteles.length,
            totalReservas: reservas.length,
            totalUsuarios: usuarios.length,
            ingresosTotales: this.calculateTotalIncome(reservas),
            reservasConfirmadas: reservas.filter(r => r.estado === 'confirmada').length,
            reservasPendientes: reservas.filter(r => r.estado === 'pendiente').length,
            reservasCanceladas: reservas.filter(r => r.estado === 'cancelada').length,
            notificaciones: {
              reservas: reservas.filter(r => r.estado === 'pendiente').length,
              eventos: 0, // Se actualizará cuando se implemente eventos
              mensajes: 0, // Se actualizará cuando se implemente mensajes
              total: reservas.filter(r => r.estado === 'pendiente').length
            }
          };
          this.statisticsSubject.next(stats);
        });
      });
    });
  }

  private getHoteles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/hoteles`).pipe(
      catchError(() => of([]))
    );
  }

  private getReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/reservas`).pipe(
      catchError(() => of([]))
    );
  }

  private getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/usuarios`).pipe(
      catchError(() => of([]))
    );
  }

  private calculateTotalIncome(reservas: any[]): number {
    return reservas
      .filter(r => r.estado === 'confirmada')
      .reduce((total, reserva) => total + (reserva.total || 0), 0);
  }

  refreshStatistics(): void {
    this.loadStatistics();
  }

  getCurrentStatistics(): Statistics {
    return this.statisticsSubject.value;
  }
}