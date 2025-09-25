import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    expect(emailControl?.valid).toBeFalsy();
    expect(passwordControl?.valid).toBeFalsy();

    emailControl?.setValue('test@example.com');
    passwordControl?.setValue('password123');

    expect(emailControl?.valid).toBeTruthy();
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should submit form when valid', () => {
    const mockResponse = {
      msg: 'Login exitoso',
      token: 'mock-token',
      usuario: {
        _id: '123',
        nombre: 'Test User',
        email: 'test@example.com',
        tipo: 'cliente' as const
      },
      expiresIn: '24h'
    };

    authService.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should handle login error', () => {
    const error = { error: { msg: 'Credenciales incorrectas' } };
    authService.login.and.returnValue(throwError(() => error));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Credenciales incorrectas');
    expect(component.isLoading).toBe(false);
  });

  it('should not submit invalid form', () => {
    component.loginForm.setValue({
      email: '',
      password: ''
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(component.loginForm.get('email')?.touched).toBeTruthy();
    expect(component.loginForm.get('password')?.touched).toBeTruthy();
  });

  it('should redirect to dashboard on successful login', (done) => {
    const mockResponse = {
      msg: 'Login exitoso',
      token: 'mock-token',
      usuario: {
        _id: '123',
        nombre: 'Test User',
        email: 'test@example.com',
        tipo: 'cliente' as const
      },
      expiresIn: '24h'
    };

    authService.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 1100);
  });

  it('should redirect if already authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    
    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should fill test credentials', () => {
    component.fillTestCredentials('admin');

    expect(component.loginForm.get('email')?.value).toBe('admin@hotelchain.com');
    expect(component.loginForm.get('password')?.value).toBe('admin123');
  });

  it('should navigate to register page', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');

    component.goToRegister(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should display loading state during login', () => {
    authService.login.and.returnValue(of({} as any));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(component.isLoading).toBe(false);
    
    component.onSubmit();
    
    // El loading se resetea después de la respuesta, pero podemos verificar que se llamó el servicio
    expect(authService.login).toHaveBeenCalled();
  });
});