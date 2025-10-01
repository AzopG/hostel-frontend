import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../index';
import {
  HotelState,
  HabitacionState,
  ReservaState,
  UserState,
  UIState,
  AnalyticsState,
  FilterState,
  SearchState
} from '../reducers/hotel.reducers';

// Feature selectors
export const selectHotelState = createFeatureSelector<HotelState>('hotel');
export const selectHabitacionState = createFeatureSelector<HabitacionState>('habitacion');
export const selectReservaState = createFeatureSelector<ReservaState>('reserva');
export const selectUserState = createFeatureSelector<UserState>('user');
export const selectUIState = createFeatureSelector<UIState>('ui');
export const selectAnalyticsState = createFeatureSelector<AnalyticsState>('analytics');
export const selectFilterState = createFeatureSelector<FilterState>('filter');
export const selectSearchState = createFeatureSelector<SearchState>('search');

// Hotel selectors
export const selectHoteles = createSelector(
  selectHotelState,
  (state: HotelState) => state.hoteles
);

export const selectSelectedHotel = createSelector(
  selectHotelState,
  (state: HotelState) => state.selectedHotel
);

export const selectHotelesLoading = createSelector(
  selectHotelState,
  (state: HotelState) => state.loading
);

export const selectHotelesError = createSelector(
  selectHotelState,
  (state: HotelState) => state.error
);

export const selectHotelById = (hotelId: string) => createSelector(
  selectHoteles,
  (hoteles) => hoteles.find(hotel => hotel.id === hotelId)
);

// Habitación selectors
export const selectHabitaciones = createSelector(
  selectHabitacionState,
  (state: HabitacionState) => state.habitaciones
);

export const selectHabitacionesLoading = createSelector(
  selectHabitacionState,
  (state: HabitacionState) => state.loading
);

export const selectHabitacionesError = createSelector(
  selectHabitacionState,
  (state: HabitacionState) => state.error
);

export const selectHabitacionesDisponibles = createSelector(
  selectHabitaciones,
  selectFilterState,
  (habitaciones, filters) => {
    if (!filters.dateFilter.startDate || !filters.dateFilter.endDate) {
      return habitaciones;
    }

    return habitaciones.filter(habitacion => {
      // Lógica para verificar disponibilidad en las fechas seleccionadas
      const startDate = new Date(filters.dateFilter.startDate!);
      const endDate = new Date(filters.dateFilter.endDate!);
      
      // Aquí implementarías la lógica real de disponibilidad
      return habitacion.disponible !== false;
    });
  }
);

// Reserva selectors
export const selectReservas = createSelector(
  selectReservaState,
  (state: ReservaState) => state.reservas
);

export const selectReservasLoading = createSelector(
  selectReservaState,
  (state: ReservaState) => state.loading
);

export const selectReservasError = createSelector(
  selectReservaState,
  (state: ReservaState) => state.error
);

export const selectReservasByUser = (userId: string) => createSelector(
  selectReservas,
  (reservas) => reservas.filter(reserva => reserva.userId === userId)
);

export const selectReservasActivas = createSelector(
  selectReservas,
  (reservas) => reservas.filter(reserva => 
    new Date(reserva.fechaInicio) >= new Date() && reserva.estado === 'confirmada'
  )
);

export const selectReservasPasadas = createSelector(
  selectReservas,
  (reservas) => reservas.filter(reserva => 
    new Date(reserva.fechaFin) < new Date()
  )
);

// User selectors
export const selectUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);

export const selectUserPreferences = createSelector(
  selectUserState,
  (state: UserState) => state.preferences
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);

export const selectUserTheme = createSelector(
  selectUserPreferences,
  (preferences) => preferences.theme
);

// UI selectors
export const selectUILoading = createSelector(
  selectUIState,
  (state: UIState) => state.loading
);

export const selectNotification = createSelector(
  selectUIState,
  (state: UIState) => state.notification
);

export const selectSidebarOpen = createSelector(
  selectUIState,
  (state: UIState) => state.sidebarOpen
);

export const selectTheme = createSelector(
  selectUIState,
  (state: UIState) => state.theme
);

