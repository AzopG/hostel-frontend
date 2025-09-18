import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { RealtimeService, ChatMessage } from '../../services/realtime.service';
import { Subject, takeUntil } from 'rxjs';

interface ChatRoom {
  id: string;
  name: string;
  type: 'support' | 'general' | 'private';
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

@Component({
  selector: 'app-realtime-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-container" [class.open]="chatOpen">
      
      <!-- Chat Toggle Button -->
      <button class="chat-toggle" 
              (click)="toggleChat()"
              [class.has-unread]="totalUnreadCount > 0">
        💬
        <span class="unread-badge" *ngIf="totalUnreadCount > 0">
          {{ totalUnreadCount }}
        </span>
      </button>

      <!-- Chat Panel -->
      <div class="chat-panel" *ngIf="chatOpen" @slideIn>
        
        <!-- Chat Header -->
        <div class="chat-header">
          <h3>Chat de Soporte</h3>
          <div class="connection-status" 
               [class]="connectionStatus.connected ? 'connected' : 'disconnected'">
            {{ connectionStatus.connected ? '🟢 Conectado' : '🔴 Desconectado' }}
          </div>
          <button class="close-chat" (click)="closeChat()">✕</button>
        </div>

        <!-- Room Selector -->
        <div class="room-selector" *ngIf="chatRooms.length > 1">
          <select [(ngModel)]="activeRoomId" 
                  (change)="switchRoom($event)"
                  class="room-select">
            <option *ngFor="let room of chatRooms" [value]="room.id">
              {{ room.name }}
              <span *ngIf="room.unreadCount > 0">({{ room.unreadCount }})</span>
            </option>
          </select>
        </div>

        <!-- Messages Area -->
        <div class="messages-area" 
             #messagesContainer
             [class.loading]="isLoading">
          
          <div class="message-item"
               *ngFor="let message of currentRoomMessages; trackBy: trackByMessageId"
               [class.own-message]="isOwnMessage(message)"
               @messageAnimation>
            
            <div class="message-avatar" *ngIf="!isOwnMessage(message)">
              {{ getAvatarInitials(message.userName) }}
            </div>
            
            <div class="message-content">
              <div class="message-header" *ngIf="!isOwnMessage(message)">
                <span class="message-user">{{ message.userName }}</span>
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
              
              <div class="message-bubble" [class]="'message-' + message.type">
                <div class="message-text" *ngIf="message.type === 'text'">
                  {{ message.message }}
                </div>
                
                <div class="message-image" *ngIf="message.type === 'image'">
                  <img [src]="message.message" [alt]="'Imagen compartida'" loading="lazy">
                </div>
                
                <div class="message-file" *ngIf="message.type === 'file'">
                  <div class="file-icon">📄</div>
                  <div class="file-info">
                    <div class="file-name">{{ getFileName(message.message) }}</div>
                    <button class="file-download" (click)="downloadFile(message.message)">
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="message-time own-time" *ngIf="isOwnMessage(message)">
                {{ formatMessageTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <div class="typing-indicator" *ngIf="isTyping" @fadeInOut>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">Alguien está escribiendo...</span>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-area">
          <div class="input-actions">
            <button class="action-btn" 
                    (click)="selectFile()"
                    title="Adjuntar archivo">
              📎
            </button>
            <button class="action-btn" 
                    (click)="selectImage()"
                    title="Enviar imagen">
              🖼️
            </button>
          </div>
          
          <div class="input-wrapper">
            <textarea [(ngModel)]="newMessage"
                      (keydown)="onKeyDown($event)"
                      (input)="onTyping()"
                      placeholder="Escribe tu mensaje..."
                      class="message-input"
                      rows="1"
                      #messageInput></textarea>
            
            <button class="send-btn" 
                    (click)="sendMessage()"
                    [disabled]="!newMessage.trim() || !connectionStatus.connected">
              <span *ngIf="!isSending">📤</span>
              <span *ngIf="isSending" class="loading-spinner">⏳</span>
            </button>
          </div>
        </div>

        <!-- File input (hidden) -->
        <input type="file" 
               #fileInput 
               (change)="onFileSelected($event)"
               accept="*/*"
               style="display: none;">
        
        <input type="file" 
               #imageInput 
               (change)="onImageSelected($event)"
               accept="image/*"
               style="display: none;">
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .chat-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      position: relative;
    }

    .chat-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .chat-toggle.has-unread {
      animation: bounce 1s infinite alternate;
    }

    @keyframes bounce {
      from { transform: scale(1); }
      to { transform: scale(1.05); }
    }

    .unread-badge {
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

    .chat-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .connection-status {
      font-size: 0.8rem;
      padding: 4px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
    }

    .connection-status.connected {
      background: rgba(16, 185, 129, 0.2);
    }

    .connection-status.disconnected {
      background: rgba(239, 68, 68, 0.2);
    }

    .close-chat {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .close-chat:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .room-selector {
      padding: 12px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .room-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .messages-area.loading {
      opacity: 0.6;
    }

    .message-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .message-item.own-message {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
      max-width: 70%;
    }

    .own-message .message-content {
      text-align: right;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .message-user {
      font-weight: 600;
      color: #374151;
      font-size: 0.8rem;
    }

    .message-time {
      color: #9ca3af;
      font-size: 0.7rem;
    }

    .message-bubble {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 18px;
      border-top-left-radius: 6px;
      word-wrap: break-word;
    }

    .own-message .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-top-left-radius: 18px;
      border-top-right-radius: 6px;
    }

    .message-text {
      line-height: 1.4;
    }

    .message-image img {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      cursor: pointer;
    }

    .message-file {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .file-icon {
      font-size: 1.5rem;
    }

    .file-info {
      flex: 1;
    }

    .file-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .file-download {
      background: none;
      border: 1px solid currentColor;
      color: inherit;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .own-time {
      margin-top: 4px;
      font-size: 0.7rem;
      color: #9ca3af;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      font-size: 0.8rem;
      font-style: italic;
    }

    .typing-dots {
      display: flex;
      gap: 2px;
    }

    .typing-dots span {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #6b7280;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .message-input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .input-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }

    .action-btn:hover {
      background: #d1d5db;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      flex: 1;
    }

    .message-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      resize: none;
      font-family: inherit;
      font-size: 0.9rem;
      line-height: 1.4;
      max-height: 80px;
      outline: none;
    }

    .message-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .chat-panel {
        width: calc(100vw - 40px);
        right: -160px;
        height: 60vh;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
                style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
                style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }))
      ])
    ]),
    trigger('messageAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class RealtimeChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('imageInput') imageInput!: ElementRef;

  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private realtimeService = inject(RealtimeService);
  
  private typingTimer: any;
  private currentUserId = 'user-123'; // Esto vendría del servicio de autenticación
  private currentUserName = 'Usuario'; // Esto vendría del servicio de autenticación

  chatOpen = false;
  connectionStatus = { connected: false };
  newMessage = '';
  isLoading = false;
  isSending = false;
  isTyping = false;
  
  activeRoomId = 'support';
  chatRooms: ChatRoom[] = [
    {
      id: 'support',
      name: 'Soporte Técnico',
      type: 'support',
      participants: [],
      unreadCount: 0
    }
  ];

  messages: ChatMessage[] = [];
  
  get currentRoomMessages(): ChatMessage[] {
    return this.messages.filter(m => 
      m.roomId === this.activeRoomId || 
      (!m.roomId && this.activeRoomId === 'support')
    );
  }

  get totalUnreadCount(): number {
    return this.chatRooms.reduce((total, room) => total + room.unreadCount, 0);
  }

  ngOnInit(): void {
    this.subscribeToConnection();
    this.subscribeToChatMessages();
    this.loadInitialMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToConnection(): void {
    this.realtimeService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.connectionStatus = status;
        this.cdr.markForCheck();
      });
  }

  private subscribeToChatMessages(): void {
    this.realtimeService.getChatMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.addMessage(message);
        this.updateRoomUnreadCount(message.roomId || 'support');
        this.scrollToBottom();
        this.cdr.markForCheck();
      });
  }

