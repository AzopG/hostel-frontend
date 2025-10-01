import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService, ReservaCreada } from '../../services/reserva.service';

type EstadoFiltro = 'todas' | 'confirmada' | 'cancelada' | 'completada' | 'pendiente';

interface ReservaConAcciones extends ReservaCreada {
  puedeModificar?: boolean;
  horasHastaCheckIn?: number;
  puedeCancelar?: boolean;
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent implements OnInit {
  reservas: ReservaConAcciones[] = [];
  reservasFiltradas: ReservaConAcciones[] = [];
  
  // Filtros
  estadoFiltro: EstadoFiltro = 'todas';
  busquedaCodigo = '';
  
  // Estados de carga
  cargando = true;
  error = '';
  
  // Modal de cancelación (HU10)
  mostrarModalCancelar = false;
  reservaACancelar: ReservaConAcciones | null = null;
  motivoCancelacion = '';
  cancelando = false;
  
  // HU10: Información de penalización
  verificandoPoliticas = false;
  politicaCancelacion: any = null;
  aceptaPenalizacion = false;

  constructor(
    private reservaService: ReservaService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  /**
   * Cargar todas las reservas del usuario
   * Nota: En producción, esto debería filtrar por usuario autenticado
   */
  private cargarReservas(): void {
    this.cargando = true;
    this.error = '';

    // Por ahora, obtener todas las reservas (en producción filtrar por userId)
    this.reservaService.obtenerTodasReservas().subscribe({
      next: (response: any) => {
        this.reservas = response.reservas || [];
        
        // Verificar acciones disponibles para cada reserva
        this.reservas.forEach(reserva => {
          this.verificarAccionesDisponibles(reserva);
        });

        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar reservas:', err);
        this.error = 'No se pudieron cargar las reservas. Por favor, intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  /**
   * Verificar qué acciones puede realizar sobre la reserva
   */
  private verificarAccionesDisponibles(reserva: ReservaConAcciones): void {
    // Calcular horas hasta check-in
    const ahora = new Date();
    const fechaInicio = new Date(reserva.fechaInicio);
    const horasHastaCheckIn = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    reserva.horasHastaCheckIn = horasHastaCheckIn;
    
    // CA1 + CA4: Puede modificar si estado=confirmada y >= 24h
    reserva.puedeModificar = 
      reserva.estado === 'confirmada' && 
      horasHastaCheckIn >= 24;
    
    // Puede cancelar si estado=confirmada y no ha pasado el check-in
    reserva.puedeCancelar = 
      reserva.estado === 'confirmada' && 
      horasHastaCheckIn > 0;
  }

  /**
   * Aplicar filtros de estado y búsqueda
   */
  aplicarFiltros(): void {
    let resultado = [...this.reservas];

    // Filtro por estado
    if (this.estadoFiltro !== 'todas') {
      resultado = resultado.filter(r => r.estado === this.estadoFiltro);
    }

    // Filtro por código (búsqueda)
    if (this.busquedaCodigo.trim()) {
      const busqueda = this.busquedaCodigo.trim().toLowerCase();
      resultado = resultado.filter(r => 
        r.codigoReserva.toLowerCase().includes(busqueda) ||
        r.hotel.nombre.toLowerCase().includes(busqueda) ||
        r.habitacion.tipo.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar por fecha de check-in (más reciente primero)
    resultado.sort((a, b) => {
      return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
    });

    this.reservasFiltradas = resultado;
  }

  /**
   * Cambiar filtro de estado
   */
  cambiarFiltro(estado: EstadoFiltro): void {
    this.estadoFiltro = estado;
    this.aplicarFiltros();
  }

  /**
   * Búsqueda por código
   */
  buscar(): void {
    this.aplicarFiltros();
  }

  /**
   * Limpiar búsqueda
   */
  limpiarBusqueda(): void {
    this.busquedaCodigo = '';
    this.aplicarFiltros();
  }

  /**
   * Navegar a detalle de reserva
   */
  verDetalle(reserva: ReservaConAcciones): void {
    this.router.navigate(['/detalle-reserva', reserva.codigoReserva]);
  }

  /**
   * HU11: Navegar a ver recibo
   */
  verRecibo(reserva: ReservaConAcciones): void {
    this.router.navigate(['/recibo', reserva._id]);
  }

  /**
   * Navegar a modificar fechas (HU09)
   */
  modificarFechas(reserva: ReservaConAcciones): void {
    if (!reserva.puedeModificar) {
      alert('No se puede modificar esta reserva en este momento.');
      return;
    }
    this.router.navigate(['/modificar-reserva', reserva._id]);
  }

  /**
   * HU10: Abrir modal de cancelación y verificar políticas
   */
  abrirModalCancelar(reserva: ReservaConAcciones): void {
    if (!reserva.puedeCancelar) {
      alert('No se puede cancelar esta reserva.');
      return;
    }
    
    this.reservaACancelar = reserva;
    this.motivoCancelacion = '';
    this.politicaCancelacion = null;
    this.aceptaPenalizacion = false;
    this.mostrarModalCancelar = true;
    this.verificandoPoliticas = true;
    
    // HU10 CA2: Verificar políticas de cancelación
    this.reservaService.verificarPoliticasCancelacion(reserva._id).subscribe({
      next: (response: any) => {
        this.verificandoPoliticas = false;
        
        if (!response.puedeCancelar) {
          // CA3: No puede cancelar (ya cancelada, completada, etc.)
          alert(response.mensaje || 'No se puede cancelar esta reserva');
          this.cerrarModalCancelar();
          return;
        }
        
        this.politicaCancelacion = response.politicaCancelacion;
      },
      error: (err: any) => {
        this.verificandoPoliticas = false;
        console.error('Error al verificar políticas:', err);
        alert('Error al verificar las políticas de cancelación');
        this.cerrarModalCancelar();
      }
    });
  }

  /**
   * Cerrar modal de cancelación
   */
  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
    this.reservaACancelar = null;
    this.motivoCancelacion = '';
    this.cancelando = false;
    this.verificandoPoliticas = false;
    this.politicaCancelacion = null;
    this.aceptaPenalizacion = false;
  }

  /**
   * HU10: Confirmar cancelación de reserva (CA1 + CA2 + CA3 + CA4)
   */
  confirmarCancelacion(): void {
    if (!this.reservaACancelar || !this.politicaCancelacion) return;

    // Validar motivo
    if (!this.motivoCancelacion.trim()) {
      alert('Por favor, indica el motivo de la cancelación.');
      return;
    }

    // CA2: Si hay penalización, debe aceptarla
    if (this.politicaCancelacion.montoPenalizacion > 0 && !this.aceptaPenalizacion) {
      alert('Debes aceptar la penalización para continuar con la cancelación.');
      return;
    }

    this.cancelando = true;

    const datos = {
      motivo: this.motivoCancelacion,
      confirmacionPenalizacion: this.aceptaPenalizacion
    };

    this.reservaService.cancelarReserva(this.reservaACancelar._id, datos).subscribe({
      next: (response: any) => {
        // CA4: Mostrar mensaje con información de notificación
        const mensaje = response.cancelacion?.notificacionEnviada
          ? `${response.message}\n\nSe ha enviado un correo de confirmación a ${this.reservaACancelar?.datosHuesped?.email || 'tu correo'}.`
          : response.message;
        
        alert(mensaje);
        this.cerrarModalCancelar();
        this.cargarReservas(); // Recargar lista
      },
      error: (err: any) => {
        console.error('Error al cancelar:', err);
        
        // CA3: Manejar error de reserva ya cancelada
        if (err.error?.yaCancelada) {
          alert(`Esta reserva ya fue cancelada el ${this.formatearFecha(err.error.fechaCancelacion)}`);
          this.cerrarModalCancelar();
          this.cargarReservas();
        } else {
          alert(err.error?.message || 'No se pudo cancelar la reserva. Por favor, intenta de nuevo.');
        }
        
        this.cancelando = false;
      }
    });
  }

  /**
   * Obtener clase CSS según estado
   */
  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'confirmada': 'estado-confirmada',
      'pendiente': 'estado-pendiente',
      'cancelada': 'estado-cancelada',
      'completada': 'estado-completada'
    };
    return clases[estado] || 'estado-default';
  }

  /**
   * Obtener ícono según estado
   */
  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'confirmada': '✅',
      'pendiente': '⏳',
      'cancelada': '❌',
      'completada': '✔️'
    };
    return iconos[estado] || '📋';
  }

  /**
   * Formatear fecha a formato legible
   */
  formatearFecha(fecha: string | Date): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-CO', opciones);
  }

  /**
   * Formatear precio a formato colombiano
   */
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  /**
   * Obtener texto de tiempo restante
   */
  getTiempoRestante(reserva: ReservaConAcciones): string {
    if (!reserva.horasHastaCheckIn) return '';
    
    const horas = reserva.horasHastaCheckIn;
    
    if (horas < 0) {
      return 'Check-in pasado';
    } else if (horas < 24) {
      return `¡Menos de 24 horas!`;
    } else if (horas < 48) {
      return `${Math.floor(horas)} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      return `${dias} días`;
    }
  }

  /**
   * Contar reservas por estado
   */
  contarPorEstado(estado: EstadoFiltro): number {
    if (estado === 'todas') return this.reservas.length;
    return this.reservas.filter(r => r.estado === estado).length;
  }

  /**
   * Recargar reservas
   */
  recargar(): void {
    this.cargarReservas();
  }
}
