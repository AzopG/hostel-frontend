import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService, ReservaCreada } from '../../services/reserva.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.codigoReserva = this.route.snapshot.paramMap.get('codigo') || '';
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
    this.router.navigate(['/mis-reservas']);
  }
}
