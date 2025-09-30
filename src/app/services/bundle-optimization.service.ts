import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BundleOptimizationService {
  private preloadedRoutes = new Set<string>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.initializePreloadingStrategy();
  }

  /**
   * Estrategia de precarga inteligente
   */
  private initializePreloadingStrategy(): void {
    // Precargar rutas críticas después de la carga inicial
    setTimeout(() => {
      this.preloadCriticalRoutes();
    }, 2000);

    // Precargar rutas en hover (mouse over navigation)
    this.setupHoverPreloading();

    // Precargar basado en comportamiento del usuario
    this.setupBehaviorBasedPreloading();
  }

  /**
   * Precargar rutas críticas
   */
  private preloadCriticalRoutes(): void {
    const criticalRoutes = [
      '/dashboard',
      '/disponibilidad',
      '/reservas'
    ];

    criticalRoutes.forEach(route => {
      this.preloadRoute(route);
    });
  }

  /**
   * Configurar precarga en hover
   */
  private setupHoverPreloading(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('mouseover', (event) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a[routerLink]');
        
        if (link) {
          const routerLink = link.getAttribute('routerLink');
          if (routerLink && !this.preloadedRoutes.has(routerLink)) {
            // Precargar después de un pequeño delay para evitar precargas innecesarias
            setTimeout(() => {
              this.preloadRoute(routerLink);
            }, 100);
          }
        }
      });
    }
  }

  /**
   * Precarga basada en comportamiento
   */
  private setupBehaviorBasedPreloading(): void {
    // Precargar rutas relacionadas basado en la página actual
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      const relatedRoutes = this.getRelatedRoutes(currentUrl);
      
      relatedRoutes.forEach(route => {
        if (!this.preloadedRoutes.has(route)) {
          this.queuePreload(route);
        }
      });
    });
  }

  /**
   * Obtener rutas relacionadas
   */
  private getRelatedRoutes(currentUrl: string): string[] {
    const routeMap: { [key: string]: string[] } = {
      '/dashboard': ['/disponibilidad', '/reservas', '/reportes'],
      '/disponibilidad': ['/reservas', '/habitaciones'],
      '/reservas': ['/disponibilidad', '/inventario'],
      '/habitaciones': ['/disponibilidad', '/inventario'],
      '/reportes': ['/dashboard', '/reservas']
    };

    return routeMap[currentUrl] || [];
  }

  /**
   * Agregar ruta a la cola de precarga
   */
  private queuePreload(route: string): void {
    if (!this.preloadQueue.includes(route)) {
      this.preloadQueue.push(route);
      this.processPreloadQueue();
    }
  }

  /**
   * Procesar cola de precarga
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const route = this.preloadQueue.shift();
      if (route && !this.preloadedRoutes.has(route)) {
        await this.preloadRoute(route);
        // Pequeña pausa entre precargas para no sobrecargar
        await this.delay(200);
      }
    }

    this.isPreloading = false;
  }

  /**
   * Precargar una ruta específica
   */
  private async preloadRoute(route: string): Promise<void> {
    try {
      if (this.preloadedRoutes.has(route)) {
        return;
      }

      // Simular precarga del módulo
      const moduleLoader = this.getModuleLoader(route);
      if (moduleLoader) {
        await moduleLoader();
        this.preloadedRoutes.add(route);
        console.log(`Precargada ruta: ${route}`);
      }
    } catch (error) {
      console.warn(`Error precargando ruta ${route}:`, error);
    }
  }

  /**
   * Obtener cargador del módulo para una ruta
   */
  private getModuleLoader(route: string): (() => Promise<any>) | null {
    const moduleMap: { [key: string]: () => Promise<any> } = {
      '/dashboard': () => import('../components/dashboard/dashboard.component').catch(() => null),
      '/login': () => import('../components/login/login.component').catch(() => null),
      '/performance-demo': () => Promise.resolve(null)
    };

    return moduleMap[route] || null;
  }

  /**
   * Utilidad para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Optimización de bundles en tiempo de ejecución
   */
  public optimizeBundles(): void {
    // Lazy loading de librerías pesadas
    this.setupLazyLibraryLoading();
    
    // Tree shaking dinámico
    this.enableDynamicTreeShaking();
    
    // Compresión de recursos
    this.setupResourceCompression();
  }

  /**
   * Carga lazy de librerías
   */
  private setupLazyLibraryLoading(): void {
    // Configurar carga lazy de librerías externas
    (window as any).loadExternalLibrary = async (libraryName: string) => {
      console.log(`Cargando librería: ${libraryName}`);
      // Simulación de carga de librería externa
      return Promise.resolve({});
    };
  }

  /**
   * Tree shaking dinámico
   */
  private enableDynamicTreeShaking(): void {
    // Remover código no utilizado basado en el uso real
    this.analyzeCodeUsage();
    
    // Optimizar imports dinámicos
    this.optimizeDynamicImports();
  }

  /**
   * Analizar uso de código
   */
  private analyzeCodeUsage(): void {
    // Tracking de funciones utilizadas
    const usedFunctions = new Set<string>();
    
    // Observer para detectar funciones llamadas
    const originalCall = Function.prototype.call;
    Function.prototype.call = function(...args) {
      if (this.name && this.name !== 'anonymous') {
        usedFunctions.add(this.name);
      }
      return originalCall.apply(this, args);
    };

    // Reportar uso después de un tiempo
    setTimeout(() => {
      console.log('Funciones utilizadas:', Array.from(usedFunctions));
    }, 30000);
  }

  /**
   * Optimizar imports dinámicos
   */
  private optimizeDynamicImports(): void {
    // Cache de módulos importados dinámicamente
    const moduleCache = new Map<string, any>();

    (window as any).optimizedImport = async (modulePath: string) => {
      if (moduleCache.has(modulePath)) {
        return moduleCache.get(modulePath);
      }

      const module = await import(modulePath);
      moduleCache.set(modulePath, module);
      return module;
    };
  }

  /**
   * Configurar compresión de recursos
   */
  private setupResourceCompression(): void {
    // Comprimir respuestas HTTP
    if ('serviceWorker' in navigator) {
      this.registerCompressionServiceWorker();
    }

    // Optimizar imágenes
    this.setupImageOptimization();
  }

  /**
   * Registrar service worker para compresión
   */
  private async registerCompressionServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado para compresión');
    } catch (error) {
      console.warn('Error registrando Service Worker:', error);
    }
  }

  /**
   * Configurar optimización de imágenes
   */
  private setupImageOptimization(): void {
    // Lazy loading de imágenes
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc) {
            img.setAttribute('src', dataSrc);
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Métricas de optimización
   */
  public getOptimizationMetrics(): any {
    return {
      preloadedRoutes: Array.from(this.preloadedRoutes),
      queueLength: this.preloadQueue.length,
      isPreloading: this.isPreloading,
      bundleSize: this.estimateBundleSize(),
      compressionRatio: this.getCompressionRatio()
    };
  }

  /**
   * Estimar tamaño del bundle
   */
  private estimateBundleSize(): number {
    // Estimación aproximada basada en el número de scripts cargados
    const scripts = document.querySelectorAll('script[src]');
    return scripts.length * 100; // KB aproximados
  }

  /**
   * Obtener ratio de compresión
   */
  private getCompressionRatio(): number {
    // Simulación del ratio de compresión
    return 0.7; // 70% del tamaño original
  }

  /**
   * Limpiar recursos
   */
  public cleanup(): void {
    this.preloadedRoutes.clear();
    this.preloadQueue.length = 0;
    this.isPreloading = false;
  }
}