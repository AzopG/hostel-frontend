import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaqueteService, OpcionesPaquete, ValidacionPaquete, SolicitudPaquete, ConfirmacionPaquete } from '../../services/paquete.service';
import { SalonService } from '../../services/salon.service';

/**
 * HU18: RESERVAR UN PAQUETE CORPORATIVO
 * 
 * Proceso de 7 pasos:
 * 1. Seleccionar fechas
 * 2. Seleccionar salón (CA1)
 * 3. Seleccionar habitaciones (CA1)
 * 4. Configurar catering (CA1)
 * 5. Validar disponibilidad conjunta (CA2)
 * 6. Revisar inconsistencias y alternativas (CA3)
 * 7. Confirmar y obtener código de paquete (CA4)
 */
@Component({
  selector: 'app-reservar-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservar-paquete.component.html',
  styleUrls: ['./reservar-paquete.component.css']
})
export class ReservarPaqueteComponent implements OnInit {
  hotelId: string = '';
  pasoActual: number = 1;
  totalPasos: number = 7;

  // Datos del hotel
  hotel: any = null;
  
  // Datos del paquete
  opciones: OpcionesPaquete | null = null;
  
  // Selección del usuario
  fechaInicio: string = '';
  fechaFin: string = '';
  salonSeleccionado: any = null;
  habitacionesSeleccionadas: Array<{ tipo: string, cantidad: number, precio: number }> = [];
  cateringSeleccionado: any = null;
  
  // Validación (CA2 & CA3)
  validacion: ValidacionPaquete | null = null;
  mostrandoAlternativas: boolean = false;
  
  // Formularios
  formFechas: FormGroup;
  formEvento: FormGroup;
  formContacto: FormGroup;
  
  // Estados
  cargando: boolean = false;
  error: string = '';
  politicasAceptadas: boolean = false;
  
