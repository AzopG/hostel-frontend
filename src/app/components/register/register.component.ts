import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <!-- Navegación superior -->
      <div class="navigation-header">
        <button class="btn-volver" (click)="volver()" title="Volver al inicio">
          <span class="back-icon"><img src="Hotel.png" alt="Hotel Paradise" class="brand-logo-small"></span>
          <span>Volver al Inicio</span>
        </button>
      </div>

      <!-- Fondo decorativo -->
      <div class="background-decoration"></div>

      <!-- Layout de dos columnas -->
      <div class="register-layout">
        <!-- Columna izquierda - Imagen -->
        <div class="image-section">
          <div class="image-container">
            <img src="registro.png" alt="Registro Hotel Paradise" class="register-image">
            <div class="image-overlay">
              <div class="welcome-text">
                <h2>Únete a Hotel Paradise</h2>
                <p>Descubre una nueva forma de gestionar tu experiencia hotelera</p>
                <div class="features-list">
                  <div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Reservas en línea</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Gestión completa</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Soporte 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna derecha - Formulario -->
        <div class="form-section">
          <div class="register-card">
            <div class="register-header">
              <div class="brand-section">
                <span class="brand-icon"><img src="Hotel.png" alt="Hotel Paradise" class="brand-logo"></span>
                <h1>Hotel Paradise</h1>
              </div>
              <h2>Crear Cuenta</h2>
              <p>Regístrate para acceder al sistema hotelero</p>
            </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <!-- Nombre -->
          <div class="form-group">
            <label for="nombre">Nombre completo <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-user"></i></span>
              <input
                id="nombre"
                type="text"
                formControlName="nombre"
                placeholder="Ingresa tu nombre completo"
                [class.error]="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched"
              />
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched"
            >
              <span *ngIf="registerForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
              <span *ngIf="registerForm.get('nombre')?.errors?.['minlength']">El nombre debe tener al menos 3 caracteres</span>
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Correo electrónico <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-envelope"></i></span>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="admin@hotelchain.com"
                [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
              <span *ngIf="registerForm.get('email')?.errors?.['required']">El correo es requerido</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Formato de correo inválido</span>
            </div>
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label for="password">Contraseña <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
              <span *ngIf="registerForm.get('password')?.errors?.['required']">La contraseña es requerida</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
            </div>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Repite tu contraseña"
                [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              />
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            >
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Debes confirmar tu contraseña</span>
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
            >
              <span>Las contraseñas no coinciden</span>
            </div>
          </div>

          <!-- Tipo de usuario -->
          <div class="form-group">
            <label for="tipo">Tipo de cuenta <span class="required">*</span></label>
            <div class="select-wrapper">
              <span class="input-icon"><i class="fas fa-tag"></i></span>
              <select
                id="tipo"
                formControlName="tipo"
                [class.error]="registerForm.get('tipo')?.invalid && registerForm.get('tipo')?.touched"
              >
                <option value="">Selecciona un tipo</option>
                <option value="cliente">Cliente</option>
                <option value="empresa">Empresa</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('tipo')?.invalid && registerForm.get('tipo')?.touched"
            >
              <span *ngIf="registerForm.get('tipo')?.errors?.['required']">Debes seleccionar un tipo de cuenta</span>
            </div>
          </div>

          <!-- Empresa (solo si tipo es 'empresa') -->
          <div class="form-group empresa-field" *ngIf="registerForm.get('tipo')?.value === 'empresa'">
            <label for="empresa">Nombre de la empresa <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="input-icon"><i class="fas fa-building"></i></span>
              <input
                id="empresa"
                type="text"
                formControlName="empresa"
                placeholder="Ingresa el nombre de tu empresa"
                [class.error]="registerForm.get('empresa')?.invalid && registerForm.get('empresa')?.touched"
              />
            </div>
            <div 
              class="error-message" 
              *ngIf="registerForm.get('empresa')?.invalid && registerForm.get('empresa')?.touched"
            >
              <span *ngIf="registerForm.get('empresa')?.errors?.['required']">El nombre de la empresa es requerido</span>
            </div>
          </div>

          <!-- Error general del servidor -->
          <div class="alert error-alert" *ngIf="serverError">
            <span class="alert-icon"><i class="fas fa-exclamation-triangle"></i></span>
            <strong>{{ serverError }}</strong>
          </div>

          <!-- Success message -->
          <div class="alert success-alert" *ngIf="successMessage">
            <span class="alert-icon"><i class="fas fa-check-circle"></i></span>
            {{ successMessage }}
          </div>

          <!-- Submit button -->
          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="loading-spinner"></span>
            <span class="btn-text">{{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
          </button>
        </form>

        <!-- Links adicionales -->
        <div class="register-footer">
          <p>¿Ya tienes cuenta? <a href="#" (click)="goToLogin($event)" class="login-link">Inicia sesión aquí</a></p>
        </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1C2526 0%, #0A3161 50%, #4A1B2F 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
      font-family: 'Playfair Display', 'Georgia', serif;
    }

    .background-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(184, 151, 120, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(74, 27, 47, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .navigation-header {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
    }

    .btn-volver {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
      color: #1C2526;
      border: 2px solid rgba(184, 151, 120, 0.5);
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(15px);
      font-size: 0.95rem;
      text-shadow: none;
      font-family: 'Playfair Display', serif;
      letter-spacing: 0.5px;
    }

    .btn-volver:hover {
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      color: #F8F1E9;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.4);
      border-color: #F8F1E9;
    }

    /* Layout de dos columnas */
    .register-layout {
      display: flex;
      min-height: 100vh;
      max-width: 1400px;
      margin: 0 auto;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
    }

    /* Sección de imagen */
    .image-section {
      flex: 1;
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #1C2526 0%, #4A1B2F 50%, #B89778 100%);
    }

    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .register-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
      transition: all 0.6s ease;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(28, 37, 38, 0.85) 0%,
        rgba(74, 27, 47, 0.75) 50%,
        rgba(184, 151, 120, 0.65) 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .welcome-text {
      text-align: center;
      color: #F8F1E9;
      max-width: 400px;
    }

    .welcome-text h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 1px;
    }

    .welcome-text p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.95;
      line-height: 1.6;
      font-family: 'Crimson Text', serif;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.1rem;
      font-weight: 500;
      font-family: 'Crimson Text', serif;
    }

    .feature-item i {
      color: #B89778;
      font-size: 1.2rem;
      filter: drop-shadow(0 0 4px rgba(184, 151, 120, 0.5));
    }

    /* Sección del formulario */
    .form-section {
      flex: 1;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 1rem;
      background: rgba(248, 241, 233, 0.5);
    }

    .back-icon {
      font-size: 1.2rem;
      color: #B89778;
      filter: drop-shadow(0 0 4px rgba(184, 151, 120, 0.3));
    }

    .btn-volver:hover .back-icon {
      color: #F8F1E9;
    }

    .register-card {
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);
      backdrop-filter: blur(25px);
      border-radius: 25px;
      box-shadow: 0 25px 50px rgba(28, 37, 38, 0.2);
      border: 2px solid rgba(184, 151, 120, 0.3);
      padding: 30px;
      width: 100%;
      height: 100%;
      min-height: calc(100vh - 2rem);
      max-height: none;
      overflow-y: auto;
      margin: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      position: relative;
      z-index: 2;
    }

    .register-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #B89778 0%, #4A1B2F 50%, #0A3161 100%);
      border-radius: 25px 25px 0 0;
    }

    .register-header {
      text-align: center;
      margin-bottom: 30px;
      flex-shrink: 0;
    }

    .brand-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 15px;
    }

    .brand-icon {
      font-size: 2.2rem;
      color: #B89778;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      transition: all 0.3s ease;
    }

    .brand-logo-small {
      width: 30px;
      height: 30px;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
      transition: all 0.3s ease;
    }

    .brand-logo:hover,
    .brand-logo-small:hover {
      filter: drop-shadow(0 0 12px rgba(184, 151, 120, 0.8)) drop-shadow(2px 2px 6px rgba(0,0,0,0.4));
      transform: scale(1.05);
    }

    .brand-section h1 {
      color: #1C2526;
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 2px;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .register-header h2 {
      color: #1C2526;
      margin-bottom: 12px;
      font-size: 2rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      letter-spacing: 1px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .register-header p {
      color: #4A1B2F;
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
    }

    .register-form {
      margin-bottom: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 0;
    }

    .form-group {
      margin-bottom: 20px;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .empresa-field {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #1C2526;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      font-family: 'Playfair Display', serif;
    }

    .required {
      color: #4A1B2F;
      font-weight: 700;
    }

    .input-wrapper, .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.1rem;
      color: #B89778;
      z-index: 1;
      filter: drop-shadow(0 0 2px rgba(184, 151, 120, 0.3));
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 15px 15px 15px 50px;
      border: 2px solid rgba(184, 151, 120, 0.3);
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: rgba(255, 255, 255, 0.8);
      color: #1C2526;
      font-weight: 500;
      letter-spacing: 0.3px;
      font-family: 'Crimson Text', serif;
      backdrop-filter: blur(10px);
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #B89778;
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.2);
    }

    .form-group input::placeholder {
      color: rgba(28, 37, 38, 0.6);
      font-style: italic;
    }

    .form-group input.error,
    .form-group select.error {
      border-color: #4A1B2F;
      background: rgba(74, 27, 47, 0.05);
    }

    .select-wrapper {
      position: relative;
    }

    .select-arrow {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #B89778;
      pointer-events: none;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .form-group select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
    }

    .error-message {
      color: #4A1B2F;
      font-size: 0.85rem;
      margin-top: 6px;
      font-weight: 500;
      letter-spacing: 0.3px;
      padding-left: 8px;
    }

    .alert {
      padding: 15px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      letter-spacing: 0.3px;
      backdrop-filter: blur(10px);
    }

    .error-alert {
      background: rgba(74, 27, 47, 0.1);
      border: 2px solid rgba(74, 27, 47, 0.3);
      color: #4A1B2F;
    }

    .success-alert {
      background: rgba(184, 151, 120, 0.1);
      border: 2px solid rgba(184, 151, 120, 0.3);
      color: #1C2526;
    }

    .alert-icon {
      font-size: 1.2rem;
      filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
    }

    .submit-btn {
      width: 100%;
      padding: 18px 24px;
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      color: #F8F1E9;
      border: 2px solid #B89778;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-family: 'Cormorant Garamond', serif;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: auto;
      margin-bottom: 0;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.4);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.6s;
    }

    .submit-btn:hover::before {
      left: 100%;
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #4A1B2F 0%, #0A3161 100%);
      border-color: #F8F1E9;
      transform: translateY(-4px);
      box-shadow: 0 12px 35px rgba(74, 27, 47, 0.6);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(248, 241, 233, 0.3);
      border-top: 2px solid #F8F1E9;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-text {
      position: relative;
      z-index: 1;
    }

    .register-footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 25px;
      border-top: 2px solid rgba(184, 151, 120, 0.3);
    }

    .register-footer p {
      color: #4A1B2F;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .login-link {
      color: #B89778;
      text-decoration: none;
      font-weight: 700;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      position: relative;
    }

    .login-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #B89778, #4A1B2F);
      transition: width 0.3s ease;
    }

    .login-link:hover::after {
      width: 100%;
    }

    .login-link:hover {
      color: #4A1B2F;
      transform: translateY(-1px);
    }

    /* Scrollbar personalizada */
    .register-card::-webkit-scrollbar {
      width: 8px;
    }

    .register-card::-webkit-scrollbar-track {
      background: rgba(248, 241, 233, 0.3);
      border-radius: 10px;
    }

    .register-card::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #B89778, #4A1B2F);
      border-radius: 10px;
    }

    .register-card::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #4A1B2F, #0A3161);
    }

    /* Responsive Design */
    /* Responsive Design */
    @media (max-width: 1200px) {
      .register-layout {
        max-width: 100%;
        margin: 0;
        border-radius: 0;
      }

      .welcome-text h2 {
        font-size: 2.2rem;
      }

      .welcome-text p {
        font-size: 1.1rem;
      }
    }

    @media (max-width: 992px) {
      .register-layout {
        flex-direction: column;
        min-height: auto;
      }

      .image-section {
        min-height: 50vh;
        flex: none;
      }

      .form-section {
        flex: none;
        padding: 2rem 1rem;
      }

      .welcome-text {
        max-width: 500px;
      }

      .welcome-text h2 {
        font-size: 2rem;
      }

      .features-list {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
      }

      .feature-item {
        flex: 1;
        min-width: 150px;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .register-container {
        padding: 0;
        flex-direction: column;
      }

      .form-section {
        padding: 0.5rem;
      }

      .register-card {
        min-height: 60vh;
        padding: 25px;
        border-radius: 20px;
      }

      .navigation-header {
        top: 15px;
        left: 15px;
      }

      .btn-volver {
        padding: 10px 16px;
        font-size: 0.9rem;
        gap: 8px;
      }

      .image-section {
        min-height: 40vh;
      }

      .image-overlay {
        padding: 2rem 1rem;
      }

      .welcome-text h2 {
        font-size: 1.8rem;
      }

      .welcome-text p {
        font-size: 1rem;
      }

      .features-list {
        flex-direction: column;
        gap: 0.8rem;
      }

      .feature-item {
        font-size: 1rem;
        justify-content: flex-start;
      }

      .form-section {
        padding: 1.5rem 1rem;
      }

      .register-card {
        padding: 30px 25px;
        max-width: 100%;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(28, 37, 38, 0.2);
      }

      .brand-section h1 {
        font-size: 1.5rem;
        letter-spacing: 1px;
      }

      .register-header h2 {
        font-size: 1.7rem;
      }

      .register-header p {
        font-size: 0.9rem;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group input,
      .form-group select {
        padding: 14px 14px 14px 45px;
        font-size: 0.95rem;
      }

      .input-icon {
        left: 12px;
        font-size: 1rem;
      }

      .submit-btn {
        padding: 16px 20px;
        font-size: 1rem;
        margin-top: auto;
      }
    }
        letter-spacing: 1px;
      }
    }

    @media (max-width: 480px) {
      .image-section {
        min-height: 35vh;
      }

      .welcome-text h2 {
        font-size: 1.6rem;
      }

      .welcome-text p {
        font-size: 0.95rem;
      }

      .register-card {
        padding: 25px 20px;
        border-radius: 15px;
        min-height: calc(100vh - 35vh - 1rem);
        height: auto;
      }

      .brand-section {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }

      .brand-logo {
        width: 35px;
        height: 35px;
        margin-bottom: 10px;
      }

      .brand-section h1 {
        font-size: 1.3rem;
      }

      .register-header h2 {
        font-size: 1.5rem;
      }

      .form-group input,
      .form-group select {
        padding: 12px 12px 12px 40px;
        font-size: 0.9rem;
      }

      .input-icon {
        left: 10px;
        font-size: 0.9rem;
      }

      .submit-btn {
        padding: 14px 18px;
        font-size: 0.95rem;
      }

      .feature-item {
        font-size: 0.95rem;
      }
    }

    /* Landscape orientation adjustments */
    @media (max-width: 768px) and (orientation: landscape) {
      .register-container {
        padding: 10px;
      }

      .register-card {
        max-height: 95vh;
        padding: 20px;
      }

      .register-header {
        margin-bottom: 20px;
      }

      .brand-section {
        margin-bottom: 15px;
      }

      .form-group {
        margin-bottom: 15px;
      }
    }

    /* Orientación horizontal para tablets */
    @media (max-height: 600px) and (orientation: landscape) and (min-width: 768px) {
      .register-container {
        min-height: 100vh;
        padding: 15px;
      }

      .register-card {
        min-height: auto;
        max-height: 85vh;
        overflow-y: auto;
      }

      .image-section {
        min-height: 85vh;
      }

      .welcome-text {
        padding: 20px;
      }

      .welcome-text h2 {
        font-size: 2rem;
        margin-bottom: 8px;
      }

      .welcome-text p {
        font-size: 0.95rem;
        margin-bottom: 15px;
      }

      .features-list {
        gap: 8px;
      }

      .feature-item {
        font-size: 0.9rem;
      }
    }

    /* Móviles en landscape */
    @media (max-height: 480px) and (orientation: landscape) {
      .register-container {
        flex-direction: row;
        gap: 20px;
        padding: 10px;
      }

      .image-section {
        min-height: 100vh;
        flex: 0 0 45%;
      }

      .register-card {
        flex: 0 0 50%;
        min-height: auto;
        max-height: 95vh;
        overflow-y: auto;
        padding: 20px;
      }

      .welcome-text {
        padding: 15px;
      }

      .welcome-text h2 {
        font-size: 1.5rem;
        margin-bottom: 5px;
      }

      .welcome-text p {
        font-size: 0.85rem;
        margin-bottom: 10px;
      }

      .features-list {
        gap: 6px;
      }

      .feature-item {
        font-size: 0.8rem;
      }
    }

    /* Animaciones suaves */
    .register-container * {
      transition: all 0.3s ease;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(26, 188, 156, 0.3);
    }

    .form-group:focus-within .input-icon {
      color: #1abc9c;
      transform: scale(1.1);
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #1abc9c;
      box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.1);
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  serverError = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializar el formulario con validaciones
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      empresa: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    // Listener para el cambio de tipo de usuario
    this.registerForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const empresaControl = this.registerForm.get('empresa');
      if (tipo === 'empresa') {
        empresaControl?.setValidators([Validators.required]);
      } else {
        empresaControl?.clearValidators();
        empresaControl?.setValue('');
      }
      empresaControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Manejar el envío del formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    // Validar que el formulario sea válido
    if (this.registerForm.invalid) {
      this.serverError = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    this.serverError = '';
    this.successMessage = '';

    // Preparar datos para enviar
    const { confirmPassword, ...userData } = this.registerForm.value;
    const registerData: RegisterRequest = userData;

    // Llamar al servicio de registro
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response && response.usuario) {
          // Registro exitoso
          this.successMessage = `¡Bienvenido ${response.usuario.nombre}! Tu cuenta ha sido creada exitosamente. Iniciando sesión...`;
          
          // Iniciar sesión automáticamente
          const loginData: LoginRequest = {
            email: registerData.email,
            password: registerData.password
          };

          this.authService.login(loginData).subscribe({
            next: (loginResponse) => {
              if (loginResponse) {
                // Navegación inmediata
                this.router.navigate(['/dashboard']);
              }
            },
            error: (loginError) => {
              // Si falla el login automático, redirigir a login manual
              this.successMessage = 'Cuenta creada exitosamente. Redirigiendo al inicio de sesión...';
              // Navegación inmediata al login
              this.router.navigate(['/login']);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        // Manejar errores específicos del servidor
        if (error.error?.msg) {
          const errorMsg = error.error.msg;
          
          // Error de correo duplicado (Criterio 4)
          if (errorMsg.includes('ya existe') || errorMsg.includes('email')) {
            this.serverError = 'El correo ya está registrado';
          } else {
            this.serverError = errorMsg;
          }
        } else {
          this.serverError = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Navegar a la página de login
   */
  goToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  /**
   * Volver al inicio
   */
  volver(): void {
    this.router.navigate(['/']);
  }
}
