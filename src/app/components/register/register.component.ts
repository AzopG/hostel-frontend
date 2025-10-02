
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
      confirmPassword: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      // HU13: Campos específicos para empresas
      empresa: [''],
      razonSocial: [''],
      nit: [''],
      contactoNombre: [''],
      contactoCargo: ['Representante Legal'],
      contactoTelefono: ['']
    }, { validators: this.passwordMatchValidator });
    
    // Configurar validaciones dinámicas para campos de empresa
    this.setupEmpresaValidations();
  }

  ngOnInit(): void {
    // Limpiar mensajes al inicializar
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * HU13: Configurar validaciones dinámicas para campos de empresa
   */
  private setupEmpresaValidations(): void {
    this.registerForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const razonSocialControl = this.registerForm.get('razonSocial');
      const nitControl = this.registerForm.get('nit');
      const contactoNombreControl = this.registerForm.get('contactoNombre');
      const contactoTelefonoControl = this.registerForm.get('contactoTelefono');
      
      if (tipo === 'empresa') {
        // Activar validaciones para empresa
        razonSocialControl?.setValidators([Validators.required, Validators.minLength(3)]);
        nitControl?.setValidators([Validators.required, Validators.pattern(/^[\d\s.-]+$/)]);
        contactoNombreControl?.setValidators([Validators.required, Validators.minLength(3)]);
        contactoTelefonoControl?.setValidators([Validators.required, Validators.pattern(/^[\d\s+()-]+$/)]);
      } else {
        // Remover validaciones si no es empresa
        razonSocialControl?.clearValidators();
        nitControl?.clearValidators();
        contactoNombreControl?.clearValidators();
        contactoTelefonoControl?.clearValidators();
      }
      
      // Actualizar validaciones
      razonSocialControl?.updateValueAndValidity();
      nitControl?.updateValueAndValidity();
      contactoNombreControl?.updateValueAndValidity();
      contactoTelefonoControl?.updateValueAndValidity();
    });
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

      const formValues = this.registerForm.value;
      const tipoUsuario = formValues.tipo;

      if (tipoUsuario === 'empresa') {
        // HU13: Usar endpoint específico para empresas
        const empresaData = {
          razonSocial: formValues.razonSocial.trim(),
          nit: formValues.nit.replace(/[\s.-]/g, ''), // Limpiar formato
          contacto: {
            nombre: formValues.contactoNombre.trim(),
            cargo: formValues.contactoCargo.trim(),
            telefono: formValues.contactoTelefono.trim()
          },
          email: formValues.email.toLowerCase().trim(),
          password: formValues.password
        };

        this.authService.registerEmpresa(empresaData).subscribe({
          next: (response) => {
            if (response && response.success) {
              this.successMessage = 'Empresa registrada exitosamente. Redirigiendo...';
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 2000);
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.error?.msg || error.error?.detalle || 'Error al registrar la empresa.';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        // Registro normal para clientes
        const registerData = {
          nombre: formValues.nombre,
          email: formValues.email,
          password: formValues.password,
          tipo: tipoUsuario as 'cliente'
        };

        this.authService.register(registerData).subscribe({
          next: (response) => {
            this.successMessage = 'Registro exitoso. Redirigiendo al login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.error?.message || 'Error en el registro. Inténtalo de nuevo.';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
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

  /**
   * HU13: Verificar si un campo tiene error y fue tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * HU13: Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) {
      const min = field.errors['minlength'].requiredLength;
      return `Mínimo ${min} caracteres`;
    }
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['pattern']) {
      if (fieldName === 'nit') return 'Solo números, puntos y guiones permitidos';
      if (fieldName === 'contactoTelefono') return 'Formato de teléfono inválido';
    }
    return 'Campo inválido';
  }

  /**
   * HU13: Formatear NIT mientras se escribe
   */
  onNitInput(event: any): void {
    const input = event.target;
    const nit = input.value.replace(/[\s.-]/g, '');
    
    if (nit.length === 10) {
      const formatted = `${nit.slice(0, 3)}.${nit.slice(3, 6)}.${nit.slice(6, 9)}-${nit.slice(9)}`;
      this.registerForm.get('nit')?.setValue(formatted, { emitEvent: false });
    } else if (nit.length === 9) {
      const formatted = `${nit.slice(0, 3)}.${nit.slice(3, 6)}.${nit.slice(6)}`;
      this.registerForm.get('nit')?.setValue(formatted, { emitEvent: false });
    }
  }
}