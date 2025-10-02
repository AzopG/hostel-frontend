﻿import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    spy.isAuthenticated.and.returnValue(false);
    
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    expect(form.valid).toBeFalsy();
    
    const email = form.get('email');
    const password = form.get('password');
    
    expect(email?.errors?.['required']).toBeTruthy();
    expect(password?.errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.errors?.['email']).toBeTruthy();
    
    email?.setValue('valid@email.com');
    expect(email?.errors?.['email']).toBeFalsy();
  });

  it('should show validation errors when form is submitted empty', () => {
    component.onSubmit();
    expect(component.errorMessage).toBe('Por favor, completa todos los campos requeridos');
  });

  it('should call auth service when form is valid', fakeAsync(() => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    };

    authServiceSpy.login.and.returnValue(of({ 
      msg: 'Login exitoso',
      token: 'fake-jwt-token',
      expiresIn: '3600',
      usuario: { 
        _id: '123',
        nombre: 'Test User',
        email: 'test@example.com',
        tipo: 'cliente'
      }
    }));

    component.loginForm.patchValue(credentials);
    component.onSubmit();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith(credentials);
    expect(component.successMessage).toContain('Bienvenido Test User');
  }));

  it('should handle login error', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    };

    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.loginForm.patchValue(credentials);
    component.onSubmit();

    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to dashboard if already authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate based on user role after successful login', fakeAsync(() => {
    const credentials = {
      email: 'admin@test.com',
      password: 'password',
      rememberMe: false
    };

    authServiceSpy.login.and.returnValue(of({
      msg: 'Login exitoso',
      token: 'fake-jwt-token',
      expiresIn: '3600',
      usuario: {
        _id: '456',
        nombre: 'Admin',
        email: 'admin@test.com',
        tipo: 'admin_central'
      }
    }));

    component.loginForm.patchValue(credentials);
    component.onSubmit();
    tick(1000);

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/hoteles']);
  }));

  it('should handle volver() navigation', () => {
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should prevent default and navigate on goToRegister()', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    
    component.goToRegister(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });
});