  private loadInitialMessages(): void {
    // Simular carga de mensajes iniciales
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'support-agent',
        userName: 'Agente de Soporte',
        message: '¡Hola! ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        roomId: 'support'
      }
    ];

    this.messages = initialMessages;
    this.cdr.markForCheck();
  }

  private addMessage(message: ChatMessage): void {
    this.messages.push(message);
    
    // Actualizar último mensaje de la sala
    const room = this.chatRooms.find(r => r.id === (message.roomId || 'support'));
    if (room) {
      room.lastMessage = message;
    }
  }

  private updateRoomUnreadCount(roomId: string): void {
    if (roomId !== this.activeRoomId) {
      const room = this.chatRooms.find(r => r.id === roomId);
      if (room) {
        room.unreadCount++;
      }
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    
    if (this.chatOpen) {
      this.realtimeService.joinChatRoom(this.activeRoomId);
      this.markRoomAsRead(this.activeRoomId);
      setTimeout(() => {
        this.scrollToBottom();
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 300);
    }
  }

  closeChat(): void {
    this.chatOpen = false;
    this.realtimeService.leaveChatRoom(this.activeRoomId);
  }

  switchRoom(event: any): void {
    const newRoomId = event.target.value;
    
    if (newRoomId !== this.activeRoomId) {
      this.realtimeService.leaveChatRoom(this.activeRoomId);
      this.activeRoomId = newRoomId;
      this.realtimeService.joinChatRoom(this.activeRoomId);
      this.markRoomAsRead(this.activeRoomId);
      this.scrollToBottom();
    }
  }

  private markRoomAsRead(roomId: string): void {
    const room = this.chatRooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = 0;
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.connectionStatus.connected || this.isSending) {
      return;
    }

    this.isSending = true;
    
    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      userId: this.currentUserId,
      userName: this.currentUserName,
      message: this.newMessage.trim(),
      type: 'text',
      roomId: this.activeRoomId
    };

    this.realtimeService.sendChatMessage(message);
    
    // Simular mensaje propio inmediatamente
    this.addMessage({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    });

    this.newMessage = '';
    this.isSending = false;
    this.scrollToBottom();
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping(): void {
    // Reportar que el usuario está escribiendo
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = setTimeout(() => {
      // Detener indicador de escritura después de 3 segundos
    }, 3000);
  }

  selectFile(): void {
    this.fileInput.nativeElement.click();
  }

  selectImage(): void {
    this.imageInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Aquí implementarías la carga del archivo
      console.log('Archivo seleccionado:', file.name);
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Aquí implementarías la carga de la imagen
      console.log('Imagen seleccionada:', file.name);
    }
  }

  downloadFile(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  getFileName(filePath: string): string {
    return filePath.split('/').pop() || 'archivo';
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.userId === this.currentUserId;
  }

  getAvatarInitials(userName: string): string {
    return userName.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}