import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { metaReducers, reducers } from './store';
import { HotelEffects } from './store/effects/hotel.effects';

// Interceptor funcional para Angular 19
const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Leer el token directamente del storage para evitar ciclo DI
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return next(authReq);
};

// Interceptor de rendimiento funcional
const performanceInterceptor: HttpInterceptorFn = (req, next) => {
  const performanceInterceptorService = inject(PerformanceInterceptor);
  return performanceInterceptorService.intercept(req, { handle: next } as any);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(
      withFetch(),
      withInterceptors([performanceInterceptor, authInterceptor])
    ),
    provideAnimations(),
    provideStore(reducers, { metaReducers }),
    provideEffects(HotelEffects),
    provideStoreDevtools({ 
      maxAge: 25, 
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75
    }),
    PerformanceInterceptor
  ]
};
