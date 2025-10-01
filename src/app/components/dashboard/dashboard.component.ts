import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { AppState } from '../../store';
import * as HotelActions from '../../store/actions/hotel.actions';
import * as HotelSelectors from '../../store/selectors/hotel.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  animations: [
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-50px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="dashboard">
      <!-- Header profesional -->
      <nav class="navbar" [@fadeInUp]>
        <div class="container-fluid">
          <div class="navbar-content">
            <div class="navbar-brand">
              <div class="brand-icon">🏨</div>
              <div class="brand-text">
                <h4 class="mb-0">Hotel Management</h4>
                <small class="user-info" *ngIf="currentUser">{{ currentUser.nombre }} - {{ getUserRole() }}</small>
              </div>
            </div>
            
            <!-- Stats dinámicas -->
            <div class="quick-stats">
              <div class="stat-item" [@fadeInUp]>
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getDashboardStats().reservas }}</div>
                  <div class="stat-label">Reservas</div>
                </div>
              </div>
              <div class="stat-item" [@fadeInUp]>
                <div class="stat-icon">🏨</div>
                <div class="stat-info">
                  <div class="stat-number">{{ getDashboardStats().hoteles }}</div>
                  <div class="stat-label">Hoteles</div>
                </div>
              </div>
              <div class="stat-item" [@fadeInUp]>
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-number">\${{ getDashboardStats().ingresos }}</div>
                  <div class="stat-label">Ingresos</div>
                </div>
              </div>
            </div>

            <!-- Acciones rápidas -->
            <div class="header-actions">
              <button class="action-btn home" (click)="goToHome()" title="Ir a Inicio">
                <span class="emoji">🏠</span>
              </button>
              <button class="btn-logout" (click)="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <!-- Layout mejorado -->
      <div class="dashboard-layout">
        <!-- Sidebar animado -->
        <aside class="sidebar" [@slideInLeft]>
          <div class="sidebar-header">
            <h5 class="sidebar-title">Panel de Control</h5>
            <div class="sidebar-subtitle">Gestión Hotelera</div>
          </div>
          
          <nav class="sidebar-nav">
            <div class="nav-section">
              <div class="section-header">Principal</div>
              
              <!-- Buscar Habitaciones - Para Clientes -->
              <a *ngIf="currentUser?.tipo === 'cliente'" 
                 class="nav-item" 
                 routerLink="/buscar-habitaciones" 
                 [@listAnimation]="0">
                <div class="nav-icon">
                  <span class="emoji">🔍</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Buscar Habitaciones</span>
                  <span class="nav-description">Encuentra tu habitación ideal</span>
                </div>
              </a>

              <!-- Mis Reservas - Para Clientes -->
              <a *ngIf="currentUser?.tipo === 'cliente'" 
                 class="nav-item" 
                 routerLink="/mis-reservas" 
                 [@listAnimation]="1">
                <div class="nav-icon">
                  <span class="emoji">📅</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Mis Reservas</span>
                  <span class="nav-description">Ver y gestionar reservas</span>
                </div>
              </a>

              <!-- Disponibilidad - Para Clientes -->
              <a *ngIf="currentUser?.tipo === 'cliente'" 
                 class="nav-item" 
                 routerLink="/disponibilidad-ciudad" 
                 [@listAnimation]="2">
                <div class="nav-icon">
                  <span class="emoji">📊</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Disponibilidad</span>
                  <span class="nav-description">Ver calendario por ciudad</span>
                </div>
              </a>

              <!-- Buscar Salones - Para Empresas -->
              <a *ngIf="currentUser?.tipo === 'empresa'" 
                 class="nav-item" 
                 routerLink="/busqueda-salones" 
                 [@listAnimation]="0">
                <div class="nav-icon">
                  <span class="emoji">🏛️</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Buscar Salones</span>
                  <span class="nav-description">Encuentra salones para eventos</span>
                </div>
              </a>

              <!-- Mis Reservas - Para Empresas -->
              <a *ngIf="currentUser?.tipo === 'empresa'" 
                 class="nav-item" 
                 routerLink="/mis-reservas" 
                 [@listAnimation]="1">
                <div class="nav-icon">
                  <span class="emoji">📋</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Mis Reservas</span>
                  <span class="nav-description">Gestionar eventos y reservas</span>
                </div>
              </a>

              <!-- Hoteles -->
              <a *ngIf="currentUser?.tipo === 'admin_central'" 
                 class="nav-item" 
                 routerLink="/dashboard/hoteles" 
                 routerLinkActive="active"
                 [@listAnimation]="0">
                <div class="nav-icon">
                  <span class="emoji">🏨</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Hoteles</span>
                  <span class="nav-badge">5</span>
                </div>
              </a>
              
              <!-- Usuarios -->
              <a *ngIf="canAccessSection('usuarios')" 
                 class="nav-item" 
                 routerLink="/dashboard/usuarios" 
                 routerLinkActive="active"
                 [@listAnimation]="1">
                <div class="nav-icon">
                  <span class="emoji">👥</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Usuarios</span>
                  <span class="nav-badge">{{ getUsersCount() }}</span>
                </div>
              </a>
              
              <!-- Habitaciones -->
              <a *ngIf="canAccessSection('habitaciones')" 
                 class="nav-item" 
                 routerLink="/dashboard/habitaciones" 
                 routerLinkActive="active"
                 [@listAnimation]="2">
                <div class="nav-icon">
                  <span class="emoji">🛏️</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Habitaciones</span>
                  <span class="nav-badge">{{ getRoomsCount() }}</span>
                </div>
              </a>
              
              <!-- Salones -->
              <a *ngIf="canAccessSection('salones')" 
                 class="nav-item" 
                 routerLink="/dashboard/salones" 
                 routerLinkActive="active"
                 [@listAnimation]="3">
                <div class="nav-icon">
                  <i class="fas fa-glass-cheers"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Salones</span>
                  <span class="nav-badge">8</span>
                </div>
              </a>
              
              <!-- Reservas -->
              <a class="nav-item" 
                 routerLink="/dashboard/reservas" 
                 routerLinkActive="active"
                 [@listAnimation]="4">
                <div class="nav-icon">
                  <span class="emoji">📅</span>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Reservas</span>
                  <span class="nav-badge new">{{ getActiveReservations() }}</span>
                </div>
              </a>
              

              
              <!-- Reportes -->
              <a *ngIf="canAccessSection('reportes')" 
                 class="nav-item" 
                 routerLink="/dashboard/reportes" 
                 routerLinkActive="active"
                 [@listAnimation]="9">
                <div class="nav-icon">
                  <i class="fas fa-chart-bar"></i>
                </div>
                <div class="nav-content">
                  <span class="nav-label">Reportes</span>
                </div>
              </a>
            </div>
          </nav>
        </aside>
        
        <!-- Contenido principal -->
        <main class="main-content">
          <div class="content-wrapper" [@fadeInUp]>
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Diseño base de lujo */
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #1C2526 0%, #0A3161 50%, #4A1B2F 100%);
      background-attachment: fixed;
      position: relative;
    }

    /* Header profesional de lujo */
    .navbar {
      background: linear-gradient(135deg, #1C2526 0%, #0A3161 100%) !important;
      backdrop-filter: blur(20px);
      border-bottom: 2px solid #B89778;
      box-shadow: 0 8px 32px rgba(28, 37, 38, 0.4);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 80px;
      padding: 0;
    }

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0 32px;
      height: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #F8F1E9 !important;
      flex-shrink: 0;
    }

    .brand-icon {
      font-size: 2.2rem;
      color: #B89778;
      filter: drop-shadow(0 0 8px rgba(184, 151, 120, 0.6)) drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    }

    .brand-text h4 {
      font-weight: 700;
      color: #F8F1E9;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      margin: 0;
      letter-spacing: 2px;
      font-size: 1.4rem;
    }

    .user-info {
      color: #B89778;
      font-size: 0.9rem;
      font-weight: 500;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      letter-spacing: 0.5px;
    }

    /* Stats rápidas */
    .quick-stats {
      display: flex;
      gap: 20px;
      align-items: center;
      flex: 1;
      justify-content: center;
      max-width: 600px;
      margin: 0 20px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
      border: 2px solid rgba(184, 151, 120, 0.5);
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      min-width: 130px;
      max-width: 160px;
      backdrop-filter: blur(15px);
      position: relative;
      overflow: hidden;
    }

    .stat-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(184, 151, 120, 0.2), transparent);
      transition: left 0.6s;
    }

    .stat-item:hover::before {
      left: 100%;
    }

    .stat-item:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 35px rgba(184, 151, 120, 0.4);
      background: linear-gradient(135deg, rgba(248, 241, 233, 1) 0%, rgba(255, 255, 255, 1) 100%);
      border-color: #B89778;
    }

    .stat-icon {
      font-size: 1.3rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      border-radius: 10px;
      color: #F8F1E9;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      flex-shrink: 0;
    }

    .stat-info {
      min-width: 0;
      flex: 1;
    }

    .stat-number {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1C2526;
      font-family: 'Playfair Display', serif;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
      line-height: 1;
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #4A1B2F;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Acciones rápidas */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 48px;
      height: 48px;
      border: 2px solid rgba(184, 151, 120, 0.5);
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
      color: #1C2526;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      position: relative;
      font-size: 1.2rem;
      backdrop-filter: blur(15px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .action-btn .emoji {
      font-size: 1.3rem;
      line-height: 1;
      opacity: 1 !important;
      filter: drop-shadow(0 0 2px rgba(0,0,0,0.1));
    }

    .action-btn:hover {
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      color: #F8F1E9;
      border-color: #F8F1E9;
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 25px rgba(184, 151, 120, 0.4);
    }

    .action-btn:hover .emoji {
      filter: drop-shadow(0 0 4px rgba(248, 241, 233, 0.3));
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: linear-gradient(135deg, #4A1B2F 0%, #1C2526 100%);
      color: #F8F1E9;
      border: 2px solid #B89778;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
      border: 2px solid rgba(184, 151, 120, 0.5);
      border-radius: 50px;
      color: #1C2526;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
      font-family: 'Playfair Display', serif;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      backdrop-filter: blur(15px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      text-transform: uppercase;
      position: relative;
      overflow: hidden;
    }

    .btn-logout::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(184, 151, 120, 0.2), transparent);
      transition: left 0.6s;
    }

    .btn-logout:hover::before {
      left: 100%;
    }

    .btn-logout:hover {
      background: linear-gradient(135deg, #4A1B2F 0%, #1C2526 100%);
      color: #F8F1E9;
      border-color: #B89778;
      transform: translateY(-3px);
      box-shadow: 0 12px 25px rgba(74, 27, 47, 0.4);
    }

    /* Layout principal */
    .dashboard-layout {
      display: flex;
      margin-top: 70px;
      min-height: calc(100vh - 70px);
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    }

    /* Sidebar mejorado */
    .sidebar {
      width: 300px;
      background: linear-gradient(180deg, #1C2526 0%, #0A3161 50%, #4A1B2F 100%);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(184, 151, 120, 0.3);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
      position: fixed;
      left: 0;
      top: 70px;
      bottom: 0;
      z-index: 100;
    }

    .sidebar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 0%, rgba(184, 151, 120, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .sidebar-header {
      padding: 32px 24px;
      border-bottom: 1px solid rgba(184, 151, 120, 0.3);
      background: linear-gradient(135deg, rgba(184, 151, 120, 0.1), rgba(74, 27, 47, 0.1));
      position: relative;
    }

    .sidebar-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #F8F1E9;
      margin: 0 0 4px 0;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.5px;
    }

    .sidebar-subtitle {
      font-size: 0.875rem;
      color: rgba(248, 241, 233, 0.8);
      font-weight: 500;
      font-family: 'Playfair Display', serif;
      letter-spacing: 0.5px;
    }

    .sidebar-nav {
      padding: 24px 0;
    }

    .nav-section {
      margin-bottom: 32px;
    }

    .section-header {
      padding: 0 24px 16px 24px;
      font-size: 0.75rem;
      font-weight: 700;
      color: rgba(184, 151, 120, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: 'Playfair Display', serif;
    }

    /* Items de navegación */
    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      margin: 3px 12px;
      border-radius: 12px;
      color: rgba(248, 241, 233, 0.9);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid rgba(184, 151, 120, 0.2);
      background: rgba(248, 241, 233, 0.1);
      width: calc(100% - 24px);
      font-size: 0.95rem;
      min-height: 50px;
      font-family: 'Playfair Display', serif;
      backdrop-filter: blur(10px);
      letter-spacing: 0.5px;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(184, 151, 120, 0.2), transparent);
      transition: left 0.6s ease;
    }

    .nav-item:hover::before {
      left: 100%;
    }

    .nav-item:hover {
      background: linear-gradient(135deg, rgba(184, 151, 120, 0.3), rgba(74, 27, 47, 0.4));
      color: #F8F1E9;
      border-color: rgba(184, 151, 120, 0.6);
      transform: translateX(8px);
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.2);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #B89778, #4A1B2F);
      color: #F8F1E9;
      border-color: #F8F1E9;
      transform: translateX(8px);
      box-shadow: 0 8px 30px rgba(184, 151, 120, 0.4);
    }

    .nav-item.active::before {
      display: none;
    }

    .nav-icon {
      width: 48px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-right: 16px;
      border-radius: 12px;
      background: rgba(102, 126, 234, 0.1);
      transition: all 0.3s ease;
    }

    .nav-icon .emoji {
      font-size: 1.3rem;
      line-height: 1;
      opacity: 1 !important;
    }

    .nav-item:hover .nav-icon {
      background: rgba(102, 126, 234, 0.2);
      transform: scale(1.1);
    }

    .nav-item.active .nav-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .nav-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-label {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .nav-description {
      font-size: 0.8rem;
      opacity: 0.7;
    }

    .nav-badge {
      background: #667eea;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: auto;
      min-width: 24px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-badge.new {
      background: #e53e3e;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .quick-action {
      border-left: 4px solid transparent;
      transition: border-color 0.3s ease;
    }

    .quick-action:hover {
      border-left-color: #667eea;
    }

    /* Contenido principal */
    .main-content {
      flex: 1;
      margin-left: 300px;
      background: rgba(255, 255, 255, 0.02);
      min-height: calc(100vh - 70px);
    }

    .content-wrapper {
      padding: 24px 28px;
      min-height: calc(100vh - 70px);
      background: rgba(255, 255, 255, 0.95);
      margin: 8px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    /* Scroll personalizado */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #5a6fd8, #6b46a3);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .navbar-stats {
        gap: 12px;
      }
      
      .stat-item {
        min-width: 100px;
        padding: 12px 14px;
      }

      .stat-value {
        font-size: 1.6rem;
      }

      .stat-label {
        font-size: 0.8rem;
      }
    }
    
    @media (max-width: 1024px) {
      .navbar {
        flex-wrap: wrap;
        height: auto;
        min-height: 80px;
        padding: 16px 20px;
      }

      .navbar-stats {
        gap: 10px;
        flex: 1;
        min-width: 0;
      }

      .stat-item {
        min-width: 80px;
        padding: 10px 12px;
        flex: 1;
      }

      .stat-value {
        font-size: 1.4rem;
      }

      .stat-label {
        font-size: 0.75rem;
      }

      .sidebar {
        width: 280px;
      }

      .main-content {
        margin-left: 280px;
        padding-top: 100px;
      }
      
      .content-wrapper {
        padding: 20px 24px;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding: 16px 20px;
        height: auto;
        min-height: 120px;
      }

      .navbar-left {
        justify-content: center;
      }

      .navbar-stats {
        justify-content: space-around;
        width: 100%;
        gap: 8px;
      }

      .stat-item {
        min-width: 0;
        flex: 1;
        padding: 12px 8px;
        text-align: center;
      }

      .stat-value {
        font-size: 1.3rem;
      }

      .stat-label {
        font-size: 0.7rem;
      }

      .header-actions {
        gap: 12px;
        align-self: center;
        flex-direction: row;
        justify-content: center;
      }

      .brand-text h4 {
        font-size: 1.1rem;
      }

      .user-info {
        display: none;
      }

      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        position: fixed;
        z-index: 1001;
        top: 0;
        width: 100%;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
        width: 100%;
        padding-top: 140px;
      }

      .action-btn span {
        display: none;
      }

      .btn-logout span {
        display: none;
      }

      .btn-logout {
        min-width: 48px;
      }
    }

    @media (max-width: 576px) {
      .navbar {
        padding: 12px 16px;
        min-height: 140px;
      }

      .navbar-stats {
        flex-direction: column;
        gap: 12px;
      }

      .stat-item {
        padding: 16px;
        text-align: center;
      }

      .stat-value {
        font-size: 1.2rem;
      }

      .stat-label {
        font-size: 0.7rem;
      }

      .header-actions {
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .action-btn {
        width: 40px;
        height: 40px;
        font-size: 0.9rem;
      }

      .brand-icon {
        font-size: 1.5rem;
      }

      .content-wrapper {
        padding: 16px;
      }

      .main-content {
        padding-top: 160px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Cargar datos iniciales para el dashboard
    this.store.dispatch(HotelActions.loadHoteles());
  }

  // Métodos de navegación
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }



  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Métodos de utilidad para el template
  getUserRole(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.tipo) {
      case 'admin_central':
        return 'Administrador Central';
      case 'admin_hotel':
        return 'Administrador de Hotel';
      case 'empresa':
        return 'Empresa';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  }

  canAccessSection(section: string): boolean {
    if (!this.currentUser) return false;
    
    // Admin central puede acceder a todo
    if (this.currentUser.tipo === 'admin_central') {
      return true;
    }
    
    // Admin hotel puede acceder a gestión
    if (this.currentUser.tipo === 'admin_hotel') {
      const adminSections = ['usuarios', 'habitaciones', 'salones', 'reservas', 'reportes'];
      return adminSections.includes(section);
    }
    
    // Empresas pueden acceder a salones y reservas
    if (this.currentUser.tipo === 'empresa') {
      const empresaSections = ['salones', 'reservas'];
      return empresaSections.includes(section);
    }
    
    // Clientes solo reservas
    if (this.currentUser.tipo === 'cliente') {
      return ['reservas'].includes(section);
    }
    
    return false;
  }

  getDashboardStats(): any {
    return {
      reservas: this.getActiveReservations(),
      hoteles: this.currentUser?.tipo === 'admin_central' ? '5' : '1',
      ingresos: '45K'
    };
  }

  getUsersCount(): string {
    // En una implementación real, esto vendría del store/backend
    return this.currentUser?.tipo === 'admin_central' ? '24' : '8';
  }

  getRoomsCount(): string {
    // En una implementación real, esto vendría del store/backend
    return this.currentUser?.tipo === 'admin_central' ? '156' : '32';
  }

  getActiveReservations(): string {
    // En una implementación real, esto vendría del store/backend
    const baseReservations = 12;
    const multiplier = this.currentUser?.tipo === 'admin_central' ? 5 : 1;
    return (baseReservations * multiplier).toString();
  }

  trackByMenuId(index: number, item: any): any {
    return item.id || index;
  }
}