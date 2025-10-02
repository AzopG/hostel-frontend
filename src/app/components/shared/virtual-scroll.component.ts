import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ViewChild, 
  ElementRef, 
  TemplateRef,
  ContentChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent, Subscription } from 'rxjs';
import { throttleTime, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PerformanceService } from '../../services/performance.service';

interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  buffer: number;
  threshold: number;
}

interface VisibleRange {
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
}

@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      #scrollContainer
      class="virtual-scroll-container"
      [style.height.px]="config.containerHeight"
      (scroll)="onScroll($event)"
    >
      <!-- Spacer superior -->
      <div 
        class="virtual-scroll-spacer" 
        [style.height.px]="topSpacerHeight"
      ></div>
      
      <!-- Items visibles -->
      <div 
        class="virtual-scroll-content"
        [style.transform]="'translateY(' + offsetY + 'px)'"
      >
        <div
          *ngFor="let item of visibleRange.visibleItems; 
                  trackBy: trackByFn; 
                  let i = index"
          class="virtual-scroll-item"
          [style.height.px]="config.itemHeight"
          [attr.data-index]="visibleRange.startIndex + i"
        >
          <!-- Template personalizado del item -->
          <ng-container
            *ngTemplateOutlet="itemTemplate; context: { 
              $implicit: item, 
              index: visibleRange.startIndex + i,
              isVisible: true
            }"
          >
          </ng-container>
        </div>
      </div>
      
      <!-- Spacer inferior -->
      <div 
        class="virtual-scroll-spacer" 
        [style.height.px]="bottomSpacerHeight"
      ></div>
      
      <!-- Loading indicator -->
      <div 
        *ngIf="loading" 
        class="virtual-scroll-loading"
      >
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <span>Cargando más elementos...</span>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div 
      *ngIf="!items?.length && !loading" 
      class="virtual-scroll-empty"
    >
      <ng-container
        *ngTemplateOutlet="emptyTemplate || defaultEmptyTemplate"
      >
      </ng-container>
    </div>
    
    <!-- Default empty template -->
    <ng-template #defaultEmptyTemplate>
      <div class="empty-state">
        <i class="fas fa-inbox empty-icon"></i>
        <h3>No hay elementos</h3>
        <p>No se encontraron elementos para mostrar</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .virtual-scroll-container {
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      width: 100%;
      scroll-behavior: smooth;
    }

    .virtual-scroll-spacer {
      width: 100%;
      pointer-events: none;
    }

    .virtual-scroll-content {
      will-change: transform;
    }

    .virtual-scroll-item {
      width: 100%;
      display: flex;
      align-items: stretch;
      transition: opacity 0.2s ease;
    }

    .virtual-scroll-item:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .virtual-scroll-loading {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #667eea;
      font-size: 0.875rem;
    }

    .spinner-ring {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(102, 126, 234, 0.3);
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .virtual-scroll-empty {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .empty-state {
      text-align: center;
      color: #718096;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #4a5568;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    /* Optimizaciones para móvil */
    @media (max-width: 768px) {
      .virtual-scroll-container {
        scroll-behavior: auto; /* Mejor performance en móvil */
      }
      
      .virtual-scroll-item {
        transition: none; /* Reducir transiciones en móvil */
      }
    }

    /* Optimizaciones para scroll touch */
    .virtual-scroll-container {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
    }

    /* Performance optimizations */
    .virtual-scroll-content {
      contain: layout style paint;
    }

    .virtual-scroll-item {
      contain: layout style paint;
    }
  `]
})
export class VirtualScrollComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() items: any[] = [];
  @Input() itemHeight: number = 60;
  @Input() containerHeight: number = 400;
  @Input() buffer: number = 5;
  @Input() threshold: number = 0.8;
  @Input() loading: boolean = false;
  @Input() trackByProperty: string = 'id';
  
  @Output() scrollEnd = new EventEmitter<void>();
  @Output() itemsVisible = new EventEmitter<VisibleRange>();
  @Output() loadMore = new EventEmitter<number>();

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef<HTMLDivElement>;
  @ContentChild('itemTemplate', { static: false }) itemTemplate!: TemplateRef<any>;
  @ContentChild('emptyTemplate', { static: false }) emptyTemplate?: TemplateRef<any>;

  config: VirtualScrollConfig = {
    itemHeight: 60,
    containerHeight: 400,
    buffer: 5,
    threshold: 0.8
  };

  visibleRange: VisibleRange = {
    startIndex: 0,
    endIndex: 0,
    visibleItems: []
  };

  topSpacerHeight: number = 0;
  bottomSpacerHeight: number = 0;
  offsetY: number = 0;
  
  private scrollSubject = new Subject<Event>();
  private subscriptions: Subscription[] = [];
  private isScrolling = false;
  private scrollTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private performanceService: PerformanceService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.updateConfig();
    this.setupScrollObserver();
    this.calculateVisibleItems();
  }

  ngAfterViewInit(): void {
    // Configurar intersection observer para lazy loading
    this.performanceService.observeForLazyLoading(
      this.scrollContainer.nativeElement
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['itemHeight'] || changes['containerHeight']) {
      this.updateConfig();
      this.calculateVisibleItems();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.performanceService.unobserve(this.scrollContainer.nativeElement);
    
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  private updateConfig(): void {
    this.config = {
      itemHeight: this.itemHeight,
      containerHeight: this.containerHeight,
      buffer: this.buffer,
      threshold: this.threshold
    };
  }

  private setupScrollObserver(): void {
    // Scroll observer optimizado con throttling
    const scrollSub = this.scrollSubject.pipe(
      throttleTime(16), // 60fps
      distinctUntilChanged()
    ).subscribe(() => {
      this.calculateVisibleItems();
      this.checkLoadMore();
    });

    this.subscriptions.push(scrollSub);

    // Scroll end detection
    const scrollEndSub = this.scrollSubject.pipe(
      debounceTime(150)
    ).subscribe(() => {
      this.onScrollEnd();
    });

    this.subscriptions.push(scrollEndSub);
  }

  onScroll(event: Event): void {
    this.isScrolling = true;
    this.scrollSubject.next(event);
    
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Set scroll end detection
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150);
  }

  private calculateVisibleItems(): void {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    const visibleCount = Math.ceil(this.config.containerHeight / this.config.itemHeight);
    
    // Calcular índices con buffer
    const startIndex = Math.max(
      0, 
      Math.floor(scrollTop / this.config.itemHeight) - this.config.buffer
    );
    
    const endIndex = Math.min(
      this.items.length,
      startIndex + visibleCount + (this.config.buffer * 2)
    );

    // Actualizar range visible
    this.visibleRange = {
      startIndex,
      endIndex,
      visibleItems: this.items.slice(startIndex, endIndex)
    };

    // Calcular spacers
    this.topSpacerHeight = startIndex * this.config.itemHeight;
    this.bottomSpacerHeight = (this.items.length - endIndex) * this.config.itemHeight;
    this.offsetY = 0;

    // Emitir items visibles
    this.itemsVisible.emit(this.visibleRange);
  }

  private checkLoadMore(): void {
    const scrollContainer = this.scrollContainer.nativeElement;
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= this.config.threshold && !this.loading) {
      this.loadMore.emit(this.items.length);
    }
  }

  private onScrollEnd(): void {
    this.scrollEnd.emit();
  }

  trackByFn = (index: number, item: any): any => {
    if (this.trackByProperty && item[this.trackByProperty] !== undefined) {
      return item[this.trackByProperty];
    }
    return index;
  };

  /**
   * Scroll to specific item
   */
  scrollToItem(index: number, behavior: ScrollBehavior = 'smooth'): void {
    const scrollTop = index * this.config.itemHeight;
    this.scrollContainer.nativeElement.scrollTo({
      top: scrollTop,
      behavior
    });
  }

  /**
   * Scroll to top
   */
  scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    this.scrollContainer.nativeElement.scrollTo({
      top: 0,
      behavior
    });
  }

  /**
   * Get current scroll position
   */
  getScrollPosition(): number {
    return this.scrollContainer.nativeElement.scrollTop;
  }

  /**
   * Get current visible items count
   */
  getVisibleItemsCount(): number {
    return this.visibleRange.visibleItems.length;
  }

  /**
   * Refresh the virtual scroll (force recalculation)
   */
  refresh(): void {
    this.calculateVisibleItems();
  }

  /**
   * Add items to the list (optimized)
   */
  addItems(newItems: any[], prepend: boolean = false): void {
    if (prepend) {
      this.items = [...newItems, ...this.items];
      // Ajustar scroll position para mantener posición visual
      const scrollOffset = newItems.length * this.config.itemHeight;
      this.scrollContainer.nativeElement.scrollTop += scrollOffset;
    } else {
      this.items = [...this.items, ...newItems];
    }
    
    this.calculateVisibleItems();
  }

  /**
   * Remove item from list (optimized)
   */
  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.calculateVisibleItems();
  }

  /**
   * Update specific item (optimized)
   */
  updateItem(index: number, newItem: any): void {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = newItem;
      // Solo recalcular si el item está visible
      if (index >= this.visibleRange.startIndex && index < this.visibleRange.endIndex) {
        this.calculateVisibleItems();
      }
    }
  }
}