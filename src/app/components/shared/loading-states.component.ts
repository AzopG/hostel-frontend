import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaces para typing
interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
}

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-loading-states',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Skeleton Loading para cards -->
    <div class="skeleton-container" *ngIf="showSkeletons">
      <div class="skeleton-card" *ngFor="let item of [1,2,3,4]; trackBy: trackByIndex">
        <div class="skeleton-header">
          <div class="skeleton-avatar shimmer"></div>
          <div class="skeleton-text-container">
            <div class="skeleton-text shimmer"></div>
            <div class="skeleton-text short shimmer"></div>
          </div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-text shimmer"></div>
          <div class="skeleton-text shimmer"></div>
          <div class="skeleton-text short shimmer"></div>
        </div>
        <div class="skeleton-actions">
          <div class="skeleton-button shimmer"></div>
          <div class="skeleton-button shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Spinner con texto dinámico -->
    <div class="loading-spinner-container" *ngIf="loadingState.isLoading">
      <div class="loading-backdrop">
        <div class="loading-content">
          <!-- Spinner customizado -->
          <div class="custom-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          
          <!-- Progress bar -->
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                [style.width.%]="loadingState.progress"
              ></div>
            </div>
            <span class="progress-text">{{ loadingState.progress }}%</span>
          </div>
          
          <!-- Mensaje dinámico -->
          <p class="loading-message typing-animation">{{ loadingState.message }}</p>
          
          <!-- Dots animation -->
          <div class="loading-dots">
            <span class="dot" [style.animation-delay]="'0s'"></span>
            <span class="dot" [style.animation-delay]="'0.2s'"></span>
            <span class="dot" [style.animation-delay]="'0.4s'"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Micro-interactions buttons -->
    <div class="micro-interactions-demo">
      <h3>Botones con Micro-interacciones</h3>
      
      <button 
        class="btn-primary ripple-effect"
        (mousedown)="createRipple($event)"
        (click)="handleButtonClick('primary')"
      >
        <i class="fas fa-rocket"></i>
        Botón Primario
        <span class="button-highlight"></span>
      </button>

      <button 
        class="btn-secondary magnetic-effect"
        (mousemove)="magneticEffect($event)"
        (mouseleave)="resetMagnetic($event)"
        (click)="handleButtonClick('secondary')"
      >
        <i class="fas fa-magic"></i>
        Efecto Magnético
      </button>

      <button 
        class="btn-success morphing-btn"
        [class.loading]="buttonLoading"
        (click)="toggleButtonLoading()"
      >
        <span class="btn-text" [class.hidden]="buttonLoading">
          <i class="fas fa-check"></i>
          Enviar
        </span>
        <span class="btn-loader" [class.visible]="buttonLoading">
          <div class="mini-spinner"></div>
        </span>
      </button>
    </div>

    <!-- Notification Toasts -->
    <div class="toast-container">
      <div 
        *ngFor="let toast of notifications; trackBy: trackByToastId" 
        class="toast-item"
        [class]="'toast-' + toast.type"
        [style.animation]="'slideInToast 0.3s cubic-bezier(0.4, 0, 0.2, 1)'"
      >
        <div class="toast-icon">
          <i [class]="getToastIcon(toast.type)"></i>
        </div>
        <div class="toast-content">
          <h4 class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button 
          class="toast-close"
          (click)="closeToast(toast.id)"
          [attr.aria-label]="'Cerrar notificación: ' + toast.title"
        >
          <i class="fas fa-times"></i>
        </button>
        <div class="toast-progress" [style.animation-duration]="(toast.duration || 5000) + 'ms'"></div>
      </div>
    </div>

    <!-- Cards con hover effects -->
    <div class="cards-demo">
      <h3>Cards con Efectos de Hover</h3>
      <div class="cards-grid">
        <div 
          *ngFor="let card of demoCards; trackBy: trackByCardId" 
          class="demo-card"
          [class.flipped]="card.isFlipped"
          (click)="flipCard(card.id)"
        >
          <div class="card-inner">
            <div class="card-front">
              <div class="card-header">
                <i [class]="card.icon"></i>
                <h4>{{ card.title }}</h4>
              </div>
              <p class="card-description">{{ card.description }}</p>
              <div class="card-stats">
                <span class="stat-item">
                  <i class="fas fa-eye"></i>
                  {{ card.views }}
                </span>
                <span class="stat-item">
                  <i class="fas fa-heart"></i>
                  {{ card.likes }}
                </span>
              </div>
            </div>
            <div class="card-back">
              <h4>Información Adicional</h4>
              <p>{{ card.additionalInfo }}</p>
              <button class="btn-outline">Ver Detalles</button>
            </div>
          </div>
          <div class="card-glow"></div>
        </div>
      </div>
    </div>

    <!-- Demo controls -->
    <div class="demo-controls">
      <button 
        class="control-btn"
        (click)="toggleSkeletons()"
      >
        {{ showSkeletons ? 'Ocultar' : 'Mostrar' }} Skeletons
      </button>
      
      <button 
        class="control-btn"
        (click)="startLoading()"
        [disabled]="loadingState.isLoading"
      >
        Simular Carga
      </button>
      
      <button 
        class="control-btn"
        (click)="showRandomToast()"
      >
        Mostrar Notificación
      </button>
    </div>
  `,
  styles: [`
    /* Skeleton Loading Styles */
    .skeleton-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .skeleton-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e2e8f0;
    }

    .skeleton-text-container {
      flex: 1;
    }

    .skeleton-text {
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .skeleton-text.short {
      width: 60%;
    }

    .skeleton-content {
      margin-bottom: 1.5rem;
    }

    .skeleton-content .skeleton-text {
      height: 10px;
      margin-bottom: 0.75rem;
    }

    .skeleton-actions {
      display: flex;
      gap: 1rem;
    }

    .skeleton-button {
      height: 36px;
      width: 100px;
      background: #e2e8f0;
      border-radius: 6px;
    }

    .shimmer {
      background: linear-gradient(
        90deg,
        #e2e8f0 0%,
        #f1f5f9 50%,
        #e2e8f0 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Loading Spinner Styles */
    .loading-spinner-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
    }

    .loading-backdrop {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-content {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .custom-spinner {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
      margin-bottom: 2rem;
    }

    .spinner-ring {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 64px;
      height: 64px;
      margin: 8px;
      border: 4px solid #667eea;
      border-radius: 50%;
      animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #667eea transparent transparent transparent;
    }

    .spinner-ring:nth-child(1) { animation-delay: -0.45s; }
    .spinner-ring:nth-child(2) { animation-delay: -0.3s; }
    .spinner-ring:nth-child(3) { animation-delay: -0.15s; }

    @keyframes spinner-ring {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .progress-container {
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.3s ease;
      position: relative;
    }

    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: progressShimmer 2s infinite;
    }

    @keyframes progressShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .progress-text {
      font-size: 0.875rem;
      color: #4a5568;
      font-weight: 600;
    }

    .loading-message {
      font-size: 1rem;
      color: #2d3748;
      margin-bottom: 1rem;
      min-height: 1.5rem;
    }

    .typing-animation {
      overflow: hidden;
      white-space: nowrap;
      border-right: 2px solid #667eea;
      animation: typing 2s steps(40, end), blink-caret 0.75s step-end infinite;
    }

    @keyframes typing {
      from { width: 0; }
      to { width: 100%; }
    }

    @keyframes blink-caret {
      from, to { border-color: transparent; }
      50% { border-color: #667eea; }
    }

    .loading-dots {
      display: inline-flex;
      gap: 0.25rem;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: dotBounce 1.4s infinite ease-in-out both;
    }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Micro-interactions Buttons */
    .micro-interactions-demo {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      margin: 2rem 0;
    }

    .micro-interactions-demo h3 {
      margin-bottom: 1.5rem;
      color: #2d3748;
    }

    .btn-primary, .btn-secondary, .btn-success {
      position: relative;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 1rem;
      margin-bottom: 1rem;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-success {
      background: #48bb78;
      color: white;
      min-width: 120px;
      justify-content: center;
    }

    /* Ripple Effect */
    .ripple-effect {
      position: relative;
      overflow: hidden;
    }

    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    }

    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    /* Magnetic Effect */
    .magnetic-effect {
      transition: transform 0.2s ease;
    }

    /* Morphing Button */
    .morphing-btn {
      position: relative;
      transition: all 0.3s ease;
    }

    .morphing-btn.loading {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      padding: 0;
    }

    .btn-text, .btn-loader {
      transition: all 0.3s ease;
    }

    .btn-text.hidden {
      opacity: 0;
      transform: scale(0);
    }

    .btn-loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }

    .btn-loader.visible {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }

    .mini-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Toast Notifications */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
    }

    .toast-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      position: relative;
      overflow: hidden;
      border-left: 4px solid #667eea;
    }

    .toast-success { border-left-color: #48bb78; }
    .toast-error { border-left-color: #e53e3e; }
    .toast-warning { border-left-color: #ed8936; }
    .toast-info { border-left-color: #3182ce; }

    .toast-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-success .toast-icon { background: #c6f6d5; color: #22543d; }
    .toast-error .toast-icon { background: #fed7d7; color: #742a2a; }
    .toast-warning .toast-icon { background: #feebc8; color: #7b341e; }
    .toast-info .toast-icon { background: #bee3f8; color: #2a4365; }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
    }

    .toast-message {
      margin: 0;
      font-size: 0.8125rem;
      color: #4a5568;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: #a0aec0;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .toast-close:hover {
      background: #edf2f7;
      color: #4a5568;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      animation: toastProgress linear;
    }

    @keyframes toastProgress {
      from { width: 100%; }
      to { width: 0%; }
    }

    @keyframes slideInToast {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Demo Cards */
    .cards-demo {
      padding: 2rem 0;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .demo-card {
      height: 300px;
      perspective: 1000px;
      cursor: pointer;
      position: relative;
    }

    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }

    .demo-card.flipped .card-inner {
      transform: rotateY(180deg);
    }

    .card-front, .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      background: white;
    }

    .card-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1rem;
    }

    .card-header i {
      font-size: 2rem;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .card-header h4 {
      margin: 0;
      color: #2d3748;
    }

    .card-description {
      flex: 1;
      color: #4a5568;
      line-height: 1.5;
    }

    .card-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #667eea;
    }

    .card-glow {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
      border-radius: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .demo-card:hover .card-glow {
      opacity: 0.3;
    }

    /* Demo Controls */
    .demo-controls {
      display: flex;
      gap: 1rem;
      padding: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .control-btn {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .control-btn:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .skeleton-container {
        grid-template-columns: 1fr;
        padding: 1rem;
      }

      .loading-content {
        padding: 2rem 1.5rem;
      }

      .micro-interactions-demo {
        padding: 1.5rem;
      }

      .btn-primary, .btn-secondary, .btn-success {
        width: 100%;
        margin-right: 0;
        justify-content: center;
      }

      .toast-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }

      .demo-controls {
        padding: 1rem;
      }

      .control-btn {
        flex: 1;
        min-width: 120px;
      }
    }
  `]
})
export class LoadingStatesComponent implements OnInit, OnDestroy {
  showSkeletons = false;
  buttonLoading = false;
  notifications: NotificationToast[] = [];
  
  loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    message: 'Inicializando...'
  };

  demoCards = [
    {
      id: '1',
      title: 'Disponibilidad',
      description: 'Consulta la disponibilidad en tiempo real de todas nuestras habitaciones.',
      icon: 'fas fa-calendar-check',
      views: 1250,
      likes: 89,
      additionalInfo: 'Sistema integrado con todas las sedes para mostrar información actualizada al minuto.',
      isFlipped: false
    },
    {
      id: '2',
      title: 'Reservas',
      description: 'Gestiona todas tus reservas de manera fácil e intuitiva.',
      icon: 'fas fa-bookmark',
      views: 980,
      likes: 67,
      additionalInfo: 'Interfaz optimizada para reservas rápidas con confirmación instantánea.',
      isFlipped: false
    },
    {
      id: '3',
      title: 'Eventos',
      description: 'Organiza eventos corporativos con nuestros paquetes especializados.',
      icon: 'fas fa-calendar-alt',
      views: 756,
      likes: 45,
      additionalInfo: 'Coordinación completa de eventos con servicios premium incluidos.',
      isFlipped: false
    }
  ];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Simular notificación inicial
    setTimeout(() => {
      this.showToast('success', 'Bienvenido', 'Sistema cargado correctamente');
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSkeletons(): void {
    this.showSkeletons = !this.showSkeletons;
  }

  startLoading(): void {
    this.loadingState = {
      isLoading: true,
      progress: 0,
      message: 'Conectando con el servidor...'
    };

    const messages = [
      'Conectando con el servidor...',
      'Verificando credenciales...',
      'Cargando datos de habitaciones...',
      'Sincronizando disponibilidad...',
      'Preparando interfaz...',
      'Finalizando carga...'
    ];

    const progressSubscription = interval(500).pipe(
      map(step => {
        const progress = Math.min((step + 1) * 16.67, 100);
        const messageIndex = Math.min(Math.floor(step), messages.length - 1);
        return { progress, message: messages[messageIndex] };
      })
    ).subscribe(({ progress, message }) => {
      this.loadingState.progress = progress;
      this.loadingState.message = message;

      if (progress >= 100) {
        setTimeout(() => {
          this.loadingState.isLoading = false;
          this.showToast('success', 'Completado', 'Datos cargados exitosamente');
        }, 500);
        progressSubscription.unsubscribe();
      }
    });

    this.subscriptions.push(progressSubscription);
  }

  createRipple(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  magneticEffect(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    
    button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
  }

  resetMagnetic(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    button.style.transform = 'translate(0px, 0px) scale(1)';
  }

  handleButtonClick(type: string): void {
    this.showToast('info', 'Botón Presionado', `Botón ${type} fue presionado`);
  }

  toggleButtonLoading(): void {
    this.buttonLoading = true;
    
    setTimeout(() => {
      this.buttonLoading = false;
      this.showToast('success', 'Proceso Completado', 'La acción se ejecutó correctamente');
    }, 2000);
  }

  showRandomToast(): void {
    const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];
    const type = types[Math.floor(Math.random() * types.length)];
    const messages = {
      success: { title: 'Éxito', message: 'Operación completada correctamente' },
      error: { title: 'Error', message: 'Ha ocurrido un problema inesperado' },
      warning: { title: 'Advertencia', message: 'Revisa los datos ingresados' },
      info: { title: 'Información', message: 'Nueva actualización disponible' }
    };

    this.showToast(type, messages[type].title, messages[type].message);
  }

  showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration = 5000): void {
    const id = Date.now().toString();
    const toast: NotificationToast = { id, type, title, message, duration };
    
    this.notifications.push(toast);
    
    setTimeout(() => {
      this.closeToast(id);
    }, duration);
  }

  closeToast(id: string): void {
    this.notifications = this.notifications.filter(toast => toast.id !== id);
  }

  getToastIcon(type: string): string {
    const icons = {
      success: 'fas fa-check',
      error: 'fas fa-times',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type as keyof typeof icons] || icons.info;
  }

  flipCard(id: string): void {
    const card = this.demoCards.find(c => c.id === id);
    if (card) {
      card.isFlipped = !card.isFlipped;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByToastId(index: number, toast: NotificationToast): string {
    return toast.id;
  }

  trackByCardId(index: number, card: any): string {
    return card.id;
  }
}