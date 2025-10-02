import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();

    // Si hay token, agregarlo a los headers
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Continúar con la petición y manejar errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo cerrar sesión para 401 ÚNICAMENTE en /api/auth/verify 
        if (error.status === 401 && req.url.includes('/api/auth/verify')) {
          console.warn('401 en verificación de token, cerrando sesión:', req.url);
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 401) {
          console.warn('401 en endpoint no crítico, no cerrando sesión:', req.url);
        }
        
        return throwError(() => error);
      })
    );
  }
}