import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated']);
    spy.isAuthenticated.and.returnValue(false);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        RegisterComponent
      ],
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('nombre')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.registerForm.get('tipo')?.value).toBe('');
  });

  it('should validate required fields', () => {
    expect(component.registerForm.valid).toBeFalsy();
    
    const nombre = component.registerForm.get('nombre');
    const email = component.registerForm.get('email');
    const password = component.registerForm.get('password');
    const confirmPassword = component.registerForm.get('confirmPassword');
    const tipo = component.registerForm.get('tipo');
    
    expect(nombre?.errors?.['required']).toBeTruthy();
    expect(email?.errors?.['required']).toBeTruthy();
    expect(password?.errors?.['required']).toBeTruthy();
    expect(confirmPassword?.errors?.['required']).toBeTruthy();
    expect(tipo?.errors?.['required']).toBeTruthy();
  });

  it('should validate password match', () => {
    const password = component.registerForm.get('password');
    const confirmPassword = component.registerForm.get('confirmPassword');

    // Set valid values for all required fields to isolate password validation
    component.registerForm.patchValue({
      nombre: 'Test User',
      email: 'test@example.com',
      tipo: 'cliente'
    });

    // Test mismatched passwords
    password?.setValue('password123');
    confirmPassword?.setValue('password124');
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();

    // Test matching passwords
    confirmPassword?.setValue('password123');
    expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should call register service on valid form submission', fakeAsync(() => {
    const testUser = {
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      tipo: 'cliente' as const
    };

    const mockResponse = {
      msg: 'Registro exitoso',
      usuario: {
        _id: '1',
        nombre: 'Test User',
        email: 'test@example.com',
        tipo: 'cliente' as const
      }
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));

    component.registerForm.patchValue(testUser);
    component.onSubmit();
    tick();

    const expectedRegisterData = {
      nombre: testUser.nombre,
      email: testUser.email,
      password: testUser.password,
      tipo: testUser.tipo
    };

    expect(authServiceSpy.register).toHaveBeenCalledWith(expectedRegisterData);
    expect(component.successMessage).toContain('Registro exitoso');
  }));

  it('should handle registration error', fakeAsync(() => {
    const testUser = {
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      tipo: 'cliente' as const
    };

    const mockError = {
      status: 400,
      error: { msg: 'Error en el registro' }
    };

    authServiceSpy.register.and.returnValue(throwError(() => mockError));

    component.registerForm.patchValue(testUser);
    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe(mockError.error.msg);
    expect(component.isLoading).toBeFalse();
  }));
});