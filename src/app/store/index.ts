import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import {
  hotelReducer,
  HotelState,
  habitacionReducer,
  HabitacionState,
  reservaReducer,
  ReservaState,
  userReducer,
  UserState,
  uiReducer,
  UIState,
  analyticsReducer,
  AnalyticsState,
  filterReducer,
  FilterState,
  searchReducer,
  SearchState
} from './reducers/hotel.reducers';

export interface AppState {
  hotel: HotelState;
  habitacion: HabitacionState;
  reserva: ReservaState;
  user: UserState;
  ui: UIState;
  analytics: AnalyticsState;
  filter: FilterState;
  search: SearchState;
}

export const reducers: ActionReducerMap<AppState> = {
  hotel: hotelReducer,
  habitacion: habitacionReducer,
  reserva: reservaReducer,
  user: userReducer,
  ui: uiReducer,
  analytics: analyticsReducer,
  filter: filterReducer,
  search: searchReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];