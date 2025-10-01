import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService, ReservaCreada } from '../../services/reserva.service';

@Component({
  selector: 'app-recibo-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recibo-reserva.component.html',
  styleUrl: './recibo-reserva.component.css'
})
export class ReciboReservaComponent implements OnInit {
  reserva: ReservaCreada | null = null;
  recibo: any = null;
  cargando = true;
  error = '';
  
  // Estados
  descargando = false;
  enviando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    const reservaId = this.route.snapshot.paramMap.get('id');
    if (reservaId) {
      this.cargarRecibo(reservaId);
    } else {
      this.error = 'ID de reserva no válido';
      this.cargando = false;
    }
  }

  /**
   * HU11: Cargar información del recibo
   */
  private cargarRecibo(reservaId: string): void {
    this.cargando = true;
    this.error = '';

    this.reservaService.obtenerReciboReserva(reservaId).subscribe({
      next: (response: any) => {
        this.recibo = response.recibo;
        this.reserva = response.reserva;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar recibo:', err);
        this.error = err.error?.message || 'No se pudo cargar el recibo';
        this.cargando = false;
      }
    });
  }

  /**
   * HU11 CA1: Descargar recibo en PDF
   */
  descargarPDF(): void {
    if (!this.reserva) return;

    this.descargando = true;

    this.reservaService.descargarReciboPDF(this.reserva._id).subscribe({
      next: (blob: Blob) => {
        // Crear URL del blob y descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo_${this.reserva?.codigoReserva}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.descargando = false;
        alert('Recibo descargado exitosamente');
      },
      error: (err: any) => {
        console.error('Error al descargar PDF:', err);
        alert('Error al descargar el recibo');
        this.descargando = false;
      }
    });
  }

  /**
   * HU11 CA2: Enviar recibo por email
   */
  enviarPorEmail(): void {
    if (!this.reserva) return;

    const email = prompt('¿A qué correo deseas enviar el recibo?', this.reserva.datosHuesped?.email || '');
    
    if (!email) return;

    this.enviando = true;

    this.reservaService.enviarReciboPorEmail(this.reserva._id, email).subscribe({
      next: (response: any) => {
        alert(`Recibo enviado exitosamente a ${email}`);
        this.enviando = false;
      },
      error: (err: any) => {
        console.error('Error al enviar email:', err);
        alert('Error al enviar el recibo por correo');
        this.enviando = false;
      }
    });
  }

  /**
   * Imprimir recibo
   */
  imprimir(): void {
    window.print();
  }

  /**
   * Volver a mis reservas
   */
  volver(): void {
    this.router.navigate(['/mis-reservas']);
  }

  /**
   * Ir al home
   */
  irAlHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string | Date): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-CO', opciones);
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
   * Obtener clase de estado
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
}
