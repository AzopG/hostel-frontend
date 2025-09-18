import { Injectable } from '@angular/core';
import { Observable, fromEvent, debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;

  constructor() {
    this.initializeObservers();
  }

  /**
   * Inicializa los observers para optimización
   */
  private initializeObservers(): void {
    // Intersection Observer para lazy loading
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              
              // Trigger lazy loading
              if (target.dataset['lazyLoad']) {
                this.loadLazyContent(target);
              }
              
              // Trigger animations when in viewport
              if (target.dataset['animateOnScroll']) {
                target.classList.add('animate-in-view');
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );
    }

    // Resize Observer para responsive optimizations
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const target = entry.target as HTMLElement;
          this.handleResize(target, entry.contentRect);
        });
      });
    }
  }

  /**
   * Observa un elemento para lazy loading
   */
  observeForLazyLoading(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
  }

  /**
   * Deja de observar un elemento
   */
  unobserve(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(element);
    }
  }

  /**
   * Carga contenido lazy
   */
  private loadLazyContent(element: HTMLElement): void {
    const lazyType = element.dataset['lazyLoad'];
    
    switch (lazyType) {
      case 'image':
        this.loadLazyImage(element as HTMLImageElement);
        break;
      case 'component':
        this.loadLazyComponent(element);
        break;
      case 'iframe':
        this.loadLazyIframe(element as HTMLIFrameElement);
        break;
    }
  }

  /**
   * Carga imágenes lazy
   */
  private loadLazyImage(img: HTMLImageElement): void {
    if (img.dataset['src']) {
      // Crear imagen temporal para precargar
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = img.dataset['src']!;
        img.classList.add('loaded');
        delete img.dataset['src'];
        delete img.dataset['lazyLoad'];
      };
      tempImg.src = img.dataset['src'];
    }
  }

  /**
   * Carga componentes lazy
   */
  private loadLazyComponent(element: HTMLElement): void {
    const componentName = element.dataset['component'];
    if (componentName) {
      // Emitir evento personalizado para cargar componente
      element.dispatchEvent(new CustomEvent('loadLazyComponent', {
        detail: { componentName }
      }));
    }
  }

  /**
   * Carga iframes lazy
   */
  private loadLazyIframe(iframe: HTMLIFrameElement): void {
    if (iframe.dataset['src']) {
      iframe.src = iframe.dataset['src'];
      delete iframe.dataset['src'];
      delete iframe.dataset['lazyLoad'];
    }
  }

  /**
   * Maneja redimensionamiento responsive
   */
  private handleResize(element: HTMLElement, rect: DOMRectReadOnly): void {
    // Ajustar grid columns basado en el ancho
    if (element.classList.contains('responsive-grid')) {
      const columns = this.calculateOptimalColumns(rect.width);
      element.style.setProperty('--grid-columns', columns.toString());
    }
  }

  /**
   * Calcula columnas óptimas para grids responsivos
   */
  private calculateOptimalColumns(width: number): number {
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  }

  /**
   * Debounce para eventos de scroll
   */
  getScrollObservable(): Observable<Event> {
    return fromEvent(window, 'scroll').pipe(
      debounceTime(16), // ~60fps
      distinctUntilChanged()
    );
  }

  /**
   * Optimización para listas virtuales
   */
  calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    buffer: number = 3
  ): { startIndex: number; endIndex: number; totalItems: number } {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(startIndex + visibleItems + buffer * 2);
    
    return {
      startIndex,
      endIndex,
      totalItems: visibleItems + buffer * 2
    };
  }

  /**
   * Prefetch de rutas basado en hover
   */
  prefetchRoute(routePath: string): void {
    // En un entorno real, esto prefetchearia los chunks de la ruta
    console.log(`Prefetching route: ${routePath}`);
    
    // Simular prefetch con link rel="prefetch"
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = routePath;
    document.head.appendChild(link);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * Medir performance de operaciones
   */
  measurePerformance<T>(operation: () => T, label: string): T {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    console.log(`${label} took ${(end - start).toFixed(2)} milliseconds`);
    return result;
  }

  /**
   * Throttle function para limitar ejecuciones
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function para retrasar ejecuciones
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Detectar si el dispositivo es móvil
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Detectar conexión lenta
   */
  isSlowConnection(): boolean {
    const connection = (navigator as any).connection;
    if (connection) {
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' ||
             connection.saveData;
    }
    return false;
  }

  /**
   * Configurar optimizaciones basadas en el device
   */
  getOptimizationConfig(): {
    enableAnimations: boolean;
    imageQuality: 'low' | 'medium' | 'high';
    prefetchEnabled: boolean;
    virtualScrollThreshold: number;
  } {
    const isMobile = this.isMobileDevice();
    const isSlowConnection = this.isSlowConnection();
    
    return {
      enableAnimations: !isMobile && !isSlowConnection,
      imageQuality: isSlowConnection ? 'low' : isMobile ? 'medium' : 'high',
      prefetchEnabled: !isSlowConnection,
      virtualScrollThreshold: isMobile ? 50 : 100
    };
  }
}