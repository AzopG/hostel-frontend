
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario, UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <div class="row g-3">
          <div class="col-md-4">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input type="text" class="form-control search-input" placeholder="Buscar usuarios...">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select filter-select">
              <option value="">Todos los tipos</option>
              <option value="admin_central">Admin Central</option>
              <option value="admin_hotel">Admin Hotel</option>
              <option value="empresa">Empresa</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select filter-select">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100">
              <i class="fas fa-filter me-2"></i>Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="stat-card stat-primary">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ usuarios.length }}</h3>
                <p class="stat-label">Total Usuarios</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-success">
              <div class="stat-icon">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ getUsuariosActivos() }}</h3>
                <p class="stat-label">Usuarios Activos</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">

            <div class="stat-card stat-warning">
              <div class="stat-icon">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ getAdministradores() }}</h3>
                <p class="stat-label">Administradores</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
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
      </div>

      <!-- Tabla moderna de usuarios -->
      <div class="table-section">
        <div class="modern-card">
          <div class="card-header-modern">
            <h5 class="card-title-modern">
              <i class="fas fa-list me-2"></i>Lista de Usuarios
            </h5>
            <div class="card-actions">
              <button class="btn btn-sm btn-outline-primary me-2">
                <i class="fas fa-download me-1"></i>Exportar
              </button>
              <button class="btn btn-sm btn-outline-secondary">
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
                    <ng-container *ngIf="usuario.tipo === 'empresa'">
                      <div class="empresa-info">
                        <div class="empresa-nombre">
                          <i class="fas fa-building me-1"></i>
                          {{ usuario.razonSocial || usuario.empresa || 'Empresa' }}
                        </div>
                        <div class="empresa-nit" *ngIf="usuario.nit">
                          <small class="text-muted">NIT: {{ formatearNIT(usuario.nit) }}</small>
                        </div>
                      </div>
                    </ng-container>
                    <ng-container *ngIf="usuario.tipo !== 'empresa'">
                      <span class="text-muted">-</span>
                    </ng-container>
                  </td>
                  <td>
                    <span class="status-badge" 
                          [ngClass]="usuario.activo !== false ? 'status-active' : 'status-inactive'">
                      <i [class]="usuario.activo !== false ? 'fas fa-circle' : 'fas fa-circle'" class="status-dot me-1"></i>
                      {{ usuario.activo !== false ? 'Activo' : 'Inactivo' }}
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
              <ul class="pagination pagination-modern">
                <li class="page-item disabled">
                  <a class="page-link" href="#" tabindex="-1">
                    <i class="fas fa-chevron-left"></i>
                  </a>
                </li>
                <li class="page-item active">
                  <a class="page-link" href="#">1</a>
                </li>
                <li class="page-item disabled">
                  <a class="page-link" href="#">
                    <i class="fas fa-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Modal para ver/editar/eliminar usuario -->
      <div class="modal-overlay" *ngIf="modalVisible" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              <i *ngIf="modalModo === 'ver'" class="fas fa-eye me-2"></i>
              <i *ngIf="modalModo === 'editar'" class="fas fa-edit me-2"></i>
              <i *ngIf="modalModo === 'eliminar'" class="fas fa-trash me-2"></i>
              {{ modalModo === 'ver' ? 'Ver Usuario' : modalModo === 'editar' ? 'Editar Usuario' : 'Eliminar Usuario' }}
            </h3>
            <button class="btn-close" (click)="cerrarModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body" *ngIf="modalUsuario">
            <!-- Modo Ver -->
            <div *ngIf="modalModo === 'ver'" class="user-details">
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Nombre:</label>
                  <span>{{ modalUsuario.nombre }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ modalUsuario.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Tipo:</label>
                  <span class="badge-modern" [ngClass]="getBadgeClass(modalUsuario.tipo)">
                    {{ getTipoLabel(modalUsuario.tipo) }}
                  </span>
                </div>
                
                <!-- HU13: Información adicional para empresas -->
                <ng-container *ngIf="modalUsuario.tipo === 'empresa'">
                  <div class="detail-item" *ngIf="modalUsuario.razonSocial">
                    <label>Razón Social:</label>
                    <span>{{ modalUsuario.razonSocial }}</span>
                  </div>
                  <div class="detail-item" *ngIf="modalUsuario.nit">
                    <label>NIT:</label>
                    <span>{{ formatearNIT(modalUsuario.nit) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="modalUsuario.contactoEmpresa?.nombre">
                    <label>Contacto:</label>
                    <span>{{ modalUsuario.contactoEmpresa.nombre }}</span>
                  </div>
                  <div class="detail-item" *ngIf="modalUsuario.contactoEmpresa?.cargo">
                    <label>Cargo:</label>
                    <span>{{ modalUsuario.contactoEmpresa.cargo }}</span>
                  </div>
                  <div class="detail-item" *ngIf="modalUsuario.contactoEmpresa?.telefono">
                    <label>Teléfono:</label>
                    <span>{{ modalUsuario.contactoEmpresa.telefono }}</span>
                  </div>
                </ng-container>
                
                <div class="detail-item" *ngIf="modalUsuario.telefono">
                  <label>Teléfono:</label>
                  <span>{{ modalUsuario.telefono }}</span>
                </div>
                <div class="detail-item">
                  <label>Estado:</label>
                  <span class="status-badge" [ngClass]="modalUsuario.activo !== false ? 'status-active' : 'status-inactive'">
                    {{ modalUsuario.activo !== false ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="detail-item" *ngIf="modalUsuario.createdAt">
                  <label>Registrado:</label>
                  <span>{{ modalUsuario.createdAt | date:'medium' }}</span>
                </div>
              </div>
            </div>

            <!-- Modo Editar -->
            <div *ngIf="modalModo === 'editar'" class="edit-form">
              <div class="form-group">
                <label>Nombre:</label>
                <input type="text" [(ngModel)]="modalUsuario.nombre" class="form-control">
              </div>
              <div class="form-group">
                <label>Email:</label>
                <input type="email" [(ngModel)]="modalUsuario.email" class="form-control">
              </div>
              <div class="form-group">
                <label>Tipo:</label>
                <select [(ngModel)]="modalUsuario.tipo" class="form-control">
                  <option value="cliente">Cliente</option>
                  <option value="empresa">Empresa</option>
                  <option value="admin_hotel">Admin Hotel</option>
                  <option value="admin_central">Admin Central</option>
                </select>
              </div>
              
              <!-- HU13: Campos adicionales para empresas -->
              <ng-container *ngIf="modalUsuario.tipo === 'empresa'">
                <div class="form-group">
                  <label>Razón Social:</label>
                  <input type="text" [(ngModel)]="modalUsuario.razonSocial" class="form-control">
                </div>
                <div class="form-group">
                  <label>NIT:</label>
                  <input type="text" [(ngModel)]="modalUsuario.nit" class="form-control">
                </div>
              </ng-container>
              
              <div class="form-group" *ngIf="modalUsuario.tipo === 'empresa'">
                <label>Empresa:</label>
                <input type="text" [(ngModel)]="modalUsuario.empresa" class="form-control">
              </div>
              <div class="form-group">
                <label>Teléfono:</label>
                <input type="text" [(ngModel)]="modalUsuario.telefono" class="form-control">
              </div>
            </div>

            <!-- Modo Eliminar -->
            <div *ngIf="modalModo === 'eliminar'" class="delete-confirmation">
              <div class="warning-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <p class="warning-text">
                ¿Está seguro que desea eliminar al usuario <strong>{{ modalUsuario.nombre }}</strong>?
              </p>
              <p class="warning-subtitle">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button *ngIf="modalModo === 'ver'" class="btn btn-secondary" (click)="cerrarModal()">
              Cerrar
            </button>
            <div *ngIf="modalModo === 'editar'">
              <button class="btn btn-secondary me-2" (click)="cerrarModal()">Cancelar</button>
              <button class="btn btn-primary" (click)="guardarEdicionUsuario()">Guardar</button>
            </div>
            <div *ngIf="modalModo === 'eliminar'">
              <button class="btn btn-secondary me-2" (click)="cerrarModal()">Cancelar</button>
              <button class="btn btn-danger" (click)="confirmarEliminarUsuario()">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
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

    .search-box {
      position: relative;
    }

    .search-input {
      padding-left: 3rem;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #a0aec0;
      z-index: 10;
    }

    .filter-select {
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      height: 48px;
      font-size: 1rem;
    }

    .stats-section {
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--stat-color), var(--stat-color-light));
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
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
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: var(--stat-color);
      background: linear-gradient(135deg, var(--stat-color), var(--stat-color-light));
      background-size: 200% 200%;
      animation: gradientShift 3s ease infinite;
      color: white;
      margin-bottom: 1rem;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      color: #2d3748;
    }

    .stat-label {
      color: #718096;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
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

    .empresa-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .empresa-nombre {
      color: #4a5568;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .empresa-nit {
      font-size: 0.75rem;
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

    .pagination-modern {
      margin: 0;
    }

    .pagination-modern .page-link {
      border: none;
      padding: 0.5rem 1rem;
      margin: 0 0.25rem;
      border-radius: 8px;
      color: #4a5568;
      background: transparent;
      transition: all 0.3s ease;
    }

    .pagination-modern .page-item.active .page-link {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .pagination-modern .page-link:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-1px);
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

      .table-responsive {
        border-radius: 0;
      }

      .action-buttons {
        flex-direction: column;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #a0aec0;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .btn-close:hover {
      background: #f7fafc;
      color: #e53e3e;
    }

    .modal-body {
      padding: 2rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item span {
      color: #2d3748;
      font-size: 1rem;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .delete-confirmation {
      text-align: center;
      padding: 2rem 0;
    }

    .warning-icon {
      font-size: 4rem;
      color: #f56565;
      margin-bottom: 1rem;
    }

    .warning-text {
      font-size: 1.25rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .warning-subtitle {
      color: #718096;
      font-size: 1rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 2rem;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 0 0 20px 20px;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    .btn-danger {
      background: linear-gradient(135deg, #f56565, #e53e3e);
      color: white;
    }

    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 101, 101, 0.3);
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        width: 95%;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1.5rem;
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

  /**
   * HU13: Formatear NIT para visualización
   * Ejemplo: 9001234561 → 900.123.456-1
   */
  formatearNIT(nit: string): string {
    if (!nit) return '';
    
    const nitStr = nit.toString();
    
    if (nitStr.length === 10) {
      // Formato: XXX.XXX.XXX-X
      return `${nitStr.slice(0, 3)}.${nitStr.slice(3, 6)}.${nitStr.slice(6, 9)}-${nitStr.slice(9)}`;
    } else if (nitStr.length === 9) {
      // Formato: XXX.XXX.XXX
      return `${nitStr.slice(0, 3)}.${nitStr.slice(3, 6)}.${nitStr.slice(6)}`;
    }
    
    return nitStr;
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