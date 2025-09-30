import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ComprobanteService, ComprobanteReserva } from '../../services/comprobante.service';

@Component({
  selector: 'app-comprobante-reserva',
  imports: [CommonModule],
  templateUrl: './comprobante-reserva.component.html',
  styleUrl: './comprobante-reserva.component.css'
})
export class ComprobanteReservaComponent implements OnInit {
  comprobante: ComprobanteReserva | null = null;
  codigoReserva: string = '';
  idioma: string = 'es'; // CA3: Idioma por defecto
  cargando: boolean = true;
  error: string = '';
  descargando: boolean = false;

  // CA3: Idiomas disponibles
  idiomasDisponibles = [
    { codigo: 'es', nombre: 'Español', flag: '🇪🇸' },
    { codigo: 'en', nombre: 'English', flag: '🇺🇸' },
    { codigo: 'pt', nombre: 'Português', flag: '🇧🇷' }
  ];

  constructor(
    private comprobanteService: ComprobanteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener código de reserva de la ruta
    this.route.params.subscribe(params => {
      this.codigoReserva = params['codigo'];
      if (this.codigoReserva) {
        this.cargarComprobante();
      } else {
        this.error = 'Código de reserva no proporcionado';
        this.cargando = false;
      }
    });

    // CA3: Detectar idioma del navegador
    const idiomaNavegador = navigator.language.split('-')[0];
    if (['es', 'en', 'pt'].includes(idiomaNavegador)) {
      this.idioma = idiomaNavegador;
    }
  }

