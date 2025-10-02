import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Header con navegación -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <h1><i class="fas fa-hotel me-3"></i>Dashboard Hotelero</h1>
            <p *ngIf="usuario">Bienvenido, <strong>{{ usuario.nombre }}</strong></p>
            <p class="subtitle">Gestiona tus reservas y servicios hoteleros</p>
          </div>
          <div class="header-actions">
            <button class="btn-logout" (click)="cerrarSesion()">
              <i class="fas fa-sign-out-alt me-2"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tarjetas de acceso rápido -->
      <div class="quick-actions">
        <h2><i class="fas fa-rocket me-2"></i>Acceso Rápido</h2>
        <div class="actions-grid">
          
          <!-- Buscar Habitaciones -->
          <div class="action-card primary" (click)="navegarA('/buscar-habitaciones')">
            <div class="card-icon"><i class="fas fa-search"></i></div>
            <h3>Buscar Habitaciones</h3>
            <p>Encuentra y reserva habitaciones disponibles</p>
            <div class="card-action">Explorar →</div>
          </div>

          <!-- Mis Reservas -->
          <div class="action-card success" (click)="navegarA('/mis-reservas')">
            <div class="card-icon"><i class="fas fa-clipboard-list"></i></div>
            <h3>Mis Reservas</h3>
            <p>Ver y gestionar tus reservas activas</p>
            <div class="card-action">Ver Reservas →</div>
          </div>

          <!-- Calendario -->
          <div class="action-card info" (click)="navegarA('/calendario')">
            <div class="card-icon"><i class="fas fa-calendar-alt"></i></div>
            <h3>Calendario</h3>
            <p>Consultar disponibilidad por fechas</p>
            <div class="card-action">Ver Calendario →</div>
          </div>

          <!-- Salones (si es empresa) -->
          <div *ngIf="esEmpresa()" class="action-card warning" (click)="navegarA('/salones')">
            <div class="card-icon"><i class="fas fa-building"></i></div>
            <h3>Salones de Eventos</h3>
            <p>Reservar salones para eventos corporativos</p>
            <div class="card-action">Ver Salones →</div>
          </div>

          <!-- Paquetes Corporativos (si es empresa) -->
          <div *ngIf="esEmpresa()" class="action-card corporate" (click)="navegarA('/paquetes')">
            <div class="card-icon"><i class="fas fa-box"></i></div>
            <h3>Paquetes Corporativos</h3>
            <p>Reservas combinadas de salón + habitaciones</p>
            <div class="card-action">Ver Paquetes →</div>
          </div>

        </div>
      </div>

      <!-- Información del usuario -->
      <div class="user-info" *ngIf="usuario">
        <h2><i class="fas fa-user me-2"></i>Información de la Cuenta</h2>
        <div class="info-card">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Nombre:</span>
              <span class="value">{{ usuario.nombre }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">{{ usuario.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">Tipo de cuenta:</span>
              <span class="value type-badge" [ngClass]="usuario.rol">{{ formatearTipo(usuario.rol) }}</span>
            </div>
            <div class="info-item" *ngIf="usuario.empresa">
              <span class="label">Empresa:</span>
              <span class="value">{{ usuario.empresa }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos adicionales -->
      <div class="additional-actions">
        <h2><i class="fas fa-tools me-2"></i>Herramientas Adicionales</h2>
        <div class="tools-grid">
          
          <div class="tool-item" (click)="navegarA('/perfil')">
            <span class="tool-icon"><i class="fas fa-cog"></i></span>
            <span class="tool-text">Configurar Perfil</span>
          </div>
          
          <div class="tool-item" (click)="navegarA('/historial')">
            <span class="tool-icon"><i class="fas fa-chart-bar"></i></span>
            <span class="tool-text">Historial Completo</span>
          </div>
          
          <div class="tool-item" (click)="navegarA('/soporte')">
            <span class="tool-icon"><i class="fas fa-comments"></i></span>
            <span class="tool-text">Soporte al Cliente</span>
          </div>
          
          <div class="tool-item" (click)="navegarA('/')">
            <span class="tool-icon"><i class="fas fa-home"></i></span>
            <span class="tool-text">Página Principal</span>
          </div>
          
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 75%, #adb5bd 100%);
    }

    .dashboard-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .welcome-section h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 2.5rem;
      display: flex;
      align-items: center;
    }

    .welcome-section h1 i {
      color: #3498db;
    }

    .welcome-section p {
      margin: 5px 0;
      color: #666;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #888 !important;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-logout i {
      color: white;
    }

    .btn-logout:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    }

    .quick-actions h2,
    .user-info h2,
    .additional-actions h2 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
    }

    .quick-actions h2 i,
    .user-info h2 i,
    .additional-actions h2 i {
      color: #3498db;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      border: none;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .action-card.primary {
      border-left: 4px solid #3498db;
    }

    .action-card.success {
      border-left: 4px solid #27ae60;
    }

    .action-card.info {
      border-left: 4px solid #8e44ad;
    }

    .action-card.warning {
      border-left: 4px solid #f39c12;
    }

    .action-card.corporate {
      border-left: 4px solid #2c3e50;
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
      color: #2d3748;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 60px;
    }

    .card-icon i {
      color: #2d3748;
    }

    .action-card.primary .card-icon i {
      color: #3498db;
    }

    .action-card.success .card-icon i {
      color: #27ae60;
    }

    .action-card.info .card-icon i {
      color: #8e44ad;
    }

    .action-card.warning .card-icon i {
      color: #f39c12;
    }

    .action-card.corporate .card-icon i {
      color: #2c3e50;
    }

    .action-card h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 1.3rem;
    }

    .action-card p {
      color: #666;
      margin: 0 0 15px 0;
      line-height: 1.5;
    }

    .card-action {
      color: #3498db;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .user-info {
      margin-bottom: 40px;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 25px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .label {
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .type-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .type-badge.cliente {
      background: #e8f5e8;
      color: #27ae60;
    }

    .type-badge.empresa {
      background: #e8f0ff;
      color: #3498db;
    }

    .type-badge.admin {
      background: #ffeaa7;
      color: #d63031;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .tool-item {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .tool-item:hover {
      background: rgba(248, 249, 250, 0.98);
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .tool-icon {
      font-size: 1.5rem;
      color: #2d3748;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    }

    .tool-icon i {
      color: #3498db;
    }

    .tool-text {
      font-weight: 600;
      color: #2c3e50;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 15px;
      }
      
      .header-content {
        flex-direction: column;
        gap: 20px;
      }
      
      .welcome-section h1 {
        font-size: 2rem;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .tools-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardHomeComponent implements OnInit {
  usuario: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  /**
   * Cargar datos del usuario autenticado
   */
  cargarDatosUsuario(): void {
    const datosUsuario = this.authService.getCurrentUser();
    if (datosUsuario) {
      this.usuario = datosUsuario;
    } else {
      // Si no hay usuario, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  /**
   * Verificar si es empresa
   */
  esEmpresa(): boolean {
    return this.usuario?.rol === 'empresa' || this.usuario?.tipo === 'empresa';
  }

  /**
   * Formatear tipo de usuario
   */
  formatearTipo(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'cliente': 'Cliente Individual',
      'empresa': 'Cuenta Empresarial',
      'admin': 'Administrador',
      'hotel': 'Hotel Manager'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Navegar a una ruta específica
   */
  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  /**
   * Cerrar sesión
   */
  cerrarSesion(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}