import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as L from 'leaflet';

import { AppState } from '../../store';
import * as HotelActions from '../../store/actions/hotel.actions';
import * as HotelSelectors from '../../store/selectors/hotel.selectors';

interface HotelMarker {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  precio: number;
  calificacion: number;
  imagen: string;
  descripcion: string;
}

@Component({
  selector: 'app-hotel-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-container">
      <div class="map-header">
        <h1>🗺️ Mapa de Hoteles</h1>
        <div class="map-controls">
          <button class="control-btn" (click)="centerMap()" title="Centrar Mapa">
            🎯
          </button>
          <button class="control-btn" (click)="toggleLayer()" title="Cambiar Vista">
            🌍
          </button>
          <button class="control-btn" (click)="refreshHotels()" title="Actualizar">
            🔄
          </button>
        </div>
      </div>

      <div class="map-content">
        <!-- Mapa -->
        <div class="map-wrapper">
          <div #mapElement class="leaflet-map" id="hotel-map-container"></div>
          
          <!-- Loading overlay -->
          <div class="map-loading" *ngIf="isLoading">
            <div class="loading-spinner">⏳</div>
            <div class="loading-text">Cargando mapa y hoteles...</div>
          </div>

          <!-- Instructions overlay for better UX -->
          <div class="map-instructions" *ngIf="!isLoading">
            <div class="instruction-item">
              <span class="instruction-icon">🖱️</span>
              <span class="instruction-text">Haz clic y arrastra para mover el mapa</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">🔍</span>
              <span class="instruction-text">Usa la rueda del mouse para hacer zoom</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">📍</span>
              <span class="instruction-text">Haz clic en un marcador para ver detalles</span>
            </div>
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="hotels-panel" [class.collapsed]="panelCollapsed">
          <div class="panel-header">
            <h3>Hoteles Encontrados</h3>
            <button class="collapse-btn" (click)="togglePanel()">
              {{ panelCollapsed ? '◀' : '▶' }}
            </button>
          </div>

          <div class="panel-content" *ngIf="!panelCollapsed">
            <div class="search-box">
              <input 
                type="text" 
                placeholder="Buscar hoteles..." 
                (input)="onSearch($event)"
                class="search-input">
            </div>

            <div class="filters-section">
              <div class="filter-group">
                <label>Precio máximo:</label>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  [(ngModel)]="maxPrice"
                  (input)="filterHotels()"
                  class="price-slider">
                <span class="price-value">\${{ maxPrice }}</span>
              </div>

              <div class="filter-group">
                <label>Calificación mínima:</label>
                <select [(ngModel)]="minRating" (change)="filterHotels()" class="rating-select">
                  <option value="0">Todas</option>
                  <option value="3">3+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>
            </div>

            <div class="hotels-list">
              <div 
                class="hotel-card"
                *ngFor="let hotel of filteredHotels; trackBy: trackByHotelId"
                [class.selected]="selectedHotelId === hotel.id"
                (click)="selectHotel(hotel)">
                
                <div class="hotel-image">
                  <img [src]="hotel.imagen" [alt]="hotel.nombre" loading="lazy">
                  <div class="hotel-rating">
                    ⭐ {{ hotel.calificacion }}
                  </div>
                </div>
                
                <div class="hotel-info">
                  <h4 class="hotel-name">{{ hotel.nombre }}</h4>
                  <p class="hotel-description">{{ hotel.descripcion }}</p>
                  <div class="hotel-meta">
                    <span class="hotel-price">\${{ hotel.precio }}/noche</span>
                    <button class="view-btn" (click)="viewHotelDetails(hotel.id, $event)">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>

              <div class="empty-state" *ngIf="filteredHotels.length === 0">
                <div class="empty-icon">🏨</div>
                <div class="empty-message">
                  No se encontraron hoteles con los filtros seleccionados
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hotel Details Modal -->
      <div class="hotel-modal" *ngIf="selectedHotelDetails" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedHotelDetails.nombre }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="hotel-gallery">
              <img [src]="selectedHotelDetails.imagen" [alt]="selectedHotelDetails.nombre">
            </div>
            
            <div class="hotel-details">
              <div class="detail-row">
                <strong>Calificación:</strong>
                <span>⭐ {{ selectedHotelDetails.calificacion }}/5</span>
              </div>
              <div class="detail-row">
                <strong>Precio desde:</strong>
                <span>\${{ selectedHotelDetails.precio }}/noche</span>
              </div>
              <div class="detail-row">
                <strong>Descripción:</strong>
                <span>{{ selectedHotelDetails.descripcion }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedHotelDetails.servicios">
                <strong>Servicios:</strong>
                <div class="servicios-tags">
                  <span class="servicio-tag" *ngFor="let servicio of selectedHotelDetails.servicios">
                    {{ servicio }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="action-btn primary" (click)="makeReservation()">
              Hacer Reserva
            </button>
            <button class="action-btn secondary" (click)="closeModal()">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .map-header h1 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }

    .map-controls {
      display: flex;
      gap: 8px;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .control-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .map-content {
      flex: 1;
      display: flex;
      position: relative;
    }

    .map-wrapper {
      flex: 1;
      position: relative;
      min-height: 600px;
      background: #f0f0f0;
    }

    .leaflet-map {
      width: 100%;
      height: 100%;
      min-height: 600px;
      cursor: grab;
      z-index: 1;
      background: #a6cee3;
    }

    .leaflet-map:active {
      cursor: grabbing;
    }

    /* Asegurar que los tiles del mapa se muestren correctamente */
    .leaflet-map :global(.leaflet-tile-pane) {
      opacity: 1 !important;
    }

    .leaflet-map :global(.leaflet-tile) {
      opacity: 1 !important;
    }

    /* Mejorar la carga de tiles */
    .leaflet-map :global(.leaflet-tile-container) {
      opacity: 1 !important;
    }

    /* Mejorar apariencia de controles de zoom */
    .leaflet-map :global(.leaflet-control-zoom) {
      border: none !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }

    .leaflet-map :global(.leaflet-control-zoom a) {
      background: white !important;
      border: none !important;
      color: #667eea !important;
      font-weight: bold !important;
      font-size: 18px !important;
      width: 34px !important;
      height: 34px !important;
      line-height: 34px !important;
      transition: all 0.3s ease !important;
    }

    .leaflet-map :global(.leaflet-control-zoom a:hover) {
      background: #667eea !important;
      color: white !important;
      transform: scale(1.1) !important;
    }

    /* Mejorar popup de marcadores */
    .leaflet-map :global(.leaflet-popup-content-wrapper) {
      border-radius: 12px !important;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
      border: none !important;
    }

    .leaflet-map :global(.leaflet-popup-tip) {
      background: white !important;
      border: none !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }

    .map-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-spinner {
      font-size: 2rem;
      animation: spin 2s linear infinite;
      margin-bottom: 16px;
    }

    .loading-text {
      font-size: 1.1rem;
      color: #666;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Instructions overlay */
    .map-instructions {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      z-index: 1000;
      max-width: 280px;
      opacity: 0.9;
      transition: opacity 0.3s ease;
    }

    .map-instructions:hover {
      opacity: 1;
    }

    .instruction-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.85rem;
      color: #555;
    }

    .instruction-item:last-child {
      margin-bottom: 0;
    }

    .instruction-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .instruction-text {
      flex: 1;
      line-height: 1.3;
    }

    @media (max-width: 768px) {
      .map-instructions {
        display: none;
      }
    }

    .hotels-panel {
      width: 400px;
      background: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .hotels-panel.collapsed {
      width: 60px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
    }

    .collapse-btn {
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .panel-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .search-box {
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .filters-section {
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .filter-group {
      margin-bottom: 16px;
    }

    .filter-group:last-child {
      margin-bottom: 0;
    }

    .filter-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 6px;
      color: #555;
    }

    .price-slider {
      width: 100%;
      margin-bottom: 4px;
    }

    .price-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #667eea;
    }

    .rating-select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .hotels-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .hotel-card {
      display: flex;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .hotel-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .hotel-card.selected {
      border: 2px solid #667eea;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
    }

    .hotel-image {
      width: 120px;
      height: 100px;
      position: relative;
      overflow: hidden;
    }

    .hotel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hotel-rating {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .hotel-info {
      flex: 1;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
    }

    .hotel-name {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .hotel-description {
      margin: 0 0 12px 0;
      font-size: 0.85rem;
      color: #666;
      line-height: 1.4;
      flex: 1;
    }

    .hotel-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hotel-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: #667eea;
    }

    .view-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .view-btn:hover {
      background: #5a67d8;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .empty-message {
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .hotel-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .close-btn {
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .modal-body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .hotel-gallery img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row strong {
      color: #555;
      min-width: 120px;
    }

    .servicios-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .servicio-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #eee;
      background: #f8f9fa;
    }

    .action-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn.primary {
      background: #667eea;
      color: white;
    }

    .action-btn.primary:hover {
      background: #5a67d8;
    }

    .action-btn.secondary {
      background: #e9ecef;
      color: #495057;
    }

    .action-btn.secondary:hover {
      background: #dee2e6;
    }

    @media (max-width: 768px) {
      .map-container {
        height: 100vh;
      }

      .map-content {
        flex-direction: column;
        height: calc(100vh - 80px);
      }

      .map-wrapper {
        flex: 1;
        min-height: 50vh;
      }

      .leaflet-map {
        min-height: 50vh;
      }
      
      .hotels-panel {
        width: 100%;
        height: 50vh;
        order: 2;
      }
      
      .hotels-panel.collapsed {
        height: 60px;
        width: 100%;
      }
      
      .hotel-card {
        flex-direction: column;
        margin-bottom: 12px;
      }
      
      .hotel-image {
        width: 100%;
        height: 120px;
      }
      
      .modal-content {
        width: 95vw;
        max-height: 90vh;
        margin: 5vh auto;
      }

      .map-header {
        padding: 12px 16px;
      }

      .map-header h1 {
        font-size: 1.5rem;
      }

      .control-btn {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }

      .panel-content {
        padding: 0;
      }

      .search-box, .filters-section {
        padding: 12px 16px;
      }

      .hotels-list {
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .map-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .map-controls {
        justify-content: center;
      }

      .hotels-panel {
        height: 45vh;
      }

      .hotel-card {
        padding: 12px;
      }

      .filter-group {
        margin-bottom: 12px;
      }
    }
  `]
})
export class HotelMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapElement') mapElement!: ElementRef;

  private destroy$ = new Subject<void>();
  private store = inject(Store<AppState>);
  private cdr = inject(ChangeDetectorRef);

  private map?: L.Map;
  private markers: L.Marker[] = [];
  private currentLayer: 'street' | 'satellite' = 'street';

  // Observables
  hoteles$!: Observable<any[]>;
  isLoading$!: Observable<boolean>;

  // Component state
  isLoading = false;
  panelCollapsed = false;
  selectedHotelId?: string;
  selectedHotelDetails?: any;
  
  // Filters
  maxPrice = 300;
  minRating = 0;
  searchQuery = '';

  // Hotels data
  hotelMarkers: HotelMarker[] = [
    {
      id: '1',
      nombre: 'Hotel Paradise',
      lat: 21.1619,
      lng: -86.8515,
      precio: 150,
      calificacion: 4.5,
      imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      descripcion: 'Un hotel de lujo frente al mar en Cancún'
    },
    {
      id: '2',
      nombre: 'Mountain Resort',
      lat: 39.1911,
      lng: -106.8175,
      precio: 200,
      calificacion: 4.8,
      imagen: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      descripcion: 'Escapada perfecta en las montañas de Aspen'
    },
    {
      id: '3',
      nombre: 'City Center Hotel',
      lat: 40.7589,
      lng: -73.9851,
      precio: 120,
      calificacion: 4.2,
      imagen: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      descripcion: 'En el corazón de Manhattan'
    },
    {
      id: '4',
      nombre: 'Beach Resort Miami',
      lat: 25.7617,
      lng: -80.1918,
      precio: 180,
      calificacion: 4.6,
      imagen: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
      descripcion: 'Resort de playa en Miami Beach'
    }
  ];

  filteredHotels: HotelMarker[] = [];

  ngOnInit(): void {
    this.initializeObservables();
    this.filteredHotels = [...this.hotelMarkers];
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'map_viewed',
      properties: { timestamp: new Date().toISOString() }
    }));
  }

  ngAfterViewInit(): void {
    // Asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      if (this.mapElement?.nativeElement) {
        this.initializeMap();
        this.cdr.detectChanges();
      } else {
        console.error('Map element not found in DOM');
        // Retry after another delay
        setTimeout(() => {
          if (this.mapElement?.nativeElement) {
            this.initializeMap();
            this.cdr.detectChanges();
          } else {
            this.showMapError();
          }
        }, 500);
      }
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeObservables(): void {
    this.hoteles$ = this.store.select(HotelSelectors.selectHoteles);
    this.isLoading$ = this.store.select(HotelSelectors.selectHotelesLoading);

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.isLoading = loading;
      this.cdr.markForCheck();
    });
  }

  private initializeMap(): void {
    try {
      // Configurar iconos de Leaflet para evitar problemas de rutas
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Verificar que el elemento del mapa existe
      if (!this.mapElement?.nativeElement) {
        console.error('Map element not found');
        return;
      }

      // Inicializar mapa con configuración mejorada
      this.map = L.map(this.mapElement.nativeElement, {
        center: [25.7617, -80.1918], // Miami como centro
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true, // Habilitado por defecto
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        attributionControl: true
      });

      // Configurar manejo del scroll del mouse
      this.setupScrollHandling();

      // Agregar capa base
      this.addBaseLayer();

      // Agregar marcadores después de que el mapa se haya cargado
      this.map.whenReady(() => {
        this.addHotelMarkers();
        this.fitMapToMarkers();
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      this.showMapError();
    }
  }

  private setupScrollHandling(): void {
    if (!this.map || !this.mapElement) return;

    const mapElement = this.mapElement.nativeElement;
    let isMouseOver = false;

    // Detectar cuando el mouse está sobre el mapa
    mapElement.addEventListener('mouseenter', () => {
      isMouseOver = true;
      this.map!.scrollWheelZoom.enable();
    });

    mapElement.addEventListener('mouseleave', () => {
      isMouseOver = false;
      this.map!.scrollWheelZoom.disable();
    });

    // Mostrar mensaje cuando el usuario trata de hacer scroll sin tener el mouse sobre el mapa
    mapElement.addEventListener('wheel', (e: WheelEvent) => {
      if (!isMouseOver) {
        e.preventDefault();
        this.showScrollHint();
      }
    }, { passive: false });
  }

  private showScrollHint(): void {
    // Mostrar un hint visual temporal
    if (!document.getElementById('scroll-hint')) {
      const hint = document.createElement('div');
      hint.id = 'scroll-hint';
      hint.innerHTML = '🖱️ Coloca el cursor sobre el mapa para hacer zoom';
      hint.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 2001;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(hint);
      
      // Animar entrada
      setTimeout(() => hint.style.opacity = '1', 10);
      
      // Remover después de 2 segundos
      setTimeout(() => {
        hint.style.opacity = '0';
        setTimeout(() => {
          if (hint.parentNode) {
            hint.parentNode.removeChild(hint);
          }
        }, 300);
      }, 2000);
    }
  }

  private addBaseLayer(): void {
    if (!this.map) return;

    try {
      // Usar múltiples proveedores de tiles para mayor confiabilidad
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        crossOrigin: true
      });

      streetLayer.addTo(this.map);

      // Agregar evento para manejar errores de carga de tiles
      streetLayer.on('tileerror', (e: any) => {
        console.warn('Tile loading error:', e);
        // Fallback a un proveedor alternativo si hay errores
        this.addFallbackLayer();
      });

      streetLayer.on('tileload', () => {
        console.log('Tiles loaded successfully');
      });

    } catch (error) {
      console.error('Error adding base layer:', error);
      this.addFallbackLayer();
    }
  }

  private addFallbackLayer(): void {
    if (!this.map) return;

    // Capa de respaldo usando CartoDB
    const fallbackLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });

    fallbackLayer.addTo(this.map);
  }

  private addHotelMarkers(): void {
    if (!this.map) return;

    this.clearMarkers();

    this.filteredHotels.forEach(hotel => {
      const customIcon = L.divIcon({
        html: `
          <div class="custom-marker">
            <div class="marker-price">$${hotel.precio}</div>
            <div class="marker-rating">⭐${hotel.calificacion}</div>
          </div>
        `,
        className: 'custom-marker-container',
        iconSize: [80, 60],
        iconAnchor: [40, 30]
      });

      const marker = L.marker([hotel.lat, hotel.lng], { icon: customIcon })
        .addTo(this.map!)
        .bindPopup(`
          <div class="marker-popup">
            <img src="${hotel.imagen}" alt="${hotel.nombre}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <h4 style="margin: 0 0 8px 0;">${hotel.nombre}</h4>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9rem;">${hotel.descripcion}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #667eea;">$${hotel.precio}/noche</span>
              <span style="color: #f39c12;">⭐ ${hotel.calificacion}</span>
            </div>
          </div>
        `)
        .on('click', () => {
          this.selectHotel(hotel);
        });

      this.markers.push(marker);
    });

    // Agregar estilos CSS para marcadores personalizados
    if (!document.getElementById('map-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'map-marker-styles';
      style.textContent = `
        .custom-marker-container {
          border: none !important;
          background: transparent !important;
        }
        .custom-marker {
          background: white;
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 4px 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .custom-marker:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .marker-price {
          font-weight: bold;
          color: #667eea;
          font-size: 0.9rem;
        }
        .marker-rating {
          font-size: 0.8rem;
          color: #f39c12;
        }
        .marker-popup {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers = [];
  }

  private fitMapToMarkers(): void {
    if (!this.map || this.markers.length === 0) return;

    const group = new L.FeatureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  centerMap(): void {
    if (!this.map) return;
    
    this.fitMapToMarkers();
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'map_centered',
      properties: { timestamp: new Date().toISOString() }
    }));
  }

  toggleLayer(): void {
    if (!this.map) return;

    // En una implementación real, cambiarías entre diferentes tipos de mapas
    this.currentLayer = this.currentLayer === 'street' ? 'satellite' : 'street';
    
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'map_layer_changed',
      properties: { layer: this.currentLayer }
    }));
  }

  refreshHotels(): void {
    this.store.dispatch(HotelActions.loadHoteles());
    this.addHotelMarkers();
    
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'hotels_refreshed',
      properties: { count: this.filteredHotels.length }
    }));
  }

  togglePanel(): void {
    this.panelCollapsed = !this.panelCollapsed;
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.filterHotels();
  }

  filterHotels(): void {
    this.filteredHotels = this.hotelMarkers.filter(hotel => {
      const matchesSearch = hotel.nombre.toLowerCase().includes(this.searchQuery) ||
                           hotel.descripcion.toLowerCase().includes(this.searchQuery);
      const matchesPrice = hotel.precio <= this.maxPrice;
      const matchesRating = hotel.calificacion >= this.minRating;

      return matchesSearch && matchesPrice && matchesRating;
    });

    this.addHotelMarkers();
    this.cdr.markForCheck();

    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'hotels_filtered',
      properties: { 
        resultCount: this.filteredHotels.length,
        maxPrice: this.maxPrice,
        minRating: this.minRating,
        searchQuery: this.searchQuery
      }
    }));
  }

  selectHotel(hotel: HotelMarker): void {
    this.selectedHotelId = hotel.id;
    
    if (this.map) {
      this.map.setView([hotel.lat, hotel.lng], 12);
    }
    
    this.store.dispatch(HotelActions.selectHotel({ hotelId: hotel.id }));
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'hotel_selected',
      properties: { hotelId: hotel.id, hotelName: hotel.nombre }
    }));
    
    this.cdr.markForCheck();
  }

  viewHotelDetails(hotelId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.selectedHotelDetails = this.hotelMarkers.find(h => h.id === hotelId);
    if (this.selectedHotelDetails) {
      // Simular servicios adicionales
      this.selectedHotelDetails.servicios = ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Gimnasio'];
    }
    
    this.store.dispatch(HotelActions.trackEvent({ 
      event: 'hotel_details_viewed',
      properties: { hotelId }
    }));
  }

  closeModal(): void {
    this.selectedHotelDetails = null;
  }

  makeReservation(): void {
    if (this.selectedHotelDetails) {
      // Aquí redirigirías al formulario de reserva
      this.store.dispatch(HotelActions.trackEvent({ 
        event: 'reservation_started',
        properties: { hotelId: this.selectedHotelDetails.id }
      }));
      
      this.closeModal();
      alert(`Iniciando reserva para ${this.selectedHotelDetails.nombre}`);
    }
  }

  trackByHotelId(index: number, hotel: HotelMarker): string {
    return hotel.id;
  }

  private showMapError(): void {
    if (this.mapElement?.nativeElement) {
      this.mapElement.nativeElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8f9fa;
          color: #666;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
          <h3 style="margin: 0 0 0.5rem 0; color: #333;">Error al cargar el mapa</h3>
          <p style="margin: 0; text-align: center; max-width: 300px;">
            No se pudo inicializar el mapa. Por favor, actualiza la página o verifica tu conexión a internet.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              margin-top: 1rem;
              padding: 0.5rem 1rem;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            "
          >
            Recargar página
          </button>
        </div>
      `;
    }
  }
}