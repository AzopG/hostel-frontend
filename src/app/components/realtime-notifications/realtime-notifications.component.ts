import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { RealtimeService, NotificationMessage } from '../../services/realtime.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-realtime-notifications',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notifications-container" 
         [class.has-notifications]="notifications.length > 0">
      
      <!-- Badge indicador -->
      <div class="notification-badge" 
           [class.show]="unreadCount > 0"
           (click)="togglePanel()">
        <span class="badge-icon">🔔</span>
        <span class="badge-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
      </div>

      <!-- Panel de notificaciones -->
      <div class="notifications-panel" 
           [class.open]="panelOpen"
           @slidePanel>
        
        <div class="panel-header">
          <h3>Notificaciones</h3>
          <div class="header-actions">
            <button class="action-btn" 
                    (click)="markAllRead()"
                    [disabled]="unreadCount === 0">
              Marcar todas como leídas
            </button>
            <button class="close-btn" (click)="closePanel()">✕</button>
          </div>
        </div>

        <div class="notifications-list" 
             *ngIf="notifications.length > 0; else noNotifications">
          
          <div class="notification-item"
               *ngFor="let notification of notifications; trackBy: trackByNotificationId"
               [class]="'notification-' + notification.type"
               [class.unread]="!notification.read"
               @notificationAnimation>
            
            <div class="notification-icon">
              {{ getNotificationIcon(notification.type) }}
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">
                {{ formatTime(notification.timestamp) }}
              </div>
            </div>
            
            <div class="notification-actions" *ngIf="notification.actions">
              <button class="notification-action-btn"
                      *ngFor="let action of notification.actions"
                      [class]="'btn-' + action.style"
                      (click)="executeAction(notification, action)">
                {{ action.label }}
              </button>
            </div>
            
            <button class="dismiss-btn" 
                    (click)="dismissNotification(notification.id)">
              ✕
            </button>
          </div>
        </div>

        <ng-template #noNotifications>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-message">No hay notificaciones</div>
          </div>
        </ng-template>
      </div>

      <!-- Toast notifications -->
      <div class="toast-container">
        <div class="toast-notification"
             *ngFor="let toast of toastNotifications; trackBy: trackByNotificationId"
             [class]="'toast-' + toast.type"
             @toastAnimation>
          
          <div class="toast-icon">
            {{ getNotificationIcon(toast.type) }}
          </div>
          
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          
          <button class="toast-close" 
                  (click)="dismissToast(toast.id)">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .notification-badge {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .notification-badge:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .notification-badge.show {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .badge-icon {
      font-size: 1.5rem;
      color: white;
    }

    .badge-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      border: 2px solid white;
    }

    .notifications-panel {
      position: absolute;
      top: 60px;
      right: 0;
      width: 400px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      transform: translateY(-20px) scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .notifications-panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .notifications-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      position: relative;
      transition: all 0.3s ease;
    }

    .notification-item:hover {
      background: #f8fafc;
    }

    .notification-item.unread {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
    }

    .notification-item.notification-error {
      border-left-color: #ef4444;
    }

    .notification-item.notification-warning {
      border-left-color: #f59e0b;
    }

    .notification-item.notification-success {
      border-left-color: #10b981;
    }

    .notification-icon {
      font-size: 1.5rem;
      margin-right: 12px;
      margin-top: 2px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .notification-message {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .notification-time {
      color: #9ca3af;
      font-size: 0.75rem;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .notification-action-btn {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .notification-action-btn.btn-primary {
      background: #3b82f6;
      color: white;
    }

    .notification-action-btn.btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }

    .notification-action-btn.btn-danger {
      background: #ef4444;
      color: white;
    }

    .dismiss-btn {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.3s ease;
      margin-left: 12px;
    }

    .dismiss-btn:hover {
      background: #f1f5f9;
      color: #6b7280;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    .empty-message {
      font-size: 0.9rem;
    }

    .toast-container {
      position: fixed;
      top: 20px;
      right: 480px;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toast-notification {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3b82f6;
      min-width: 300px;
      max-width: 400px;
    }

    .toast-notification.toast-error {
      border-left-color: #ef4444;
    }

    .toast-notification.toast-warning {
      border-left-color: #f59e0b;
    }

    .toast-notification.toast-success {
      border-left-color: #10b981;
    }

    .toast-icon {
      font-size: 1.2rem;
      margin-right: 12px;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }

    .toast-message {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .toast-close {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      margin-left: 12px;
    }

    .toast-close:hover {
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .notifications-panel {
        width: calc(100vw - 40px);
        right: -160px;
      }
      
      .toast-container {
        right: 20px;
        left: 20px;
      }
      
      .toast-notification {
        min-width: auto;
      }
    }
  `],
  animations: [
    trigger('slidePanel', [
      transition(':enter', [
        style({ transform: 'translateY(-20px) scale(0.95)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px) scale(0.95)', opacity: 0 }))
      ])
    ]),
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class RealtimeNotificationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private realtimeService = inject(RealtimeService);

  notifications: NotificationMessage[] = [];
  toastNotifications: NotificationMessage[] = [];
  panelOpen = false;
  unreadCount = 0;

  ngOnInit(): void {
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToNotifications(): void {
    this.realtimeService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.addNotification(notification);
        this.showToast(notification);
        this.updateUnreadCount();
        this.cdr.markForCheck();
      });
  }

  private addNotification(notification: NotificationMessage): void {
    // Agregar al inicio del array
    this.notifications.unshift(notification);
    
    // Limitar a 50 notificaciones máximo
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  private showToast(notification: NotificationMessage): void {
    // Mostrar toast solo para notificaciones importantes
    if (notification.type === 'error' || notification.type === 'warning') {
      this.toastNotifications.push(notification);
      
      // Auto-dismiss después de 5 segundos
      setTimeout(() => {
        this.dismissToast(notification.id);
      }, 5000);
    }
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  closePanel(): void {
    this.panelOpen = false;
  }

  markAllRead(): void {
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        this.realtimeService.markNotificationRead(notification.id);
      }
    });
    this.updateUnreadCount();
    this.cdr.markForCheck();
  }

  dismissNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateUnreadCount();
    this.cdr.markForCheck();
  }

  dismissToast(notificationId: string): void {
    this.toastNotifications = this.toastNotifications.filter(n => n.id !== notificationId);
    this.cdr.markForCheck();
  }

  executeAction(notification: NotificationMessage, action: any): void {
    console.log('Ejecutando acción:', action.action, 'para notificación:', notification.id);
    
    // Aquí implementarías la lógica específica para cada acción
    switch (action.action) {
      case 'view_reservation':
        // Navegar a la reserva
        break;
      case 'approve_request':
        // Aprobar solicitud
        break;
      case 'decline_request':
        // Rechazar solicitud
        break;
      default:
        console.log('Acción no implementada:', action.action);
    }
    
    // Marcar notificación como leída después de ejecutar acción
    notification.read = true;
    this.realtimeService.markNotificationRead(notification.id);
    this.updateUnreadCount();
    this.cdr.markForCheck();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      case 'success': return '✅';
      default: return '📢';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return timestamp.toLocaleDateString();
  }

  trackByNotificationId(index: number, notification: NotificationMessage): string {
    return notification.id;
  }
}