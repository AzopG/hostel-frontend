import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
          <span class="back-icon"><img src="Hotel.png" alt="Hotel Paradise" class="brand-logo-small"></span>
          <span>Volver al Inicio</span>
        </button>
      </div>

      <!-- Fondo decorativo -->
      <div class="background-decoration"></div>

      <div class="login-card">
        <div class="login-header">
          <div class="brand-section">
            <span class="brand-icon"><img src="Hotel.png" alt="Hotel Paradise" class="brand-logo"></span>
            <h1>Hotel Paradise</h1>
          </div>
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta del sistema hotelero</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-envelope"></i></span>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="admin@hotelchain.com"
                [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
            </div>
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
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
            </div>
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
              <span class="checkmark"></span>
              <span class="checkbox-label">Recordarme</span>
            </label>
          </div>

          <!-- Error general -->
          <div class="alert error-alert" *ngIf="errorMessage">
            <span class="alert-icon">⚠️</span>
            <strong>{{ errorMessage }}</strong>
          </div>

          <!-- Success message -->
          <div class="alert success-alert" *ngIf="successMessage">
            <span class="alert-icon">✅</span>
            {{ successMessage }}
          </div>

          <!-- Success message después de reset password -->
          <div class="alert success-alert" *ngIf="resetPasswordSuccess">
            <span class="alert-icon">🔑</span>
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="loading-spinner"></span>
            <span class="btn-text">{{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
          </button>
        </form>

        <!-- Links adicionales -->
        <div class="login-footer">
          <p>¿No tienes cuenta? <a href="#" (click)="goToRegister($event)" class="register-link">Regístrate aquí</a></p>
          <p><a routerLink="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1C2526 0%, #0A3161 50%, #4A1B2F 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
      font-family: 'Playfair Display', 'Georgia', serif;
    }

    .background-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(184, 151, 120, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(74, 27, 47, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .navigation-header {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
    }

    .btn-volver {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
      color: #1C2526;
      border: 2px solid rgba(184, 151, 120, 0.5);
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(15px);
      font-size: 0.95rem;
      text-shadow: none;
      font-family: 'Playfair Display', serif;
      letter-spacing: 0.5px;
    }

    .btn-volver:hover {
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      color: #F8F1E9;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.4);
      border-color: #F8F1E9;
    }

    .back-icon {
      font-size: 1.2rem;
      color: #B89778;
      filter: drop-shadow(0 0 4px rgba(184, 151, 120, 0.3));
    }

    .btn-volver:hover .back-icon {
      color: #F8F1E9;
    }

    .login-card {
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);
      backdrop-filter: blur(25px);
      border-radius: 25px;
      box-shadow: 0 25px 50px rgba(28, 37, 38, 0.4);
      border: 2px solid rgba(184, 151, 120, 0.5);
      padding: 40px;
      width: 100%;
      max-width: 450px;
      position: relative;
      z-index: 2;
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #B89778 0%, #4A1B2F 50%, #0A3161 100%);
      border-radius: 25px 25px 0 0;
    }

    .login-header {
      text-align: center;
      margin-bottom: 35px;
    }

    .brand-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .brand-icon {
      font-size: 2.2rem;
      color: #B89778;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      transition: all 0.3s ease;
    }

    .brand-logo-small {
      width: 30px;
      height: 30px;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      transition: all 0.3s ease;
    }

    .brand-logo:hover,
    .brand-logo-small:hover {
      filter: drop-shadow(0 0 12px rgba(184, 151, 120, 0.8)) drop-shadow(2px 2px 6px rgba(0,0,0,0.4));
      transform: scale(1.05);
    }

    .brand-section h1 {
      color: #1C2526;
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 2px;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .login-header h2 {
      color: #1C2526;
      margin-bottom: 12px;
      font-size: 2rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      letter-spacing: 1px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .login-header p {
      color: #4A1B2F;
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .login-form {
      margin-bottom: 25px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #1C2526;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      font-family: 'Playfair Display', serif;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.1rem;
      color: #B89778;
      z-index: 1;
      filter: drop-shadow(0 0 2px rgba(184, 151, 120, 0.3));
    }

    .form-group input {
      width: 100%;
      padding: 15px 15px 15px 50px;
      border: 2px solid rgba(184, 151, 120, 0.3);
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: rgba(255, 255, 255, 0.8);
      color: #1C2526;
      font-weight: 500;
      letter-spacing: 0.3px;
      font-family: 'Crimson Text', serif;
      backdrop-filter: blur(10px);
    }

    .form-group input:focus {
      outline: none;
      border-color: #B89778;
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.2);
    }

    .form-group input::placeholder {
      color: rgba(28, 37, 38, 0.6);
      font-style: italic;
    }

    .form-group input.error {
      border-color: #4A1B2F;
      background: rgba(74, 27, 47, 0.05);
    }

    .form-group-checkbox {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-left: 35px;
    }

    .checkbox-container input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 20px;
      width: 20px;
      background: rgba(255, 255, 255, 0.8);
      border: 2px solid rgba(184, 151, 120, 0.4);
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .checkbox-container:hover input ~ .checkmark {
      background: rgba(184, 151, 120, 0.1);
      border-color: #B89778;
    }

    .checkbox-container input:checked ~ .checkmark {
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      border-color: #B89778;
    }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }

    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }

    .checkbox-container .checkmark:after {
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid #F8F1E9;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .checkbox-label {
      color: #1C2526;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .error-message {
      color: #4A1B2F;
      font-size: 0.85rem;
      margin-top: 6px;
      font-weight: 500;
      letter-spacing: 0.3px;
      padding-left: 8px;
    }

    .alert {
      padding: 15px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      letter-spacing: 0.3px;
      backdrop-filter: blur(10px);
    }

    .error-alert {
      background: rgba(74, 27, 47, 0.1);
      border: 2px solid rgba(74, 27, 47, 0.3);
      color: #4A1B2F;
    }

    .success-alert {
      background: rgba(184, 151, 120, 0.1);
      border: 2px solid rgba(184, 151, 120, 0.3);
      color: #1C2526;
    }

    .alert-icon {
      font-size: 1.2rem;
      filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
    }

    .submit-btn {
      width: 100%;
      padding: 18px 24px;
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      color: #F8F1E9;
      border: 2px solid #B89778;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-family: 'Cormorant Garamond', serif;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 30px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.4);
      position: relative;
      overflow: hidden;
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.6s;
    }

    .submit-btn:hover::before {
      left: 100%;
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #4A1B2F 0%, #0A3161 100%);
      border-color: #F8F1E9;
      transform: translateY(-4px);
      box-shadow: 0 12px 35px rgba(74, 27, 47, 0.6);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      background: linear-gradient(135deg, rgba(184, 151, 120, 0.5) 0%, rgba(74, 27, 47, 0.5) 100%);
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(248, 241, 233, 0.3);
      border-top: 2px solid #F8F1E9;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-text {
      position: relative;
      z-index: 1;
    }

    .login-footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 25px;
      border-top: 2px solid rgba(184, 151, 120, 0.3);
    }

    .login-footer p {
      color: #4A1B2F;
      font-weight: 500;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
    }

    .register-link,
    .forgot-link {
      color: #B89778;
      text-decoration: none;
      font-weight: 700;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      position: relative;
    }

    .register-link::after,
    .forgot-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #B89778, #4A1B2F);
      transition: width 0.3s ease;
    }

    .register-link:hover::after,
    .forgot-link:hover::after {
      width: 100%;
    }

    .register-link:hover,
    .forgot-link:hover {
      color: #4A1B2F;
      transform: translateY(-1px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .login-container {
        padding: 15px;
      }

      .navigation-header {
        top: 15px;
        left: 15px;
      }

      .btn-volver {
        padding: 10px 16px;
        font-size: 0.9rem;
        gap: 8px;
      }

      .login-card {
        padding: 30px 25px;
        max-width: 100%;
        border-radius: 20px;
      }

      .brand-section h1 {
        font-size: 1.5rem;
        letter-spacing: 1px;
      }

      .login-header h2 {
        font-size: 1.7rem;
      }

      .login-header p {
        font-size: 0.9rem;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group input {
        padding: 14px 14px 14px 45px;
        font-size: 0.95rem;
      }

      .input-icon {
        left: 12px;
        font-size: 1rem;
      }

      .submit-btn {
        padding: 16px 20px;
        font-size: 1rem;
        letter-spacing: 1px;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 25px 20px;
        border-radius: 15px;
      }

      .brand-section {
        flex-direction: column;
        gap: 8px;
      }

      .brand-section h1 {
        font-size: 1.3rem;
      }

      .login-header h2 {
        font-size: 1.5rem;
      }

      .form-group input {
        padding: 12px 12px 12px 40px;
        font-size: 0.9rem;
      }

      .input-icon {
        left: 10px;
        font-size: 0.9rem;
      }

      .submit-btn {
        padding: 14px 18px;
        font-size: 0.95rem;
      }
    }

    /* Landscape orientation adjustments */
    @media (max-width: 768px) and (orientation: landscape) {
      .login-container {
        padding: 10px;
      }

      .login-card {
        max-height: 95vh;
        padding: 20px;
        overflow-y: auto;
      }

      .login-header {
        margin-bottom: 20px;
      }

      .brand-section {
        margin-bottom: 15px;
      }

      .form-group {
        margin-bottom: 15px;
      }
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
            setTimeout(() => {
              // Redirigir al panel correspondiente según el rol (CA1)
              this.navigateByRole(response.usuario.tipo);
            }, 1000);
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