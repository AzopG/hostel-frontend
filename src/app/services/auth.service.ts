import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
  rememberMe?: boolean;
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

// HU13: Interfaces para registro de empresa
export interface ContactoEmpresa {
  nombre: string;
  cargo?: string;
  telefono: string;
}

export interface RegisterEmpresaRequest {
  razonSocial: string;
  nit: string;
  contacto: ContactoEmpresa;
  email: string;
  password: string;
}

export interface EmpresaData {
  _id: string;
  razonSocial: string;
  nit: string;
  nitFormateado: string;
  email: string;
  tipo: 'empresa';
  contacto: ContactoEmpresa;
  createdAt: Date;
}

export interface RegisterEmpresaResponse {
  success: boolean;
  msg: string;
  token: string;
  empresa: EmpresaData;
}

// HU03: Interfaces para recuperación de contraseña
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  msg: string;
  resetToken?: string; // Solo en desarrollo
  resetUrl?: string;   // Solo en desarrollo
}

export interface ResetPasswordRequest {
  password: string;
}

export interface ResetPasswordResponse {
  msg: string;
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
   * CA4: Verifica tanto localStorage como sessionStorage
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
          // CA4: Guardar sesión según "Recordarme"
          if (isPlatformBrowser(this.platformId)) {
            const storage = credentials.rememberMe ? localStorage : sessionStorage;
            
            // Limpiar del otro storage
            const otherStorage = credentials.rememberMe ? sessionStorage : localStorage;
            otherStorage.removeItem('token');
            otherStorage.removeItem('user');
            otherStorage.removeItem('rememberMe');
            
            // Guardar en el storage apropiado
            storage.setItem('token', response.token);
            storage.setItem('user', JSON.stringify(response.usuario));
            storage.setItem('rememberMe', credentials.rememberMe ? 'true' : 'false');
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
   * HU13: Registrar cuenta empresarial
   * CA1: Envía formulario con razón social, NIT, contacto, correo, contraseña
   * CA4: Inicia sesión automáticamente al registrar
   */
  registerEmpresa(empresaData: RegisterEmpresaRequest): Observable<RegisterEmpresaResponse> {
    return this.http.post<RegisterEmpresaResponse>(`${this.API_URL}/register-empresa`, empresaData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            // CA4: Guardar sesión automáticamente al registrar empresa
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify({
                _id: response.empresa._id,
                nombre: response.empresa.contacto.nombre,
                email: response.empresa.email,
                tipo: 'empresa',
                empresa: response.empresa.razonSocial
              }));
              localStorage.setItem('rememberMe', 'true');
            }
            
            // Actualizar subjects
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next({
              _id: response.empresa._id,
              nombre: response.empresa.contacto.nombre,
              email: response.empresa.email,
              tipo: 'empresa',
              empresa: response.empresa.razonSocial
            });
          }
        }),
        catchError(this.handleError<RegisterEmpresaResponse>('registerEmpresa'))
      );
  }

  /**
   * Cerrar sesión
   * CA4: Limpiar tanto localStorage como sessionStorage
   */
  logout(): void {
    // Limpiar ambos storages
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('rememberMe');
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
   * HU03 - CA1, CA2, CA3: Solicitar recuperación de contraseña
   */
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.API_URL}/forgot-password`, { email })
      .pipe(
        catchError(this.handleError<ForgotPasswordResponse>('forgotPassword'))
      );
  }

  /**
   * HU03 - CA4: Restablecer contraseña con token
   */
  resetPassword(token: string, password: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.API_URL}/reset-password/${token}`, { password })
      .pipe(
        catchError(this.handleError<ResetPasswordResponse>('resetPassword'))
      );
  }

  /**
   * Obtener token del storage apropiado (localStorage o sessionStorage)
   * CA4: Busca en ambos storages
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  }

  /**
   * Obtener usuario actual del storage apropiado
   * CA4: Busca en ambos storages
   */
  getCurrentUser(): Usuario | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  /**
   * Verificar si la sesión fue marcada para recordar
   * CA4: Check rememberMe flag
   */
  isRememberMeEnabled(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('rememberMe') === 'true';
    }
    return false;
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
