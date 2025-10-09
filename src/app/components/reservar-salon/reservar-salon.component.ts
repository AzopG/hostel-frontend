import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService, DatosEvento, DatosContacto } from '../../services/reserva.service';
import { SalonService } from '../../services/salon.service';

/**
 * HU17: Reservar un Salón
 * CA1: Inicio reserva - formulario con datos del evento
 * CA2: Conflicto simultáneo - notificar y permitir volver
 * CA3: Confirmación - generar código y bloquear horario
 * CA4: Políticas - mostrar condiciones antes de confirmar
 */
@Component({
  selector: 'app-reservar-salon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reservar-salon.component.html',
  styleUrl: './reservar-salon.component.css'
})
export class ReservarSalonComponent implements OnInit {
  // Estado del proceso
  pasoActual = 1; // 1: Datos evento, 2: Datos contacto, 3: Políticas, 4: Confirmación
  cargando = false;
  error = '';
  
  // Datos del salón y fechas (de la URL)
  salonId = '';
  fechaInicio = '';
  fechaFin = '';
  layoutId = '';
  
  // Información del salón
  salon: any = null;
  layoutSeleccionado: any = null;
  tarifaEstimada: any = null;
  dias = 0;
  
  // Formularios por paso
  formularioEvento!: FormGroup;
  formularioContacto!: FormGroup;
  politicasAceptadas = false;
  
  // CA4: Políticas
  politicas: any = null;
  mostrarPoliticas = false;
  
  // CA3: Resultado de confirmación
  codigoReserva = '';
  reservaConfirmada: any = null;
  
  // CA2: Manejo de conflictos
  conflictoDetectado = false;
  mensajeConflicto = '';
  mostrarFloatingNotification = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private salonService: SalonService
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    // Inicializar propiedades
    this.mostrarFloatingNotification = true;
    
    // Obtener parámetros de la URL
    this.route.params.subscribe(params => {
      this.salonId = params['id'];
    });

