import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SalonService, Salon, BusquedaSalonesResponse } from '../../services/salon.service';
import { HotelService } from '../../services/hotel.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-busqueda-salones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './busqueda-salones.component.html',
  styleUrls: ['./busqueda-salones.component.css']
})
export class DashboardBusquedaSalonesComponent implements OnInit {
  busquedaForm!: FormGroup;
  salones: Salon[] = [];
  loading = false;
  error: string | null = null;
  mostrarResultados = false;
  sugerencias: any = null;
  
  // Opciones de ordenamiento (CA4)
  opcionesOrdenamiento = [
    { valor: 'capacidad_asc', etiqueta: 'Capacidad (menor a mayor)' },
    { valor: 'capacidad_desc', etiqueta: 'Capacidad (mayor a menor)' },
    { valor: 'precio_asc', etiqueta: 'Precio (menor a mayor)' },
    { valor: 'precio_desc', etiqueta: 'Precio (mayor a mayor)' },
    { valor: 'nombre', etiqueta: 'Nombre (A-Z)' }
  ];

  // HU15: Equipamiento disponible para filtrado
  equipamientoDisponible = [
    'Proyector',
    'Sistema de audio',
    'Micrófono',
    'Micrófono inalámbrico',
    'Pizarra',
    'Pizarra interactiva',
    'WiFi',
    'Aire acondicionado',
    'Catering',
    'Estacionamiento',
    'Accesibilidad',
    'Escenario',
    'Iluminación profesional',
    'Sistema de videoconferencia',
    'Pantalla LED 75"',
    'Proyector HD'
  ];

  equipamientoSeleccionado: string[] = [];
  mostrarEquipamientoExpandido = false; // HU15: Control de expansión

  // Hoteles cargados desde el backend
  hoteles: any[] = [];
  cargandoHoteles = false;

  constructor(
    private fb: FormBuilder,
    private salonService: SalonService,
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarHoteles();
    this.configurarRecalculoAutomatico(); // HU14 - CA3
    this.restaurarFiltrosDesdeStorage(); // HU15 - CA4: Restaurar filtros al cargar
  }

