import { createAction, props } from '@ngrx/store';

// Hotel Actions
export const loadHoteles = createAction('[Hotel] Load Hoteles');
export const loadHotelesSuccess = createAction(
  '[Hotel] Load Hoteles Success',
  props<{ hoteles: any[] }>()
);
export const loadHotelesFailure = createAction(
  '[Hotel] Load Hoteles Failure',
  props<{ error: string }>()
);

export const selectHotel = createAction(
  '[Hotel] Select Hotel',
  props<{ hotelId: string }>()
);

// Habitación Actions
export const loadHabitaciones = createAction(
  '[Habitacion] Load Habitaciones',
  props<{ hotelId: string }>()
);
export const loadHabitacionesSuccess = createAction(
  '[Habitacion] Load Habitaciones Success',
  props<{ habitaciones: any[] }>()
);
export const loadHabitacionesFailure = createAction(
  '[Habitacion] Load Habitaciones Failure',
  props<{ error: string }>()
);

export const updateDisponibilidad = createAction(
  '[Habitacion] Update Disponibilidad',
  props<{ habitacionId: string; fechas: string[]; disponible: boolean }>()
);

// Reserva Actions
export const loadReservas = createAction('[Reserva] Load Reservas');
export const loadReservasSuccess = createAction(
  '[Reserva] Load Reservas Success',
  props<{ reservas: any[] }>()
);
export const loadReservasFailure = createAction(
  '[Reserva] Load Reservas Failure',
  props<{ error: string }>()
);

export const createReserva = createAction(
  '[Reserva] Create Reserva',
  props<{ reserva: any }>()
);
export const createReservaSuccess = createAction(
  '[Reserva] Create Reserva Success',
  props<{ reserva: any }>()
);
export const createReservaFailure = createAction(
  '[Reserva] Create Reserva Failure',
  props<{ error: string }>()
);

export const updateReserva = createAction(
  '[Reserva] Update Reserva',
  props<{ id: string; changes: any }>()
);
export const updateReservaSuccess = createAction(
  '[Reserva] Update Reserva Success',
  props<{ reserva: any }>()
);

export const deleteReserva = createAction(
  '[Reserva] Delete Reserva',
  props<{ id: string }>()
);
export const deleteReservaSuccess = createAction(
  '[Reserva] Delete Reserva Success',
  props<{ id: string }>()
);

// User Actions
export const loadUserProfile = createAction('[User] Load Profile');
export const loadUserProfileSuccess = createAction(
  '[User] Load Profile Success',
  props<{ user: any }>()
);
export const loadUserProfileFailure = createAction(
  '[User] Load Profile Failure',
  props<{ error: string }>()
);

export const updateUserPreferences = createAction(
  '[User] Update Preferences',
  props<{ preferences: any }>()
);

// UI Actions
export const setLoading = createAction(
  '[UI] Set Loading',
  props<{ loading: boolean }>()
);

export const showNotification = createAction(
  '[UI] Show Notification',
  props<{ message: string; notificationType: 'success' | 'error' | 'warning' | 'info' }>()
);

export const hideNotification = createAction('[UI] Hide Notification');

export const toggleSidebar = createAction('[UI] Toggle Sidebar');

export const setTheme = createAction(
  '[UI] Set Theme',
  props<{ theme: 'light' | 'dark' }>()
);

// Analytics Actions
export const trackEvent = createAction(
  '[Analytics] Track Event',
  props<{ event: string; properties?: any }>()
);

export const loadDashboardData = createAction('[Analytics] Load Dashboard Data');
export const loadDashboardDataSuccess = createAction(
  '[Analytics] Load Dashboard Data Success',
  props<{ data: any }>()
);
export const loadDashboardDataFailure = createAction(
  '[Analytics] Load Dashboard Data Failure',
  props<{ error: string }>()
);

// Filter Actions
export const setHotelFilter = createAction(
  '[Filter] Set Hotel Filter',
  props<{ filter: any }>()
);

export const setDateFilter = createAction(
  '[Filter] Set Date Filter',
  props<{ startDate: string; endDate: string }>()
);

export const setPriceFilter = createAction(
  '[Filter] Set Price Filter',
  props<{ minPrice: number; maxPrice: number }>()
);

export const clearFilters = createAction('[Filter] Clear All Filters');

// Search Actions
export const searchHoteles = createAction(
  '[Search] Search Hoteles',
  props<{ query: string; filters?: any }>()
);
export const searchHotelesSuccess = createAction(
  '[Search] Search Hoteles Success',
  props<{ results: any[]; total: number }>()
);
export const searchHotelesFailure = createAction(
  '[Search] Search Hoteles Failure',
  props<{ error: string }>()
);

export const clearSearchResults = createAction('[Search] Clear Results');