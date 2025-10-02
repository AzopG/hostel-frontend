import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
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
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.route.queryParams.subscribe(params => {
      if (params['resetSuccess'] === 'true') {
        this.resetPasswordSuccess = true;
      }
    });
  }

  onSubmit(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

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
            this.successMessage = `Bienvenido ${response.usuario.nombre}. Redirigiendo...`;
            setTimeout(() => {
              this.navigateByRole(response.usuario.tipo);
            }, 1000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.status === 401) {
            this.errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
          } else if (error.status === 0) {
            this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          } else {
            this.errorMessage = error.error?.msg || 'Error al iniciar sesión. Intenta nuevamente.';
          }
        }
      });
    }
  }

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