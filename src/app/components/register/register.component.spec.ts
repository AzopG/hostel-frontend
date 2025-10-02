import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RegisterComponent - HU01', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'register',
      'login',
      'isAuthenticated'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    authService.isAuthenticated.and.returnValue(false);
    
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Criterio 1: Campos obligatorios', () => {
    it('debe mostrar el formulario con todos los campos requeridos', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#nombre')).toBeTruthy();
      expect(compiled.querySelector('#email')).toBeTruthy();
      expect(compiled.querySelector('#password')).toBeTruthy();
      expect(compiled.querySelector('#confirmPassword')).toBeTruthy();
      expect(compiled.querySelector('#tipo')).toBeTruthy();
    });

    it('debe tener todos los campos obligatorios inicialmente vacíos', () => {
      expect(component.registerForm.get('nombre')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
      expect(component.registerForm.get('tipo')?.value).toBe('');
    });

    it('debe validar que el nombre sea requerido', () => {
      const nombreControl = component.registerForm.get('nombre');
      nombreControl?.setValue('');
      nombreControl?.markAsTouched();
      
      expect(nombreControl?.hasError('required')).toBeTruthy();
    });

    it('debe validar que el email sea requerido', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();
      
      expect(emailControl?.hasError('required')).toBeTruthy();
    });

    it('debe validar que la contraseña sea requerida', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();
      
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('debe validar que confirmar contraseña sea requerido', () => {
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      confirmPasswordControl?.setValue('');
      confirmPasswordControl?.markAsTouched();
      
      expect(confirmPasswordControl?.hasError('required')).toBeTruthy();
    });

    it('debe mostrar campo empresa cuando tipo es "empresa"', () => {
      component.registerForm.get('tipo')?.setValue('empresa');
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('#empresa')).toBeTruthy();
    });

    it('debe hacer campo empresa requerido cuando tipo es "empresa"', () => {
      component.registerForm.get('tipo')?.setValue('empresa');
      fixture.detectChanges();
      
      const empresaControl = component.registerForm.get('empresa');
      expect(empresaControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('Criterio 2: Registro exitoso', () => {
    it('debe crear cuenta e iniciar sesión automáticamente con datos válidos', (done) => {
      const mockRegisterResponse = {
        msg: 'Usuario registrado exitosamente',
        usuario: {
          _id: '123',
          nombre: 'Juan Pérez',
          email: 'juan@test.com',
          tipo: 'cliente' as const
        }
      };

      const mockLoginResponse = {
        msg: 'Login exitoso',
        token: 'fake-token',
        usuario: mockRegisterResponse.usuario,
        expiresIn: '24h'
      };

      authService.register.and.returnValue(of(mockRegisterResponse));
      authService.login.and.returnValue(of(mockLoginResponse));

      component.registerForm.patchValue({
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        tipo: 'cliente'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(authService.register).toHaveBeenCalled();
        expect(authService.login).toHaveBeenCalled();
        expect(component.successMessage).toContain('Bienvenido');
        expect(component.successMessage).toContain('Juan Pérez');
        done();
      }, 100);
    });

    it('debe mostrar mensaje de bienvenida al registrarse exitosamente', (done) => {
      const mockResponse = {
        msg: 'Usuario registrado exitosamente',
        usuario: {
          _id: '123',
          nombre: 'María García',
          email: 'maria@test.com',
          tipo: 'cliente' as const
        }
      };

      authService.register.and.returnValue(of(mockResponse));
      authService.login.and.returnValue(of({
        msg: 'Login exitoso',
        token: 'token',
        usuario: mockResponse.usuario,
        expiresIn: '24h'
      }));

      component.registerForm.patchValue({
        nombre: 'María García',
        email: 'maria@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        tipo: 'cliente'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.successMessage).toContain('Bienvenido');
        expect(component.successMessage).toContain('María García');
        done();
      }, 100);
    });

    it('debe redirigir al dashboard después de registro exitoso', (done) => {
      const mockResponse = {
        msg: 'Usuario registrado exitosamente',
        usuario: {
          _id: '123',
          nombre: 'Test User',
          email: 'test@test.com',
          tipo: 'cliente' as const
        }
      };

      authService.register.and.returnValue(of(mockResponse));
      authService.login.and.returnValue(of({
        msg: 'Login exitoso',
        token: 'token',
        usuario: mockResponse.usuario,
        expiresIn: '24h'
      }));

      component.registerForm.patchValue({
        nombre: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        tipo: 'cliente'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
        done();
      }, 2100);
    });
  });

  describe('Criterio 3: Validaciones', () => {
    it('debe mostrar error si campos están vacíos', () => {
      component.registerForm.patchValue({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        tipo: ''
      });

      component.onSubmit();

      expect(component.registerForm.invalid).toBeTruthy();
      expect(component.serverError).toContain('completa todos los campos');
    });

    it('debe validar formato de email', () => {
      const emailControl = component.registerForm.get('email');
      
      emailControl?.setValue('correo-invalido');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('correo@valido.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('debe validar longitud mínima de contraseña (6 caracteres)', () => {
      const passwordControl = component.registerForm.get('password');
      
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
      
      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBeFalsy();
    });

    it('debe validar que las contraseñas coincidan', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password456'
      });

      expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();

      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });

      expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
    });

    it('debe validar longitud mínima del nombre (3 caracteres)', () => {
      const nombreControl = component.registerForm.get('nombre');
      
      nombreControl?.setValue('AB');
      expect(nombreControl?.hasError('minlength')).toBeTruthy();
      
      nombreControl?.setValue('ABC');
      expect(nombreControl?.hasError('minlength')).toBeFalsy();
    });

    it('no debe crear cuenta si hay errores de validación', () => {
      component.registerForm.patchValue({
        nombre: 'A', // muy corto
        email: 'email-invalido', // formato incorrecto
        password: '123', // muy corta
        confirmPassword: '456', // no coincide
        tipo: ''
      });

      component.onSubmit();

      expect(authService.register).not.toHaveBeenCalled();
      expect(component.serverError).toBeTruthy();
    });
  });

  describe('Criterio 4: Correo duplicado', () => {
    it('debe mostrar error "El correo ya está registrado" cuando el correo existe', (done) => {
      const mockError = {
        error: {
          msg: 'Ya existe un usuario con ese email'
        }
      };

      authService.register.and.returnValue(throwError(() => mockError));

      component.registerForm.patchValue({
        nombre: 'Juan Pérez',
        email: 'existente@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        tipo: 'cliente'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.serverError).toBe('El correo ya está registrado');
        expect(authService.login).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('no debe crear cuenta cuando el correo ya existe', (done) => {
      const mockError = {
        error: {
          msg: 'Ya existe un usuario con ese email'
        }
      };

      authService.register.and.returnValue(throwError(() => mockError));

      component.registerForm.patchValue({
        nombre: 'Test User',
        email: 'duplicado@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        tipo: 'cliente'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.isLoading).toBeFalsy();
        expect(component.successMessage).toBe('');
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Navegación', () => {
    it('debe navegar a login cuando se hace clic en "Inicia sesión aquí"', () => {
      component.goToLogin(new Event('click'));
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debe redirigir a dashboard si el usuario ya está autenticado', () => {
      authService.isAuthenticated.and.returnValue(true);
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Tipo de usuario empresa', () => {
    it('debe agregar validación requerida a empresa cuando tipo es "empresa"', () => {
      const empresaControl = component.registerForm.get('empresa');
      
      // Inicialmente no es requerido
      expect(empresaControl?.hasError('required')).toBeFalsy();
      
      // Cambiar a empresa
      component.registerForm.get('tipo')?.setValue('empresa');
      empresaControl?.markAsTouched();
      
      // Ahora debe ser requerido
      expect(empresaControl?.hasError('required')).toBeTruthy();
    });

    it('debe remover validación de empresa cuando tipo no es "empresa"', () => {
      component.registerForm.get('tipo')?.setValue('empresa');
      fixture.detectChanges();
      
      const empresaControl = component.registerForm.get('empresa');
      empresaControl?.markAsTouched();
      expect(empresaControl?.hasError('required')).toBeTruthy();
      
      // Cambiar a cliente
      component.registerForm.get('tipo')?.setValue('cliente');
      expect(empresaControl?.hasError('required')).toBeFalsy();
    });
  });
});
