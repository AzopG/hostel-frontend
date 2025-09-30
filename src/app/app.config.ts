import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { inject } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { Router } from '@angular/router';
import { reducers, metaReducers } from './store';
import { HotelEffects } from './store/effects/hotel.effects';
import { environment } from '../environments/environment';

// Interceptor funcional para Angular 19
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Si hay token, agregarlo a los headers
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
