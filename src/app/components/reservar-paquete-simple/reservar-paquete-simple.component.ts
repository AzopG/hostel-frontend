import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaquetePublicoService } from '../../services/paquete-publico.service';
import { ReservaPaqueteService } from '../../services/reserva-paquete.service';

@Component({
  selector: 'app-reservar-paquete-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid" *ngIf="paquete">
      <!-- Navegación -->
      <div class="navigation-header">
        <button (click)="volver()" class="btn-nav">
          <i class="fas fa-arrow-left me-2"></i>Volver a Paquetes
        </button>
        <button (click)="irADashboard()" class="btn-nav-secondary">
          <i class="fas fa-tachometer-alt me-2"></i>Dashboard
        </button>
      </div>

      <!-- Header -->
      <div class="header-section">
        <h1 class="page-title">Reservar: {{paquete.nombre}}</h1>
        <p class="page-subtitle">{{paquete.hotel?.nombre}} - {{paquete.hotel?.ciudad}}</p>
      </div>

      <div class="row">
        <!-- Información del Paquete -->
        <div class="col-md-6">
          <div class="info-card">
            <h3>Detalles del Paquete</h3>
            <div class="paquete-info">
              <p><strong>Descripción:</strong> {{paquete.descripcion}}</p>
              <p><strong>Capacidad:</strong> {{paquete.capacidadMinima}} - {{paquete.capacidadMaxima}} personas</p>
              <p><strong>Duración:</strong> {{paquete.duracionDias}} días</p>
              <p><strong>Precio base:</strong> {{formatearPrecio(paquete.precios.base) | currency:'COP':'symbol-narrow':'1.0-0'}}</p>
            </div>

            <div class="servicios-incluidos">
              <h5>Servicios Incluidos:</h5>
              <ul>
                <li *ngFor="let servicio of paquete.serviciosIncluidos">{{servicio}}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Formulario de Reserva -->
        <div class="col-md-6">
          <div class="reserva-card">
            <h3>Datos de la Reserva</h3>
            <form (ngSubmit)="realizarReserva()" #reservaForm="ngForm">
              
              <!-- Datos del Evento -->
              <div class="form-section">
                <h5>Información del Evento</h5>
                
                <div class="form-group">
                  <label>Nombre del Evento*</label>
                  <input type="text" class="form-control" [(ngModel)]="reservaData.nombreEvento" 
                         name="nombreEvento" required>
                </div>

                <div class="form-group">
                  <label>Tipo de Evento*</label>
                  <select class="form-control" [(ngModel)]="reservaData.tipoEvento" name="tipoEvento" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="evento_corporativo">Evento Corporativo</option>
                    <option value="reunion_negocios">Reunión de Negocios</option>
                    <option value="congreso">Congreso</option>
                    <option value="capacitacion">Capacitación</option>
                    <option value="celebracion_empresarial">Celebración Empresarial</option>
                  </select>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Fecha de Inicio*</label>
                      <input type="date" class="form-control" [(ngModel)]="reservaData.fechaInicio" 
                             name="fechaInicio" required [min]="minDate">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Número de Asistentes*</label>
                      <input type="number" class="form-control" [(ngModel)]="reservaData.numeroAsistentes" 
                             name="numeroAsistentes" required 
                             [min]="paquete.capacidadMinima" [max]="paquete.capacidadMaxima">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Datos de la Empresa -->
              <div class="form-section">
                <h5>Información de la Empresa</h5>
                
                <div class="form-group">
                  <label>Razón Social*</label>
                  <input type="text" class="form-control" [(ngModel)]="reservaData.empresa.razonSocial" 
                         name="razonSocial" required>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>NIT*</label>
                      <input type="text" class="form-control" [(ngModel)]="reservaData.empresa.nit" 
                             name="nit" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Teléfono*</label>
                      <input type="tel" class="form-control" [(ngModel)]="reservaData.empresa.telefono" 
                             name="telefono" required>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Email de Contacto*</label>
                  <input type="email" class="form-control" [(ngModel)]="reservaData.empresa.email" 
                         name="email" required>
                </div>
              </div>

              <!-- Resumen de Precios -->
              <div class="precio-resumen">
                <h5>Resumen de Precios</h5>
                <div class="precio-linea">
                  <span>Precio base del paquete:</span>
                  <span>{{formatearPrecio(paquete.precios.base) | currency:'COP':'symbol-narrow':'1.0-0'}}</span>
                </div>
                <div class="precio-linea">
                  <span>IVA (19%):</span>
                  <span>{{formatearPrecio(calcularIVA()) | currency:'COP':'symbol-narrow':'1.0-0'}}</span>
                </div>
                <div class="precio-total">
                  <span>Total:</span>
                  <span>{{formatearPrecio(calcularTotal()) | currency:'COP':'symbol-narrow':'1.0-0'}}</span>
                </div>
              </div>

              <!-- Botones -->
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="volver()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!reservaForm.valid || procesando">
                  <span *ngIf="procesando">
                    <i class="fas fa-spinner fa-spin me-2"></i>Procesando...
                  </span>
                  <span *ngIf="!procesando">
                    <i class="fas fa-check me-2"></i>Confirmar Reserva
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservar-paquete-simple.component.css']
})
export class ReservarPaqueteSimpleComponent implements OnInit {
  paquete: any = null;
  paqueteId: string = '';
  procesando: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];
  private paqueteService = inject(PaquetePublicoService);

  reservaData = {
    nombreEvento: '',
    tipoEvento: '',
    fechaInicio: '',
    numeroAsistentes: 1,
    empresa: {
      razonSocial: '',
      nit: '',
      telefono: '',
      email: ''
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservaPaqueteService: ReservaPaqueteService
  ) {}

  ngOnInit() {
    this.paqueteId = this.route.snapshot.params['id'];
    this.cargarPaquete();
    this.cargarDatosUsuario();
  }

  cargarPaquete() {
    // console.log('🔍 Cargando paquete con ID:', this.paqueteId);
    this.paqueteService.obtenerPaqueteDisponible(this.paqueteId).subscribe({
      next: (response: any) => {
        // console.log('📦 Respuesta del servidor:', response);
        if (response.success) {
          this.paquete = response.paquete;
          this.reservaData.numeroAsistentes = this.paquete.capacidadMinima;
          // console.log('✅ Paquete cargado correctamente:', this.paquete.nombre);
        } else {
          // console.log('❌ Respuesta no exitosa:', response);
          alert('Error: ' + response.message);
          this.volver();
        }
      },
      error: (error: any) => {
        console.error('💥 Error al cargar paquete:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);
        alert(`Error al cargar el paquete: ${error.status} - ${error.message || 'Error desconocido'}`);
        this.volver();
      }
    });
  }

  cargarDatosUsuario() {
    const usuario = this.authService.getCurrentUser();
    if (usuario && usuario.tipo === 'empresa') {
      this.reservaData.empresa.email = usuario.email || '';
    }
  }

  calcularIVA(): number {
    return this.paquete ? this.paquete.precios.base * 0.19 : 0;
  }

  calcularTotal(): number {
    return this.paquete ? this.paquete.precios.base + this.calcularIVA() : 0;
  }

  realizarReserva() {
    if (!this.paquete) return;

    this.procesando = true;

    const total = this.calcularTotal();

    const reservaCompleta = {
      paquete: this.paqueteId,
      hotel: this.paquete.hotel._id,
      nombreEvento: this.reservaData.nombreEvento,
      tipoEvento: this.reservaData.tipoEvento,
      fechaInicio: this.reservaData.fechaInicio,
      fechaFin: this.reservaData.fechaInicio, // Por ahora mismo día
      horaInicio: '08:00',
      horaFin: '18:00',
      numeroAsistentes: this.reservaData.numeroAsistentes,
      datosEmpresa: {
        razonSocial: this.reservaData.empresa.razonSocial,
        nit: this.reservaData.empresa.nit,
        telefono: this.reservaData.empresa.telefono,
        email: this.reservaData.empresa.email
      },
      precios: {
        subtotalPaquete: this.paquete.precios.base,
        subtotalHabitaciones: 0,
        subtotalSalones: 0,
        subtotalServicios: 0,
        subtotalCatering: 0,
        descuentos: 0,
        impuestos: this.calcularIVA(),
        total: total
      }
    };

    // console.log('📋 Enviando reserva:', reservaCompleta);

    // Usar el servicio real de reserva de paquetes
    this.reservaPaqueteService.crearReservaPaquete(reservaCompleta).subscribe({
      next: (response: any) => {
        // console.log('✅ Reserva creada:', response);
        this.procesando = false;
        if (response.success) {
          alert(`¡Reserva creada exitosamente! 
          
Número de reserva: ${response.reserva.numeroReserva}
          
Te contactaremos pronto para confirmar los detalles.`);
          this.router.navigate(['/mis-reservas']);
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: (error: any) => {
        console.error('💥 Error al crear reserva:', error);
        this.procesando = false;
        alert(`Error al crear la reserva: ${error.error?.message || error.message || 'Error desconocido'}`);
      }
    });
  }

  formatearPrecio(precio: number): string {
    return precio?.toLocaleString('es-CO') || '0';
  }

  volver() {
    this.router.navigate(['/ver-paquetes']);
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }
}