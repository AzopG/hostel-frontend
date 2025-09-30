import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService, DetalleHabitacion, TarifaDesglose } from '../../services/habitacion.service';
import { ReservaService, CrearReservaRequest, ReservaCreada } from '../../services/reserva.service';

@Component({
  selector: 'app-reservar-habitacion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservar-habitacion.component.html',
  styleUrl: './reservar-habitacion.component.css'
})
export class ReservarHabitacionComponent implements OnInit {
  // HU08: Estados del flujo de reserva
  pasoActual: 'resumen' | 'datos' | 'confirmacion' | 'exito' | 'error' = 'resumen';
  
  // Datos de la habitación (HU07)
  habitacion: DetalleHabitacion | null = null;
  fechaInicio = '';
  fechaFin = '';
  huespedes = 2;
  
  // Tarifa (HU07 CA3)
  tarifa: TarifaDesglose | null = null;
  noches = 0;
  
  // HU08 CA1: Formulario de datos del huésped
  datosForm!: FormGroup;
  
  // HU08 CA4: Políticas
  politicasAceptadas = false;
  
  // HU08 CA2: Reserva creada
  reservaCreada: ReservaCreada | null = null;
  
  // Estados
  cargando = true;
  procesando = false;
  error = '';
  
  // HU08 CA3: Conflicto de disponibilidad
  conflictoDisponibilidad = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private habitacionService: HabitacionService,
    private reservaService: ReservaService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    // Obtener ID de habitación
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID de habitación no proporcionado';
      this.cargando = false;
      this.pasoActual = 'error';
      return;
    }

    // Obtener query params (fechas y huéspedes)
    this.route.queryParams.subscribe(params => {
      this.fechaInicio = params['fechaInicio'] || '';
      this.fechaFin = params['fechaFin'] || '';
      this.huespedes = parseInt(params['huespedes']) || 2;
      
      // Validar que haya fechas
      if (!this.fechaInicio || !this.fechaFin) {
        this.error = 'Debe seleccionar fechas para reservar';
        this.cargando = false;
        this.pasoActual = 'error';
        return;
      }
      
      // Cargar datos de la habitación
      this.cargarDatosHabitacion(id);
    });
  }

  /**
   * CA1: Inicializar formulario de datos del huésped
   */
  private inicializarFormulario(): void {
    this.datosForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]+$/)]],
      documento: [''],
      pais: ['Colombia'],
      ciudad: [''],
      notas: ['']
    });
  }

  /**
   * Cargar datos de habitación y calcular tarifa
   */
  private cargarDatosHabitacion(id: string): void {
    this.cargando = true;
    
    // Cargar detalle
    this.habitacionService.obtenerDetalle(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.habitacion = response.habitacion;
          
          // Calcular tarifa
          this.habitacionService.calcularTarifa(id, this.fechaInicio, this.fechaFin).subscribe({
            next: (tarifaResponse) => {
              if (tarifaResponse.success) {
                this.tarifa = tarifaResponse.tarifa.desglose;
                this.noches = tarifaResponse.tarifa.noches;
                this.cargando = false;
              }
            },
            error: (err) => {
              console.error('Error al calcular tarifa:', err);
              this.error = 'Error al calcular la tarifa';
              this.cargando = false;
              this.pasoActual = 'error';
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar habitación:', err);
        this.error = 'Error al cargar los datos de la habitación';
        this.cargando = false;
        this.pasoActual = 'error';
      }
    });
  }

  /**
   * CA1: Avanzar al formulario de datos
   */
  irADatos(): void {
    this.pasoActual = 'datos';
  }

  /**
   * CA1 + CA4: Avanzar a confirmación
   */
  irAConfirmacion(): void {
    if (this.datosForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.datosForm.controls).forEach(key => {
        this.datosForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.pasoActual = 'confirmacion';
  }

  /**
   * Volver al paso anterior
   */
  volverPaso(): void {
    if (this.pasoActual === 'datos') {
      this.pasoActual = 'resumen';
    } else if (this.pasoActual === 'confirmacion') {
      this.pasoActual = 'datos';
    }
  }

  /**
   * CA2 + CA3: Confirmar reserva
   */
  confirmarReserva(): void {
    // CA4: Validar que se aceptaron las políticas
    if (!this.politicasAceptadas) {
      alert('Debe aceptar las políticas de cancelación para continuar');
      return;
    }

    if (!this.habitacion || !this.tarifa) {
      return;
    }

    this.procesando = true;
    this.error = '';

    const datosReserva: CrearReservaRequest = {
      hotel: this.habitacion.hotel._id,
      habitacion: this.habitacion._id,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      huespedes: this.huespedes,
      datosHuesped: {
        nombre: this.datosForm.value.nombre,
        apellido: this.datosForm.value.apellido,
        email: this.datosForm.value.email,
        telefono: this.datosForm.value.telefono,
        documento: this.datosForm.value.documento || '',
        pais: this.datosForm.value.pais || 'Colombia',
        ciudad: this.datosForm.value.ciudad || ''
      },
      tarifa: {
        precioPorNoche: this.tarifa.precioPorNoche,
        subtotal: this.tarifa.subtotal,
        impuestos: this.tarifa.impuestos.monto,
        total: this.tarifa.total,
        moneda: 'COP'
      },
      politicasAceptadas: true,
      notas: this.datosForm.value.notas || ''
    };

    this.reservaService.crearReserva(datosReserva).subscribe({
      next: (response) => {
        this.procesando = false;
        
        if (response.success && response.reserva) {
          // CA2: Reserva creada exitosamente
          this.reservaCreada = response.reserva;
          this.pasoActual = 'exito';
        } else if (response.conflicto) {
          // CA3: Conflicto de disponibilidad
          this.conflictoDisponibilidad = true;
          this.error = response.message || 'La habitación ya no está disponible';
          this.pasoActual = 'error';
        } else {
          this.error = response.message || 'Error al crear la reserva';
          this.pasoActual = 'error';
        }
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        this.procesando = false;
        
        // CA3: Verificar si es conflicto de disponibilidad (409)
        if (err.status === 409) {
          this.conflictoDisponibilidad = true;
          this.error = err.error?.message || 'La habitación ya no está disponible para las fechas seleccionadas';
        } else {
          this.error = 'Error al procesar la reserva. Por favor, intente nuevamente.';
        }
        
        this.pasoActual = 'error';
      }
    });
  }

  /**
   * CA3: Volver a la búsqueda
   */
  volverABusqueda(): void {
    this.router.navigate(['/buscar-habitaciones'], {
      queryParams: {
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        huespedes: this.huespedes
      }
    });
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  /**
   * Ir al detalle de la habitación
   */
  verDetalle(): void {
    if (this.habitacion) {
      this.router.navigate(['/habitacion', this.habitacion._id], {
        queryParams: {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
          huespedes: this.huespedes
        }
      });
    }
  }

  /**
   * Ver detalle de mi reserva
   */
  verMiReserva(): void {
    if (this.reservaCreada && this.reservaCreada.codigoReserva) {
      // Por ahora redirige al dashboard o a home
      // En futuras HU se creará una página de detalle de reserva
      this.router.navigate(['/dashboard/mis-reservas'], {
        queryParams: {
          codigo: this.reservaCreada.codigoReserva
        }
      });
    }
  }

  /**
   * Validación de campo
   */
  obtenerErrorCampo(campo: string): string {
    const control = this.datosForm.get(campo);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Formato inválido';
    }
    
    return '';
  }

  /**
   * Verificar si un campo tiene error y ha sido tocado
   */
  mostrarError(campo: string): boolean {
    const control = this.datosForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}
