import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta del sistema hotelero</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Ingresa tu email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
              <span *ngIf="loginForm.get('email')?.errors?.['required']">El email es requerido</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Formato de email inválido</span>
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

          <!-- Error general -->
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <!-- Success message -->
          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
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
        </div>

        <!-- ...eliminar credenciales de prueba... -->
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 450px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .login-header p {
      color: #666;
      font-size: 14px;
    }

    .login-form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e1e1;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }

    .success-message {
      color: #27ae60;
      font-size: 14px;
      margin-bottom: 15px;
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .submit-btn:hover:not(:disabled) {
      opacity: 0.9;
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.successMessage = 'Login exitoso. Redirigiendo...';
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.msg || 'Error al iniciar sesión. Intenta nuevamente.';
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
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