import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SalonService, Salon } from '../../services/salon.service';

@Component({
  selector: 'app-detalle-salon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-salon.component.html',
  styleUrl: './detalle-salon.component.css'
})
export class DetalleSalonComponent implements OnInit {
  salon: Salon | null = null;
  loading = true;
  error: string | null = null;
  
  // HU16 - CA3: Layout seleccionado
  layoutSeleccionado: any = null;
  
  // HU16 - CA2: Disponibilidad
  disponibilidad: any = null;
  fechasConsulta: { inicio: string | null, fin: string | null } = { inicio: null, fin: null };
  verificandoDisponibilidad = false;
  
  // Navegación (CA4)
  filtrosGuardados: any = null;
  fromDashboard: boolean = false;
  returnUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salonService: SalonService
  ) {}

  ngOnInit(): void {
    // Obtener ID del salón desde la URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID de salón no válido';
      this.loading = false;
      return;
    }

    // CA4: Restaurar fechas de búsqueda si vienen en query params
    this.route.queryParams.subscribe(params => {
      if (params['fechaInicio'] && params['fechaFin']) {
        this.fechasConsulta = {
          inicio: params['fechaInicio'],
          fin: params['fechaFin']
        };
      }
      
      // Comprobar si viene del dashboard
      if (params['fromDashboard'] === 'true') {
        this.fromDashboard = true;
      }
      
      // Guardar URL de retorno si existe
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    // CA4: Intentar restaurar filtros de localStorage
    this.restaurarFiltrosBusqueda();

    // CA1: Cargar detalle del salón
    this.cargarDetalleSalon(id);
  }

  /**
   * HU16 - CA1: Cargar información completa del salón
   */
  cargarDetalleSalon(id: string): void {
    this.loading = true;
    this.error = null;

    this.salonService.obtenerDetalleSalon(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.salon = response.salon;
          
          // CA3: Seleccionar primer layout por defecto
          if (this.salon.layouts && this.salon.layouts.length > 0) {
            this.layoutSeleccionado = this.salon.layouts[0];
          }

          // CA2: Si hay fechas de consulta, verificar disponibilidad
          if (this.fechasConsulta.inicio && this.fechasConsulta.fin) {
            this.verificarDisponibilidad();
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del salón:', error);
        this.error = 'No se pudo cargar la información del salón';
        this.loading = false;
      }
    });
  }

  /**
   * HU16 - CA2: Verificar disponibilidad en fechas específicas
   */
  verificarDisponibilidad(): void {
    if (!this.salon || !this.fechasConsulta.inicio || !this.fechasConsulta.fin) {
      return;
    }

    this.verificandoDisponibilidad = true;

    this.salonService.verificarDisponibilidadDetallada(
      this.salon._id,
      this.fechasConsulta.inicio,
      this.fechasConsulta.fin
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.disponibilidad = response.disponibilidad;
        }
        this.verificandoDisponibilidad = false;
      },
      error: (error) => {
        console.error('Error al verificar disponibilidad:', error);
        this.verificandoDisponibilidad = false;
      }
    });
  }

  /**
   * HU16 - CA3: Alternar entre layouts
   */
  seleccionarLayout(layout: any): void {
    this.layoutSeleccionado = layout;
  }

  /**
   * HU16 - CA4: Restaurar filtros de búsqueda desde localStorage
   */
  restaurarFiltrosBusqueda(): void {
    try {
      const filtrosGuardados = localStorage.getItem('busquedaSalones_filtros');
      if (filtrosGuardados) {
        this.filtrosGuardados = JSON.parse(filtrosGuardados);
        
        // Si no hay fechas en query params, usar las guardadas
        if (!this.fechasConsulta.inicio && this.filtrosGuardados.formulario) {
          this.fechasConsulta = {
            inicio: this.filtrosGuardados.formulario.fechaInicio,
            fin: this.filtrosGuardados.formulario.fechaFin
          };
        }
      }
    } catch (error) {
      console.error('Error al restaurar filtros:', error);
    }
  }

  /**
   * HU16 - CA4: Volver a resultados de búsqueda manteniendo filtros
   */
  volverAResultados(): void {
    // Si viene del dashboard, volver allí
    if (this.fromDashboard) {
      // Si hay una URL específica a la que volver, usarla
      if (this.returnUrl) {
        this.router.navigate([this.returnUrl]);
      } else {
        // De lo contrario, ir a la búsqueda de salones dentro del dashboard
        this.router.navigate(['/dashboard/busqueda-salones']);
      }
    } else {
      // Los filtros ya están en localStorage, solo navegamos de vuelta
      this.router.navigate(['/busqueda-salones']);
    }
  }

  /**
   * HU17: Navegar a reservar salón
   */
  reservarAhora(): void {
    if (!this.salon || !this.fechasConsulta.inicio || !this.fechasConsulta.fin) {
      alert('Por favor, verifica la disponibilidad del salón antes de reservar');
      return;
    }

    // Navegar al componente de reserva con datos necesarios
    const queryParams: any = {
      fechaInicio: this.fechasConsulta.inicio,
      fechaFin: this.fechasConsulta.fin
    };

    // Si hay un layout seleccionado, pasarlo también
    if (this.layoutSeleccionado) {
      queryParams.layoutId = this.layoutSeleccionado._id;
    }
    
    // Mantener la información de navegación desde el dashboard si existe
    if (this.fromDashboard) {
      queryParams.fromDashboard = true;
      if (this.returnUrl) {
        queryParams.returnUrl = this.returnUrl;
      }
      
      // Si viene del dashboard, mantener el contexto del dashboard en la navegación
      this.router.navigate(['/dashboard/reservar-salon', this.salon._id], { queryParams });
    } else {
      // Navegación normal fuera del dashboard
      this.router.navigate(['/reservar-salon', this.salon._id], { queryParams });
    }
  }

  /**
   * Obtener clase CSS según estado de disponibilidad
   */
  getDisponibilidadClass(): string {
    if (!this.disponibilidad) return '';
    
    switch (this.disponibilidad.estado) {
      case 'libre':
        return 'disponible';
      case 'bloqueado':
        return 'no-disponible';
      case 'parcial':
        return 'parcialmente-disponible';
      default:
        return '';
    }
  }

  /**
   * Obtener ícono según estado de disponibilidad
   */
  getDisponibilidadIcono(): string {
    if (!this.disponibilidad) return '❓';
    
    switch (this.disponibilidad.estado) {
      case 'libre':
        return '✅';
      case 'bloqueado':
        return '❌';
      case 'parcial':
        return '⚠️';
      default:
        return '❓';
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Verificar si un layout es el seleccionado
   */
  esLayoutSeleccionado(layout: any): boolean {
    return this.layoutSeleccionado && this.layoutSeleccionado.nombre === layout.nombre;
  }

  /**
   * Navegación al inicio
   */
  irAInicio(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navegación a buscar salones
   */
  irABuscarSalones(): void {
    this.router.navigate(['/salones']);
  }
}