  // Confirmación (CA4)
  paqueteConfirmado: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private paqueteService: PaqueteService,
    private salonService: SalonService
  ) {
    // Formulario de fechas
    this.formFechas = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });

    // Formulario de evento
    this.formEvento = this.fb.group({
      nombreEvento: ['', Validators.required],
      tipoEvento: ['Corporativo', Validators.required],
      horarioInicio: ['08:00', Validators.required],
      horarioFin: ['18:00', Validators.required],
      responsable: ['', Validators.required],
      cargoResponsable: [''],
      telefonoResponsable: ['', Validators.required],
      layoutSeleccionado: ['', Validators.required],
      capacidadLayout: [0],
      requiremientosEspeciales: ['']
    });

    // Formulario de contacto
    this.formContacto = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      documento: [''],
      pais: ['Colombia'],
      ciudad: ['']
    });
  }

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('hotelId') || '';
    
    if (!this.hotelId) {
      this.error = 'No se especificó un hotel';
      return;
    }

    this.cargarHotel();
  }

  cargarHotel(): void {
    // El hotel se cargará cuando se obtengan las opciones del paquete
    // Ya que iniciarPaqueteCorporativo devuelve los datos del hotel
    this.cargando = false;
  }

  /**
   * PASO 1: Seleccionar fechas e iniciar paquete (CA1)
   */
  iniciarPaquete(): void {
    if (this.formFechas.invalid) {
      this.error = 'Por favor complete las fechas del evento';
      return;
    }

    this.fechaInicio = this.formFechas.value.fechaInicio;
    this.fechaFin = this.formFechas.value.fechaFin;

    // Validar que fechaFin sea posterior a fechaInicio
    if (new Date(this.fechaFin) <= new Date(this.fechaInicio)) {
      this.error = 'La fecha de fin debe ser posterior a la fecha de inicio';
      return;
    }

    this.cargando = true;
    this.error = '';

    // CA1: Iniciar selección de paquete
    this.paqueteService.iniciarPaqueteCorporativo(this.hotelId, this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (response) => {
          this.opciones = response;
          this.pasoActual = 2; // Avanzar a selección de salón
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al iniciar paquete:', err);
          this.error = err.error?.message || 'Error al cargar opciones de paquete';
          this.cargando = false;
        }
      });
  }

  /**
   * PASO 2: Seleccionar salón (CA1)
   */
  seleccionarSalon(salon: any): void {
    this.salonSeleccionado = salon;
    
    // Configurar layout por defecto
    if (salon.layouts && salon.layouts.length > 0) {
      const layoutDefecto = salon.layouts[0];
      this.formEvento.patchValue({
        layoutSeleccionado: layoutDefecto.tipo,
        capacidadLayout: layoutDefecto.capacidad
      });
    }
    
    this.error = '';
  }

  avanzarDesdeSalon(): void {
    if (!this.salonSeleccionado) {
      this.error = 'Debe seleccionar un salón';
      return;
    }
    this.pasoActual = 3; // Avanzar a habitaciones
  }

  /**
   * PASO 3: Seleccionar habitaciones (CA1)
   */
  agregarHabitacion(tipoHabitacion: any): void {
    const existente = this.habitacionesSeleccionadas.find(h => h.tipo === tipoHabitacion.tipo);
    
    if (existente) {
      // Validar que no supere la cantidad disponible
      if (existente.cantidad < tipoHabitacion.cantidad) {
        existente.cantidad++;
      } else {
        this.error = `Solo hay ${tipoHabitacion.cantidad} habitaciones tipo ${tipoHabitacion.tipo} disponibles`;
      }
    } else {
      this.habitacionesSeleccionadas.push({
        tipo: tipoHabitacion.tipo,
        cantidad: 1,
        precio: tipoHabitacion.precio
      });
    }
  }

  quitarHabitacion(tipo: string): void {
    const habitacion = this.habitacionesSeleccionadas.find(h => h.tipo === tipo);
    if (habitacion) {
      habitacion.cantidad--;
      if (habitacion.cantidad === 0) {
        this.habitacionesSeleccionadas = this.habitacionesSeleccionadas.filter(h => h.tipo !== tipo);
      }
    }
  }

  avanzarDesdeHabitaciones(): void {
    if (this.habitacionesSeleccionadas.length === 0) {
      this.error = 'Debe seleccionar al menos una habitación';
      return;
    }
    this.error = '';
    this.pasoActual = 4; // Avanzar a catering
  }

  /**
   * PASO 4: Configurar catering (CA1)
   */
  seleccionarCatering(opcion: any): void {
    this.cateringSeleccionado = {
      incluido: true,
      tipo: opcion.tipo,
      numeroPersonas: this.salonSeleccionado?.capacidad || 50,
      precioPorPersona: opcion.precioPorPersona,
      menuSeleccionado: opcion.descripcion,
      restriccionesAlimentarias: ''
    };
    this.error = '';
  }

  omitirCatering(): void {
    this.cateringSeleccionado = null;
    this.error = '';
  }

  avanzarDesdeCatering(): void {
    this.pasoActual = 5; // Avanzar a validación
  }

  /**
   * PASO 5: Validar disponibilidad conjunta (CA2)
   */
  validarDisponibilidad(): void {
    this.cargando = true;
    this.error = '';
    this.validacion = null;

    const solicitud: SolicitudPaquete = {
      hotelId: this.hotelId,
      salonId: this.salonSeleccionado._id,
      habitaciones: this.habitacionesSeleccionadas.map(h => ({
        tipo: h.tipo,
        cantidad: h.cantidad
      })),
      catering: this.cateringSeleccionado ? {
        tipo: this.cateringSeleccionado.tipo,
        numeroPersonas: this.cateringSeleccionado.numeroPersonas
      } : undefined,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      horarioEvento: {
        inicio: this.formEvento.value.horarioInicio,
        fin: this.formEvento.value.horarioFin
      }
    };

    // CA2: Validar disponibilidad conjunta
    this.paqueteService.validarDisponibilidadPaquete(solicitud).subscribe({
      next: (response) => {
        this.validacion = response;
        this.cargando = false;

        if (response.todosDisponibles) {
          // CA2: Todo disponible, avanzar a datos del evento
          this.pasoActual = 6;
        } else {
          // CA3: Hay inconsistencias, mostrar alternativas
          this.mostrandoAlternativas = true;
        }
      },
      error: (err) => {
        console.error('Error en validación:', err);
        
        // CA3: Manejar inconsistencias
        if (err.status === 409 && err.error.inconsistencias) {
          this.validacion = err.error;
          this.mostrandoAlternativas = true;
          this.cargando = false;
        } else {
          this.error = err.error?.message || 'Error al validar disponibilidad';
          this.cargando = false;
        }
      }
    });
  }

  /**
   * PASO 6: Revisar inconsistencias y seleccionar alternativas (CA3)
   */
  seleccionarSalonAlternativo(salon: any): void {
    this.salonSeleccionado = salon;
    this.mostrandoAlternativas = false;
    this.validacion = null;
    this.pasoActual = 5; // Volver a validar
  }

  ajustarHabitaciones(): void {
    // Permitir al usuario ajustar las habitaciones según alternativas
    this.mostrandoAlternativas = false;
    this.pasoActual = 3; // Volver a selección de habitaciones
  }

  cambiarFechas(): void {
    this.mostrandoAlternativas = false;
    this.pasoActual = 1; // Volver a selección de fechas
  }

  continuarConValidacion(): void {
    if (this.validacion?.todosDisponibles) {
      this.pasoActual = 6; // Avanzar a datos del evento
    } else {
      this.error = 'Debe resolver las inconsistencias antes de continuar';
    }
  }

  /**
   * PASO 7: Confirmar reserva de paquete (CA4)
   */
  confirmarPaquete(): void {
    if (this.formEvento.invalid) {
      this.error = 'Por favor complete los datos del evento';
      return;
    }

    if (this.formContacto.invalid) {
      this.error = 'Por favor complete los datos de contacto';
      return;
    }

    if (!this.politicasAceptadas) {
      this.error = 'Debe aceptar las políticas de cancelación';
      return;
    }

    if (!this.validacion?.todosDisponibles) {
      this.error = 'Debe validar la disponibilidad antes de confirmar';
      return;
    }

    this.cargando = true;
    this.error = '';

    // Obtener IDs específicos de habitaciones de la validación
    const habitacionesConIds = this.validacion.detalles.habitaciones
      .filter(h => h.suficientes)
      .flatMap(h => h.ids.map(id => ({
        habitacionId: id,
        tipo: h.tipo
      })));

    const confirmacion: ConfirmacionPaquete = {
      hotelId: this.hotelId,
      salonId: this.salonSeleccionado._id,
      habitaciones: habitacionesConIds,
      catering: this.cateringSeleccionado,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      datosEvento: {
        nombreEvento: this.formEvento.value.nombreEvento,
        tipoEvento: this.formEvento.value.tipoEvento,
        horarioInicio: this.formEvento.value.horarioInicio,
        horarioFin: this.formEvento.value.horarioFin,
        responsable: this.formEvento.value.responsable,
        cargoResponsable: this.formEvento.value.cargoResponsable,
        telefonoResponsable: this.formEvento.value.telefonoResponsable,
        layoutSeleccionado: this.formEvento.value.layoutSeleccionado,
        capacidadLayout: this.formEvento.value.capacidadLayout,
        serviciosAdicionales: [],
        requiremientosEspeciales: this.formEvento.value.requiremientosEspeciales
      },
      datosContacto: {
        nombre: this.formContacto.value.nombre,
        apellido: this.formContacto.value.apellido,
        email: this.formContacto.value.email,
        telefono: this.formContacto.value.telefono,
        documento: this.formContacto.value.documento,
        pais: this.formContacto.value.pais,
        ciudad: this.formContacto.value.ciudad
      },
      politicasAceptadas: this.politicasAceptadas
    };

    // CA4: Confirmar paquete corporativo
    this.paqueteService.confirmarPaqueteCorporativo(confirmacion).subscribe({
      next: (response) => {
        this.paqueteConfirmado = response.paquete;
        this.pasoActual = 7; // Mostrar confirmación
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al confirmar paquete:', err);
        
        if (err.status === 409) {
          this.error = err.error.message + '. ' + (err.error.sugerencia || '');
        } else {
          this.error = err.error?.message || 'Error al confirmar el paquete';
        }
        
        this.cargando = false;
      }
    });
  }

  /**
   * Métodos auxiliares
   */
  calcularTotal(): number {
    if (!this.opciones) return 0;

    let total = 0;

    // Costo del salón
    if (this.salonSeleccionado) {
      const dias = this.opciones.fechas.dias;
      total += this.salonSeleccionado.precio * dias;
    }

    // Costo de habitaciones
    for (const hab of this.habitacionesSeleccionadas) {
      const noches = this.opciones.fechas.dias;
      total += hab.precio * hab.cantidad * noches;
    }

    // Costo de catering
    if (this.cateringSeleccionado && this.cateringSeleccionado.incluido) {
      total += this.cateringSeleccionado.precioPorPersona * this.cateringSeleccionado.numeroPersonas;
    }

    return total;
  }

  calcularDescuento(): number {
    const total = this.calcularTotal();
    const descuentoPorcentaje = this.opciones?.descuentoPaquete || 10;
    return Math.round(total * (descuentoPorcentaje / 100));
  }

  calcularTotalConDescuento(): number {
    return this.calcularTotal() - this.calcularDescuento();
  }

  retroceder(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.error = '';
    }
  }

  volver(): void {
    this.router.navigate(['/hoteles']);
  }

  irAMisReservas(): void {
    this.router.navigate(['/mis-reservas']);
  }

  irAlHome(): void {
    this.router.navigate(['/']);
  }

  descargarPDF(): void {
    // Implementar descarga de PDF con los detalles del paquete
    alert('Funcionalidad de descarga de PDF en desarrollo');
  }

  hoy(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
