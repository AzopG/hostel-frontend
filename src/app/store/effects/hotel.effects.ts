import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import * as HotelActions from '../actions/hotel.actions';

@Injectable()
export class HotelEffects {
  private actions$ = inject(Actions);

  // Simulated API service - in real app, inject actual HTTP service
  private simulateApiCall = <T>(data: T, delay = 1000): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  };

  loadHoteles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.loadHoteles),
      switchMap(() =>
        this.simulateApiCall([
          {
            id: '1',
            nombre: 'Hotel Paradise',
            descripcion: 'Un hotel de lujo frente al mar',
            ubicacion: 'Cancún, México',
            precioMinimo: 150,
            calificacion: 4.5,
            servicios: ['WiFi', 'Piscina', 'Spa', 'Restaurante'],
            imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
          },
          {
            id: '2',
            nombre: 'Mountain Resort',
            descripcion: 'Escapada perfecta en las montañas',
            ubicacion: 'Aspen, Colorado',
            precioMinimo: 200,
            calificacion: 4.8,
            servicios: ['WiFi', 'Esquí', 'Spa', 'Bar'],
            imagen: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'
          },
          {
            id: '3',
            nombre: 'City Center Hotel',
            descripcion: 'En el corazón de la ciudad',
            ubicacion: 'Nueva York, NY',
            precioMinimo: 120,
            calificacion: 4.2,
            servicios: ['WiFi', 'Gimnasio', 'Centro de negocios'],
            imagen: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791'
          }
        ]).then(
          hoteles => HotelActions.loadHotelesSuccess({ hoteles }),
          error => HotelActions.loadHotelesFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadHotelesFailure({ error: error.message })))
    )
  );

  loadHabitaciones$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.loadHabitaciones),
      switchMap(({ hotelId }) =>
        this.simulateApiCall([
          {
            id: '1',
            hotelId,
            nombre: 'Suite Presidencial',
            tipo: 'suite',
            precio: 300,
            capacidad: 4,
            servicios: ['Jacuzzi', 'Vista al mar', 'Minibar'],
            disponible: true,
            imagenes: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304']
          },
          {
            id: '2',
            hotelId,
            nombre: 'Habitación Doble',
            tipo: 'doble',
            precio: 150,
            capacidad: 2,
            servicios: ['WiFi', 'TV', 'Aire acondicionado'],
            disponible: true,
            imagenes: ['https://images.unsplash.com/photo-1631049421450-348171c6d1b5']
          },
          {
            id: '3',
            hotelId,
            nombre: 'Habitación Individual',
            tipo: 'individual',
            precio: 100,
            capacidad: 1,
            servicios: ['WiFi', 'TV'],
            disponible: false,
            imagenes: ['https://images.unsplash.com/photo-1631049552240-16c5f2c1f2a6']
          }
        ]).then(
          habitaciones => HotelActions.loadHabitacionesSuccess({ habitaciones }),
          error => HotelActions.loadHabitacionesFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadHabitacionesFailure({ error: error.message })))
    )
  );

  loadReservas$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.loadReservas),
      switchMap(() =>
        this.simulateApiCall([
          {
            id: '1',
            hotelId: '1',
            habitacionId: '1',
            userId: 'user-123',
            fechaInicio: '2024-12-20',
            fechaFin: '2024-12-25',
            estado: 'confirmada',
            precio: 1500,
            huespedes: 2,
            serviciosAdicionales: ['Desayuno', 'Masaje']
          },
          {
            id: '2',
            hotelId: '2',
            habitacionId: '2',
            userId: 'user-123',
            fechaInicio: '2024-11-15',
            fechaFin: '2024-11-18',
            estado: 'completada',
            precio: 600,
            huespedes: 1,
            serviciosAdicionales: ['Desayuno']
          }
        ]).then(
          reservas => HotelActions.loadReservasSuccess({ reservas }),
          error => HotelActions.loadReservasFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadReservasFailure({ error: error.message })))
    )
  );

  createReserva$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.createReserva),
      switchMap(({ reserva }) =>
        this.simulateApiCall({
          ...reserva,
          id: Date.now().toString(),
          estado: 'confirmada',
          fechaCreacion: new Date().toISOString()
        }).then(
          newReserva => HotelActions.createReservaSuccess({ reserva: newReserva }),
          error => HotelActions.createReservaFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.createReservaFailure({ error: error.message })))
    )
  );

  updateReserva$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.updateReserva),
      switchMap(({ id, changes }) =>
        this.simulateApiCall({
          id,
          ...changes,
          fechaActualizacion: new Date().toISOString()
        }).then(
          reserva => HotelActions.updateReservaSuccess({ reserva }),
          error => HotelActions.loadReservasFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadReservasFailure({ error: error.message })))
    )
  );

  deleteReserva$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.deleteReserva),
      switchMap(({ id }) =>
        this.simulateApiCall({ success: true }).then(
          () => HotelActions.deleteReservaSuccess({ id }),
          error => HotelActions.loadReservasFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadReservasFailure({ error: error.message })))
    )
  );

  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.loadUserProfile),
      switchMap(() =>
        this.simulateApiCall({
          id: 'user-123',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          telefono: '+1234567890',
          fechaRegistro: '2024-01-15',
          tipoUsuario: 'cliente',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
        }).then(
          user => HotelActions.loadUserProfileSuccess({ user }),
          error => HotelActions.loadUserProfileFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadUserProfileFailure({ error: error.message })))
    )
  );

  loadDashboardData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.loadDashboardData),
      switchMap(() =>
        this.simulateApiCall({
          reservasPorMes: [
            { mes: 'Enero', reservas: 45, ingresos: 67500 },
            { mes: 'Febrero', reservas: 52, ingresos: 78000 },
            { mes: 'Marzo', reservas: 48, ingresos: 72000 },
            { mes: 'Abril', reservas: 61, ingresos: 91500 },
            { mes: 'Mayo', reservas: 55, ingresos: 82500 },
            { mes: 'Junio', reservas: 68, ingresos: 102000 }
          ],
          ocupacionPorHotel: [
            { hotel: 'Hotel Paradise', ocupacion: 85 },
            { hotel: 'Mountain Resort', ocupacion: 92 },
            { hotel: 'City Center Hotel', ocupacion: 78 }
          ],
          ingresosPorTipo: [
            { tipo: 'Suite', ingresos: 180000, porcentaje: 45 },
            { tipo: 'Doble', ingresos: 120000, porcentaje: 30 },
            { tipo: 'Individual', ingresos: 100000, porcentaje: 25 }
          ],
          estadisticasGenerales: {
            totalReservas: 329,
            ingresosTotales: 400000,
            ocupacionPromedio: 85,
            calificacionPromedio: 4.5
          }
        }).then(
          data => HotelActions.loadDashboardDataSuccess({ data }),
          error => HotelActions.loadDashboardDataFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.loadDashboardDataFailure({ error: error.message })))
    )
  );

  searchHoteles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.searchHoteles),
      switchMap(({ query, filters }) =>
        this.simulateApiCall({
          results: [
            {
              id: '1',
              nombre: 'Hotel Paradise',
              descripcion: 'Un hotel de lujo frente al mar',
              ubicacion: 'Cancún, México',
              precioMinimo: 150,
              calificacion: 4.5
            }
          ].filter(hotel => 
            hotel.nombre.toLowerCase().includes(query.toLowerCase()) ||
            hotel.ubicacion.toLowerCase().includes(query.toLowerCase())
          ),
          total: 1
        }).then(
          ({ results, total }) => HotelActions.searchHotelesSuccess({ results, total }),
          error => HotelActions.searchHotelesFailure({ error: error.message })
        )
      ),
      catchError(error => of(HotelActions.searchHotelesFailure({ error: error.message })))
    )
  );

  // Track analytics events
  trackEvent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.trackEvent),
      tap(({ event, properties }) => {
        console.log('Analytics Event:', event, properties);
        // En una app real, enviarías esto a un servicio de analytics
      })
    ), { dispatch: false }
  );

  // Show notifications after successful actions
  showSuccessNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        HotelActions.createReservaSuccess,
        HotelActions.updateReservaSuccess,
        HotelActions.deleteReservaSuccess
      ),
      map(action => {
        let message = '';
        switch (action.type) {
          case '[Reserva] Create Reserva Success':
            message = 'Reserva creada exitosamente';
            break;
          case '[Reserva] Update Reserva Success':
            message = 'Reserva actualizada exitosamente';
            break;
          case '[Reserva] Delete Reserva Success':
            message = 'Reserva eliminada exitosamente';
            break;
        }
        return HotelActions.showNotification({ 
          message, 
          notificationType: 'success' 
        });
      })
    )
  );

  // Auto-hide notifications
  autoHideNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HotelActions.showNotification),
      switchMap(() =>
        of(HotelActions.hideNotification()).pipe(
          // Hide notification after 5 seconds
          map(() => HotelActions.hideNotification())
        )
      )
    )
  );
}