  cargarHoteles(): void {
    this.cargandoHoteles = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles.filter(hotel => hotel.activo);
        this.cargandoHoteles = false;
      },
      error: (error) => {
        console.error('Error al cargar hoteles:', error);
        this.cargandoHoteles = false;
        // Usar hoteles de ejemplo en caso de error
        this.hoteles = [
          { _id: '1', nombre: 'Hotel Central Plaza' },
          { _id: '2', nombre: 'Hotel Business Tower' },
          { _id: '3', nombre: 'Hotel Conference Center' }
        ];
      }
    });
  }

  inicializarFormulario(): void {
    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    this.busquedaForm = this.fb.group({
      hotelId: ['', Validators.required],
      capacidadMinima: [10, [Validators.required, Validators.min(1)]],
      fechaInicio: [hoy, Validators.required],
      fechaFin: [manana, Validators.required],
      ordenarPor: ['capacidad_asc']
    });
  }

  /**
   * HU14 - CA3: Configurar recálculo automático cuando cambien las fechas o capacidad
   * Usa debounceTime para no sobrecargar el servidor
   */
  configurarRecalculoAutomatico(): void {
    this.busquedaForm.valueChanges
      .pipe(
        debounceTime(500), // Espera 500ms después del último cambio
        distinctUntilChanged()
      )
      .subscribe(() => {
        // Si ya se realizó una búsqueda previa, recalcular automáticamente
        if (this.mostrarResultados && this.busquedaForm.valid) {
          this.buscarSalones();
        }
      });
  }

  /**
   * HU14 - CA1: Buscar salones disponibles
   */
  buscarSalones(): void {
    if (this.busquedaForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;
    this.error = null;
    this.sugerencias = null;

    const formValues = this.busquedaForm.value;
    
    // Validar que la fecha de inicio sea antes de la fecha fin
    if (new Date(formValues.fechaInicio) >= new Date(formValues.fechaFin)) {
      this.error = 'La fecha de inicio debe ser anterior a la fecha de fin';
      this.loading = false;
      return;
    }

    const params = {
      hotelId: formValues.hotelId,
      capacidadMinima: formValues.capacidadMinima,
      fechaInicio: formValues.fechaInicio,
      fechaFin: formValues.fechaFin,
      ordenarPor: formValues.ordenarPor,
      equipamiento: this.equipamientoSeleccionado.length > 0 ? this.equipamientoSeleccionado : undefined
    };

    this.salonService.buscarSalonesDisponibles(params).subscribe({
      next: (response: BusquedaSalonesResponse) => {
        this.salones = response.salones;
        this.mostrarResultados = true;
        this.loading = false;

        // HU14 - CA2: Mostrar sugerencias si no hay resultados
        if (response.salones.length === 0 && response.sugerencias) {
          this.sugerencias = response.sugerencias;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al buscar salones. Intente nuevamente.';
        this.loading = false;
        this.mostrarResultados = false;
      }
    });
  }

  /**
   * HU15 - CA1: Toggle de equipamiento con búsqueda automática
   */
  toggleEquipamiento(equip: string): void {
    const index = this.equipamientoSeleccionado.indexOf(equip);
    if (index > -1) {
      // HU15 - CA2: Remover filtro
      this.equipamientoSeleccionado.splice(index, 1);
    } else {
      // HU15 - CA1: Agregar filtro
      this.equipamientoSeleccionado.push(equip);
    }

    // HU15 - CA1/CA2: Actualizar búsqueda si ya hay resultados
    if (this.mostrarResultados && this.busquedaForm.valid) {
      this.buscarSalones();
    }

    // HU15 - CA4: Guardar en localStorage para persistencia
    this.guardarFiltrosEnStorage();
  }

  esEquipamientoSeleccionado(equip: string): boolean {
    return this.equipamientoSeleccionado.includes(equip);
  }

  /**
   * HU15 - CA3: Limpiar todos los filtros de equipamiento
   */
  limpiarFiltrosEquipamiento(): void {
    this.equipamientoSeleccionado = [];
    this.guardarFiltrosEnStorage();
    
    // Actualizar búsqueda si ya hay resultados
    if (this.mostrarResultados && this.busquedaForm.valid) {
      this.buscarSalones();
    }
  }

  /**
   * HU15 - CA4: Guardar filtros en localStorage
   */
  private guardarFiltrosEnStorage(): void {
    const filtros = {
      equipamiento: this.equipamientoSeleccionado,
      formulario: this.busquedaForm.value,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('busquedaSalones_filtros', JSON.stringify(filtros));
  }

  /**
   * HU15 - CA4: Restaurar filtros desde localStorage
   */
  private restaurarFiltrosDesdeStorage(): void {
    const filtrosGuardados = localStorage.getItem('busquedaSalones_filtros');
    if (filtrosGuardados) {
      try {
        const filtros = JSON.parse(filtrosGuardados);
        
        // Verificar que no sean muy antiguos (más de 1 hora)
        const timestamp = new Date(filtros.timestamp);
        const ahora = new Date();
        const diferenciaHoras = (ahora.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (diferenciaHoras < 1) {
          // Restaurar equipamiento
          if (filtros.equipamiento && Array.isArray(filtros.equipamiento)) {
            this.equipamientoSeleccionado = filtros.equipamiento;
          }
          
          // Restaurar formulario
          if (filtros.formulario) {
            this.busquedaForm.patchValue(filtros.formulario, { emitEvent: false });
          }
        }
      } catch (error) {
        console.error('Error al restaurar filtros:', error);
      }
    }
  }

  /**
   * HU15: Toggle para expandir/colapsar equipamiento
   */
  toggleEquipamientoExpandido(): void {
    this.mostrarEquipamientoExpandido = !this.mostrarEquipamientoExpandido;
  }

  /**
   * HU14 - CA3: Verificar disponibilidad específica cuando el usuario cambia fechas
   */
  verificarDisponibilidadSalon(salon: Salon): void {
    const formValues = this.busquedaForm.value;
    
    this.salonService.verificarDisponibilidad(
      salon._id,
      formValues.fechaInicio,
      formValues.fechaFin
    ).subscribe({
      next: (response) => {
        if (response.disponible) {
          alert(`✓ ${salon.nombre} está disponible\n\nPrecio total: $${response.precioInfo.precioTotal} (${response.precioInfo.dias} días)`);
        } else {
          alert(`✗ ${salon.nombre} no está disponible en estas fechas.\n\nConflictos encontrados: ${response.conflictos?.length || 0}`);
        }
      },
      error: (err) => {
        console.error('Error al verificar disponibilidad:', err);
      }
    });
  }

  /**
   * Acción para reservar un salón
   */
  reservarSalon(salon: Salon): void {
    // Aquí se integraría con el sistema de reservas
    alert(`Reservar salón: ${salon.nombre}\nCapacidad: ${salon.capacidad} personas\nPrecio total: $${salon.precioTotal}`);
  }

  /**
   * HU15 - CA3: Limpiar búsqueda completa (formulario + filtros)
   */
  limpiarBusqueda(): void {
    this.inicializarFormulario();
    this.salones = [];
    this.mostrarResultados = false;
    this.error = null;
    this.sugerencias = null;
    this.equipamientoSeleccionado = [];
    
    // HU15 - CA4: Limpiar también el localStorage
    localStorage.removeItem('busquedaSalones_filtros');
  }

  /**
   * Helper para marcar campos como tocados
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.busquedaForm.controls).forEach(key => {
      this.busquedaForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Helper para validación de campos
   */
  esCampoInvalido(campo: string): boolean {
    const control = this.busquedaForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Calcular días entre fechas
   */
  calcularDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * HU16 - CA1, CA4: Ver detalle del salón
   * Navega al componente de detalle preservando filtros en localStorage
   */
  verDetalleSalon(salon: Salon): void {
    // Los filtros ya están guardados en localStorage por HU15
    // Agregar fechas como query params para disponibilidad
    const queryParams: any = {};
    
    if (this.busquedaForm.value.fechaInicio && this.busquedaForm.value.fechaFin) {
      queryParams.fechaInicio = this.busquedaForm.value.fechaInicio;
      queryParams.fechaFin = this.busquedaForm.value.fechaFin;
    }

    this.router.navigate(['/salon', salon._id], { queryParams });
  }
}