  /**
   * HU11 CA1: Cargar comprobante para visualización
   */
  cargarComprobante(): void {
    this.cargando = true;
    this.error = '';

    this.comprobanteService.obtenerComprobante(this.codigoReserva, this.idioma).subscribe({
      next: (response) => {
        if (response.success) {
          this.comprobante = response.comprobante;
        } else {
          this.error = 'No se pudo cargar el comprobante';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar comprobante:', err);
        if (err.status === 404) {
          this.error = 'Reserva no encontrada';
        } else if (err.status === 400) {
          this.error = err.error?.message || 'Solo las reservas confirmadas tienen comprobante disponible';
        } else {
          this.error = 'Error al cargar el comprobante. Por favor, intente de nuevo.';
        }
        this.cargando = false;
      }
    });
  }

  /**
   * HU11 CA2: Descargar comprobante en PDF
   */
  descargarPDF(): void {
    if (!this.codigoReserva) return;

    this.descargando = true;

    this.comprobanteService.descargarComprobantePDF(this.codigoReserva, this.idioma).subscribe({
      next: (blob) => {
        // Trigger descarga
        const filename = `comprobante-${this.codigoReserva}.pdf`;
        this.comprobanteService.triggerDownload(blob, filename);
        this.descargando = false;
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        alert('Error al descargar el PDF. Por favor, intente de nuevo.');
        this.descargando = false;
      }
    });
  }

  /**
   * HU11 CA3: Cambiar idioma del comprobante
   */
  cambiarIdioma(nuevoIdioma: string): void {
    if (this.idioma !== nuevoIdioma) {
      this.idioma = nuevoIdioma;
      this.cargarComprobante(); // Re-cargar con nuevo idioma
    }
  }

  /**
   * Imprimir comprobante
   */
  imprimirComprobante(): void {
    window.print();
  }

  /**
   * Volver a mis reservas
   */
  volverAReservas(): void {
    this.router.navigate(['/mis-reservas']);
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const locales: { [key: string]: string } = {
      es: 'es-ES',
      en: 'en-US',
      pt: 'pt-BR'
    };
    
    return date.toLocaleDateString(locales[this.idioma] || 'es-ES', opciones);
  }

  /**
   * Formatear precio
   */
  formatearPrecio(precio: number, moneda: string = 'COP'): string {
    const simbolo = moneda === 'COP' ? '$' : moneda;
    const precioFormateado = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
    
    return `${simbolo} ${precioFormateado}`;
  }

  /**
   * Obtener clase CSS según estado
   */
  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'confirmada': 'estado-confirmada',
      'completada': 'estado-completada',
      'pendiente': 'estado-pendiente',
      'cancelada': 'estado-cancelada'
    };
    return clases[estado] || 'estado-default';
  }

  /**
   * Obtener texto traducido del estado
   */
  getEstadoTexto(estado: string): string {
    const traducciones: { [key: string]: { [key: string]: string } } = {
      es: {
        confirmada: 'CONFIRMADA',
        completada: 'COMPLETADA',
        pendiente: 'PENDIENTE',
        cancelada: 'CANCELADA'
      },
      en: {
        confirmada: 'CONFIRMED',
        completada: 'COMPLETED',
        pendiente: 'PENDING',
        cancelada: 'CANCELLED'
      },
      pt: {
        confirmada: 'CONFIRMADA',
        completada: 'CONCLUÍDA',
        pendiente: 'PENDENTE',
        cancelada: 'CANCELADA'
      }
    };
    
    return traducciones[this.idioma]?.[estado] || estado.toUpperCase();
  }

  /**
   * Obtener traducciones estáticas
   */
  t(key: string): string {
    const traducciones: { [key: string]: { [key: string]: string } } = {
      es: {
        titulo: 'COMPROBANTE DE RESERVA',
        subtitulo: 'Confirmación de su reserva hotelera',
        codigo: 'Código de Reserva',
        estado: 'Estado',
        fechaEmision: 'Fecha de Emisión',
        descargarPDF: 'Descargar PDF',
        imprimir: 'Imprimir',
        idioma: 'Idioma',
        infoHotel: 'Información del Hotel',
        hotel: 'Hotel',
        ubicacion: 'Ubicación',
        direccion: 'Dirección',
        telefono: 'Teléfono',
        email: 'Email',
        infoHuesped: 'Información del Huésped',
        nombre: 'Nombre',
        documento: 'Documento',
        detallesReserva: 'Detalles de la Reserva',
        habitacion: 'Habitación',
        capacidad: 'Capacidad',
        personas: 'personas',
        huespedes: 'Número de Huéspedes',
        servicios: 'Servicios Incluidos',
        fechasEstadia: 'Fechas de Estadía',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        noches: 'Noches',
        desglosePrecios: 'Desglose de Precios',
        precioPorNoche: 'Precio por Noche',
        subtotal: 'Subtotal',
        impuestos: 'Impuestos (19%)',
        total: 'TOTAL',
        volverReservas: 'Volver a Mis Reservas',
        notasImportantes: 'Notas Importantes',
        politicaCancelacion: 'Cancelación gratuita hasta 48 horas antes del check-in.',
        horarios: 'Check-in: 3:00 PM | Check-out: 12:00 PM',
        presentacion: 'Presente este comprobante al momento del check-in.'
      },
      en: {
        titulo: 'RESERVATION RECEIPT',
        subtitulo: 'Your hotel reservation confirmation',
        codigo: 'Reservation Code',
        estado: 'Status',
        fechaEmision: 'Issue Date',
        descargarPDF: 'Download PDF',
        imprimir: 'Print',
        idioma: 'Language',
        infoHotel: 'Hotel Information',
        hotel: 'Hotel',
        ubicacion: 'Location',
        direccion: 'Address',
        telefono: 'Phone',
        email: 'Email',
        infoHuesped: 'Guest Information',
        nombre: 'Name',
        documento: 'ID Document',
        detallesReserva: 'Reservation Details',
        habitacion: 'Room',
        capacidad: 'Capacity',
        personas: 'people',
        huespedes: 'Number of Guests',
        servicios: 'Included Services',
        fechasEstadia: 'Stay Dates',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        noches: 'Nights',
        desglosePrecios: 'Price Breakdown',
        precioPorNoche: 'Price per Night',
        subtotal: 'Subtotal',
        impuestos: 'Taxes (19%)',
        total: 'TOTAL',
        volverReservas: 'Back to My Reservations',
        notasImportantes: 'Important Notes',
        politicaCancelacion: 'Free cancellation up to 48 hours before check-in.',
        horarios: 'Check-in: 3:00 PM | Check-out: 12:00 PM',
        presentacion: 'Present this receipt at check-in.'
      },
      pt: {
        titulo: 'COMPROVANTE DE RESERVA',
        subtitulo: 'Confirmação da sua reserva de hotel',
        codigo: 'Código de Reserva',
        estado: 'Estado',
        fechaEmision: 'Data de Emissão',
        descargarPDF: 'Baixar PDF',
        imprimir: 'Imprimir',
        idioma: 'Idioma',
        infoHotel: 'Informações do Hotel',
        hotel: 'Hotel',
        ubicacion: 'Localização',
        direccion: 'Endereço',
        telefono: 'Telefone',
        email: 'Email',
        infoHuesped: 'Informações do Hóspede',
        nombre: 'Nome',
        documento: 'Documento',
        detallesReserva: 'Detalhes da Reserva',
        habitacion: 'Quarto',
        capacidad: 'Capacidade',
        personas: 'pessoas',
        huespedes: 'Número de Hóspedes',
        servicios: 'Serviços Incluídos',
        fechasEstadia: 'Datas da Estadia',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        noches: 'Noites',
        desglosePrecios: 'Detalhamento de Preços',
        precioPorNoche: 'Preço por Noite',
        subtotal: 'Subtotal',
        impuestos: 'Impostos (19%)',
        total: 'TOTAL',
        volverReservas: 'Voltar para Minhas Reservas',
        notasImportantes: 'Notas Importantes',
        politicaCancelacion: 'Cancelamento gratuito até 48 horas antes do check-in.',
        horarios: 'Check-in: 15:00 | Check-out: 12:00',
        presentacion: 'Apresente este comprovante no momento do check-in.'
      }
    };
    
    return traducciones[this.idioma]?.[key] || traducciones['es'][key] || key;
  }
}
