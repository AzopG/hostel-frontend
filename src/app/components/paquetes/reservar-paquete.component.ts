import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservaPaqueteService, ReservaPaquete, PaqueteDisponible } from '../../services/reserva-paquete.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservar-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reservar-paquete-container">
      <!-- Header -->
      <div class="header-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="page-title">
                <i class="fas fa-calendar-plus me-3"></i>
                Reservar Paquete Empresarial
              </h1>
              <p class="page-subtitle">Complete los datos para confirmar su reserva</p>
            </div>
            <div class="col-md-4 text-end">
              <button class="btn btn-secondary" (click)="volver()">
                <i class="fas fa-arrow-left me-2"></i>Volver
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content">
        <div class="container">
          
          <!-- Loading -->
          <div *ngIf="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">Cargando información del paquete...</p>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
          </div>

          <!-- Formulario de reserva -->
          <div *ngIf="!cargando && !error && paquete" class="row">
            
            <!-- Información del paquete -->
            <div class="col-lg-4">
              <div class="paquete-info-card">
                <div class="paquete-header">
                  <h4>{{ paquete.nombre }}</h4>
                  <span class="paquete-tipo">{{ getTipoEventoLabel(paquete.tipo) }}</span>
                </div>
                
                <div class="paquete-details">
                  <div class="detail-item">
                    <i class="fas fa-map-marker-alt text-primary"></i>
                    <div>
                      <strong>{{ paquete.hotel.nombre }}</strong>
                      <p class="text-muted">{{ paquete.hotel.ciudad }}</p>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <i class="fas fa-users text-info"></i>
                    <div>
                      <strong>Capacidad</strong>
                      <p class="text-muted">{{ paquete.capacidadMinima }} - {{ paquete.capacidadMaxima }} personas</p>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <i class="fas fa-dollar-sign text-success"></i>
                    <div>
                      <strong>Precio Base</strong>
                      <p class="precio-destacado">\${{ formatearPrecio(paquete.precios.base) }} {{ paquete.precios.moneda }}</p>
                    </div>
                  </div>
                </div>

                <div class="incluye-section" *ngIf="paquete.habitaciones?.length || paquete.salones?.length">
                  <h6>El paquete incluye:</h6>
                  <ul class="incluye-lista">
                    <li *ngIf="paquete.habitaciones?.length">
                      <i class="fas fa-bed me-2"></i>{{ paquete.habitaciones.length }} tipos de habitación
                    </li>
                    <li *ngIf="paquete.salones?.length">
                      <i class="fas fa-building me-2"></i>{{ paquete.salones.length }} salones
                    </li>
                    <li *ngIf="paquete.servicios?.length">
                      <i class="fas fa-concierge-bell me-2"></i>{{ paquete.servicios.length }} servicios adicionales
                    </li>
                    <li *ngIf="paquete.catering?.length">
                      <i class="fas fa-utensils me-2"></i>Opciones de catering
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Formulario -->
            <div class="col-lg-8">
              <form (ngSubmit)="crearReserva()" #reservaForm="ngForm" class="reserva-form">
                
                <!-- Información del evento -->
                <div class="form-section">
                  <h5><i class="fas fa-info-circle me-2"></i>Información del Evento</h5>
                  
                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label>Nombre del Evento*</label>
                        <input type="text" class="form-control" [(ngModel)]="reservaData.nombreEvento" 
                               name="nombreEvento" required 
                               placeholder="Ej: Congreso Anual de Ventas 2025">
                      </div>
                    </div>
                    
                    <div class="col-md-12">
                      <div class="form-group">
                        <label>Descripción del Evento</label>
                        <textarea class="form-control" [(ngModel)]="reservaData.descripcionEvento" 
                                  name="descripcionEvento" rows="3"
                                  placeholder="Describe brevemente el propósito y características del evento..."></textarea>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Tipo de Evento*</label>
                        <select class="form-control" [(ngModel)]="reservaData.tipoEvento" name="tipoEvento" required>
                          <option value="evento_corporativo">Evento Corporativo</option>
                          <option value="reunion_negocios">Reunión de Negocios</option>
                          <option value="congreso">Congreso</option>
                          <option value="capacitacion">Capacitación</option>
                          <option value="celebracion_empresarial">Celebración Empresarial</option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Número de Asistentes*</label>
                        <input type="number" class="form-control" [(ngModel)]="reservaData.numeroAsistentes" 
                               name="numeroAsistentes" required
                               [min]="paquete.capacidadMinima" [max]="paquete.capacidadMaxima"
                               placeholder="Cantidad de personas">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fechas y horarios -->
                <div class="form-section">
                  <h5><i class="fas fa-calendar-alt me-2"></i>Fechas y Horarios</h5>
                  
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Fecha de Inicio*</label>
                        <input type="date" class="form-control" [(ngModel)]="reservaData.fechaInicio" 
                               name="fechaInicio" required [min]="fechaMinima">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Fecha de Fin*</label>
                        <input type="date" class="form-control" [(ngModel)]="reservaData.fechaFin" 
                               name="fechaFin" required [min]="reservaData.fechaInicio">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Hora de Inicio*</label>
                        <input type="time" class="form-control" [(ngModel)]="reservaData.horaInicio" 
                               name="horaInicio" required>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Hora de Fin*</label>
                        <input type="time" class="form-control" [(ngModel)]="reservaData.horaFin" 
                               name="horaFin" required>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Información de la empresa -->
                <div class="form-section">
                  <h5><i class="fas fa-building me-2"></i>Información de la Empresa</h5>
                  
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Razón Social*</label>
                        <input type="text" class="form-control" [(ngModel)]="reservaData.datosEmpresa.razonSocial" 
                               name="razonSocial" required placeholder="Nombre completo de la empresa">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>NIT*</label>
                        <input type="text" class="form-control" [(ngModel)]="reservaData.datosEmpresa.nit" 
                               name="nit" required placeholder="123456789-0">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" class="form-control" [(ngModel)]="reservaData.datosEmpresa.telefono" 
                               name="telefono" placeholder="+57 300 123 4567">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Email de Facturación</label>
                        <input type="email" class="form-control" [(ngModel)]="reservaData.datosEmpresa.email" 
                               name="emailEmpresa" placeholder="facturacion@empresa.com">
                      </div>
                    </div>
                    
                    <div class="col-md-12">
                      <div class="form-group">
                        <label>Dirección</label>
                        <textarea class="form-control" [(ngModel)]="reservaData.datosEmpresa.direccion" 
                                  name="direccion" rows="2" placeholder="Dirección completa de la empresa"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contacto principal -->
                <div class="form-section">
                  <h5><i class="fas fa-user-tie me-2"></i>Contacto Principal</h5>
                  
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Nombre Completo*</label>
                        <input type="text" class="form-control" [(ngModel)]="getContactoPrincipal().nombre" 
                               (ngModelChange)="setContactoPrincipal('nombre', $event)"
                               name="nombreContacto" required placeholder="Nombre del responsable">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Cargo*</label>
                        <input type="text" class="form-control" [(ngModel)]="getContactoPrincipal().cargo" 
                               (ngModelChange)="setContactoPrincipal('cargo', $event)"
                               name="cargoContacto" required placeholder="Director, Gerente, etc.">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Teléfono de Contacto*</label>
                        <input type="tel" class="form-control" [(ngModel)]="getContactoPrincipal().telefono" 
                               (ngModelChange)="setContactoPrincipal('telefono', $event)"
                               name="telefonoContacto" required placeholder="+57 300 123 4567">
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Email de Contacto*</label>
                        <input type="email" class="form-control" [(ngModel)]="getContactoPrincipal().email" 
                               (ngModelChange)="setContactoPrincipal('email', $event)"
                               name="emailContacto" required placeholder="contacto@empresa.com">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Método de pago -->
                <div class="form-section">
                  <h5><i class="fas fa-credit-card me-2"></i>Método de Pago</h5>
                  
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Forma de Pago*</label>
                        <select class="form-control" [(ngModel)]="reservaData.metodoPago.tipo" name="metodoPago" required>
                          <option value="transferencia">Transferencia Bancaria</option>
                          <option value="tarjeta_credito">Tarjeta de Crédito</option>
                          <option value="cheque">Cheque</option>
                          <option value="credito_empresarial">Crédito Empresarial</option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Porcentaje de Anticipo*</label>
                        <select class="form-control" [(ngModel)]="reservaData.metodoPago.anticipoPorcentaje" name="anticipoPorcentaje" required>
                          <option value="30">30%</option>
                          <option value="50">50%</option>
                          <option value="70">70%</option>
                          <option value="100">100% (Pago completo)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notas adicionales -->
                <div class="form-section">
                  <h5><i class="fas fa-sticky-note me-2"></i>Observaciones</h5>
                  
                  <div class="form-group">
                    <label>Notas Adicionales</label>
                    <textarea class="form-control" [(ngModel)]="reservaData.notas" 
                              name="notas" rows="4" 
                              placeholder="Incluya cualquier requerimiento especial, restricciones alimentarias, necesidades de accesibilidad, etc."></textarea>
                  </div>
                </div>

                <!-- Resumen de precios -->
                <div class="resumen-precios">
                  <h5><i class="fas fa-calculator me-2"></i>Resumen de Precios</h5>
                  <div class="precio-breakdown">
                    <div class="precio-item">
                      <span>Precio base del paquete:</span>
                      <span>\${{ formatearPrecio(paquete.precios.base) }}</span>
                    </div>
                    <div class="precio-item">
                      <span>IVA (19%):</span>
                      <span>\${{ formatearPrecio(calcularIVA()) }}</span>
                    </div>
                    <div class="precio-item total">
                      <span><strong>Total estimado:</strong></span>
                      <span><strong>\${{ formatearPrecio(calcularTotal()) }}</strong></span>
                    </div>
                    <div class="precio-item anticipo">
                      <span>Anticipo ({{ reservaData.metodoPago.anticipoPorcentaje }}%):</span>
                      <span>\${{ formatearPrecio(calcularAnticipo()) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Términos y condiciones -->
                <div class="terminos-section">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" [(ngModel)]="aceptaTerminos" 
                           name="aceptaTerminos" id="aceptaTerminos" required>
                    <label class="form-check-label" for="aceptaTerminos">
                      Acepto los términos y condiciones, políticas de cancelación y privacidad del hotel
                    </label>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="volver()">
                    <i class="fas fa-times me-2"></i>Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" 
                          [disabled]="!reservaForm.valid || !aceptaTerminos || enviando">
                    <i class="fas fa-check me-2" *ngIf="!enviando"></i>
                    <i class="fas fa-spinner fa-spin me-2" *ngIf="enviando"></i>
                    {{ enviando ? 'Procesando...' : 'Confirmar Reserva' }}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservar-paquete.component.css']
})
export class ReservarPaqueteComponent implements OnInit {
  paqueteId: string = '';
  paquete: PaqueteDisponible | null = null;
  