// Analytics selectors
export const selectDashboardData = createSelector(
  selectAnalyticsState,
  (state: AnalyticsState) => state.dashboardData
);

export const selectAnalyticsEvents = createSelector(
  selectAnalyticsState,
  (state: AnalyticsState) => state.events
);

export const selectAnalyticsLoading = createSelector(
  selectAnalyticsState,
  (state: AnalyticsState) => state.loading
);

export const selectRecentEvents = createSelector(
  selectAnalyticsEvents,
  (events) => events.slice(-10) // Últimos 10 eventos
);

// Filter selectors
export const selectHotelFilter = createSelector(
  selectFilterState,
  (state: FilterState) => state.hotelFilter
);

export const selectDateFilter = createSelector(
  selectFilterState,
  (state: FilterState) => state.dateFilter
);

export const selectPriceFilter = createSelector(
  selectFilterState,
  (state: FilterState) => state.priceFilter
);

export const selectActiveFilters = createSelector(
  selectFilterState,
  (state: FilterState) => {
    const activeFilters: any = {};
    
    if (Object.keys(state.hotelFilter).length > 0) {
      activeFilters.hotel = state.hotelFilter;
    }
    
    if (state.dateFilter.startDate && state.dateFilter.endDate) {
      activeFilters.dates = state.dateFilter;
    }
    
    if (state.priceFilter.minPrice > 0 || state.priceFilter.maxPrice < 10000) {
      activeFilters.price = state.priceFilter;
    }
    
    return activeFilters;
  }
);

// Search selectors
export const selectSearchQuery = createSelector(
  selectSearchState,
  (state: SearchState) => state.query
);

export const selectSearchResults = createSelector(
  selectSearchState,
  (state: SearchState) => state.results
);

export const selectSearchTotal = createSelector(
  selectSearchState,
  (state: SearchState) => state.total
);

export const selectSearchLoading = createSelector(
  selectSearchState,
  (state: SearchState) => state.loading
);

export const selectSearchError = createSelector(
  selectSearchState,
  (state: SearchState) => state.error
);

// Combined selectors
export const selectFilteredHoteles = createSelector(
  selectHoteles,
  selectActiveFilters,
  selectSearchResults,
  selectSearchQuery,
  (hoteles, filters, searchResults, searchQuery) => {
    let result = hoteles;
    
    // Si hay una búsqueda activa, usar los resultados de búsqueda
    if (searchQuery && searchResults.length > 0) {
      result = searchResults;
    }
    
    // Aplicar filtros adicionales
    if (Object.keys(filters).length > 0) {
      if (filters.price) {
        result = result.filter(hotel => 
          hotel.precioMinimo >= filters.price.minPrice && 
          hotel.precioMinimo <= filters.price.maxPrice
        );
      }
      
      if (filters.hotel) {
        // Aplicar filtros específicos del hotel
        Object.keys(filters.hotel).forEach(key => {
          if (filters.hotel[key]) {
            result = result.filter((hotel: any) => hotel[key] === filters.hotel[key]);
          }
        });
      }
    }
    
    return result;
  }
);

export const selectDashboardSummary = createSelector(
  selectReservas,
  selectHoteles,
  selectHabitaciones,
  (reservas, hoteles, habitaciones) => ({
    totalReservas: reservas.length,
    reservasActivas: reservas.filter(r => r.estado === 'confirmada').length,
    totalHoteles: hoteles.length,
    totalHabitaciones: habitaciones.length,
    ocupacionPromedio: habitaciones.length > 0 
      ? (reservas.filter(r => r.estado === 'confirmada').length / habitaciones.length) * 100 
      : 0
  })
);

export const selectIsLoading = createSelector(
  selectHotelesLoading,
  selectReservasLoading,
  selectHabitacionesLoading,
  selectUserLoading,
  selectAnalyticsLoading,
  selectSearchLoading,
  (hotelLoading, reservaLoading, habitacionLoading, userLoading, analyticsLoading, searchLoading) =>
    hotelLoading || reservaLoading || habitacionLoading || userLoading || analyticsLoading || searchLoading
);