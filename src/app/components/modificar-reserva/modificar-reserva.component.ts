import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  ReservaService, 
  ReservaCreada, 
  VerificarModificacionResponse,
  ModificarFechasRequest 
} from '../../services/reserva.service';

@Component({
  selector: 'app-modificar-reserva',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modificar-reserva.component.html',
  styleUrl: './modificar-reserva.component.css'
})
export class ModificarReservaComponent implements OnInit {
  // HU09: Estados del flujo
  pasoActual: 'verificando' | 'seleccionar-fechas' | 'confirmacion' | 'exito' | 'error' = 'verificando';
  
  // Datos de la reserva
  reserva: ReservaCreada | null = null;
  reservaId = '';
  
  // HU09 CA1 + CA4: Verificación de modificabilidad
  puedeModificar = false;
  motivoNoModificable = '';
  horasHastaCheckIn = 0;
  
  // Formulario de nuevas fechas
  fechasForm!: FormGroup;
  
  // HU09 CA2: Nuevos valores calculados
  nochesNuevas = 0;
  tarifaNueva = 0;
  diferenciaTarifa = 0;
  
  // Estados
  cargando = true;
  procesando = false;
  error = '';
  
  // HU09 CA3: Conflicto de disponibilidad
  conflictoDisponibilidad = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private reservaService: ReservaService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.reservaId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.reservaId) {
      this.error = 'ID de reserva inválido';
      this.pasoActual = 'error';
      this.cargando = false;
      return;
    }

    this.cargarReserva();
  }

  /**
   * Inicializar formulario de fechas
   */
  private inicializarFormulario(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const pasadoManana = new Date();
    pasadoManana.setDate(pasadoManana.getDate() + 3);

    this.fechasForm = this.fb.group({
      fechaInicio: [this.formatearFecha(manana), [Validators.required]],
      fechaFin: [this.formatearFecha(pasadoManana), [Validators.required]]
    });

    // Listener para calcular noches y tarifa
    this.fechasForm.valueChanges.subscribe(() => {
      this.calcularNuevaTarifa();
    });
  }

  /**
   * HU09 CA1: Cargar reserva y verificar si puede modificarse
   */
  private cargarReserva(): void {
    this.cargando = true;

    // Primero obtener datos de la reserva
    this.reservaService.obtenerReservaPorCodigo(this.reservaId).subscribe({
      next: (response) => {
        if (response.success && response.reserva) {
          this.reserva = response.reserva;
          
          // Pre-llenar formulario con fechas actuales
          this.fechasForm.patchValue({
            fechaInicio: this.formatearFecha(new Date(this.reserva.fechaInicio)),
            fechaFin: this.formatearFecha(new Date(this.reserva.fechaFin))
          });

          // HU09 CA1 + CA4: Verificar si puede modificarse
          this.verificarModificabilidad();
        }
      },
      error: (err) => {
        console.error('Error al cargar reserva:', err);
        this.error = 'No se pudo cargar la reserva';
        this.pasoActual = 'error';
        this.cargando = false;
      }
    });
  }

  /**
   * HU09 CA1 + CA4: Verificar si la reserva puede modificarse
   */
  private verificarModificabilidad(): void {
    if (!this.reserva) return;

    this.reservaService.verificarPuedeModificar(this.reserva._id).subscribe({
      next: (response: VerificarModificacionResponse) => {
        this.puedeModificar = response.puedeModificar;
        this.horasHastaCheckIn = response.horasHastaCheckIn || 0;

        if (!this.puedeModificar) {
          // CA1: No puede modificar
          this.motivoNoModificable = response.mensaje || 'No se puede modificar esta reserva';
          this.pasoActual = 'error';
        } else {
          // CA1: Puede modificar
          this.pasoActual = 'seleccionar-fechas';
        }
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al verificar modificabilidad:', err);
        this.error = 'Error al verificar si puede modificarse la reserva';
        this.pasoActual = 'error';
        this.cargando = false;
      }
    });
  }

  /**
   * Calcular tarifa con las nuevas fechas
   */
  private calcularNuevaTarifa(): void {
    if (!this.reserva || !this.fechasForm.valid) {
      return;
    }

    const inicio = new Date(this.fechasForm.value.fechaInicio);
    const fin = new Date(this.fechasForm.value.fechaFin);

    if (inicio >= fin) {
      this.nochesNuevas = 0;
      this.tarifaNueva = 0;
      this.diferenciaTarifa = 0;
      return;
    }

    this.nochesNuevas = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    const precioPorNoche = this.reserva.tarifa.precioPorNoche;
    const subtotal = precioPorNoche * this.nochesNuevas;
    const impuestos = Math.round(subtotal * 0.19);
    this.tarifaNueva = subtotal + impuestos;
    this.diferenciaTarifa = this.tarifaNueva - this.reserva.tarifa.total;
  }

  /**
   * Ir al paso de confirmación
   */
  irAConfirmacion(): void {
    if (this.fechasForm.invalid) {
      Object.keys(this.fechasForm.controls).forEach(key => {
        this.fechasForm.get(key)?.markAsTouched();
      });
      return;
    }

    const inicio = new Date(this.fechasForm.value.fechaInicio);
    const fin = new Date(this.fechasForm.value.fechaFin);

    if (inicio >= fin) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    const ahora = new Date();
    if (inicio < ahora) {
      alert('La fecha de inicio no puede ser en el pasado');
      return;
    }

    this.calcularNuevaTarifa();
    this.pasoActual = 'confirmacion';
  }

  /**
   * Volver al paso anterior
   */
  volverPaso(): void {
    if (this.pasoActual === 'confirmacion') {
      this.pasoActual = 'seleccionar-fechas';
    }
  }

  /**
   * HU09 CA2 + CA3: Confirmar modificación de fechas
   */
  confirmarModificacion(): void {
    if (!this.reserva || this.fechasForm.invalid) {
      return;
    }

    this.procesando = true;

    const datos: ModificarFechasRequest = {
      fechaInicioNueva: this.fechasForm.value.fechaInicio,
      fechaFinNueva: this.fechasForm.value.fechaFin
    };

    this.reservaService.modificarFechasReserva(this.reserva._id, datos).subscribe({
      next: (response) => {
        if (response.success && response.reserva) {
          // CA2: Modificación exitosa
          this.reserva = response.reserva;
          this.pasoActual = 'exito';
        } else if (response.conflicto || !response.disponible) {
          // CA3: Conflicto de disponibilidad
          this.conflictoDisponibilidad = true;
          this.error = response.message || 'La habitación no está disponible para las nuevas fechas';
          this.pasoActual = 'error';
        } else if (!response.puedeModificar) {
          // CA4: Restricción temporal
          this.error = response.message || 'No se puede modificar la reserva';
          this.pasoActual = 'error';
        }
        this.procesando = false;
      },
      error: (err) => {
        console.error('Error al modificar fechas:', err);
        this.procesando = false;

        if (err.status === 409) {
          // CA3: Conflicto de disponibilidad
          this.conflictoDisponibilidad = true;
          this.error = err.error?.message || 'La habitación no está disponible';
        } else if (err.status === 400) {
          // CA1 o CA4: No puede modificar
          this.error = err.error?.message || 'No se puede modificar la reserva';
        } else {
          this.error = 'Error al modificar la reserva. Por favor, intenta nuevamente.';
        }

        this.pasoActual = 'error';
      }
    });
  }

  /**
   * Volver a la vista de reservas
   */
  volverAMisReservas(): void {
    this.router.navigate(['/dashboard/mis-reservas']);
  }

  /**
   * Ver detalle de la reserva
   */
  verDetalleReserva(): void {
    if (this.reserva) {
      this.router.navigate(['/reserva', this.reserva.codigoReserva]);
    }
  }

  /**
   * Formatear fecha para input type="date"
   */
  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
   * Obtener mensaje de error de campo
   */
  obtenerErrorCampo(campo: string): string {
    const control = this.fechasForm.get(campo);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    return '';
  }

  /**
   * Verificar si mostrar error de campo
   */
  mostrarError(campo: string): boolean {
    const control = this.fechasForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Volver a mis reservas
   */
  volver(): void {
    this.router.navigate(['/mis-reservas']);
  }

  /**
   * Ir al inicio
   */
  irAInicio(): void {
    this.router.navigate(['/']);
  }
}