    this.route.queryParams.subscribe(params => {
      this.fechaInicio = params['fechaInicio'] || '';
      this.fechaFin = params['fechaFin'] || '';
      this.layoutId = params['layoutId'] || '';
      
      if (this.salonId && this.fechaInicio && this.fechaFin) {
        this.iniciarReserva();
      }
    });
  }

  /**
   * Inicializar formularios con validaciones
   */
  private inicializarFormularios(): void {
    // CA1: Formulario de datos del evento
    this.formularioEvento = this.fb.group({
      nombreEvento: ['', [Validators.required, Validators.minLength(3)]],
      tipoEvento: ['Corporativo', Validators.required],
      horarioInicio: ['09:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      horarioFin: ['18:00', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      responsable: ['', [Validators.required, Validators.minLength(3)]],
      cargoResponsable: [''],
      telefonoResponsable: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      serviciosAdicionales: [[]],
      requiremientosEspeciales: ['']
    });

    // CA1: Formulario de datos de contacto
    this.formularioContacto = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      documento: [''],
      pais: ['Colombia'],
      ciudad: ['']
    });
  }

  /**
   * CA1: Iniciar reserva - Obtener información del salón y tarifa
   */
  iniciarReserva(): void {
    this.cargando = true;
    this.error = '';

    const datos = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      layoutId: this.layoutId
    };

    this.reservaService.iniciarReservaSalon(this.salonId, datos).subscribe({
      next: (response) => {
        if (response.success) {
          this.salon = response.salon;
          this.layoutSeleccionado = response.layoutSeleccionado;
          this.tarifaEstimada = response.tarifaEstimada;
          this.dias = response.fechas.dias;
          
          // CA4: Cargar políticas
          this.cargarPoliticas();
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al iniciar reserva:', err);
        this.error = err.error?.message || 'Error al cargar la información del salón';
        this.mostrarFloatingNotification = true;
        this.cargando = false;
      }
    });
  }

  /**
   * CA4: Cargar políticas de reserva
   */
  cargarPoliticas(): void {
    const hotelId = this.salon?.hotel?._id;
    this.reservaService.obtenerPoliticasReservaSalon(hotelId).subscribe({
      next: (response) => {
        if (response.success) {
          this.politicas = response.politicas;
        }
      },
      error: (err) => {
        console.error('Error al cargar políticas:', err);
      }
    });
  }

  /**
   * Avanzar al siguiente paso
   */
  siguientePaso(): void {
    if (this.pasoActual === 1 && this.formularioEvento.valid) {
      this.pasoActual = 2;
      this.scrollToTop();
    } else if (this.pasoActual === 2 && this.formularioContacto.valid) {
      this.pasoActual = 3;
      this.scrollToTop();
    } else if (this.pasoActual === 3 && this.politicasAceptadas) {
      // CA2: Verificar disponibilidad antes de confirmar
      this.verificarDisponibilidadFinal();
    } else {
      // Marcar campos como tocados para mostrar errores
      if (this.pasoActual === 1) {
        this.formularioEvento.markAllAsTouched();
      } else if (this.pasoActual === 2) {
        this.formularioContacto.markAllAsTouched();
      }
    }
  }

  /**
   * Volver al paso anterior
   */
  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.scrollToTop();
    }
  }

  /**
   * CA2: Verificar disponibilidad en tiempo real antes de confirmar
   */
  verificarDisponibilidadFinal(): void {
    this.cargando = true;
    this.error = '';
    this.conflictoDetectado = false;

    const datosEvento = this.formularioEvento.value;

    const datos = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      horarioInicio: datosEvento.horarioInicio,
      horarioFin: datosEvento.horarioFin
    };

    this.reservaService.verificarDisponibilidadSalonTiempoReal(this.salonId, datos).subscribe({
      next: (response) => {
        this.cargando = false;
        
        if (response.disponible) {
          // CA3: Disponible - Proceder a confirmar
          this.confirmarReserva();
        } else {
          // CA2: Conflicto detectado
          this.conflictoDetectado = true;
          this.mensajeConflicto = response.message || '¡ATENCIÓN! Este salón ya está reservado';
          this.error = response.sugerencia || 'Por favor, seleccione otras fechas u horarios para su reserva o explore otros salones disponibles.';
          
          // Scroll hacia la alerta para asegurar que el usuario la vea
          setTimeout(() => {
            const alertaElement = document.querySelector('.alerta-conflicto');
            if (alertaElement) {
              alertaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Aplicar clase de destaque
              alertaElement.classList.add('destacado');
              setTimeout(() => {
                alertaElement.classList.remove('destacado');
              }, 1000);
            }
          }, 100);
        }
      },
      error: (err) => {
        console.error('Error al verificar disponibilidad:', err);
        this.cargando = false;
        
        if (err.status === 409) {
          // CA2: Conflicto
          this.conflictoDetectado = true;
          this.mensajeConflicto = err.error.message || '¡ATENCIÓN! Este salón ya está reservado';
          this.error = err.error.sugerencia || 'El horario seleccionado ya está ocupado. Por favor, seleccione otras fechas u horarios para su reserva.';
          
          // Scroll hacia la alerta para asegurar que el usuario la vea
          setTimeout(() => {
            const alertaElement = document.querySelector('.alerta-conflicto');
            if (alertaElement) {
              alertaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Aplicar clase de destaque
              alertaElement.classList.add('destacado');
              setTimeout(() => {
                alertaElement.classList.remove('destacado');
              }, 1000);
            }
          }, 100);
        } else {
          this.error = 'Error al verificar disponibilidad. Por favor, intenta nuevamente.';
          this.mostrarFloatingNotification = true;
        }
      }
    });
  }

  /**
   * CA3: Confirmar reserva de salón
   */
  confirmarReserva(): void {
    this.cargando = true;
    this.error = '';
    this.conflictoDetectado = false; // Reset conflict state

    const datosEvento: DatosEvento = {
      ...this.formularioEvento.value,
      layoutSeleccionado: this.layoutSeleccionado?.nombre,
      capacidadLayout: this.layoutSeleccionado?.capacidad
    };

    const datosContacto: DatosContacto = this.formularioContacto.value;

    const datos = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      datosEvento: datosEvento,
      datosContacto: datosContacto,
      politicasAceptadas: this.politicasAceptadas
    };

    this.reservaService.confirmarReservaSalon(this.salonId, datos).subscribe({
      next: (response) => {
        this.cargando = false;
        
        if (response.success && response.reserva) {
          // CA3: Reserva confirmada exitosamente
          this.codigoReserva = response.reserva.codigoReserva;
          this.reservaConfirmada = response.reserva;
          this.pasoActual = 4; // Mostrar confirmación
          this.scrollToTop();
        } else if (response.conflicto) {
          // CA2: Conflicto detectado en el último momento
          this.manejarConflicto(response.message || '', response.sugerencia || '');
        }
      },
      error: (err) => {
        console.error('Error al confirmar reserva:', err);
        this.cargando = false;
        
        if (err.status === 409) {
          // CA2: Conflicto
          this.manejarConflicto(
            err.error.message || '¡ATENCIÓN! Este salón ya está reservado', 
            err.error.sugerencia || 'El horario seleccionado ya está ocupado. Por favor, seleccione otras fechas u horarios para su reserva.'
          );
        } else {
          this.error = err.error?.message || 'Error al confirmar la reserva. Por favor, intenta nuevamente.';
        }
      }
    });
  }
  
  /**
   * Maneja la visualización del conflicto de reserva
   */
  private manejarConflicto(mensaje: string, sugerencia: string): void {
    this.conflictoDetectado = true;
    this.mensajeConflicto = mensaje || '¡ATENCIÓN! Este salón ya está reservado';
    this.error = sugerencia || 'El horario seleccionado ya está ocupado. Por favor, seleccione otras fechas u horarios.';
    this.mostrarFloatingNotification = true;
    
    // Volver al paso 1 para permitir cambiar fechas/horarios
    this.pasoActual = 1;
    
    // Scroll hacia la alerta para asegurar que el usuario la vea
    setTimeout(() => {
      const alertaElement = document.querySelector('.alerta-conflicto');
      if (alertaElement) {
        alertaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Aplicar una clase temporal para llamar la atención
        alertaElement.classList.add('destacado');
        setTimeout(() => {
          alertaElement.classList.remove('destacado');
        }, 1000);
      }
    }, 100);
  }
  
  /**
   * Cierra la notificación flotante
   */
  cerrarNotificacion(): void {
    this.mostrarFloatingNotification = false;
    // Si hay un conflicto activo, lo mantenemos para la alerta inline
    if (!this.conflictoDetectado) {
      this.error = '';
    }
  }

  /**
   * CA2: Volver a la búsqueda de salones
   */
  volverABusqueda(): void {
    this.router.navigate(['/busqueda-salones']);
  }

  /**
   * Ir al home
   */
  irAlHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * CA4: Toggle para mostrar/ocultar políticas detalladas
   */
  togglePoliticas(): void {
    this.mostrarPoliticas = !this.mostrarPoliticas;
  }

  /**
   * Formatear precio en COP
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(fecha).toLocaleDateString('es-CO', opciones);
  }

  /**
   * Scroll al inicio de la página
   */
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Verificar si un campo es inválido y fue tocado
   */
  campoInvalido(formulario: FormGroup, campo: string): boolean {
    const control = formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  obtenerError(formulario: FormGroup, campo: string): string {
    const control = formulario.get(campo);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    
    if (control.errors['email']) {
      return 'Email inválido';
    }
    
    if (control.errors['pattern']) {
      if (campo.includes('telefono')) {
        return 'Debe ser un teléfono de 10 dígitos';
      }
      if (campo.includes('horario')) {
        return 'Formato: HH:MM (ej: 09:00)';
      }
    }

    return 'Campo inválido';
  }
}
