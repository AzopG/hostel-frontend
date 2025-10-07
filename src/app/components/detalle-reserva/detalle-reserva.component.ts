import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService, ReservaCreada } from '../../services/reserva.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-detalle-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-reserva.component.html',
  styleUrl: './detalle-reserva.component.css'
})
export class DetalleReservaComponent implements OnInit {
  reserva: ReservaCreada | null = null;
  cargando = true;
  error = '';
  codigoReserva = '';
  returnUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.codigoReserva = this.route.snapshot.paramMap.get('codigo') || '';
    // Verificar si hay una URL de retorno en los queryParams
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    
    if (!this.codigoReserva) {
      this.error = 'Código de reserva inválido';
      this.cargando = false;
      return;
    }
    this.cargarReserva();
  }

  cargarReserva(): void {
    this.cargando = true;
    this.reservaService.obtenerReservaPorCodigo(this.codigoReserva).subscribe({
      next: (response) => {
        if (response.success && response.reserva) {
          this.reserva = response.reserva;
        } else {
          this.error = 'Reserva no encontrada';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la reserva';
        this.cargando = false;
      }
    });
  }

  volver(): void {
    // Si hay una URL de retorno específica, navegar a ella
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else if (document.referrer && document.referrer.includes(window.location.origin)) {
      // Si viene de otra página dentro de la misma aplicación, volver a la página anterior
      this.location.back();
    } else {
      // Por defecto, ir a mis-reservas (cliente)
      this.router.navigate(['/mis-reservas']);
    }
  }
}
