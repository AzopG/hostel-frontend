import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService, DetalleHabitacion, TarifaDesglose } from '../../services/habitacion.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-habitacion',
  imports: [CommonModule],
  templateUrl: './detalle-habitacion.component.html',
  styleUrl: './detalle-habitacion.component.css'
})
export class DetalleHabitacionComponent implements OnInit, OnDestroy {
  // HU07 CA1: Detalle de habitación
  habitacion: DetalleHabitacion | null = null;
  loading = true;
  error = '';

  // HU07 CA2: Disponibilidad dinámica
  private readonly TIEMPO_ACTUALIZACION = 5 * 60 * 1000; // 5 minutos
  private disponibilidadSubscription?: Subscription;
  disponibilidadCambiada = false;
  mensajeDisponibilidad = '';

  // HU07 CA3: Tarifa
  fechaInicio = '';
  fechaFin = '';
  tarifa: TarifaDesglose | null = null;
  noches = 0;
  cargandoTarifa = false;

  // HU07 CA4: Navegación
  private queryParams: any = {};

  // Galería de fotos
  fotoActual = 0;
  mostrarGaleria = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitacionService: HabitacionService
  ) {}

  ngOnInit(): void {
    // Obtener ID de la habitación
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID de habitación no proporcionado';
      this.loading = false;
      return;
    }

    // HU07 CA4: Guardar queryParams para conservar filtros al volver
    this.route.queryParams.subscribe(params => {
      this.queryParams = { ...params };
      this.fechaInicio = params['fechaInicio'] || '';
      this.fechaFin = params['fechaFin'] || '';
    });

    // HU07 CA1: Cargar detalle
    this.cargarDetalle(id);

    // HU07 CA3: Calcular tarifa si hay fechas
    if (this.fechaInicio && this.fechaFin) {
      this.calcularTarifa(id);
    }

    // HU07 CA2: Iniciar verificación periódica de disponibilidad
    this.iniciarVerificacionDisponibilidad(id);
  }

  ngOnDestroy(): void {
    // Limpiar suscripción al salir
    if (this.disponibilidadSubscription) {
      this.disponibilidadSubscription.unsubscribe();
    }
  }

  /**
   * HU07 CA1: Cargar detalle completo de la habitación
   */
  private cargarDetalle(id: string): void {
    this.habitacionService.obtenerDetalle(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.habitacion = response.habitacion;
          this.loading = false;
        } else {
          this.error = 'No se pudo cargar el detalle de la habitación';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        this.error = 'Error al cargar el detalle de la habitación';
        this.loading = false;
      }
    });
  }

  /**
   * HU07 CA2: Iniciar verificación periódica de disponibilidad
   */
  private iniciarVerificacionDisponibilidad(id: string): void {
    // Solo verificar si hay fechas seleccionadas
    if (!this.fechaInicio || !this.fechaFin) {
      return;
    }

    // Verificar cada X minutos
    this.disponibilidadSubscription = interval(this.TIEMPO_ACTUALIZACION)
      .pipe(
        switchMap(() => 
          this.habitacionService.verificarDisponibilidad(id, this.fechaInicio, this.fechaFin)
        )
      )
      .subscribe({
        next: (response) => {
          if (response.success && !response.disponible) {
            // CA2: La disponibilidad cambió
            this.disponibilidadCambiada = true;
            this.mensajeDisponibilidad = response.mensaje;
          }
        },
        error: (err) => {
          console.error('Error al verificar disponibilidad:', err);
        }
      });
  }

  /**
   * HU07 CA3: Calcular tarifa con desglose
   */
  calcularTarifa(id?: string): void {
    const habitacionId = id || this.habitacion?._id;
    
    if (!habitacionId || !this.fechaInicio || !this.fechaFin) {
      return;
    }

    this.cargandoTarifa = true;

    this.habitacionService.calcularTarifa(habitacionId, this.fechaInicio, this.fechaFin).subscribe({
      next: (response) => {
        if (response.success) {
          this.tarifa = response.tarifa.desglose;
          this.noches = response.tarifa.noches;
          this.cargandoTarifa = false;
        }
      },
      error: (err) => {
        console.error('Error al calcular tarifa:', err);
        this.cargandoTarifa = false;
      }
    });
  }

  /**
   * HU07 CA4: Volver a resultados conservando filtros
   */
  volverAResultados(): void {
    this.router.navigate(['/buscar-habitaciones'], {
      queryParams: this.queryParams
    });
  }

  /**
   * Galería de fotos
   */
  get fotosDisponibles(): string[] {
    if (!this.habitacion) return [];
    
    // Combinar fotos de la habitación y del hotel
    const fotos = [
      ...(this.habitacion.fotos || []),
      ...(this.habitacion.hotel?.fotos || [])
    ];
    
    // Si no hay fotos, usar placeholder
    return fotos.length > 0 ? fotos : ['https://via.placeholder.com/800x600?text=Sin+Fotos'];
  }

  abrirGaleria(index: number): void {
    this.fotoActual = index;
    this.mostrarGaleria = true;
  }

  cerrarGaleria(): void {
    this.mostrarGaleria = false;
  }

  fotoAnterior(): void {
    this.fotoActual = (this.fotoActual - 1 + this.fotosDisponibles.length) % this.fotosDisponibles.length;
  }

  fotoSiguiente(): void {
    this.fotoActual = (this.fotoActual + 1) % this.fotosDisponibles.length;
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
   * Ir a reserva
   */
  irAReserva(): void {
    if (!this.habitacion) return;

    this.router.navigate(['/reservar', this.habitacion._id], {
      queryParams: {
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin
      }
    });
  }
}
