import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="forgot-password-container">
      <!-- Navegación superior -->
      <div class="navigation-header">
        <button class="btn-volver" (click)="volver()" title="Volver al login">
          <span>← Volver al Login</span>
        </button>
      </div>

      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <h2>¿Olvidaste tu contraseña?</h2>
          <p class="subtitle">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <!-- CA1: Mensaje de éxito -->
        <div *ngIf="successMessage" class="alert alert-success">
          <i class="icon-check"></i>
          {{ successMessage }}
        </div>

        <!-- CA3: Mensaje de error -->
        <div *ngIf="errorMessage" class="alert alert-error">
          <i class="icon-alert"></i>
          {{ errorMessage }}
        </div>

        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
          <!-- Campo Email -->
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="tu@email.com"
              [class.error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
            />
            <div class="error-message" *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
              <span *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">
                El email es requerido
              </span>
              <span *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">
                Formato de email inválido
              </span>
            </div>
          </div>

          <!-- Botón Submit -->
          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="isLoading || forgotPasswordForm.invalid"
          >
            <span *ngIf="!isLoading">Enviar Enlace de Recuperación</span>
            <span *ngIf="isLoading">
              <span class="loader"></span>
              Enviando...
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

    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forgot-password-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 450px;
    }

    .forgot-password-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .forgot-password-header h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
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

    .forgot-password-form {
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

    .form-group input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
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
      .forgot-password-card {
        padding: 30px 20px;
      }

      .forgot-password-header h2 {
        font-size: 24px;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    // Limpiar mensajes
    this.successMessage = '';
    this.errorMessage = '';

    // Validar formulario
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;

    // CA1, CA2, CA3: Solicitar recuperación
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        // CA1: Mostrar mensaje de confirmación
        this.successMessage = response.msg || 'Se ha enviado un enlace de recuperación a tu correo';
        this.forgotPasswordForm.reset();
        
        // En desarrollo, mostrar el link en consola
        if (response.resetUrl) {
          // console.log('🔗 Link de recuperación (DEV):', response.resetUrl);
        }
      },
      error: (error) => {
        this.isLoading = false;
        // CA3: Mostrar error si el correo no existe
        if (error.status === 404) {
          this.errorMessage = 'No existe una cuenta con este correo';
        } else {
          this.errorMessage = error.error?.msg || 'Error al enviar el enlace. Intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Volver al login
   */
  volver(): void {
    this.router.navigate(['/login']);
  }
}
