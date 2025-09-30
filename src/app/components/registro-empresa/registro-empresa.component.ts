import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterEmpresaRequest } from '../../services/auth.service';

@Component({
  selector: 'app-registro-empresa',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-empresa.component.html',
  styleUrl: './registro-empresa.component.css'
})
export class RegistroEmpresaComponent {
  registroForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  mostrarPassword = false;
  
  // HU13 CA2: Validación de NIT
  nitInvalido = false;
  nitMensajeError = '';
  
  // HU13 CA3: Duplicidad de NIT
  nitDuplicado = false;
  razonSocialExistente = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // CA1: Formulario empresa con campos específicos
    this.registroForm = this.fb.group({
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required, Validators.pattern(/^[\d\s.-]+$/)]],
      contactoNombre: ['', [Validators.required, Validators.minLength(3)]],
      contactoCargo: ['Representante Legal'],
      contactoTelefono: ['', [Validators.required, Validators.pattern(/^[\d\s+()-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * HU13 CA2: Validar formato de NIT mientras se escribe
   */
  validarFormatoNIT(): void {
    const nitControl = this.registroForm.get('nit');
    
    if (!nitControl || !nitControl.value) {
      this.nitInvalido = false;
      this.nitMensajeError = '';
      return;
    }

    const nit = nitControl.value;
    const nitLimpio = nit.replace(/[\s.-]/g, '');

    // Validar que solo contenga números
    if (!/^\d+$/.test(nitLimpio)) {
      this.nitInvalido = true;
      this.nitMensajeError = 'El NIT solo debe contener números';
      return;
    }

    // CA2: Validar longitud (9-10 dígitos)
    if (nitLimpio.length < 9 || nitLimpio.length > 10) {
      this.nitInvalido = true;
      this.nitMensajeError = 'El NIT debe tener 9 o 10 dígitos';
      return;
    }

    // NIT válido
    this.nitInvalido = false;
    this.nitMensajeError = '';
  }

  /**
   * Formatear NIT automáticamente mientras se escribe
   * Ejemplo: 9001234561 → 900.123.456-1
   */
  formatearNIT(): void {
    const nitControl = this.registroForm.get('nit');
    
    if (!nitControl || !nitControl.value) {
      return;
    }

    const nit = nitControl.value;
    const nitLimpio = nit.replace(/[\s.-]/g, '');

    if (nitLimpio.length === 10) {
      const nitFormateado = `${nitLimpio.slice(0, 3)}.${nitLimpio.slice(3, 6)}.${nitLimpio.slice(6, 9)}-${nitLimpio.slice(9)}`;
      nitControl.setValue(nitFormateado, { emitEvent: false });
    } else if (nitLimpio.length === 9) {
      const nitFormateado = `${nitLimpio.slice(0, 3)}.${nitLimpio.slice(3, 6)}.${nitLimpio.slice(6)}`;
      nitControl.setValue(nitFormateado, { emitEvent: false });
    }
  }

  /**
   * CA1: Enviar formulario de registro de empresa
   */
  onSubmit(): void {
    // Resetear errores previos
    this.error = '';
    this.nitDuplicado = false;
    this.razonSocialExistente = '';

    // Validar formulario
    if (this.registroForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    // CA2: Validar formato de NIT antes de enviar
    this.validarFormatoNIT();
    if (this.nitInvalido) {
      this.error = this.nitMensajeError;
      return;
    }

    this.loading = true;

    const formValue = this.registroForm.value;

    // CA1: Preparar datos para envío
    const empresaData: RegisterEmpresaRequest = {
      razonSocial: formValue.razonSocial.trim(),
      nit: formValue.nit.replace(/[\s.-]/g, ''), // Enviar sin formato
      contacto: {
        nombre: formValue.contactoNombre.trim(),
        cargo: formValue.contactoCargo.trim(),
        telefono: formValue.contactoTelefono.trim()
      },
      email: formValue.email.toLowerCase().trim(),
      password: formValue.password
    };

    this.authService.registerEmpresa(empresaData).subscribe({
      next: (response) => {
        if (response && response.success) {
          // CA4: Registro exitoso con inicio de sesión automático
          this.success = true;
          this.loading = false;
          
          console.log('✅ Empresa registrada exitosamente:', response.empresa.razonSocial);
          
          // Mostrar mensaje de éxito por 2 segundos y redirigir
          setTimeout(() => {
            this.router.navigate(['/']); // Redirigir al home
          }, 2000);
        } else {
          this.loading = false;
          this.error = response?.msg || 'Error al registrar empresa';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error en registro de empresa:', err);

        // CA2: Error de formato de NIT
        if (err.error && err.error.formatoNIT === false) {
          this.nitInvalido = true;
          this.nitMensajeError = err.error.msg;
          this.error = err.error.msg;
          return;
        }

        // CA3: NIT duplicado
        if (err.error && err.error.nitDuplicado) {
          this.nitDuplicado = true;
          this.razonSocialExistente = err.error.razonSocialExistente || '';
          this.error = err.error.msg;
          return;
        }

        // Error genérico
        this.error = err.error?.msg || err.error?.detalle || 'Error al registrar la empresa. Intente nuevamente.';
      }
    });
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.registroForm.controls).forEach(key => {
      const control = this.registroForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene error y fue tocado
   */
  tieneError(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getMensajeError(campo: string): string {
    const control = this.registroForm.get(campo);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }

    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `Mínimo ${min} caracteres`;
    }

    if (control.errors['email']) {
      return 'Email inválido';
    }

    if (control.errors['pattern']) {
      if (campo === 'nit') {
        return 'Solo números, puntos y guiones permitidos';
      }
      if (campo === 'contactoTelefono') {
        return 'Formato de teléfono inválido';
      }
    }

    return 'Campo inválido';
  }

  /**
   * Alternar visibilidad de contraseña
   */
  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Limpiar error de duplicidad al cambiar NIT
   */
  onNitChange(): void {
    this.nitDuplicado = false;
    this.razonSocialExistente = '';
    this.validarFormatoNIT();
  }

  /**
   * Getter para verificar si las contraseñas coinciden
   */
  get passwordsNoCoinciden(): boolean {
    return !!(this.registroForm.errors?.['passwordMismatch'] && 
              this.registroForm.get('confirmPassword')?.touched);
  }
}
