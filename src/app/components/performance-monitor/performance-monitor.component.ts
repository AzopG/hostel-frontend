import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceService } from '../../services/performance.service';
import { BundleOptimizationService } from '../../services/bundle-optimization.service';
import { interval, Subscription } from 'rxjs';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface NetworkMetric {
  name: string;
  requests: number;
  totalSize: number;
  averageTime: number;
  cacheHitRate: number;
}

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="performance-monitor">
      <div class="monitor-header">
        <h2>🚀 Monitor de Rendimiento</h2>
        <div class="last-update">
          Última actualización: {{ lastUpdate | date:'HH:mm:ss' }}
        </div>
      </div>

      <!-- Métricas Principales -->
      <div class="metrics-grid">
        <div class="metric-card" 
             *ngFor="let metric of performanceMetrics"
             [class]="'status-' + metric.status">
          <div class="metric-header">
            <h4>{{ metric.name }}</h4>
            <span class="metric-status" [class]="'status-' + metric.status">
              {{ getStatusIcon(metric.status) }}
            </span>
          </div>
          <div class="metric-value">
            {{ metric.value | number:'1.1-2' }}
            <span class="metric-unit">{{ metric.unit }}</span>
          </div>
          <div class="metric-description">{{ metric.description }}</div>
        </div>
      </div>

      <!-- Core Web Vitals -->
      <div class="vitals-section">
        <h3>Core Web Vitals</h3>
        <div class="vitals-grid">
          <div class="vital-card">
            <div class="vital-name">LCP</div>
            <div class="vital-value" [class]="getLCPStatus()">
              {{ coreWebVitals.lcp | number:'1.1-1' }}s
            </div>
            <div class="vital-description">Largest Contentful Paint</div>
          </div>
          <div class="vital-card">
            <div class="vital-name">FID</div>
            <div class="vital-value" [class]="getFIDStatus()">
              {{ coreWebVitals.fid | number:'1.0-0' }}ms
            </div>
            <div class="vital-description">First Input Delay</div>
          </div>
          <div class="vital-card">
            <div class="vital-name">CLS</div>
            <div class="vital-value" [class]="getCLSStatus()">
              {{ coreWebVitals.cls | number:'1.3-3' }}
            </div>
            <div class="vital-description">Cumulative Layout Shift</div>
          </div>
        </div>
      </div>

      <!-- Métricas de Red -->
      <div class="network-section">
        <h3>Rendimiento de Red</h3>
        <div class="network-grid">
          <div class="network-card" *ngFor="let network of networkMetrics">
            <h4>{{ network.name }}</h4>
            <div class="network-stats">
              <div class="stat">
                <span class="stat-label">Requests:</span>
                <span class="stat-value">{{ network.requests }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Size:</span>
                <span class="stat-value">{{ formatBytes(network.totalSize) }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Avg Time:</span>
                <span class="stat-value">{{ network.averageTime }}ms</span>
              </div>
              <div class="stat">
                <span class="stat-label">Cache Hit:</span>
                <span class="stat-value">{{ network.cacheHitRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Optimizaciones Activas -->
      <div class="optimizations-section">
        <h3>Optimizaciones Activas</h3>
        <div class="optimization-list">
          <div class="optimization-item" 
               *ngFor="let opt of activeOptimizations"
               [class.active]="opt.active">
            <div class="opt-icon">{{ opt.icon }}</div>
            <div class="opt-details">
              <div class="opt-name">{{ opt.name }}</div>
              <div class="opt-description">{{ opt.description }}</div>
            </div>
            <div class="opt-status">
              <span [class]="opt.active ? 'status-active' : 'status-inactive'">
                {{ opt.active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bundle Information -->
      <div class="bundle-section">
        <h3>Información del Bundle</h3>
        <div class="bundle-info">
          <div class="bundle-stat">
            <span class="stat-label">Rutas Precargadas:</span>
            <span class="stat-value">{{ bundleMetrics.preloadedRoutes.length }}</span>
          </div>
          <div class="bundle-stat">
            <span class="stat-label">Cola de Precarga:</span>
            <span class="stat-value">{{ bundleMetrics.queueLength }}</span>
          </div>
          <div class="bundle-stat">
            <span class="stat-label">Tamaño Estimado:</span>
            <span class="stat-value">{{ bundleMetrics.bundleSize }}KB</span>
          </div>
          <div class="bundle-stat">
            <span class="stat-label">Compresión:</span>
            <span class="stat-value">{{ (bundleMetrics.compressionRatio * 100) | number:'1.0-0' }}%</span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="actions-section">
        <button class="action-btn primary" (click)="refreshMetrics()">
          🔄 Actualizar Métricas
        </button>
        <button class="action-btn secondary" (click)="clearCache()">
          🗑️ Limpiar Cache
        </button>
        <button class="action-btn secondary" (click)="optimizeNow()">
          ⚡ Optimizar Ahora
        </button>
      </div>
    </div>
  `,
  styles: [`
    .performance-monitor {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
    }

    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    }

    .monitor-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .last-update {
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .metric-card.status-good {
      border-left: 4px solid #4ade80;
    }

    .metric-card.status-warning {
      border-left: 4px solid #fbbf24;
    }

    .metric-card.status-critical {
      border-left: 4px solid #f87171;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .metric-header h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .metric-status {
      font-size: 1.2rem;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 8px;
    }

    .metric-unit {
      font-size: 1rem;
      font-weight: 400;
      opacity: 0.8;
    }

    .metric-description {
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.4;
    }

    .vitals-section, .network-section, .optimizations-section, .bundle-section {
      margin-bottom: 32px;
    }

    .vitals-section h3, .network-section h3, .optimizations-section h3, .bundle-section h3 {
      font-size: 1.8rem;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .vital-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .vital-name {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .vital-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .vital-value.good { color: #4ade80; }
    .vital-value.warning { color: #fbbf24; }
    .vital-value.critical { color: #f87171; }

    .vital-description {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .network-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .network-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }

    .network-card h4 {
      margin: 0 0 16px 0;
      font-size: 1.2rem;
    }

    .network-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
    }

    .stat-label {
      opacity: 0.8;
    }

    .stat-value {
      font-weight: 600;
    }

    .optimization-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .optimization-item {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .optimization-item:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .optimization-item.active {
      border-left: 4px solid #4ade80;
    }

    .opt-icon {
      font-size: 1.5rem;
      margin-right: 16px;
    }

    .opt-details {
      flex: 1;
    }

    .opt-name {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .opt-description {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .opt-status .status-active {
      color: #4ade80;
      font-weight: 600;
    }

    .opt-status .status-inactive {
      color: #6b7280;
      font-weight: 600;
    }

    .bundle-section {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    .bundle-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .bundle-stat {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .actions-section {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 32px;
    }

    .action-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .action-btn.primary {
      background: #4ade80;
      color: #1f2937;
    }

    .action-btn.secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      
      .network-grid {
        grid-template-columns: 1fr;
      }
      
      .bundle-info {
        grid-template-columns: 1fr;
      }
      
      .actions-section {
        flex-direction: column;
      }
    }
  `]
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private performanceService = inject(PerformanceService);
  private bundleOptimizationService = inject(BundleOptimizationService);
  
  private metricsSubscription?: Subscription;
  
  lastUpdate = new Date();
  
  performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Tiempo de Carga',
      value: 0,
      unit: 'ms',
      status: 'good',
      description: 'Tiempo total de carga de la página'
    },
    {
      name: 'Memoria Utilizada',
      value: 0,
      unit: 'MB',
      status: 'good',
      description: 'Uso actual de memoria del navegador'
    },
    {
      name: 'FPS Promedio',
      value: 60,
      unit: 'fps',
      status: 'good',
      description: 'Frames por segundo en animaciones'
    },
    {
      name: 'Elementos DOM',
      value: 0,
      unit: 'nodes',
      status: 'good',
      description: 'Número total de elementos en el DOM'
    }
  ];

  coreWebVitals = {
    lcp: 2.1,
    fid: 85,
    cls: 0.08
  };

  networkMetrics: NetworkMetric[] = [
    {
      name: 'API Calls',
      requests: 45,
      totalSize: 125000,
      averageTime: 280,
      cacheHitRate: 78
    },
    {
      name: 'Assets',
      requests: 23,
      totalSize: 890000,
      averageTime: 145,
      cacheHitRate: 92
    }
  ];

  activeOptimizations = [
    {
      name: 'Lazy Loading',
      description: 'Carga diferida de imágenes y componentes',
      icon: '🔄',
      active: true
    },
    {
      name: 'Virtual Scrolling',
      description: 'Renderizado optimizado de listas grandes',
      icon: '📜',
      active: true
    },
    {
      name: 'OnPush Detection',
      description: 'Estrategia optimizada de detección de cambios',
      icon: '🎯',
      active: true
    },
    {
      name: 'HTTP Caching',
      description: 'Cache inteligente de peticiones HTTP',
      icon: '💾',
      active: true
    },
    {
      name: 'Route Preloading',
      description: 'Precarga inteligente de rutas',
      icon: '🚀',
      active: true
    },
    {
      name: 'Bundle Optimization',
      description: 'Optimización dinámica del bundle',
      icon: '📦',
      active: false
    }
  ];

  bundleMetrics = {
    preloadedRoutes: [],
    queueLength: 0,
    bundleSize: 0,
    compressionRatio: 0.7
  };

  ngOnInit(): void {
    this.initializeMetrics();
    this.startMetricsUpdates();
  }

  ngOnDestroy(): void {
    if (this.metricsSubscription) {
      this.metricsSubscription.unsubscribe();
    }
  }

  private initializeMetrics(): void {
    this.updatePerformanceMetrics();
    this.updateCoreWebVitals();
    this.updateBundleMetrics();
  }

  private startMetricsUpdates(): void {
    this.metricsSubscription = interval(5000).subscribe(() => {
      this.updatePerformanceMetrics();
      this.updateNetworkMetrics();
      this.lastUpdate = new Date();
      this.cdr.markForCheck();
    });
  }

  private updatePerformanceMetrics(): void {
    // Tiempo de carga
    if (performance && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.performanceMetrics[0].value = loadTime;
      this.performanceMetrics[0].status = loadTime > 3000 ? 'critical' : loadTime > 1500 ? 'warning' : 'good';
    }

    // Memoria utilizada
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMB = memory.usedJSHeapSize / (1024 * 1024);
      this.performanceMetrics[1].value = memoryMB;
      this.performanceMetrics[1].status = memoryMB > 100 ? 'critical' : memoryMB > 50 ? 'warning' : 'good';
    }

    // Elementos DOM
    const domElements = document.querySelectorAll('*').length;
    this.performanceMetrics[3].value = domElements;
    this.performanceMetrics[3].status = domElements > 2000 ? 'critical' : domElements > 1000 ? 'warning' : 'good';
  }

  private updateCoreWebVitals(): void {
    // Simular métricas de Core Web Vitals
    // En una implementación real, usarías web-vitals library
    this.coreWebVitals = {
      lcp: 1.5 + Math.random() * 2,
      fid: 50 + Math.random() * 100,
      cls: Math.random() * 0.2
    };
  }

  private updateNetworkMetrics(): void {
    // Simular actualizaciones de métricas de red
    this.networkMetrics.forEach(metric => {
      metric.requests += Math.floor(Math.random() * 5);
      metric.totalSize += Math.floor(Math.random() * 10000);
      metric.averageTime = 200 + Math.floor(Math.random() * 200);
      metric.cacheHitRate = 70 + Math.floor(Math.random() * 25);
    });
  }

  private updateBundleMetrics(): void {
    this.bundleMetrics = this.bundleOptimizationService.getOptimizationMetrics();
  }

  getLCPStatus(): string {
    return this.coreWebVitals.lcp <= 2.5 ? 'good' : this.coreWebVitals.lcp <= 4 ? 'warning' : 'critical';
  }

  getFIDStatus(): string {
    return this.coreWebVitals.fid <= 100 ? 'good' : this.coreWebVitals.fid <= 300 ? 'warning' : 'critical';
  }

  getCLSStatus(): string {
    return this.coreWebVitals.cls <= 0.1 ? 'good' : this.coreWebVitals.cls <= 0.25 ? 'warning' : 'critical';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  refreshMetrics(): void {
    this.updatePerformanceMetrics();
    this.updateCoreWebVitals();
    this.updateNetworkMetrics();
    this.updateBundleMetrics();
    this.lastUpdate = new Date();
    this.cdr.markForCheck();
  }

  clearCache(): void {
    // Limpiar caches del navegador
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Limpiar localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    alert('Cache limpiado exitosamente');
  }

  optimizeNow(): void {
    this.bundleOptimizationService.optimizeBundles();
    this.activeOptimizations.forEach(opt => opt.active = true);
    alert('Optimizaciones aplicadas');
    this.cdr.markForCheck();
  }
}