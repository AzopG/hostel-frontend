import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PerformanceService } from '../../services/performance.service';

interface ImageConfig {
  src: string;
  alt: string;
  placeholder?: string;
  quality: 'low' | 'medium' | 'high';
  lazy: boolean;
  aspectRatio?: string;
  sizes?: string;
  srcset?: string;
}

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="optimized-image-container"
      [style.aspect-ratio]="config.aspectRatio || 'auto'"
      [class.loading]="isLoading"
      [class.loaded]="isLoaded"
      [class.error]="hasError"
    >
      <!-- Placeholder/Skeleton -->
      <div 
        *ngIf="isLoading || hasError" 
        class="image-placeholder"
        [class.skeleton]="isLoading"
        [class.error-state]="hasError"
      >
        <div *ngIf="isLoading" class="skeleton-shimmer"></div>
        <div *ngIf="hasError" class="error-content">
          <i class="fas fa-image error-icon"></i>
          <span class="error-text">Error al cargar imagen</span>
        </div>
      </div>

      <!-- Imagen optimizada -->
      <img
        #optimizedImage
        [src]="displaySrc"
        [alt]="config.alt"
        [sizes]="config.sizes"
        [srcset]="config.srcset"
        [loading]="config.lazy ? 'lazy' : 'eager'"
        class="optimized-image"
        [class.fade-in]="fadeInEnabled"
        (load)="onImageLoad()"
        (error)="onImageError()"
        [style.display]="isLoaded ? 'block' : 'none'"
      />

      <!-- Overlay de información (solo en desarrollo) -->
      <div 
        *ngIf="showDebugInfo && isLoaded" 
        class="debug-overlay"
      >
        <small>{{ config.quality | uppercase }}</small>
        <small>{{ imageSize }}</small>
      </div>
    </div>
  `,
  styles: [`
    .optimized-image-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      background-color: #f7fafc;
      border-radius: 8px;
    }

    .optimized-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .optimized-image.fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #e2e8f0;
      z-index: 1;
    }

    .image-placeholder.skeleton {
      background: linear-gradient(
        90deg,
        #e2e8f0 0%,
        #f1f5f9 50%,
        #e2e8f0 100%
      );
      background-size: 200% 100%;
      position: relative;
      overflow: hidden;
    }

    .skeleton-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      right: -100%;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .error-state {
      background-color: #fed7d7;
      color: #e53e3e;
    }

    .error-content {
      text-align: center;
      padding: 1rem;
    }

    .error-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.6;
    }

    .error-text {
      font-size: 0.875rem;
      display: block;
    }

    .debug-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      pointer-events: none;
    }

    /* Optimizaciones para diferentes tamaños */
    .optimized-image-container.small {
      border-radius: 4px;
    }

    .optimized-image-container.large {
      border-radius: 12px;
    }

    /* Estados de carga */
    .optimized-image-container.loading .optimized-image {
      opacity: 0;
    }

    .optimized-image-container.loaded .image-placeholder {
      opacity: 0;
      pointer-events: none;
    }

    .optimized-image-container.error .optimized-image {
      display: none;
    }

    /* Responsive optimizations */
    @media (max-width: 768px) {
      .debug-overlay {
        display: none;
      }
      
      .optimized-image {
        transition: none; /* Mejor performance en móvil */
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .image-placeholder {
        border: 2px solid currentColor;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .optimized-image,
      .skeleton-shimmer {
        animation: none;
        transition: none;
      }
    }

    /* Print optimization */
    @media print {
      .debug-overlay,
      .skeleton-shimmer {
        display: none;
      }
    }
  `]
})
export class OptimizedImageComponent implements OnInit, OnDestroy {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() placeholder: string = '';
  @Input() quality: 'low' | 'medium' | 'high' = 'medium';
  @Input() lazy: boolean = true;
  @Input() aspectRatio: string = '';
  @Input() sizes: string = '';
  @Input() srcset: string = '';
  @Input() fadeInEnabled: boolean = true;
  @Input() showDebugInfo: boolean = false;

  @Output() imageLoad = new EventEmitter<Event>();
  @Output() imageError = new EventEmitter<Event>();

  @ViewChild('optimizedImage', { static: false }) imageElement?: ElementRef<HTMLImageElement>;

  config: ImageConfig = {
    src: '',
    alt: '',
    quality: 'medium',
    lazy: true
  };

  isLoading: boolean = true;
  isLoaded: boolean = false;
  hasError: boolean = false;
  displaySrc: string = '';
  imageSize: string = '';

  private optimizationConfig = {
    enableAnimations: true,
    imageQuality: 'medium' as 'low' | 'medium' | 'high',
    prefetchEnabled: true
  };

  constructor(
    private performanceService: PerformanceService,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.optimizationConfig = this.performanceService.getOptimizationConfig();
    this.updateConfig();
    if (isPlatformBrowser(this.platformId)) {
      this.setupImage();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.performanceService.unobserve(this.elementRef.nativeElement);
    }
  }

  private updateConfig(): void {
    this.config = {
      src: this.src,
      alt: this.alt,
      placeholder: this.placeholder,
      quality: this.quality || this.optimizationConfig.imageQuality,
      lazy: this.lazy,
      aspectRatio: this.aspectRatio,
      sizes: this.sizes,
      srcset: this.srcset
    };
  }

  private setupImage(): void {
    if (!this.config.src) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    // Determinar la URL optimizada basada en la calidad
    this.displaySrc = this.getOptimizedSrc();

    if (isPlatformBrowser(this.platformId)) {
      // Configurar lazy loading si está habilitado
      if (this.config.lazy) {
        this.elementRef.nativeElement.dataset['lazyLoad'] = 'image';
        this.elementRef.nativeElement.dataset['src'] = this.displaySrc;
        this.performanceService.observeForLazyLoading(this.elementRef.nativeElement);
      }

      // Precargar imagen si no es lazy
      if (!this.config.lazy) {
        this.preloadImage();
      }
    }
  }

  private getOptimizedSrc(): string {
    const baseSrc = this.config.src;
    const qualityParams = {
      low: 'q_30,f_auto',
      medium: 'q_70,f_auto', 
      high: 'q_90,f_auto'
    };
    // Simular parámetros de optimización
    if (baseSrc.includes('cloudinary.com')) {
      const quality = qualityParams[this.config.quality];
      return baseSrc.replace('/image/upload/', `/image/upload/${quality}/`);
    }
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const url = new URL(baseSrc, window.location.origin);
      url.searchParams.set('quality', this.config.quality);
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    // SSR: solo retorna el src base
    return baseSrc;
  }

  private preloadImage(): void {
    const img = new Image();
    
    img.onload = () => {
      this.onImageLoad();
      this.calculateImageSize(img);
    };
    
    img.onerror = () => {
      this.onImageError();
    };
    
    // Configurar srcset si está disponible
    if (this.config.srcset) {
      img.srcset = this.config.srcset;
    }
    
    if (this.config.sizes) {
      img.sizes = this.config.sizes;
    }
    
    img.src = this.displaySrc;
  }

  private calculateImageSize(img: HTMLImageElement): void {
    const kb = Math.round((img.src.length * 0.75) / 1024); // Aproximación
    this.imageSize = `${img.naturalWidth}x${img.naturalHeight} (~${kb}KB)`;
  }

  onImageLoad(): void {
    this.isLoading = false;
    this.isLoaded = true;
    this.hasError = false;
    
    if (this.imageElement?.nativeElement) {
      this.calculateImageSize(this.imageElement.nativeElement);
    }
    
    this.imageLoad.emit();
  }

  onImageError(): void {
    this.isLoading = false;
    this.isLoaded = false;
    this.hasError = true;
    
    // Intentar cargar imagen de fallback
    if (this.placeholder && this.displaySrc !== this.placeholder) {
      this.displaySrc = this.placeholder;
      this.preloadImage();
      return;
    }
    
    this.imageError.emit();
  }

  /**
   * Retry loading the image
   */
  retryLoad(): void {
    this.isLoading = true;
    this.isLoaded = false;
    this.hasError = false;
    this.setupImage();
  }

  /**
   * Update image source
   */
  updateSrc(newSrc: string): void {
    this.src = newSrc;
    this.updateConfig();
    this.retryLoad();
  }

  /**
   * Generate srcset for responsive images
   */
  static generateSrcSet(baseSrc: string, widths: number[]): string {
    return widths
      .map(width => `${baseSrc}?w=${width} ${width}w`)
      .join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  static generateSizes(breakpoints: { maxWidth: string; size: string }[]): string {
    const sizeRules = breakpoints
      .map(bp => `(max-width: ${bp.maxWidth}) ${bp.size}`)
      .join(', ');
    
    return `${sizeRules}, 100vw`;
  }

  /**
   * Create optimized image config
   */
  static createConfig(
    src: string,
    alt: string,
    options: Partial<ImageConfig> = {}
  ): ImageConfig {
    return {
      src,
      alt,
      quality: 'medium',
      lazy: true,
      ...options
    };
  }
}