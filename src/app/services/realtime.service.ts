import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, map, retry, takeUntil, timer } from 'rxjs';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  id?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  userId?: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

export interface DisponibilidadUpdate {
  hotelId: string;
  habitacionId: string;
  fechas: string[];
  disponible: boolean;
  precio?: number;
  motivo?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  roomId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService implements OnDestroy {
  private socket: WebSocket | null = null;
  private destroy$ = new Subject<void>();
  private reconnectTimer: any;
  
  // Connection status
  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    reconnectAttempts: 0
  });

  // Message streams
  private messages$ = new Subject<WebSocketMessage>();
  private notifications$ = new Subject<NotificationMessage>();
  private disponibilidadUpdates$ = new Subject<DisponibilidadUpdate>();
  private chatMessages$ = new Subject<ChatMessage>();
  private userActivityUpdates$ = new Subject<any>();

  // Configuration
  private readonly wsUrl = 'ws://localhost:3001'; // URL del WebSocket server
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 3000;

  constructor() {
    this.connect();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  /**
   * Conectar al WebSocket
   */
  private connect(): void {
    try {
      this.socket = new WebSocket(this.wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
      this.handleReconnect();
    }
  }

  /**
   * Configurar listeners del WebSocket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = (event) => {
      console.log('WebSocket conectado');
      this.updateConnectionStatus({
        connected: true,
        reconnecting: false,
        lastConnected: new Date(),
        reconnectAttempts: 0
      });
      
      // Registrar usuario después de la conexión
      this.registerUser();
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        message.timestamp = new Date(message.timestamp);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket desconectado:', event);
      this.updateConnectionStatus({
        connected: false,
        reconnecting: false,
        lastDisconnected: new Date()
      });
      
      if (!event.wasClean) {
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
      this.updateConnectionStatus({ connected: false, reconnecting: false });
    };
  }

  /**
   * Manejar mensajes recibidos
   */
  private handleMessage(message: WebSocketMessage): void {
    this.messages$.next(message);

    switch (message.type) {
      case 'notification':
        this.notifications$.next(message.data as NotificationMessage);
        break;
      
      case 'disponibilidad_update':
        this.disponibilidadUpdates$.next(message.data as DisponibilidadUpdate);
        break;
      
      case 'chat_message':
        this.chatMessages$.next(message.data as ChatMessage);
        break;
      
      case 'user_activity':
        this.userActivityUpdates$.next(message.data);
        break;
      
      default:
        console.log('Tipo de mensaje no manejado:', message.type);
    }
  }

  /**
   * Actualizar estado de conexión
   */
  private updateConnectionStatus(updates: Partial<ConnectionStatus>): void {
    const current = this.connectionStatus$.value;
    this.connectionStatus$.next({ ...current, ...updates });
  }

  /**
   * Manejar reconexión
   */
  private handleReconnect(): void {
    const status = this.connectionStatus$.value;
    
    if (status.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo número de intentos de reconexión alcanzado');
      return;
    }

    this.updateConnectionStatus({
      reconnecting: true,
      reconnectAttempts: status.reconnectAttempts + 1
    });

    this.reconnectTimer = setTimeout(() => {
      console.log(`Intento de reconexión ${status.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      this.connect();
    }, this.reconnectDelay * Math.pow(2, status.reconnectAttempts)); // Exponential backoff
  }

  /**
   * Registrar usuario en el servidor
   */
  private registerUser(): void {
    const userToken = localStorage.getItem('authToken');
    if (userToken) {
      this.sendMessage({
        type: 'register_user',
        data: { token: userToken }
      });
    }
  }

  /**
   * Enviar mensaje al servidor
   */
  private sendMessage(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date()
      };
      this.socket.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }

  /**
   * Desconectar WebSocket
   */
  private disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Desconexión intencional');
      this.socket = null;
    }
  }

  // Public API

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Obtener stream de notificaciones
   */
  getNotifications(): Observable<NotificationMessage> {
    return this.notifications$.asObservable();
  }

  /**
   * Obtener actualizaciones de disponibilidad
   */
  getDisponibilidadUpdates(): Observable<DisponibilidadUpdate> {
    return this.disponibilidadUpdates$.asObservable();
  }

  /**
   * Obtener mensajes de chat
   */
  getChatMessages(): Observable<ChatMessage> {
    return this.chatMessages$.asObservable();
  }

  /**
   * Obtener actualizaciones de actividad de usuarios
   */
  getUserActivityUpdates(): Observable<any> {
    return this.userActivityUpdates$.asObservable();
  }

  /**
   * Enviar notificación
   */
  sendNotification(notification: Omit<NotificationMessage, 'id' | 'timestamp'>): void {
    this.sendMessage({
      type: 'send_notification',
      data: notification
    });
  }

  /**
   * Actualizar disponibilidad
   */
  updateDisponibilidad(update: DisponibilidadUpdate): void {
    this.sendMessage({
      type: 'update_disponibilidad',
      data: update
    });
  }

  /**
   * Enviar mensaje de chat
   */
  sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    this.sendMessage({
      type: 'chat_message',
      data: message
    });
  }

  /**
   * Marcar notificación como leída
   */
  markNotificationRead(notificationId: string): void {
    this.sendMessage({
      type: 'mark_notification_read',
      data: { notificationId }
    });
  }

  /**
   * Unirse a una sala de chat
   */
  joinChatRoom(roomId: string): void {
    this.sendMessage({
      type: 'join_room',
      data: { roomId }
    });
  }

  /**
   * Salir de una sala de chat
   */
  leaveChatRoom(roomId: string): void {
    this.sendMessage({
      type: 'leave_room',
      data: { roomId }
    });
  }

  /**
   * Reportar actividad del usuario
   */
  reportUserActivity(activity: string, data?: any): void {
    this.sendMessage({
      type: 'user_activity',
      data: { activity, data }
    });
  }

  /**
   * Solicitar sincronización de datos
   */
  requestDataSync(dataType: string): void {
    this.sendMessage({
      type: 'request_sync',
      data: { dataType }
    });
  }

  /**
   * Forzar reconexión
   */
  forceReconnect(): void {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.connectionStatus$.value.connected;
  }

  /**
   * Obtener métricas de conexión
   */
  getConnectionMetrics(): any {
    const status = this.connectionStatus$.value;
    return {
      connected: status.connected,
      reconnecting: status.reconnecting,
      reconnectAttempts: status.reconnectAttempts,
      lastConnected: status.lastConnected,
      lastDisconnected: status.lastDisconnected,
      uptime: status.lastConnected ? Date.now() - status.lastConnected.getTime() : 0
    };
  }
}