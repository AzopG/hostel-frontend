import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent - HU02', () => {
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
    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with rememberMe false', () => {
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('CA1: should redirect cliente to mis-reservas', (done) => {
    authService.login.and.returnValue(of({
      msg: 'OK',
      token: 't1',
      usuario: { _id: '1', nombre: 'Test', email: 'test@test.com', tipo: 'cliente' as const },
      expiresIn: '24h'
    }));
    component.loginForm.patchValue({ email: 'test@test.com', password: 'pass123' });
    component.onSubmit();
    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard/mis-reservas']);
      done();
    }, 1100);
  });

  it('CA2: should show "Credenciales inválidas"', (done) => {
    authService.login.and.returnValue(throwError(() => ({ status: 401, error: {} })));
    component.loginForm.patchValue({ email: 'bad@test.com', password: 'wrong' });
    component.onSubmit();
    setTimeout(() => {
      expect(component.errorMessage).toBe('Credenciales inválidas');
      done();
    }, 100);
  });

  it('CA3: should show error for empty fields', () => {
    component.loginForm.patchValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Por favor, completa todos los campos requeridos');
  });

  it('CA4: should send rememberMe value', (done) => {
    authService.login.and.returnValue(of({
      msg: 'OK',
      token: 't1',
      usuario: { _id: '1', nombre: 'Test', email: 'test@test.com', tipo: 'cliente' as const },
      expiresIn: '24h'
    }));
    component.loginForm.patchValue({ email: 'test@test.com', password: 'pass123', rememberMe: true });
    component.onSubmit();
    setTimeout(() => {
      const callArgs = authService.login.calls.mostRecent().args[0];
      expect(callArgs.rememberMe).toBe(true);
      done();
    }, 100);
  });
});
