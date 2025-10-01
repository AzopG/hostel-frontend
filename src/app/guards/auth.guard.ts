import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Si no hay token, redirigir al login
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // Si ya está marcado como autenticado, permitir acceso
    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    // Verificar token con el servidor
    return this.authService.verifyToken().pipe(
      map(response => {
        if (response && response.usuario) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}