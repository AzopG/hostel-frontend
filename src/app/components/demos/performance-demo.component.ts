import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription, interval, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

// Importar componentes optimizados
import { VirtualScrollComponent } from '../shared/virtual-scroll.component';
import { OptimizedImageComponent } from '../shared/optimized-image.component';
import { PerformanceService } from '../../services/performance.service';

interface ListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  image?: string;
  metadata?: any;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  listItems: number;
  visibleItems: number;
  scrollPosition: number;
}

@Component({
  selector: 'app-performance-demo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    VirtualScrollComponent, 
    OptimizedImageComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="performance-demo-container">
      <!-- Header -->
      <header class="demo-header">
        <div class="header-content">
          <h1>🚀 Optimización de Rendimiento</h1>
          <p>Demostración de técnicas avanzadas para maximizar el rendimiento</p>
        </div>
        
        <!-- Performance Metrics -->
        <div class="metrics-bar">
          <div class="metric-item">
            <span class="metric-label">Render Time</span>
            <span class="metric-value">{{ metrics.renderTime.toFixed(2) }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Memory</span>
            <span class="metric-value">{{ formatMemory(metrics.memoryUsage) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Items</span>
            <span class="metric-value">{{ metrics.listItems }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Visible</span>
            <span class="metric-value">{{ metrics.visibleItems }}</span>
          </div>
        </div>
      </header>

      <!-- Controls -->
      <section class="controls-section">
        <div class="controls-grid">
          <div class="control-group">
            <label>Cantidad de Items</label>
            <select [(ngModel)]="itemCount" (change)="generateItems()">
              <option value="100">100 items</option>
              <option value="500">500 items</option>
              <option value="1000">1,000 items</option>
              <option value="5000">5,000 items</option>
              <option value="10000">10,000 items</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Altura del Item</label>
            <select [(ngModel)]="itemHeight" (change)="updateVirtualScroll()">
              <option value="60">60px</option>
              <option value="80">80px</option>
              <option value="120">120px</option>
              <option value="150">150px</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Calidad de Imagen</label>
            <select [(ngModel)]="imageQuality">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          
          <div class="control-group">
            <button class="btn-primary" (click)="measurePerformance()">
              <i class="fas fa-stopwatch"></i>
              Medir Rendimiento
            </button>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <div class="demo-content">
        
        <!-- Virtual Scroll Demo -->
        <section class="demo-section">
          <h2>Virtual Scrolling</h2>
          <p>Lista optimizada con {{ items.length }} elementos - Solo renderiza items visibles</p>
          
          <app-virtual-scroll
            [items]="items"
            [itemHeight]="itemHeight"
            [containerHeight]="500"
            [buffer]="5"
            [threshold]="0.8"
            [loading]="isLoading"
            (loadMore)="loadMoreItems($event)"
            (itemsVisible)="onItemsVisible($event)"
          >
            <!-- Template para cada item -->
            <ng-template #itemTemplate let-item let-index="index">
              <div class="virtual-item" [attr.data-testid]="'item-' + index">
                <div class="item-image">
                  <app-optimized-image
                    [src]="item.image || 'https://picsum.photos/80/80?random=' + item.id"
                    [alt]="item.title"
                    [quality]="imageQuality"
                    [aspectRatio]="'1'"
                    [lazy]="true"
                  ></app-optimized-image>
                </div>
                
                <div class="item-content">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                  <div class="item-meta">
                    <span class="category" [class]="'category-' + item.category">
                      {{ item.category }}
                    </span>
                    <span class="priority" [class]="'priority-' + item.priority">
                      {{ item.priority | titlecase }}
                    </span>
                    <span class="date">
                      {{ item.createdAt | date:'short' }}
                    </span>
                  </div>
                </div>
                
                <div class="item-actions">
                  <button 
                    class="btn-icon" 
                    (click)="editItem(item, index)"
                    [attr.aria-label]="'Editar ' + item.title"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-icon danger" 
                    (click)="deleteItem(index)"
                    [attr.aria-label]="'Eliminar ' + item.title"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </ng-template>
            
            <!-- Empty template -->
            <ng-template #emptyTemplate>
              <div class="empty-state">
                <i class="fas fa-list-ul empty-icon"></i>
                <h3>Lista vacía</h3>
                <p>No hay elementos para mostrar</p>
                <button class="btn-primary" (click)="generateItems()">
                  Generar Items
                </button>
              </div>
            </ng-template>
          </app-virtual-scroll>
        </section>

        <!-- Image Gallery Demo -->
        <section class="demo-section">
          <h2>Galería de Imágenes Optimizada</h2>
          <p>Lazy loading con diferentes calidades según la conexión</p>
          
          <div class="image-gallery">
            <div 
              *ngFor="let image of sampleImages; trackBy: trackByImageId"
              class="gallery-item"
            >
              <app-optimized-image
                [src]="image.url"
                [alt]="image.alt"
                [quality]="imageQuality"
                [aspectRatio]="'16/9'"
                [lazy]="true"
                [showDebugInfo]="true"
                [sizes]="'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'"
                [srcset]="generateSrcSet(image.url)"
              ></app-optimized-image>
              <div class="image-info">
                <h4>{{ image.title }}</h4>
                <p>{{ image.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Performance Analysis -->
        <section class="demo-section">
          <h2>Análisis de Rendimiento</h2>
          
          <div class="performance-grid">
            <div class="perf-card">
              <h3>Change Detection</h3>
              <div class="perf-stats">
                <div class="stat">
                  <span class="stat-label">Estrategia:</span>
                  <span class="stat-value">OnPush</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Detectiones:</span>
                  <span class="stat-value">{{ changeDetectionCount }}</span>
                </div>
              </div>
            </div>
            
            <div class="perf-card">
              <h3>Virtual Scrolling</h3>
              <div class="perf-stats">
                <div class="stat">
                  <span class="stat-label">Items Totales:</span>
                  <span class="stat-value">{{ items.length }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Items Renderizados:</span>
                  <span class="stat-value">{{ metrics.visibleItems }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Ahorro:</span>
                  <span class="stat-value">{{ calculateSavings() }}%</span>
                </div>
              </div>
            </div>
            
            <div class="perf-card">
              <h3>Lazy Loading</h3>
              <div class="perf-stats">
                <div class="stat">
                  <span class="stat-label">Imágenes Cargadas:</span>
                  <span class="stat-value">{{ loadedImages }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Ahorro de Banda:</span>
                  <span class="stat-value">{{ bandwidthSaved }}KB</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .performance-demo-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .demo-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    .header-content h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .metrics-bar {
      display: flex;
      gap: 2rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .controls-section {
      background: white;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      align-items: end;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .control-group label {
      font-weight: 500;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .control-group select {
      padding: 0.5rem;
      border: 1px solid #d2d6dc;
      border-radius: 6px;
      background: white;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .demo-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .demo-section h2 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
      font-size: 1.5rem;
    }

    .demo-section p {
      margin: 0 0 1.5rem 0;
      color: #718096;
    }

    /* Virtual Item Styles */
    .virtual-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: white;
      transition: background-color 0.2s ease;
    }

    .virtual-item:hover {
      background-color: #f7fafc;
    }

    .item-image {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .item-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .item-content p {
      margin: 0 0 0.75rem 0;
      color: #718096;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .item-meta {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .category, .priority {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .category-hotel { background: #e6fffa; color: #234e52; }
    .category-reserva { background: #fef5e7; color: #744210; }
    .category-evento { background: #edf2f7; color: #2d3748; }

    .priority-high { background: #fed7d7; color: #742a2a; }
    .priority-medium { background: #feebc8; color: #7b341e; }
    .priority-low { background: #c6f6d5; color: #22543d; }

    .date {
      color: #a0aec0;
      font-size: 0.75rem;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: #edf2f7;
      color: #4a5568;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: #e2e8f0;
    }

    .btn-icon.danger {
      background: #fed7d7;
      color: #e53e3e;
    }

    .btn-icon.danger:hover {
      background: #fbb6ce;
    }

    /* Image Gallery */
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .gallery-item {
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .image-info {
      padding: 1rem;
    }

    .image-info h4 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .image-info p {
      margin: 0;
      color: #718096;
      font-size: 0.875rem;
    }

    /* Performance Grid */
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .perf-card {
      background: #f7fafc;
      border-radius: 8px;
      padding: 1.5rem;
      border-left: 4px solid #667eea;
    }

    .perf-card h3 {
      margin: 0 0 1rem 0;
      color: #2d3748;
      font-size: 1.125rem;
    }

    .perf-stats {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      color: #718096;
      font-size: 0.875rem;
    }

    .stat-value {
      font-weight: 600;
      color: #2d3748;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .empty-icon {
      font-size: 3rem;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #4a5568;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .metrics-bar {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .controls-grid {
        grid-template-columns: 1fr;
      }

      .demo-content {
        padding: 1rem;
      }

      .virtual-item {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }

      .item-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class PerformanceDemoComponent implements OnInit, OnDestroy {
  
  items: ListItem[] = [];
  itemCount: string = '1000';
  itemHeight: number = 80;
  imageQuality: 'low' | 'medium' | 'high' = 'medium';
  isLoading: boolean = false;
  changeDetectionCount: number = 0;
  loadedImages: number = 0;
  bandwidthSaved: number = 0;

  metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    listItems: 0,
    visibleItems: 0,
    scrollPosition: 0
  };

  sampleImages = [
    { 
      id: '1', 
      url: 'https://picsum.photos/800/450?random=1',
      title: 'Hotel Bogotá Centro',
      alt: 'Vista del hotel en Bogotá',
      description: 'Elegante hotel en el corazón de la capital'
    },
    {
      id: '2',
      url: 'https://picsum.photos/800/450?random=2', 
      title: 'Hotel Medellín',
      alt: 'Hotel en Medellín',
      description: 'Moderno hotel con vista panorámica'
    },
    {
      id: '3',
      url: 'https://picsum.photos/800/450?random=3',
      title: 'Hotel Cartagena',
      alt: 'Hotel en Cartagena',
      description: 'Hotel boutique en la ciudad amurallada'
    },
    {
      id: '4',
      url: 'https://picsum.photos/800/450?random=4',
      title: 'Hotel Cali',
      alt: 'Hotel en Cali',
      description: 'Hotel ejecutivo en el centro de Cali'
    },
    {
      id: '5',
      url: 'https://picsum.photos/800/450?random=5',
      title: 'Hotel Barranquilla',
      alt: 'Hotel en Barranquilla',
      description: 'Hotel costero con vista al mar'
    },
    {
      id: '6',
      url: 'https://picsum.photos/800/450?random=6',
      title: 'Salón de Eventos',
      alt: 'Salón para eventos',
      description: 'Espacioso salón para eventos corporativos'
    }
  ];

  private subscriptions: Subscription[] = [];
  private performanceObserver?: PerformanceObserver;

  constructor(
    private cdr: ChangeDetectorRef,
    private performanceService: PerformanceService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.generateItems();
    this.setupPerformanceMonitoring();
    this.updateMetrics();
    
    // Simular actualizaciones periódicas de métricas
    const metricsUpdate = interval(1000).subscribe(() => {
      this.updateMetrics();
    });
    
    this.subscriptions.push(metricsUpdate);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  generateItems(): void {
    const count = parseInt(this.itemCount);
    const categories = ['hotel', 'reserva', 'evento'];
    const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    
    this.items = Array.from({ length: count }, (_, index) => ({
      id: `item-${index}`,
      title: `Item ${index + 1} - ${this.getRandomTitle()}`,
      description: this.getRandomDescription(),
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdAt: new Date(Date.now() - Math.random() * 10000000000),
      image: `https://picsum.photos/80/80?random=${index}`
    }));

    this.metrics.listItems = this.items.length;
    this.cdr.detectChanges();
  }

  private getRandomTitle(): string {
    const titles = [
      'Reserva Confirmada',
      'Evento Corporativo',
      'Habitación Premium',
      'Suite Ejecutiva',
      'Sala de Reuniones',
      'Conferencia Anual',
      'Banquete Especial',
      'Reunión de Trabajo'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private getRandomDescription(): string {
    const descriptions = [
      'Descripción detallada del elemento con información relevante para el usuario.',
      'Información importante sobre este item que debe ser mostrada en la lista.',
      'Detalles específicos que ayudan a identificar y categorizar este elemento.',
      'Contenido descriptivo que proporciona contexto adicional sobre el item.',
      'Información complementaria que enriquece la presentación del elemento.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  updateVirtualScroll(): void {
    this.cdr.detectChanges();
  }

  measurePerformance(): void {
    const start = performance.now();
    
    // Simular operación pesada
    this.performanceService.measurePerformance(() => {
      this.generateItems();
      this.cdr.detectChanges();
    }, 'Lista Generation');
    
    const end = performance.now();
    this.metrics.renderTime = end - start;
    this.cdr.detectChanges();
  }

  onItemsVisible(range: any): void {
    this.metrics.visibleItems = range.visibleItems.length;
    this.cdr.detectChanges();
  }

  loadMoreItems(currentCount: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Simular carga asíncrona
    setTimeout(() => {
      const newItems = Array.from({ length: 50 }, (_, index) => ({
        id: `item-${currentCount + index}`,
        title: `New Item ${currentCount + index + 1}`,
        description: this.getRandomDescription(),
        category: 'hotel',
        priority: 'medium' as const,
        createdAt: new Date(),
        image: `https://picsum.photos/80/80?random=${currentCount + index}`
      }));
      
      this.items.push(...newItems);
      this.metrics.listItems = this.items.length;
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  editItem(item: ListItem, index: number): void {
    console.log('Editing item:', item, 'at index:', index);
  }

  deleteItem(index: number): void {
    this.items.splice(index, 1);
    this.metrics.listItems = this.items.length;
    this.cdr.detectChanges();
  }

  generateSrcSet(baseUrl: string): string {
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(width => `${baseUrl}&w=${width} ${width}w`)
      .join(', ');
  }

  trackByImageId(index: number, image: any): string {
    return image.id;
  }

  calculateSavings(): number {
    if (this.items.length === 0) return 0;
    return Math.round(((this.items.length - this.metrics.visibleItems) / this.items.length) * 100);
  }

  formatMemory(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private setupPerformanceMonitoring(): void {
    // Monitor performance entries
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  private updateMetrics(): void {
    // Update memory usage (approximation)
    if ((performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
    
    // Update loaded images count
    this.loadedImages = document.querySelectorAll('img[src]').length;
    
    // Calculate bandwidth saved (approximation)
    this.bandwidthSaved = Math.round((this.sampleImages.length - this.loadedImages) * 150);
    
    // Increment change detection counter
    this.changeDetectionCount++;
  }
}