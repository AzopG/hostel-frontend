import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <!-- Navegación superior -->
      <div class="navigation-header">
        <button class="btn-volver" (click)="volver()" title="Volver al inicio">
          <span>← Volver al Inicio</span>
        </button>
      </div>

      <div class="register-card">
        <div class="register-header">
          <h2>Crear Cuenta</h2>
          <p>Regístrate para acceder al sistema hotelero</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <!-- Nombre -->
          <div class="form-group">
            <label for="nombre">Nombre completo <span class="required">*</span></label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              placeholder="Ingresa tu nombre completo"
              [class.error]="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched"
            >
              <span *ngIf="registerForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
              <span *ngIf="registerForm.get('nombre')?.errors?.['minlength']">El nombre debe tener al menos 3 caracteres</span>
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Correo electrónico <span class="required">*</span></label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Ingresa tu correo"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
              <span *ngIf="registerForm.get('email')?.errors?.['required']">El correo es requerido</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Formato de correo inválido</span>
            </div>
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label for="password">Contraseña <span class="required">*</span></label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Mínimo 6 caracteres"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
              <span *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
            </div>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña <span class="required">*</span></label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Repite tu contraseña"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            >
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Debes confirmar tu contraseña</span>
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
            >
              <span>Las contraseñas no coinciden</span>
            </div>
          </div>

          <!-- Tipo de usuario -->
          <div class="form-group">
            <label for="tipo">Tipo de cuenta <span class="required">*</span></label>
            <select
              id="tipo"
              formControlName="tipo"
              [class.error]="registerForm.get('tipo')?.invalid && registerForm.get('tipo')?.touched"
            >
              <option value="">Selecciona un tipo</option>
              <option value="cliente">Cliente</option>
              <option value="empresa">Empresa</option>
            </select>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('tipo')?.invalid && registerForm.get('tipo')?.touched"
            >
              <span *ngIf="registerForm.get('tipo')?.errors?.['required']">Debes seleccionar un tipo de cuenta</span>
            </div>
          </div>

          <!-- Empresa (solo si tipo es 'empresa') -->
          <div class="form-group" *ngIf="registerForm.get('tipo')?.value === 'empresa'">
            <label for="empresa">Nombre de la empresa <span class="required">*</span></label>
            <input
              id="empresa"
              type="text"
              formControlName="empresa"
              placeholder="Ingresa el nombre de tu empresa"
              [class.error]="registerForm.get('empresa')?.invalid && registerForm.get('empresa')?.touched"
            />
            <div 
              class="error-message" 
              *ngIf="registerForm.get('empresa')?.invalid && registerForm.get('empresa')?.touched"
            >
              <span *ngIf="registerForm.get('empresa')?.errors?.['required']">El nombre de la empresa es requerido</span>
            </div>
          </div>

          <!-- Error general del servidor -->
          <div class="error-message" *ngIf="serverError">
            <strong>{{ serverError }}</strong>
          </div>

          <!-- Success message -->
          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="loader"></span>
            {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </form>

        <!-- Links adicionales -->
        <div class="register-footer">
          <p>¿Ya tienes cuenta? <a href="#" (click)="goToLogin($event)">Inicia sesión aquí</a></p>
        </div>
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
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border: 2px solid rgba(102, 126, 234, 0.3);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 0.9rem;
    }

    .btn-volver:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .register-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .register-header h2 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .register-header p {
      color: #666;
      font-size: 14px;
    }

    .register-form {
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

    .required {
      color: #e74c3c;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e1e1;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.error,
    .form-group select.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 13px;
      margin-top: 5px;
    }

    .error-message strong {
      display: block;
      text-align: center;
      padding: 10px;
      background-color: #fee;
      border-radius: 5px;
    }

    .success-message {
      color: #27ae60;
      font-size: 14px;
      margin-bottom: 15px;
      text-align: center;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 12px;
      border-radius: 5px;
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
      margin-top: 25px;
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

    .register-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e1e1e1;
    }

    .register-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .register-footer a:hover {
      text-decoration: underline;
    }

    /* Scrollbar personalizada */
    .register-card::-webkit-scrollbar {
      width: 8px;
    }

    .register-card::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .register-card::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }

    .register-card::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  serverError = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializar el formulario con validaciones
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      empresa: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    // Listener para el cambio de tipo de usuario
    this.registerForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const empresaControl = this.registerForm.get('empresa');
      if (tipo === 'empresa') {
        empresaControl?.setValidators([Validators.required]);
      } else {
        empresaControl?.clearValidators();
        empresaControl?.setValue('');
      }
      empresaControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Manejar el envío del formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    // Validar que el formulario sea válido
    if (this.registerForm.invalid) {
      this.serverError = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    this.serverError = '';
    this.successMessage = '';

    // Preparar datos para enviar
    const { confirmPassword, ...userData } = this.registerForm.value;
    const registerData: RegisterRequest = userData;

    // Llamar al servicio de registro
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response && response.usuario) {
          // Registro exitoso
          this.successMessage = `¡Bienvenido ${response.usuario.nombre}! Tu cuenta ha sido creada exitosamente. Iniciando sesión...`;
          
          // Iniciar sesión automáticamente
          const loginData: LoginRequest = {
            email: registerData.email,
            password: registerData.password
          };

          this.authService.login(loginData).subscribe({
            next: (loginResponse) => {
              if (loginResponse) {
                // Navegación inmediata
                this.router.navigate(['/dashboard']);
              }
            },
            error: (loginError) => {
              // Si falla el login automático, redirigir a login manual
              this.successMessage = 'Cuenta creada exitosamente. Redirigiendo al inicio de sesión...';
              // Navegación inmediata al login
              this.router.navigate(['/login']);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        // Manejar errores específicos del servidor
        if (error.error?.msg) {
          const errorMsg = error.error.msg;
          
          // Error de correo duplicado (Criterio 4)
          if (errorMsg.includes('ya existe') || errorMsg.includes('email')) {
            this.serverError = 'El correo ya está registrado';
          } else {
            this.serverError = errorMsg;
          }
        } else {
          this.serverError = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Navegar a la página de login
   */
  goToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  /**
   * Volver al inicio
   */
  volver(): void {
    this.router.navigate(['/']);
  }
}
