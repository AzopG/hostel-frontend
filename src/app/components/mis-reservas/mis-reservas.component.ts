import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService, ReservaCreada } from '../../services/reserva.service';
import { ReservaPaqueteService } from '../../services/reserva-paquete.service';
import { AuthService } from '../../services/auth.service';

type EstadoFiltro = 'todas' | 'confirmada' | 'cancelada' | 'completada' | 'pendiente';
type TipoVista = 'habitaciones' | 'paquetes';

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
  // Tipo de vista actual
  vistaActual: TipoVista = 'habitaciones';
  
  // Reservas de habitaciones
  reservas: ReservaConAcciones[] = [];
  reservasFiltradas: ReservaConAcciones[] = [];
  
  // Reservas de paquetes
  reservasPaquetes: any[] = [];
  reservasPaquetesFiltradas: any[] = [];
  
  // Filtros
  estadoFiltro: EstadoFiltro = 'todas';
  busquedaCodigo = '';
  
  // Estados de carga
  cargando = true;
  cargandoPaquetes = false;
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
    private reservaPaqueteService: ReservaPaqueteService,
    public authService: AuthService,  // Changed to public so it can be used in template
    public router: Router
  ) {}

  ngOnInit(): void {
    // Debug: Check current user and role
    const currentUser = this.authService.getCurrentUser();
    console.log('MisReservas init - Current user:', currentUser);
    console.log('Is empresa user?', this.isEmpresaUser());
    
    this.cargarReservas();
    
    // Only load paquetes if user is empresa type
    if (this.isEmpresaUser()) {
      console.log('Loading paquetes for empresa user');
      this.cargarReservasPaquetes();
    } else {
      console.log('Not loading paquetes - user is not empresa type');
      // Ensure we're on habitaciones view if not empresa user
      this.vistaActual = 'habitaciones';
    }
  }

  /**
   * Cargar todas las reservas del usuario
   * Nota: En producción, esto debería filtrar por usuario autenticado
   */
  private cargarReservas(): void {
    this.cargando = true;
    this.error = '';

    // Usar el nuevo servicio que filtra las reservas
    this.reservaService.obtenerMisReservas().subscribe({
      next: (response: any) => {
        // Filtrar reservas con datos completos
        this.reservas = (response.reservas || []).filter((reserva: any) => 
          reserva && 
          reserva.datosHuesped && 
          reserva.datosHuesped.nombre && 
          reserva.habitacion && 
          reserva.hotel &&
          reserva.codigoReserva
        );
        
        // Verificar acciones disponibles para cada reserva
        this.reservas.forEach(reserva => {
          this.verificarAccionesDisponibles(reserva);
        });

        this.aplicarFiltros();
        this.cargando = false;
        
        console.log('Reservas cargadas:', this.reservas.length);
      },
      error: (err: any) => {
        console.error('Error al cargar reservas:', err);
        this.error = 'No se pudieron cargar las reservas. Por favor, intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  /**
   * Cargar reservas de paquetes del usuario
   */
  cargarReservasPaquetes(): void {
    this.cargandoPaquetes = true;
    this.reservaPaqueteService.listarMisReservasPaquetes().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservasPaquetes = response.reservas;
          this.aplicarFiltrosPaquetes();
        } else {
          console.error('Error en la respuesta:', response);
          this.error = 'Error al cargar reservas de paquetes';
        }
        this.cargandoPaquetes = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas de paquetes:', error);
        this.error = 'No se pudieron cargar las reservas de paquetes. Por favor, intenta de nuevo.';
        this.cargandoPaquetes = false;
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
    if (this.vistaActual === 'habitaciones') {
      this.aplicarFiltrosHabitaciones();
    } else {
      this.aplicarFiltrosPaquetes();
    }
  }

  /**
   * Aplicar filtros para habitaciones
   */
  aplicarFiltrosHabitaciones(): void {
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
      const fechaA = new Date(a.fechaInicio).getTime();
      const fechaB = new Date(b.fechaInicio).getTime();
      return fechaB - fechaA;
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
    // Redirigir a la nueva vista de detalle usando el código de reserva
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
    // Navegar usando el código de reserva
    this.router.navigate(['/modificar-reserva', reserva.codigoReserva]);
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
   * Verificar si el usuario es de tipo empresa
   */
  isEmpresaUser(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('Current user type:', user?.tipo);
    return this.authService.hasRole('empresa');
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
    if (this.vistaActual === 'habitaciones') {
      this.cargarReservas();
    } else {
      this.cargarReservasPaquetes();
    }
  }

  /**
   * Cambiar entre vista de habitaciones y paquetes
   */
  cambiarVista(vista: TipoVista): void {
    // If trying to access paquetes view but not empresa user, don't allow it
    if (vista === 'paquetes' && !this.isEmpresaUser()) {
      return;
    }
    
    this.vistaActual = vista;
    this.estadoFiltro = 'todas';
    this.busquedaCodigo = '';
    
    if (vista === 'paquetes' && this.reservasPaquetes.length === 0 && this.isEmpresaUser()) {
      this.cargarReservasPaquetes();
    }
  }

  /**
   * Aplicar filtros para paquetes
   */
  aplicarFiltrosPaquetes(): void {
    let resultado = [...this.reservasPaquetes];

    // Filtro por estado
    if (this.estadoFiltro !== 'todas') {
      resultado = resultado.filter(r => r.estado === this.estadoFiltro);
    }

    // Filtro por código (búsqueda)
    if (this.busquedaCodigo.trim()) {
      const busqueda = this.busquedaCodigo.trim().toLowerCase();
      resultado = resultado.filter(r => 
        r.numeroReserva?.toLowerCase().includes(busqueda) ||
        r.nombreEvento?.toLowerCase().includes(busqueda) ||
        r.datosEmpresa?.razonSocial?.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar por fecha de inicio (más reciente primero)
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaInicio).getTime();
      const fechaB = new Date(b.fechaInicio).getTime();
      return fechaB - fechaA;
    });

    this.reservasPaquetesFiltradas = resultado;
  }

  /**
   * Contar paquetes por estado
   */
  contarPaquetesPorEstado(estado: EstadoFiltro): number {
    if (estado === 'todas') return this.reservasPaquetes.length;
    return this.reservasPaquetes.filter(r => r.estado === estado).length;
  }

  /**
   * Navegar al inicio
   */
  irAInicio(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navegar a buscar habitaciones
   */
  irABuscar(): void {
    this.router.navigate(['/buscar-habitaciones']);
  }

  /**
   * Navegar al dashboard
   */
  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navegar a paquetes corporativos
   */
  irAPaquetes(): void {
    this.router.navigate(['/ver-paquetes']);
  }
}
