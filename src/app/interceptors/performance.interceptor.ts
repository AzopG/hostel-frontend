import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import {
  catchError,
  finalize,
  mergeMap,
  retryWhen,
  tap,
  timeout
} from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  ttl: number;
}

interface RequestMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Observable<HttpEvent<any>>>();
  private requestMetrics: RequestMetrics[] = [];
  private maxCacheSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutos

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Optimización de Headers
    let optimizedRequest = this.optimizeRequest(req);

    // 2. Cache para requests GET
    if (optimizedRequest.method === 'GET' && this.shouldCache(optimizedRequest)) {
      const cached = this.getFromCache(optimizedRequest);
      if (cached) {
        return of(cached);
      }

      // Verificar si ya hay un request pendiente para la misma URL
      const cacheKey = this.getCacheKey(optimizedRequest);
      const pending = this.pendingRequests.get(cacheKey);
      if (pending) {
        return pending;
      }
    }

    // 3. Métricas de rendimiento
    const startTime = performance.now();
    
    // 4. Configurar timeout y retry
    const timeoutDuration = this.getTimeoutForRequest(optimizedRequest);
    const retryConfig = this.getRetryConfig(optimizedRequest);

    const request$ = next.handle(optimizedRequest).pipe(
      // Timeout real: si la request tarda más de timeoutDuration, lanza error
      timeout(timeoutDuration),

      // Retry con backoff exponencial
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            if (index < retryConfig.maxRetries && this.shouldRetry(error, optimizedRequest)) {
              const delayMs = Math.min(1000 * Math.pow(2, index), 10000);
              return timer(delayMs);
            }
            return throwError(error);
          })
        )
      ),

      // Cache response
      tap(event => {
        if (event instanceof HttpResponse && optimizedRequest.method === 'GET' && this.shouldCache(optimizedRequest)) {
          this.addToCache(optimizedRequest, event);
        }
      }),

      // Métricas
      tap(
        event => {
          if (event instanceof HttpResponse) {
            this.recordMetrics(optimizedRequest, startTime, event, performance.now());
          }
        },
        error => {
          this.recordMetrics(optimizedRequest, startTime, null, performance.now(), error);
        }
      ),

      // Cleanup
      finalize(() => {
        if (optimizedRequest.method === 'GET') {
          const cacheKey = this.getCacheKey(optimizedRequest);
          this.pendingRequests.delete(cacheKey);
        }
      }),

      // Error handling
      catchError(error => {
        return this.handleError(error, optimizedRequest);
      })
    );

    // Guardar request pendiente
    if (optimizedRequest.method === 'GET') {
      const cacheKey = this.getCacheKey(optimizedRequest);
      this.pendingRequests.set(cacheKey, request$);
    }

    return request$;
  }

  private optimizeRequest(req: HttpRequest<any>): HttpRequest<any> {
    let headers = req.headers;

    // Agregar headers de compresión
    if (!headers.has('Accept-Encoding')) {
      headers = headers.set('Accept-Encoding', 'gzip, deflate, br');
    }

    // Optimizar Accept headers basado en el tipo de request
    if (!headers.has('Accept')) {
      if (req.url.includes('/api/')) {
        headers = headers.set('Accept', 'application/json');
      } else if (req.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        headers = headers.set('Accept', 'image/*');
      }
    }

    // Cache control para recursos estáticos
    if (req.method === 'GET' && this.isStaticResource(req.url)) {
      headers = headers.set('Cache-Control', 'public, max-age=31536000');
    }

    // Conditional requests para APIs
    if (req.method === 'GET' && req.url.includes('/api/')) {
      const etag = this.getStoredETag(req.url);
      if (etag) {
        headers = headers.set('If-None-Match', etag);
      }
    }

    return req.clone({ headers });
  }

  private shouldCache(req: HttpRequest<any>): boolean {
    // Solo cachear requests GET
    if (req.method !== 'GET') return false;

    // No cachear requests con parámetros de tiempo
    if (req.url.includes('timestamp') || req.url.includes('t=')) return false;

    // Cachear APIs de datos estáticos
    const cacheableEndpoints = [
      '/api/hoteles',
      '/api/ciudades', 
      '/api/configuracion',
      '/api/usuarios',
      '/api/auth/verify'
    ];

    return cacheableEndpoints.some(endpoint => req.url.includes(endpoint));
  }

  private getCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.urlWithParams}`;
  }

  private getFromCache(req: HttpRequest<any>): HttpResponse<any> | null {
    const key = this.getCacheKey(req);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  private addToCache(req: HttpRequest<any>, response: HttpResponse<any>): void {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntries();
    }

    const key = this.getCacheKey(req);
    const ttl = this.getTTLForRequest(req);

    this.cache.set(key, {
      response: response.clone(),
      timestamp: Date.now(),
      ttl
    });
  }

  private evictOldestEntries(): void {
    // Remover las entradas más antiguas (25% del cache)
    const entriesToRemove = Math.ceil(this.maxCacheSize * 0.25);
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entriesToRemove);

    entries.forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  private getTTLForRequest(req: HttpRequest<any>): number {
    // TTL específico por tipo de recurso
  if (req.url.includes('/api/configuracion')) return 15 * 60 * 1000; // 15 min
  if (req.url.includes('/api/hoteles')) return 10 * 60 * 1000; // 10 min
  if (req.url.includes('/api/usuarios')) return 5 * 60 * 1000; // 5 min
  if (req.url.includes('/api/disponibilidad')) return 2 * 60 * 1000; // 2 min
  if (req.url.includes('/api/auth/verify')) return 30 * 1000; // 30 segundos para verificación

  return this.defaultTTL;
  }

  private getTimeoutForRequest(req: HttpRequest<any>): number {
    // Timeout específico por tipo de request
    if (req.url.includes('/upload')) return 60000; // 1 minuto para uploads
    if (req.url.includes('/api/reportes')) return 30000; // 30s para reportes
    if (req.url.includes('/api/busqueda')) return 15000; // 15s para búsquedas

    return 10000; // 10s por defecto
  }

  private getRetryConfig(req: HttpRequest<any>): { maxRetries: number; retryableStatuses: number[] } {
    const defaultConfig = {
      maxRetries: 2,
      retryableStatuses: [500, 502, 503, 504]
    };

    // No reintentar para requests de modificación
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return { ...defaultConfig, maxRetries: 0 };
    }

    // Más reintentos para requests críticos
    if (req.url.includes('/api/auth')) {
      return { ...defaultConfig, maxRetries: 3 };
    }

    return defaultConfig;
  }

  private shouldRetry(error: any, req: HttpRequest<any>): boolean {
    if (!(error instanceof HttpErrorResponse)) return false;

    const retryConfig = this.getRetryConfig(req);
    return retryConfig.retryableStatuses.includes(error.status);
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>): Observable<never> {
    // Log error con contexto
    console.error('HTTP Error:', {
      url: req.url,
      method: req.method,
      status: error.status,
      message: error.message
    });

    // Error personalizado basado en el status
    let userMessage = 'Ha ocurrido un error inesperado';
    
    switch (error.status) {
      case 0:
        userMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
        break;
      case 400:
        userMessage = 'Los datos enviados no son válidos.';
        break;
      case 401:
        userMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
        break;
      case 403:
        userMessage = 'No tiene permisos para acceder a este recurso.';
        break;
      case 404:
        userMessage = 'El recurso solicitado no fue encontrado.';
        break;
      case 429:
        userMessage = 'Demasiadas solicitudes. Por favor, espere un momento.';
        break;
      case 500:
        userMessage = 'Error interno del servidor. Por favor, intente más tarde.';
        break;
    }

    // Crear error personalizado
    const customError = new Error(userMessage);
    (customError as any).originalError = error;
    
    return throwError(customError);
  }

  private recordMetrics(
    req: HttpRequest<any>, 
    startTime: number, 
    response: HttpResponse<any> | null,
    endTime: number,
    error?: any
  ): void {
    const metrics: RequestMetrics = {
      url: req.url,
      method: req.method,
      startTime,
      endTime,
      duration: endTime - startTime,
      status: response?.status || (error?.status || 0),
      size: this.calculateResponseSize(response)
    };

    this.requestMetrics.push(metrics);

    // Mantener solo las últimas 100 métricas
    if (this.requestMetrics.length > 100) {
      this.requestMetrics = this.requestMetrics.slice(-100);
    }

    // Log para requests lentos
    if (metrics.duration > 5000) {
      console.warn('Slow request detected:', metrics);
    }
  }

  private calculateResponseSize(response: HttpResponse<any> | null): number {
    if (!response || !response.body) return 0;
    
    try {
      return JSON.stringify(response.body).length;
    } catch {
      return 0;
    }
  }

  private isStaticResource(url: string): boolean {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.includes(ext));
  }

  private getStoredETag(url: string): string | null {
    // En una implementación real, esto vendría de localStorage o IndexedDB
    return localStorage.getItem(`etag:${url}`);
  }

  private storeETag(url: string, etag: string): void {
    localStorage.setItem(`etag:${url}`, etag);
  }

  // Métodos públicos para métricas y gestión de cache

  /**
   * Obtener métricas de rendimiento
   */
  getMetrics(): RequestMetrics[] {
    return [...this.requestMetrics];
  }

  /**
   * Limpiar cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: { key: string; age: number; ttl: number }[];
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0, // Se calcularía con métricas adicionales
      entries
    };
  }

  /**
   * Precargar recursos importantes
   */
  prefetch(urls: string[]): void {
    urls.forEach(url => {
      // Crear request para prefetch
      const req = new HttpRequest('GET', url);
      // Implementar lógica de prefetch
    });
  }
}
