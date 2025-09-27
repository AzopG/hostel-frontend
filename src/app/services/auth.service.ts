import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  tipo: 'cliente' | 'empresa' | 'admin_hotel' | 'admin_central';
  empresa?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  msg: string;
  token: string;
  usuario: Usuario;
  expiresIn: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  tipo: 'cliente' | 'empresa' | 'admin_hotel' | 'admin_central';
  empresa?: string;
}

export interface RegisterResponse {
  msg: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:4000/api/auth';
  
  // Subject para manejar el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  
  // Observables públicos
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verificar si hay un token guardado al inicializar el servicio
    this.checkStoredToken();
  }

  /**
   * Verificar si hay un token almacenado y validarlo
   */
  private checkStoredToken(): void {
    const token = this.getToken();
    if (token) {
      this.verifyToken().subscribe({
        next: (response) => {
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.usuario);
        },
        error: () => {
          // Token inválido, limpiarlo
          this.logout();
        }
      });
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token en localStorage
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.usuario));
          }
          
          // Actualizar subjects
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.usuario);
        }),
        catchError(this.handleError<LoginResponse>('login'))
      );
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        catchError(this.handleError<RegisterResponse>('register'))
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    // Limpiar localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Actualizar subjects
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Verificar token actual
   */
  verifyToken(): Observable<{ usuario: Usuario }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ usuario: Usuario }>(`${this.API_URL}/verify`, { headers })
      .pipe(
        catchError(this.handleError<{ usuario: Usuario }>('verifyToken'))
      );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ msg: string }> {
    const headers = this.getAuthHeaders();
    const body = { currentPassword, newPassword };
    
    return this.http.put<{ msg: string }>(`${this.API_URL}/change-password`, body, { headers })
      .pipe(
        catchError(this.handleError<{ msg: string }>('changePassword'))
      );
  }

  /**
   * Obtener token del localStorage
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser(): Usuario | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.tipo === role : false;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.tipo) : false;
  }

  /**
   * Obtener headers de autorización
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Manejar errores HTTP
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Si es error 401 (no autorizado), cerrar sesión
      if (error.status === 401) {
        this.logout();
      }
      
      // Retornar un resultado vacío para mantener la app funcionando
      return of(result as T);
    };
  }
}