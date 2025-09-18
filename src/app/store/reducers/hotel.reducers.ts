import { createReducer, on } from '@ngrx/store';
import * as HotelActions from '../actions/hotel.actions';

export interface HotelState {
  hoteles: any[];
  selectedHotel: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: HotelState = {
  hoteles: [],
  selectedHotel: null,
  loading: false,
  error: null
};

export const hotelReducer = createReducer(
  initialState,
  on(HotelActions.loadHoteles, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(HotelActions.loadHotelesSuccess, (state, { hoteles }) => ({
    ...state,
    hoteles,
    loading: false,
    error: null
  })),
  on(HotelActions.loadHotelesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(HotelActions.selectHotel, (state, { hotelId }) => ({
    ...state,
    selectedHotel: state.hoteles.find(h => h.id === hotelId) || null
  }))
);

export interface HabitacionState {
  habitaciones: any[];
  loading: boolean;
  error: string | null;
}

export const initialHabitacionState: HabitacionState = {
  habitaciones: [],
  loading: false,
  error: null
};

export const habitacionReducer = createReducer(
  initialHabitacionState,
  on(HotelActions.loadHabitaciones, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(HotelActions.loadHabitacionesSuccess, (state, { habitaciones }) => ({
    ...state,
    habitaciones,
    loading: false,
    error: null
  })),
  on(HotelActions.loadHabitacionesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(HotelActions.updateDisponibilidad, (state, { habitacionId, fechas, disponible }) => ({
    ...state,
    habitaciones: state.habitaciones.map(habitacion =>
      habitacion.id === habitacionId
        ? {
            ...habitacion,
            disponibilidad: {
              ...habitacion.disponibilidad,
              ...fechas.reduce((acc, fecha) => ({ ...acc, [fecha]: disponible }), {})
            }
          }
        : habitacion
    )
  }))
);

export interface ReservaState {
  reservas: any[];
  loading: boolean;
  error: string | null;
}

export const initialReservaState: ReservaState = {
  reservas: [],
  loading: false,
  error: null
};

export const reservaReducer = createReducer(
  initialReservaState,
  on(HotelActions.loadReservas, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(HotelActions.loadReservasSuccess, (state, { reservas }) => ({
    ...state,
    reservas,
    loading: false,
    error: null
  })),
  on(HotelActions.loadReservasFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(HotelActions.createReservaSuccess, (state, { reserva }) => ({
    ...state,
    reservas: [...state.reservas, reserva]
  })),
  on(HotelActions.updateReservaSuccess, (state, { reserva }) => ({
    ...state,
    reservas: state.reservas.map(r => r.id === reserva.id ? reserva : r)
  })),
  on(HotelActions.deleteReservaSuccess, (state, { id }) => ({
    ...state,
    reservas: state.reservas.filter(r => r.id !== id)
  }))
);

export interface UserState {
  user: any | null;
  preferences: any;
  loading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  user: null,
  preferences: {
    theme: 'light',
    language: 'es',
    notifications: true
  },
  loading: false,
  error: null
};

export const userReducer = createReducer(
  initialUserState,
  on(HotelActions.loadUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(HotelActions.loadUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })),
  on(HotelActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(HotelActions.updateUserPreferences, (state, { preferences }) => ({
    ...state,
    preferences: { ...state.preferences, ...preferences }
  }))
);

export interface UIState {
  loading: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  };
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

export const initialUIState: UIState = {
  loading: false,
  notification: {
    message: '',
    type: 'info',
    visible: false
  },
  sidebarOpen: true,
  theme: 'light'
};

export const uiReducer = createReducer(
  initialUIState,
  on(HotelActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  on(HotelActions.showNotification, (state, { message, notificationType }) => ({
    ...state,
    notification: {
      message,
      type: notificationType,
      visible: true
    }
  })),
  on(HotelActions.hideNotification, (state) => ({
    ...state,
    notification: {
      ...state.notification,
      visible: false
    }
  })),
  on(HotelActions.toggleSidebar, (state) => ({
    ...state,
    sidebarOpen: !state.sidebarOpen
  })),
  on(HotelActions.setTheme, (state, { theme }) => ({
    ...state,
    theme
  }))
);

export interface AnalyticsState {
  dashboardData: any | null;
  events: any[];
  loading: boolean;
  error: string | null;
}

export const initialAnalyticsState: AnalyticsState = {
  dashboardData: null,
  events: [],
  loading: false,
  error: null
};

export const analyticsReducer = createReducer(
  initialAnalyticsState,
  on(HotelActions.trackEvent, (state, { event, properties }) => ({
    ...state,
    events: [...state.events, { event, properties, timestamp: new Date() }]
  })),
  on(HotelActions.loadDashboardData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(HotelActions.loadDashboardDataSuccess, (state, { data }) => ({
    ...state,
    dashboardData: data,
    loading: false,
    error: null
  })),
  on(HotelActions.loadDashboardDataFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

export interface FilterState {
  hotelFilter: any;
  dateFilter: {
    startDate: string | null;
    endDate: string | null;
  };
  priceFilter: {
    minPrice: number;
    maxPrice: number;
  };
}

export const initialFilterState: FilterState = {
  hotelFilter: {},
  dateFilter: {
    startDate: null,
    endDate: null
  },
  priceFilter: {
    minPrice: 0,
    maxPrice: 10000
  }
};

export const filterReducer = createReducer(
  initialFilterState,
  on(HotelActions.setHotelFilter, (state, { filter }) => ({
    ...state,
    hotelFilter: filter
  })),
  on(HotelActions.setDateFilter, (state, { startDate, endDate }) => ({
    ...state,
    dateFilter: { startDate, endDate }
  })),
  on(HotelActions.setPriceFilter, (state, { minPrice, maxPrice }) => ({
    ...state,
    priceFilter: { minPrice, maxPrice }
  })),
  on(HotelActions.clearFilters, (state) => ({
    ...initialFilterState
  }))
);

export interface SearchState {
  query: string;
  results: any[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const initialSearchState: SearchState = {
  query: '',
  results: [],
  total: 0,
  loading: false,
  error: null
};

export const searchReducer = createReducer(
  initialSearchState,
  on(HotelActions.searchHoteles, (state, { query }) => ({
    ...state,
    query,
    loading: true,
    error: null
  })),
  on(HotelActions.searchHotelesSuccess, (state, { results, total }) => ({
    ...state,
    results,
    total,
    loading: false,
    error: null
  })),
  on(HotelActions.searchHotelesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(HotelActions.clearSearchResults, (state) => ({
    ...state,
    results: [],
    total: 0,
    query: ''
  }))
);