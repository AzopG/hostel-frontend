import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenteService, Asistente, RespuestaListaAsistentes, EstadisticasAsistentes } from '../../services/asistente.service';

/**
 * HU19: GESTIONAR LISTA DE ASISTENTES
 * Como empresa Quiero gestionar una lista de asistentes Para controlar participación
 */
@Component({
  selector: 'app-gestionar-asistentes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-asistentes.component.html',
  styleUrls: ['./gestionar-asistentes.component.css']
})
export class GestionarAsistentesComponent implements OnInit {
  reservaId: string = '';
  reserva: any = null;
  asistentes: Asistente[] = [];
  estadisticas: EstadisticasAsistentes | null = null;

  // Formularios
  formAgregar: FormGroup;
  formEditar: FormGroup;

  // Estados
  cargando: boolean = false;
  error: string = '';
  mensaje: string = '';
  
  // Modal de edición
  mostrarModalEditar: boolean = false;
  asistenteEditando: Asistente | null = null;

  // Modal de confirmación de eliminación
  mostrarModalEliminar: boolean = false;
  asistenteEliminar: Asistente | null = null;

  // Importación masiva
  mostrarModalImportar: boolean = false;
  textoImportacion: string = '';

  // Filtros y búsqueda
  filtroEstado: string = 'todos'; // todos, confirmados, pendientes
  terminoBusqueda: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private asistenteService: AsistenteService
  ) {
    // CA1: Formulario para agregar asistente
    this.formAgregar = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      notas: ['']
    });

    // CA2: Formulario para editar asistente
    this.formEditar = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      confirmado: [false],
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.reservaId = this.route.snapshot.paramMap.get('reservaId') || '';
    
    if (!this.reservaId) {
      this.error = 'ID de reserva no especificado';
      return;
    }

    this.cargarAsistentes();
  }

  /**
   * Cargar lista de asistentes
   */
  cargarAsistentes(): void {
    this.cargando = true;
    this.error = '';

    this.asistenteService.obtenerAsistentes(this.reservaId).subscribe({
      next: (response: RespuestaListaAsistentes) => {
        this.reserva = response.reserva;
        this.asistentes = response.asistentes;
        this.estadisticas = response.estadisticas;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar asistentes:', err);
        this.error = err.error?.message || 'Error al cargar la lista de asistentes';
        this.cargando = false;
      }
    });
  }

  /**
   * HU19 CA1: Agregar nuevo asistente
   */
  agregarAsistente(): void {
    if (this.formAgregar.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    // CA4: Verificar si está bloqueado por capacidad
    if (this.estadisticas?.bloqueado) {
      this.error = `Capacidad máxima alcanzada (${this.estadisticas.capacidadMaxima} personas)`;
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    const datos = this.formAgregar.value;

    this.asistenteService.agregarAsistente(this.reservaId, datos).subscribe({
      next: (response) => {
        this.mensaje = response.message;
        this.formAgregar.reset();
        this.cargarAsistentes();
      },
      error: (err) => {
        console.error('Error al agregar asistente:', err);
        
        // CA4: Mostrar mensaje de bloqueo si se alcanzó el límite
        if (err.error?.bloqueado) {
          this.error = err.error.message;
        } else {
          this.error = err.error?.message || 'Error al agregar el asistente';
        }
        
        this.cargando = false;
      }
    });
  }

  /**
   * CA2: Abrir modal de edición
   */
  abrirModalEditar(asistente: Asistente): void {
    this.asistenteEditando = { ...asistente };
    this.formEditar.patchValue({
      nombre: asistente.nombre,
      correo: asistente.correo,
      confirmado: asistente.confirmado || false,
      notas: asistente.notas || ''
    });
    this.mostrarModalEditar = true;
    this.error = '';
    this.mensaje = '';
  }

  /**
   * CA2: Guardar cambios del asistente
   */
  guardarEdicion(): void {
    if (this.formEditar.invalid || !this.asistenteEditando) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.error = '';

    const datos = this.formEditar.value;

    this.asistenteService.editarAsistente(
      this.reservaId,
      this.asistenteEditando._id!,
      datos
    ).subscribe({
      next: (response) => {
        this.mensaje = response.message;
        this.cerrarModalEditar();
        this.cargarAsistentes();
      },
      error: (err) => {
        console.error('Error al editar asistente:', err);
        this.error = err.error?.message || 'Error al actualizar el asistente';
        this.cargando = false;
      }
    });
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.asistenteEditando = null;
    this.formEditar.reset();
  }

  /**
   * CA3: Abrir modal de confirmación de eliminación
   */
  abrirModalEliminar(asistente: Asistente): void {
    this.asistenteEliminar = asistente;
    this.mostrarModalEliminar = true;
    this.error = '';
    this.mensaje = '';
  }

  /**
   * CA3: Confirmar eliminación de asistente
   */
  confirmarEliminacion(): void {
    if (!this.asistenteEliminar) return;

    this.cargando = true;
    this.error = '';

    this.asistenteService.eliminarAsistente(
      this.reservaId,
      this.asistenteEliminar._id!
    ).subscribe({
      next: (response) => {
        this.mensaje = response.message;
        this.cerrarModalEliminar();
        this.cargarAsistentes();
      },
      error: (err) => {
        console.error('Error al eliminar asistente:', err);
        this.error = err.error?.message || 'Error al eliminar el asistente';
        this.cargando = false;
      }
    });
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.asistenteEliminar = null;
  }

  /**
   * Confirmar asistencia
   */
  confirmarAsistencia(asistente: Asistente): void {
    if (!asistente._id) return;

    this.cargando = true;
    this.error = '';

    this.asistenteService.confirmarAsistencia(this.reservaId, asistente._id).subscribe({
      next: (response) => {
        this.mensaje = response.message;
        this.cargarAsistentes();
      },
      error: (err) => {
        console.error('Error al confirmar asistencia:', err);
        this.error = err.error?.message || 'Error al confirmar asistencia';
        this.cargando = false;
      }
    });
  }

  /**
   * Importación masiva de asistentes
   */
  abrirModalImportar(): void {
    this.mostrarModalImportar = true;
    this.textoImportacion = '';
    this.error = '';
    this.mensaje = '';
  }

  procesarImportacion(): void {
    if (!this.textoImportacion.trim()) {
      this.error = 'Ingrese los datos de los asistentes';
      return;
    }

    // Parsear texto: cada línea es un asistente (nombre, correo, notas)
    const lineas = this.textoImportacion.trim().split('\n');
    const asistentes: Array<{ nombre: string, correo: string, notas?: string }> = [];

    for (const linea of lineas) {
      const partes = linea.split(',').map(p => p.trim());
      if (partes.length >= 2) {
        asistentes.push({
          nombre: partes[0],
          correo: partes[1],
          notas: partes[2] || ''
        });
      }
    }

    if (asistentes.length === 0) {
      this.error = 'No se encontraron asistentes válidos en el formato esperado (nombre, correo)';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.asistenteService.importarAsistentes(this.reservaId, asistentes).subscribe({
      next: (response) => {
        this.mensaje = response.message;
        
        if (response.errores > 0) {
          this.error = `${response.errores} asistentes no pudieron ser importados`;
        }
        
        this.cerrarModalImportar();
        this.cargarAsistentes();
      },
      error: (err) => {
        console.error('Error al importar asistentes:', err);
        
        // CA4: Mostrar mensaje si se alcanzó límite
        if (err.error?.bloqueado) {
          this.error = err.error.message;
        } else {
          this.error = err.error?.message || 'Error al importar asistentes';
        }
        
        this.cargando = false;
      }
    });
  }

  cerrarModalImportar(): void {
    this.mostrarModalImportar = false;
    this.textoImportacion = '';
  }

  /**
   * Obtener asistentes filtrados
   */
  get asistentesFiltrados(): Asistente[] {
    let filtrados = [...this.asistentes];

    // Filtrar por estado de confirmación
    if (this.filtroEstado === 'confirmados') {
      filtrados = filtrados.filter(a => a.confirmado);
    } else if (this.filtroEstado === 'pendientes') {
      filtrados = filtrados.filter(a => !a.confirmado);
    }

    // Filtrar por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(a => 
        a.nombre.toLowerCase().includes(termino) ||
        a.correo.toLowerCase().includes(termino) ||
        (a.notas && a.notas.toLowerCase().includes(termino))
      );
    }

    return filtrados;
  }

  /**
   * Exportar lista a CSV
   */
  exportarCSV(): void {
    const headers = ['Nombre', 'Correo', 'Confirmado', 'Fecha Registro', 'Notas'];
    const rows = this.asistentes.map(a => [
      a.nombre,
      a.correo,
      a.confirmado ? 'Sí' : 'No',
      new Date(a.fechaRegistro!).toLocaleString(),
      a.notas || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `asistentes_${this.reserva?.codigoReserva}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
}
