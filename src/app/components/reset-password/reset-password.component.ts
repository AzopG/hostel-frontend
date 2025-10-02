import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  token: string | null = null;
  isResetMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.setupForm();
  }

  private setupForm(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    this.isResetMode = !!this.token;

    if (this.isResetMode) {
      this.resetForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      }, { validator: this.passwordMatchValidator });
    } else {
      this.resetForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    }
  }

  private passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isResetMode && this.token) {
      const { password } = this.resetForm.value;
      this.authService.resetPassword(this.token, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Tu contraseña ha sido actualizada exitosamente.';
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { passwordReset: 'true' } });
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al actualizar la contraseña. Por favor, intenta nuevamente.';
        }
      });
    } else {
      const { email } = this.resetForm.value;
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico.';
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { resetRequested: 'true' } });
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al procesar la solicitud. Intenta nuevamente.';
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/login']);
  }
}