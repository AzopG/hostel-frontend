

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Limpiar mensajes al inicializar
    this.errorMessage = '';
    this.successMessage = '';
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      if (Object.keys(confirmPassword.errors || {}).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerData = {
        nombre: this.registerForm.value.nombre,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        tipo: 'cliente' as const
      };

      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.successMessage = 'Registro exitoso. Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
  error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error en el registro. Inténtalo de nuevo.';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  volver(): void {
    this.router.navigate(['/']);
  }
}