  cargando = false;
  enviando = false;
  error: string = '';
  aceptaTerminos = false;
  fechaMinima: string = '';

  reservaData: ReservaPaquete = {
    paquete: '',
    nombreEvento: '',
    descripcionEvento: '',
    tipoEvento: 'evento_corporativo',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '08:00',
    horaFin: '17:00',
    numeroAsistentes: 1,
    datosEmpresa: {
      razonSocial: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: '',
      contactoPrincipal: {
        nombre: '',
        cargo: '',
        telefono: '',
        email: ''
      }
    },
    metodoPago: {
      tipo: 'transferencia',
      anticipoPorcentaje: 50
    },
    notas: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservaPaqueteService: ReservaPaqueteService,
    private authService: AuthService
  ) {
    // Establecer fecha mínima (mañana)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    this.fechaMinima = mañana.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.paqueteId = this.route.snapshot.paramMap.get('id') || '';
    if (this.paqueteId) {
      this.cargarPaquete();
    } else {
      this.error = 'ID de paquete no válido';
    }
  }

  /**
   * Cargar información del paquete
   */
  cargarPaquete(): void {
    this.cargando = true;
    
    this.reservaPaqueteService.obtenerDetallePaquete(this.paqueteId).subscribe({
      next: (response) => {
        if (response.success) {
          this.paquete = response.paquete;
          this.reservaData.paquete = this.paqueteId;
          
          // Establecer valores por defecto
          if (this.paquete.capacidadMinima) {
            this.reservaData.numeroAsistentes = this.paquete.capacidadMinima;
          }
        } else {
          this.error = 'No se pudo cargar la información del paquete';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar paquete:', err);
        this.error = 'Error al cargar la información del paquete';
        this.cargando = false;
      }
    });
  }

  /**
   * Crear la reserva
   */
  crearReserva(): void {
    if (!this.aceptaTerminos) {
      alert('Debe aceptar los términos y condiciones');
      return;
    }

    this.enviando = true;
    
    this.reservaPaqueteService.crearReservaPaquete(this.reservaData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('¡Reserva creada exitosamente! Número de reserva: ' + response.reserva.numeroReserva);
          this.router.navigate(['/mis-reservas-paquetes']);
        } else {
          alert('Error al crear la reserva');
        }
        this.enviando = false;
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        alert('Error al procesar la reserva. Intente nuevamente.');
        this.enviando = false;
      }
    });
  }

  /**
   * Calcular IVA
   */
  calcularIVA(): number {
    if (!this.paquete) return 0;
    return this.paquete.precios.base * 0.19;
  }

  /**
   * Calcular total
   */
  calcularTotal(): number {
    if (!this.paquete) return 0;
    return this.paquete.precios.base + this.calcularIVA();
  }

  /**
   * Calcular anticipo
   */
  calcularAnticipo(): number {
    return this.calcularTotal() * (this.reservaData.metodoPago.anticipoPorcentaje / 100);
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  /**
   * Obtener etiqueta del tipo de evento
   */
  getTipoEventoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'evento_corporativo': 'Evento Corporativo',
      'reunion_negocios': 'Reunión de Negocios',
      'congreso': 'Congreso',
      'capacitacion': 'Capacitación',
      'celebracion_empresarial': 'Celebración Empresarial'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Obtener contacto principal de forma segura
   */
  getContactoPrincipal(): any {
    if (!this.reservaData.datosEmpresa.contactoPrincipal) {
      this.reservaData.datosEmpresa.contactoPrincipal = {
        nombre: '',
        cargo: '',
        telefono: '',
        email: ''
      };
    }
    return this.reservaData.datosEmpresa.contactoPrincipal;
  }

  /**
   * Establecer valor del contacto principal
   */
  setContactoPrincipal(campo: string, valor: string): void {
    if (!this.reservaData.datosEmpresa.contactoPrincipal) {
      this.reservaData.datosEmpresa.contactoPrincipal = {
        nombre: '',
        cargo: '',
        telefono: '',
        email: ''
      };
    }
    (this.reservaData.datosEmpresa.contactoPrincipal as any)[campo] = valor;
  }

  /**
   * Volver a la página anterior
   */
  volver(): void {
    this.router.navigate(['/paquetes-empresariales']);
  }
}