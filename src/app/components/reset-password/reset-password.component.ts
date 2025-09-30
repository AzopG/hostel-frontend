import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <div class="reset-password-header">
          <h2>Restablecer Contraseña</h2>
          <p class="subtitle">Ingresa tu nueva contraseña</p>
        </div>

        <!-- CA4: Mensaje de éxito -->
        <div *ngIf="successMessage" class="alert alert-success">
          <i class="icon-check"></i>
          {{ successMessage }}
        </div>

        <!-- Mensaje de error -->
        <div *ngIf="errorMessage" class="alert alert-error">
          <i class="icon-alert"></i>
          {{ errorMessage }}
        </div>

        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="reset-password-form">
          <!-- Campo Nueva Contraseña -->
          <div class="form-group">
            <label for="password">Nueva Contraseña</label>
            <div class="password-input-container">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="Mínimo 6 caracteres"
                [class.error]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched"
              />
              <button 
                type="button" 
                class="toggle-password"
                (click)="togglePasswordVisibility()"
                tabindex="-1"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="error-message" *ngIf="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched">
              <span *ngIf="resetPasswordForm.get('password')?.errors?.['required']">
                La contraseña es requerida
              </span>
              <span *ngIf="resetPasswordForm.get('password')?.errors?.['minlength']">
                La contraseña debe tener al menos 6 caracteres
              </span>
            </div>
          </div>

          <!-- Campo Confirmar Contraseña -->
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <div class="password-input-container">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Repite tu contraseña"
                [class.error]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
              />
              <button 
                type="button" 
                class="toggle-password"
                (click)="toggleConfirmPasswordVisibility()"
                tabindex="-1"
              >
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="error-message" *ngIf="resetPasswordForm.errors?.['passwordMismatch'] && resetPasswordForm.get('confirmPassword')?.touched">
              Las contraseñas no coinciden
            </div>
          </div>

          <!-- Indicador de fortaleza de contraseña -->
          <div class="password-strength" *ngIf="resetPasswordForm.get('password')?.value">
            <div class="strength-label">Fortaleza de la contraseña:</div>
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                [class.weak]="passwordStrength === 'weak'"
                [class.medium]="passwordStrength === 'medium'"
                [class.strong]="passwordStrength === 'strong'"
                [style.width]="passwordStrengthWidth"
              ></div>
            </div>
            <div class="strength-text">{{ passwordStrengthText }}</div>
          </div>

          <!-- Botón Submit -->
          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="isLoading || resetPasswordForm.invalid"
          >
            <span *ngIf="!isLoading">Restablecer Contraseña</span>
            <span *ngIf="isLoading">
              <span class="loader"></span>
              Procesando...
            </span>
          </button>

          <!-- Link para volver al login -->
          <div class="back-to-login">
            <a routerLink="/login">← Volver al inicio de sesión</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .reset-password-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 450px;
    }

    .reset-password-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .reset-password-header h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .icon-check::before {
      content: "✓";
      font-weight: bold;
    }

    .icon-alert::before {
      content: "⚠";
      font-weight: bold;
    }

    .reset-password-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-container input {
      width: 100%;
      padding: 12px;
      padding-right: 45px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }

    .password-input-container input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .password-input-container input.error {
      border-color: #dc3545;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .password-strength {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
    }

    .strength-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
    }

    .strength-bar {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .strength-fill {
      height: 100%;
      transition: all 0.3s;
      border-radius: 4px;
    }

    .strength-fill.weak {
      background-color: #dc3545;
    }

    .strength-fill.medium {
      background-color: #ffc107;
    }

    .strength-fill.strong {
      background-color: #28a745;
    }

    .strength-text {
      font-size: 12px;
      font-weight: 600;
      text-align: right;
    }

    .submit-btn {
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loader {
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .back-to-login {
      text-align: center;
      margin-top: 15px;
    }

    .back-to-login a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.3s;
    }

    .back-to-login a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .reset-password-card {
        padding: 30px 20px;
      }

      .reset-password-header h2 {
        font-size: 24px;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  resetToken = '';
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordStrengthWidth = '0%';
  passwordStrengthText = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Monitorear cambios en la contraseña para calcular fortaleza
    this.resetPasswordForm.get('password')?.valueChanges.subscribe(value => {
      this.calculatePasswordStrength(value);
    });
  }

  ngOnInit(): void {
    // CA4: Obtener token de la URL
    this.resetToken = this.route.snapshot.params['token'];
    
    if (!this.resetToken) {
      this.errorMessage = 'Token de recuperación no válido';
    }
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 'weak';
      this.passwordStrengthWidth = '0%';
      this.passwordStrengthText = '';
      return;
    }

    let strength = 0;
    
    // Criterios de fortaleza
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 'weak';
      this.passwordStrengthWidth = '33%';
      this.passwordStrengthText = 'Débil';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
      this.passwordStrengthWidth = '66%';
      this.passwordStrengthText = 'Media';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthWidth = '100%';
      this.passwordStrengthText = 'Fuerte';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    // Limpiar mensajes
    this.successMessage = '';
    this.errorMessage = '';

    // Validar token
    if (!this.resetToken) {
      this.errorMessage = 'Token de recuperación no válido';
      return;
    }

    // Validar formulario
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    const password = this.resetPasswordForm.get('password')?.value;

    // CA4: Restablecer contraseña
    this.authService.resetPassword(this.resetToken, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        // CA4: Mostrar confirmación
        this.successMessage = response.msg || 'Tu contraseña ha sido restablecida exitosamente';
        this.resetPasswordForm.reset();
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { resetSuccess: 'true' }
          });
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.errorMessage = 'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.';
        } else {
          this.errorMessage = error.error?.msg || 'Error al restablecer la contraseña. Intenta nuevamente.';
        }
      }
    });
  }
}
