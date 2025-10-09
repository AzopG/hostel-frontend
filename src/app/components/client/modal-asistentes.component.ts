import { Component, Input, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteService, Asistente } from '../../services/asistente.service';

@Component({
  selector: 'app-modal-asistentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-asistentes.component.html',
  styleUrl: './modal-asistentes.component.css'
})
export class ModalAsistentesComponent implements OnInit {
  @Input() numeroReserva!: string;
  asistentes: Asistente[] = [];
  nuevoAsistente: any = { nombre: '', email: '', descripcion: '' };
  cargando = false;

  constructor(private asistenteService: AsistenteService) {}

  ngOnInit(): void {
    this.cargarAsistentes();
  }

  cargarAsistentes() {
    this.cargando = true;
    this.asistenteService.obtenerAsistentes(this.numeroReserva).subscribe({
      next: (resp) => {
        this.asistentes = resp.asistentes || [];
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  agregarAsistente() {
    if (!this.nuevoAsistente.nombre || !this.nuevoAsistente.email) return;
    this.cargando = true;
    this.asistenteService.agregarAsistente(this.numeroReserva, {
      nombre: this.nuevoAsistente.nombre,
      email: this.nuevoAsistente.email,
      descripcion: this.nuevoAsistente.descripcion
    }).subscribe({
      next: () => {
        this.nuevoAsistente = { nombre: '', email: '', descripcion: '' };
        this.cargarAsistentes();
      },
      error: () => { this.cargando = false; }
    });
  }

  eliminarAsistente(asistente: Asistente) {
    if (!asistente._id) return;
    if (!confirm('¿Eliminar este asistente?')) return;
    this.cargando = true;
    this.asistenteService.eliminarAsistente(this.numeroReserva, asistente._id).subscribe({
      next: () => this.cargarAsistentes(),
      error: () => { this.cargando = false; }
    });
  }

  exportarPDF() {
    const doc = new jsPDF();
    const columns = [
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Descripción', dataKey: 'descripcion' }
    ];
    const data = this.asistentes.map(a => ({
      nombre: a.nombre,
      email: a.email,
      descripcion: a.descripcion || ''
    }));
    doc.setFontSize(16);
    doc.text('Lista de Asistentes', 14, 18);
    (autoTable as any)(doc, {
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => (row as any)[c.dataKey])),
      startY: 24,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [46, 125, 50] },
      margin: { left: 14, right: 14 }
    });
    doc.save('asistentes.pdf');
  }

  cerrar() {
    // Emitir evento o usar Output si se requiere
    // Por ahora, solo ocultar el modal (debe integrarse con el padre)
    document.body.classList.remove('modal-open');
    // Aquí se puede emitir un Output para cerrar el modal desde el padre
  }
}
