import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <!-- Navegación superior -->
      <div class="navigation-header">
        <button class="btn-volver" (click)="volver()" title="Volver al inicio">
          <span>← Volver al Inicio</span>
        </button>
      </div>

      <div class="login-card">
        <div class="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta del sistema hotelero</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Ingresa tu correo electrónico"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
              <span *ngIf="loginForm.get('email')?.errors?.['required']">El correo electrónico es requerido</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Formato de correo electrónico inválido</span>
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Ingresa tu contraseña"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
              <span *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="form-group-checkbox">
            <label class="checkbox-container">
              <input
                type="checkbox"
                formControlName="rememberMe"
                id="rememberMe"
              />
              <span class="checkbox-label">Recordarme</span>
            </label>
          </div>

          <!-- Error general -->
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <!-- Success message -->
          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <!-- Success message después de reset password -->
          <div class="success-message" *ngIf="resetPasswordSuccess">
            ✓ Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="loader"></span>
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Links adicionales -->
        <div class="login-footer">
          <p>¿No tienes cuenta? <a href="#" (click)="goToRegister($event)">Regístrate aquí</a></p>
          <p><a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a></p>
        </div>

        <!-- ...eliminar credenciales de prueba... -->
      </div>
    </div>
  `,
  styles: [`
    .navigation-header {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
    }

    .btn-volver {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(248, 241, 233, 0.95);
      color: #1C2526;
      border: 2px solid #B89778;
      border-radius: 25px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(15px);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-volver:hover {
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      color: #F8F1E9;
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(184, 151, 120, 0.4);
    }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1C2526 0%, #0A3161 50%, #4A1B2F 100%);
      padding: 20px;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(184, 151, 120, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(74, 27, 47, 0.1) 0%, transparent 50%);
    }

    .login-card {
      background: linear-gradient(135deg, #F8F1E9 0%, rgba(248, 241, 233, 0.95) 100%);
      border-radius: 25px;
      box-shadow: 0 25px 50px rgba(28, 37, 38, 0.3);
      padding: 50px;
      width: 100%;
      max-width: 500px;
      border: 2px solid #B89778;
      backdrop-filter: blur(20px);
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #1C2526;
      margin-bottom: 15px;
      font-size: 2.2rem;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .login-header p {
      color: #4A1B2F;
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .login-form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #1C2526;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .form-group input {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid #D9D9D6;
      border-radius: 15px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: rgba(248, 241, 233, 0.8);
      color: #1C2526;
      font-weight: 500;
    }

    .form-group input:focus {
      outline: none;
      border-color: #B89778;
      background: #F8F1E9;
      box-shadow: 0 0 15px rgba(184, 151, 120, 0.3);
    }

    .form-group input.error {
      border-color: #4A1B2F;
      background: rgba(74, 27, 47, 0.1);
    }

    .form-group-checkbox {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-container input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      cursor: pointer;
      accent-color: #B89778;
    }

    .checkbox-label {
      color: #1C2526;
      font-size: 14px;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
    }

    .error-message {
      color: #4A1B2F;
      background: rgba(248, 241, 233, 0.9);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 4px solid #4A1B2F;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
      font-size: 14px;
      margin-top: 5px;
    }

    .success-message {
      color: #0A3161;
      background: rgba(248, 241, 233, 0.9);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 4px solid #0A3161;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
      font-size: 14px;
      margin-bottom: 15px;
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #1C2526 0%, #0A3161 100%);
      color: #F8F1E9;
      border: 2px solid #B89778;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      letter-spacing: 1px;
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #0A3161 0%, #4A1B2F 100%);
      border-color: #F8F1E9;
      color: #F8F1E9;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: linear-gradient(135deg, #D9D9D6 0%, #666 100%);
      color: #999;
      border-color: #D9D9D6;
    }

    .loader {
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
    }

    .login-footer a {
      color: #667eea;
      text-decoration: none;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }

    .test-credentials {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e1e1e1;
    }

    .test-credentials h4 {
      color: #333;
      margin-bottom: 15px;
      font-size: 16px;
    }

    .credential-group {
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .test-btn {
      padding: 5px 10px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s;
    }

    .test-btn:hover {
      background: #e9ecef;
    }

    .credential-group small {
      color: #666;
      font-size: 11px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resetPasswordSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Verificar si viene de reset password exitoso
    this.route.queryParams.subscribe(params => {
      if (params['resetSuccess'] === 'true') {
        this.resetPasswordSuccess = true;
        // Success message will be cleared automatically when user interacts
      }
    });
  }

  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores (CA3)
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    // Validar que los campos no estén vacíos (CA3)
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos';
      return;
    }

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            // CA1: Autenticación válida - Redirigir según el rol
            this.successMessage = `Bienvenido ${response.usuario.nombre}. Redirigiendo...`;
            // Redirigir inmediatamente sin esperar
            this.navigateByRole(response.usuario.tipo);
          }
        },
        error: (error) => {
          this.isLoading = false;
          // CA2: Credenciales inválidas
          if (error.status === 401) {
            this.errorMessage = 'Credenciales inválidas';
          } else {
            this.errorMessage = error.error?.msg || 'Error al iniciar sesión. Intenta nuevamente.';
          }
        }
      });
    }
  }

  /**
   * Navegar al panel correspondiente según el rol del usuario (CA1)
   */
  private navigateByRole(tipo: string): void {
    switch (tipo) {
      case 'admin_central':
      case 'admin_hotel':
        this.router.navigate(['/dashboard/hoteles']);
        break;
      case 'empresa':
        this.router.navigate(['/dashboard/reservas']);
        break;
      case 'cliente':
      default:
        this.router.navigate(['/dashboard/mis-reservas']);
        break;
    }
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  /**
   * Volver al inicio
   */
  volver(): void {
    this.router.navigate(['/']);
  }

  fillTestCredentials(type: string): void {
    const credentials = {
      admin: { email: 'admin@hotelchain.com', password: 'admin123' },
      cliente: { email: 'cliente@email.com', password: 'cliente123' },
      empresa: { email: 'maria@empresa.com', password: 'empresa123' },
      hotel: { email: 'admin@hotelplaza.com', password: 'hotel123' }
    };

    const cred = credentials[type as keyof typeof credentials];
    if (cred) {
      this.loginForm.patchValue(cred);
    }
  }
}