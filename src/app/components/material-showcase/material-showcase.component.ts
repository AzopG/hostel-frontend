import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';

import { AppState } from '../../store';
import * as HotelActions from '../../store/actions/hotel.actions';
import * as HotelSelectors from '../../store/selectors/hotel.selectors';

@Component({
  selector: 'app-material-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="material-showcase">
      <div class="showcase-header">
        <h1>🎨 Angular Material Showcase</h1>
        <p>Demonstración de componentes Angular Material integrados con NgRx</p>
      </div>

      <mat-tab-group class="showcase-tabs">
        
        <!-- Tab: Formularios -->
        <mat-tab label="📝 Formularios">
          <div class="tab-content">
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>Crear Nueva Reserva</mat-card-title>
                <mat-card-subtitle>Formulario con validación usando Angular Material</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="reservaForm" (ngSubmit)="onSubmitReserva()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Hotel</mat-label>
                      <mat-select formControlName="hotelId" required>
                        <mat-option *ngFor="let hotel of hoteles$ | async" [value]="hotel.id">
                          {{ hotel.nombre }}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="reservaForm.get('hotelId')?.hasError('required')">
                        Hotel es requerido
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Tipo de Habitación</mat-label>
                      <mat-select formControlName="tipoHabitacion" required>
                        <mat-option value="individual">Individual</mat-option>
                        <mat-option value="doble">Doble</mat-option>
                        <mat-option value="suite">Suite</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Fecha de Entrada</mat-label>
                      <input matInput [matDatepicker]="pickerInicio" formControlName="fechaInicio" required>
                      <mat-datepicker-toggle matIconSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                      <mat-datepicker #pickerInicio></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Fecha de Salida</mat-label>
                      <input matInput [matDatepicker]="pickerFin" formControlName="fechaFin" required>
                      <mat-datepicker-toggle matIconSuffix [for]="pickerFin"></mat-datepicker-toggle>
                      <mat-datepicker #pickerFin></mat-datepicker>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Número de Huéspedes</mat-label>
                      <mat-slider 
                        min="1" 
                        max="8" 
                        step="1" 
                        discrete 
                        [displayWith]="displayFn"
                        formControlName="huespedes">
                        <input matSliderThumb formControlName="huespedes">
                      </mat-slider>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Comentarios Especiales</mat-label>
                      <textarea matInput rows="3" formControlName="comentarios"></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-checkbox formControlName="incluirDesayuno">
                      Incluir desayuno (+$25/día)
                    </mat-checkbox>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="reservaForm.invalid || (isLoading$ | async)">
                      <mat-spinner *ngIf="isLoading$ | async" diameter="20"></mat-spinner>
                      Crear Reserva
                    </button>
                    <button mat-button type="button" (click)="resetForm()">
                      Limpiar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Datos -->
        <mat-tab label="📊 Datos">
          <div class="tab-content">
            <mat-card class="data-card">
              <mat-card-header>
                <mat-card-title>Lista de Reservas</mat-card-title>
                <mat-card-subtitle>Gestión de reservas con tabla Material</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="table-controls">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Buscar</mat-label>
                    <input matInput (keyup)="applyFilter($event)" #input>
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                  
                  <button mat-raised-button color="accent" (click)="loadReservas()">
                    <mat-icon>refresh</mat-icon>
                    Actualizar
                  </button>
                </div>

                <div class="table-container">
                  <table mat-table [dataSource]="reservasData" matSort class="reservas-table">
                    
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                      <td mat-cell *matCellDef="let reserva">{{ reserva.id }}</td>
                    </ng-container>

                    <ng-container matColumnDef="hotel">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Hotel</th>
                      <td mat-cell *matCellDef="let reserva">{{ getHotelName(reserva.hotelId) }}</td>
                    </ng-container>

                    <ng-container matColumnDef="fechas">
                      <th mat-header-cell *matHeaderCellDef>Fechas</th>
                      <td mat-cell *matCellDef="let reserva">
                        {{ reserva.fechaInicio | date }} - {{ reserva.fechaFin | date }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="estado">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
                      <td mat-cell *matCellDef="let reserva">
                        <mat-chip-set>
                          <mat-chip [color]="getEstadoColor(reserva.estado)" selected>
                            {{ reserva.estado }}
                          </mat-chip>
                        </mat-chip-set>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="precio">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Precio</th>
                      <td mat-cell *matCellDef="let reserva">\${{ reserva.precio | number:'1.2-2' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="acciones">
                      <th mat-header-cell *matHeaderCellDef>Acciones</th>
                      <td mat-cell *matCellDef="let reserva">
                        <button mat-icon-button color="primary" (click)="editReserva(reserva)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteReserva(reserva.id)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </div>

                <mat-paginator [pageSizeOptions]="[5, 10, 20]" 
                               showFirstLastButtons
                               aria-label="Seleccionar página de reservas">
                </mat-paginator>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Expansión -->
        <mat-tab label="📋 Detalles">
          <div class="tab-content">
            <mat-card class="expansion-card">
              <mat-card-header>
                <mat-card-title>Información Detallada</mat-card-title>
                <mat-card-subtitle>Paneles expandibles con información de hoteles</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <mat-accordion class="hotel-accordion">
                  <mat-expansion-panel *ngFor="let hotel of hoteles$ | async; trackBy: trackByHotelId">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>hotel</mat-icon>
                        {{ hotel.nombre }}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ hotel.ubicacion }} - ⭐ {{ hotel.calificacion }}
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    
                    <div class="hotel-details">
                      <p><strong>Descripción:</strong> {{ hotel.descripcion }}</p>
                      <p><strong>Precio desde:</strong> \${{ hotel.precioMinimo }}</p>
                      
                      <div class="servicios-section">
                        <strong>Servicios:</strong>
                        <mat-chip-set class="servicios-chips">
                          <mat-chip *ngFor="let servicio of hotel.servicios">
                            {{ servicio }}
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                      
                      <div class="hotel-actions">
                        <button mat-raised-button color="primary" (click)="selectHotel(hotel.id)">
                          Seleccionar Hotel
                        </button>
                        <button mat-button (click)="viewHotelDetails(hotel.id)">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </mat-expansion-panel>
                </mat-accordion>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab: Filtros -->
        <mat-tab label="🔍 Filtros">
          <div class="tab-content">
            <mat-card class="filters-card">
              <mat-card-header>
                <mat-card-title>Filtros de Búsqueda</mat-card-title>
                <mat-card-subtitle>Utiliza los filtros para encontrar el hotel perfecto</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
                  <div class="filters-grid">
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Rango de Precio</mat-label>
                      <mat-slider min="0" max="1000" step="10" formControlName="precioMax">
                        <input matSliderStartThumb formControlName="precioMin">
                        <input matSliderEndThumb formControlName="precioMax">
                      </mat-slider>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Ubicación</mat-label>
                      <mat-select formControlName="ubicacion" multiple>
                        <mat-option value="cancun">Cancún</mat-option>
                        <mat-option value="aspen">Aspen</mat-option>
                        <mat-option value="newyork">Nueva York</mat-option>
                        <mat-option value="miami">Miami</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Calificación Mínima</mat-label>
                      <mat-select formControlName="calificacionMin">
                        <mat-option value="3">3+ estrellas</mat-option>
                        <mat-option value="4">4+ estrellas</mat-option>
                        <mat-option value="4.5">4.5+ estrellas</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div class="servicios-filter">
                      <strong>Servicios Requeridos:</strong>
                      <div class="checkbox-group">
                        <mat-checkbox formControlName="wifi">WiFi</mat-checkbox>
                        <mat-checkbox formControlName="piscina">Piscina</mat-checkbox>
                        <mat-checkbox formControlName="spa">Spa</mat-checkbox>
                        <mat-checkbox formControlName="restaurante">Restaurante</mat-checkbox>
                        <mat-checkbox formControlName="gimnasio">Gimnasio</mat-checkbox>
                      </div>
                    </div>
                  </div>

                  <div class="filter-actions">
                    <button mat-raised-button color="primary" type="submit">
                      <mat-icon>search</mat-icon>
                      Aplicar Filtros
                    </button>
                    <button mat-button type="button" (click)="clearFilters()">
                      <mat-icon>clear</mat-icon>
                      Limpiar Filtros
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .material-showcase {
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .showcase-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .showcase-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 8px;
    }

    .showcase-header p {
      font-size: 1.1rem;
      color: #666;
    }

    .showcase-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 24px;
    }

    .form-card, .data-card, .expansion-card, .filters-card {
      margin-bottom: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-field {
      width: 300px;
    }

    .table-container {
      max-width: 100%;
      overflow-x: auto;
    }

    .reservas-table {
      width: 100%;
    }

    .hotel-accordion {
      margin-top: 16px;
    }

    .hotel-details {
      padding: 16px 0;
    }

    .servicios-section {
      margin: 16px 0;
    }

    .servicios-chips {
      margin-top: 8px;
    }

    .hotel-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .material-showcase {
        padding: 16px;
      }
      
      .form-row {
        flex-direction: column;
      }
      
      .table-controls {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .search-field {
        width: 100%;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MaterialShowcaseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Observables
  hoteles$!: Observable<any[]>;
  reservas$!: Observable<any[]>;
  isLoading$!: Observable<boolean>;

  // Forms
  reservaForm!: FormGroup;
  filtersForm!: FormGroup;

  // Table
  displayedColumns: string[] = ['id', 'hotel', 'fechas', 'estado', 'precio', 'acciones'];
  reservasData: any[] = [];

  ngOnInit(): void {
    this.initializeObservables();
    this.initializeForms();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeObservables(): void {
    this.hoteles$ = this.store.select(HotelSelectors.selectHoteles);
    this.reservas$ = this.store.select(HotelSelectors.selectReservas);
    this.isLoading$ = this.store.select(HotelSelectors.selectIsLoading);

    this.reservas$.pipe(takeUntil(this.destroy$)).subscribe(reservas => {
      this.reservasData = reservas || [];
      this.cdr.markForCheck();
    });
  }

  private initializeForms(): void {
    this.reservaForm = this.fb.group({
      hotelId: ['', Validators.required],
      tipoHabitacion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      huespedes: [2, [Validators.required, Validators.min(1)]],
      comentarios: [''],
      incluirDesayuno: [false]
    });

    this.filtersForm = this.fb.group({
      precioMin: [0],
      precioMax: [1000],
      ubicacion: [[]],
      calificacionMin: [''],
      wifi: [false],
      piscina: [false],
      spa: [false],
      restaurante: [false],
      gimnasio: [false]
    });
  }

  private loadInitialData(): void {
    this.store.dispatch(HotelActions.loadHoteles());
    this.store.dispatch(HotelActions.loadReservas());
  }

  onSubmitReserva(): void {
    if (this.reservaForm.valid) {
      const reservaData = this.reservaForm.value;
      this.store.dispatch(HotelActions.createReserva({ reserva: reservaData }));
      
      this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.resetForm();
    }
  }

  resetForm(): void {
    this.reservaForm.reset();
    this.reservaForm.patchValue({
      huespedes: 2,
      incluirDesayuno: false
    });
  }

  loadReservas(): void {
    this.store.dispatch(HotelActions.loadReservas());
    this.snackBar.open('Datos actualizados', 'Cerrar', { duration: 2000 });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Aquí implementarías el filtrado de la tabla
    console.log('Filtrar por:', filterValue);
  }

  editReserva(reserva: any): void {
    this.snackBar.open(`Editando reserva ${reserva.id}`, 'Cerrar', { duration: 2000 });
    // Aquí abrirías un diálogo de edición
  }

  deleteReserva(id: string): void {
    this.store.dispatch(HotelActions.deleteReserva({ id }));
    this.snackBar.open('Reserva eliminada', 'Cerrar', { duration: 2000 });
  }

  selectHotel(hotelId: string): void {
    this.store.dispatch(HotelActions.selectHotel({ hotelId }));
    this.snackBar.open('Hotel seleccionado', 'Cerrar', { duration: 2000 });
  }

  viewHotelDetails(hotelId: string): void {
    // Aquí abrirías un diálogo con detalles del hotel
    this.snackBar.open(`Viendo detalles del hotel ${hotelId}`, 'Cerrar', { duration: 2000 });
  }

  applyFilters(): void {
    const filters = this.filtersForm.value;
    this.store.dispatch(HotelActions.setHotelFilter({ filter: filters }));
    this.snackBar.open('Filtros aplicados', 'Cerrar', { duration: 2000 });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      precioMin: 0,
      precioMax: 1000,
      ubicacion: [],
      calificacionMin: '',
      wifi: false,
      piscina: false,
      spa: false,
      restaurante: false,
      gimnasio: false
    });
    this.store.dispatch(HotelActions.clearFilters());
    this.snackBar.open('Filtros eliminados', 'Cerrar', { duration: 2000 });
  }

  getHotelName(hotelId: string): string {
    // En una app real, buscarías en el store
    const hotelNames: { [key: string]: string } = {
      '1': 'Hotel Paradise',
      '2': 'Mountain Resort',
      '3': 'City Center Hotel'
    };
    return hotelNames[hotelId] || 'Hotel Desconocido';
  }

  getEstadoColor(estado: string): 'primary' | 'accent' | 'warn' {
    switch (estado) {
      case 'confirmada': return 'primary';
      case 'pendiente': return 'accent';
      case 'cancelada': return 'warn';
      default: return 'primary';
    }
  }

  displayFn(value: number): string {
    return `${value} huésped${value !== 1 ? 'es' : ''}`;
  }

  trackByHotelId(index: number, hotel: any): string {
    return hotel.id;
  }
}