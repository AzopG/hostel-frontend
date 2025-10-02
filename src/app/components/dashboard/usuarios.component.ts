import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario, UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="usuarios-container">
      <!-- Header moderno -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              <i class="fas fa-users text-primary me-3"></i>
              Gestión de Usuarios
            </h1>
            <p class="page-subtitle">Administra los usuarios del sistema hotelero</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary btn-modern" (click)="agregarUsuario()">
              <i class="fas fa-plus me-2"></i>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="search-container">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input type="text" class="form-control search-input" placeholder="Buscar usuarios...">
            </div>
          </div>
          <div class="filter-container">
            <select class="form-select filter-select">
              <option value="">Todos los tipos</option>
              <option value="admin_central">Admin Central</option>
              <option value="admin_hotel">Admin Hotel</option>
              <option value="empresa">Empresa</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div class="filter-container">
            <select class="form-select filter-select">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          <div class="action-container">
            <button class="btn btn-filter">
              <i class="fas fa-filter me-2"></i>Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <div class="stats-row">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ usuarios.length }}</h3>
              <p class="stat-label">Total Usuarios</p>
            </div>
          </div>
          <div class="stat-card stat-success">
            <div class="stat-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ getUsuariosActivos() }}</h3>
              <p class="stat-label">Usuarios Activos</p>
            </div>
          </div>
          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ getAdministradores() }}</h3>
              <p class="stat-label">Administradores</p>
            </div>
          </div>
          <div class="stat-card stat-info">
            <div class="stat-icon">
              <i class="fas fa-building"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ getEmpresas() }}</h3>
              <p class="stat-label">Empresas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla moderna de usuarios -->
      <div class="table-section">
        <div class="modern-card">
          <div class="card-header-modern">
            <h5 class="card-title-modern">
              <i class="fas fa-list me-2"></i>Lista de Usuarios
            </h5>
            <div class="card-actions">
              <button class="btn btn-export">
                <i class="fas fa-download me-1"></i>Exportar
              </button>
              <button class="btn btn-refresh">
                <i class="fas fa-sync me-1"></i>Actualizar
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-modern">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" class="form-check-input">
                  </th>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Tipo</th>
                  <th>Empresa</th>
                  <th>Estado</th>

                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let usuario of usuarios; trackBy: trackByUser" class="table-row-hover">
                  <td>
                    <input type="checkbox" class="form-check-input">
                  </td>
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">
                        <i class="fas fa-user"></i>
                      </div>
                      <div class="user-details">
                        <div class="user-name">{{ usuario.nombre }}</div>
                        <div class="user-id">#{{ usuario._id }}</div>

                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="contact-info">
                      <div class="contact-email">
                        <i class="fas fa-envelope me-2 text-muted"></i>
                        {{ usuario.email }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge-modern" [ngClass]="getBadgeClass(usuario.tipo)">
                      <i [class]="getTipoIcon(usuario.tipo)" class="me-1"></i>
                      {{ getTipoLabel(usuario.tipo) }}
                    </span>
                  </td>
                  <td>

                    <ng-container *ngIf="usuario.empresa && usuario.empresa !== '-' && usuario.empresa.trim() !== ''">
                      <span class="empresa-badge">
                        <i class="fas fa-building me-1"></i>
                        {{ usuario.empresa }}
                      </span>
                    </ng-container>
                    <ng-container *ngIf="!usuario.empresa || usuario.empresa === '-' || usuario.empresa.trim() === ''">
                      <span class="text-muted">No es una Empresa</span>
                    </ng-container>
                  </td>
                  <!--

                  <td>
                    <span class="status-badge" 
                          [ngClass]="usuario.activo ? 'status-active' : 'status-inactive'">
                      <i [class]="usuario.activo ? 'fas fa-circle' : 'fas fa-circle'" class="status-dot me-1"></i>
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>

                  <td>
                    <span class="text-muted">
                      <i class="fas fa-clock me-1"></i>
                      {{ usuario.updatedAt ? (usuario.updatedAt | date:'short') : 'Nunca' }}

                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-action btn-action-view" 
                              (click)="verUsuario(usuario)"
                              title="Ver detalles">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-action btn-action-edit" 
                              (click)="editarUsuario(usuario)"
                              title="Editar usuario">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-action btn-action-delete" 
                              (click)="eliminarUsuario(usuario)"
                              title="Eliminar usuario">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div class="table-footer">
            <div class="pagination-info">
              Mostrando 1-4 de 4 usuarios
            </div>
            <nav aria-label="Paginación de usuarios">
              <!-- Paginación eliminada -->
            </nav>
          </div>
  `,
  styles: [`
    .usuarios-container {
      padding: 0;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 75%, #adb5bd 100%);
      min-height: calc(100vh - 70px);
      margin: 0;
      padding: 2rem;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
    }

    .page-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      color: #718096;
      font-size: 1.1rem;
      margin: 0.5rem 0 0 0;
    }

    .btn-modern {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
      transition: all 0.3s ease;
    }

    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
    }

    .filters-section {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: center;
      width: 100%;
    }

    .search-container {
      flex: 2;
      min-width: 250px;
    }

    .filter-container {
      flex: 1;
      min-width: 150px;
    }

    .action-container {
      flex-shrink: 0;
    }

    .search-box {
      position: relative;
      width: 100%;
    }

    .search-input {
      padding-left: 3rem;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
      width: 100%;
    }

    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      outline: none;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #a0aec0;
      z-index: 10;
      font-size: 1rem;
    }

    .filter-select {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
      width: 100%;
    }

    .filter-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      outline: none;
    }

    .btn-filter {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      border: 2px solid #667eea;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }

    .btn-filter:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      border-color: #5a67d8;
    }

    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-row {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      text-align: center;
      width: calc(25% - 0.75rem);
      height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--stat-color), var(--stat-color-light));
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-primary {
      --stat-color: #667eea;
      --stat-color-light: #764ba2;
    }

    .stat-success {
      --stat-color: #48bb78;
      --stat-color-light: #68d391;
    }

    .stat-warning {
      --stat-color: #ed8936;
      --stat-color-light: #f6ad55;
    }

    .stat-info {
      --stat-color: #4299e1;
      --stat-color-light: #63b3ed;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--stat-color);
      background: linear-gradient(135deg, var(--stat-color), var(--stat-color-light));
      background-size: 200% 200%;
      animation: gradientShift 3s ease infinite;
      color: white;
      margin-bottom: 0.5rem;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: #2d3748;
      line-height: 1;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
      margin: 0;
      font-weight: 500;
      margin-top: 0.3rem;
      line-height: 1.2;
    }

    .table-section {
      margin-bottom: 2rem;
    }

    .modern-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header-modern {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title-modern {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn-export {
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      border: 2px solid #48bb78;
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 12px rgba(72, 187, 120, 0.3);
    }

    .btn-export:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
      background: linear-gradient(135deg, #38a169, #2f855a);
      border-color: #38a169;
    }

    .btn-refresh {
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      border: 2px solid #667eea;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-refresh:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a67d8, #553c9a);
      border-color: #5a67d8;
    }

    .btn-export:active,
    .btn-refresh:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .table-modern {
      margin: 0;
    }

    .table-modern th {
      background: #f8fafc;
      border: none;
      padding: 1.5rem 1rem;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-modern td {
      padding: 1.5rem 1rem;
      border: none;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .table-row-hover:hover {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      transform: scale(1.01);
      transition: all 0.3s ease;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .user-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 1rem;
    }

    .user-id {
      color: #718096;
      font-size: 0.875rem;
    }

    .contact-email {
      color: #4a5568;
      font-size: 0.875rem;
    }

    .badge-modern {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bg-danger {
      background: linear-gradient(135deg, #f56565, #e53e3e) !important;
      color: white;
    }

    .bg-warning {
      background: linear-gradient(135deg, #ed8936, #dd6b20) !important;
      color: white;
    }

    .bg-info {
      background: linear-gradient(135deg, #4299e1, #3182ce) !important;
      color: white;
    }

    .bg-secondary {
      background: linear-gradient(135deg, #a0aec0, #718096) !important;
      color: white;
    }

    .empresa-badge {
      color: #4a5568;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
    }

    .status-active {
      background: rgba(72, 187, 120, 0.1);
      color: #38a169;
    }

    .status-inactive {
      background: rgba(245, 101, 101, 0.1);
      color: #e53e3e;
    }

    .status-dot {
      font-size: 0.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 0.875rem;
    }

    .btn-action-view {
      background: rgba(66, 153, 225, 0.1);
      color: #3182ce;
    }

    .btn-action-view:hover {
      background: rgba(66, 153, 225, 0.2);
      transform: scale(1.1);
    }

    .btn-action-edit {
      background: rgba(237, 137, 54, 0.1);
      color: #dd6b20;
    }

    .btn-action-edit:hover {
      background: rgba(237, 137, 54, 0.2);
      transform: scale(1.1);
    }

    .btn-action-delete {
      background: rgba(245, 101, 101, 0.1);
      color: #e53e3e;
    }

    .btn-action-delete:hover {
      background: rgba(245, 101, 101, 0.2);
      transform: scale(1.1);
    }

    .table-footer {
      background: #f8fafc;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
    }

    .pagination-info {
      color: #718096;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .page-title {
        font-size: 2rem;
      }

      .usuarios-container {
        padding: 1rem;
      }

      .filters-row {
        flex-direction: column;
        gap: 0.8rem;
        align-items: stretch;
      }

      .search-container,
      .filter-container,
      .action-container {
        flex: none;
        width: 100%;
        min-width: auto;
      }

      .filters-section {
        padding: 1rem;
      }

      .stats-row {
        gap: 0.5rem;
      }

      .stat-card {
        width: calc(25% - 0.375rem);
        height: 100px;
        padding: 0.8rem;
      }

      .stat-icon {
        width: 32px;
        height: 32px;
        font-size: 1rem;
        margin-bottom: 0.4rem;
      }

      .stat-number {
        font-size: 1.6rem;
      }

      .stat-label {
        font-size: 0.8rem;
      }

      .table-responsive {
        border-radius: 0;
      }

      .action-buttons {
        flex-direction: column;
      }
    }

    @media (max-width: 576px) {
      .filters-section {
        padding: 0.8rem;
        margin-bottom: 1.5rem;
      }

      .search-input,
      .filter-select,
      .btn-filter {
        height: 44px;
        font-size: 0.9rem;
      }

      .stats-row {
        gap: 0.3rem;
      }

      .stat-card {
        width: calc(25% - 0.225rem);
        height: 80px;
        padding: 0.6rem;
      }

      .stat-icon {
        width: 28px;
        height: 28px;
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
      }

      .stat-number {
        font-size: 1.3rem;
      }

      .stat-label {
        font-size: 0.7rem;
        line-height: 1.1;
      }
    }
    /* Estilos responsivos */
    @media (max-width: 768px) {
      .btn-export,
      .btn-refresh {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }

      .card-actions {
        gap: 0.5rem;
      }
    }

    @media (max-width: 576px) {
      .btn-export,
      .btn-refresh {
        padding: 0.45rem 0.8rem;
        font-size: 0.75rem;
      }
    }
  `]
})
export class UsuariosComponent {

  usuarios: Usuario[] = [];
  modalVisible = false;
  modalUsuario: any = null;
  modalModo: 'ver' | 'editar' | 'eliminar' = 'ver';
  mostrarPassword = false;

  constructor(private usuarioService: UsuarioService) {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
      },
      (error) => {
        // Puedes mostrar un mensaje de error aquí si quieres
        this.usuarios = [];
      }
    );
  }


  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'admin_central': return 'bg-danger';
      case 'admin_hotel': return 'bg-warning';
      case 'empresa': return 'bg-info';
      case 'cliente': return 'bg-secondary';
      default: return 'bg-light';
    }
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'admin_central': return 'Admin Central';
      case 'admin_hotel': return 'Admin Hotel';
      case 'empresa': return 'Empresa';
      case 'cliente': return 'Cliente';
      default: return tipo;
    }
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'admin_central': return 'fas fa-crown';
      case 'admin_hotel': return 'fas fa-user-tie';
      case 'empresa': return 'fas fa-building';
      case 'cliente': return 'fas fa-user';
      default: return 'fas fa-user';
    }
  }

  getUsuariosActivos(): number {

    return this.usuarios.filter(u => u.activo).length;

  }

  getAdministradores(): number {
    return this.usuarios.filter(u => u.tipo.includes('admin')).length;
  }

  getEmpresas(): number {
    return this.usuarios.filter(u => u.tipo === 'empresa').length;
  }

  trackByUser(index: number, usuario: any): string {
    return usuario._id;

  }

  agregarUsuario(): void {
    console.log('Agregar nuevo usuario');
    // Implementar lógica para agregar usuario
  }

  verUsuario(usuario: any): void {

    this.modalUsuario = { ...usuario };
    this.modalModo = 'ver';
    this.mostrarPassword = false;
    this.modalVisible = true;
  }

  editarUsuario(usuario: any): void {
    this.modalUsuario = { ...usuario };
    this.modalModo = 'editar';
    this.modalVisible = true;
  }

  guardarEdicionUsuario(): void {
    this.usuarioService.updateUsuario(this.modalUsuario._id, this.modalUsuario).subscribe(
      (data) => {
          this.cargarUsuarios();
          this.cerrarModal();
          location.reload();
      },
      (error) => {
        alert('Error al guardar usuario');
      }
    );
  }

  eliminarUsuario(usuario: any): void {
    this.modalUsuario = { ...usuario };
    this.modalModo = 'eliminar';
    this.modalVisible = true;
  }

  confirmarEliminarUsuario(): void {
    this.usuarioService.deleteUsuario(this.modalUsuario._id).subscribe(
      (data) => {
          this.cargarUsuarios();
          this.cerrarModal();
          location.reload();
      },
      (error) => {
        alert('Error al eliminar usuario');
      }
    );
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalUsuario = null;
    this.modalModo = 'ver';
    this.mostrarPassword = false;
  }
}