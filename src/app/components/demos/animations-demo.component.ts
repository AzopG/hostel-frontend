import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importar animaciones
import { 
  fadeInOut,
  slideInOut,
  scaleInOut,
  cardHover,
  buttonHover,
  listAnimation,
  staggerAnimation,
  bounceIn,
  fadeInScale,
  accordionAnimation
} from '../../shared/animations';

// Importar componentes
import { LoadingStatesComponent } from '../shared/loading-states.component';

interface DemoSection {
  id: string;
  title: string;
  description: string;
  isExpanded: boolean;
  items: string[];
}

@Component({
  selector: 'app-animations-demo',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingStatesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInOut,
    slideInOut,
    scaleInOut,
    cardHover,
    buttonHover,
    listAnimation,
    staggerAnimation,
    bounceIn,
    fadeInScale,
    accordionAnimation
  ],
  template: `
    <div class="animations-demo-container" [@fadeInOut]>
      <!-- Header con animación -->
      <header class="demo-header" [@slideInOut]>
        <div class="header-content">
          <h1 [@bounceIn]>🎨 Sistema de Animaciones UX</h1>
          <p [@fadeInScale]>
            Demostración completa del sistema de animaciones para mejorar la experiencia de usuario
          </p>
        </div>
      </header>

      <!-- Navigation Breadcrumbs -->
      <nav class="breadcrumb-nav" [@slideInOut]>
        <ol class="breadcrumb">
          <li><a routerLink="/dashboard">Inicio</a></li>
          <li><a routerLink="/demos">Demos</a></li>
          <li class="active">Animaciones UX</li>
        </ol>
      </nav>

      <!-- Main Content Grid -->
      <div class="demo-content">
        
        <!-- Sidebar with animated sections -->
        <aside class="demo-sidebar" [@slideInOut]>
          <h3>Secciones</h3>
          <div class="sidebar-sections" [@staggerAnimation]>
            <div 
              *ngFor="let section of demoSections; trackBy: trackBySectionId"
              class="sidebar-item stagger-item"
              [class.expanded]="section.isExpanded"
              [@cardHover]="section.isExpanded ? 'hovered' : 'normal'"
              (click)="toggleSection(section.id)"
            >
              <div class="section-header">
                <i class="fas" [class.fa-chevron-right]="!section.isExpanded" [class.fa-chevron-down]="section.isExpanded"></i>
                <span>{{ section.title }}</span>
              </div>
              <div 
                class="section-content"
                [@accordionAnimation]="section.isExpanded ? 'expanded' : 'collapsed'"
              >
                <ul>
                  <li *ngFor="let item of section.items">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Demo Area -->
        <main class="demo-main" [@fadeInOut]>
          
          <!-- Interactive Buttons Section -->
          <section class="demo-section" [@fadeInScale]>
            <h2>Botones Interactivos</h2>
            <div class="buttons-grid">
              <button 
                *ngFor="let button of interactiveButtons; trackBy: trackByButtonId"
                class="demo-button"
                [class]="button.class"
                [@buttonHover]="button.isHovered ? 'hovered' : 'normal'"
                (mouseenter)="button.isHovered = true"
                (mouseleave)="button.isHovered = false"
                (click)="handleButtonAction(button)"
              >
                <i [class]="button.icon"></i>
                {{ button.text }}
              </button>
            </div>
          </section>

          <!-- Animated Cards Section -->
          <section class="demo-section" [@fadeInScale]>
            <h2>Tarjetas Animadas</h2>
            <div class="cards-container" [@listAnimation]>
              <div 
                *ngFor="let card of animatedCards; trackBy: trackByCardId; let i = index"
                class="animated-card"
                [@cardHover]="card.isHovered ? 'hovered' : 'normal'"
                [@scaleInOut]
                (mouseenter)="card.isHovered = true"
                (mouseleave)="card.isHovered = false"
                [style.animation-delay]="(i * 100) + 'ms'"
              >
                <div class="card-icon">
                  <i [class]="card.icon"></i>
                </div>
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <div class="card-stats">
                  <span class="stat">
                    <i class="fas fa-eye"></i>
                    {{ card.views }}
                  </span>
                  <span class="stat">
                    <i class="fas fa-thumbs-up"></i>
                    {{ card.likes }}
                  </span>
                </div>
                <button 
                  class="card-action"
                  [@buttonHover]="card.actionHovered ? 'hovered' : 'normal'"
                  (mouseenter)="card.actionHovered = true"
                  (mouseleave)="card.actionHovered = false"
                >
                  Ver más
                </button>
              </div>
            </div>
          </section>

          <!-- Loading States Integration -->
          <section class="demo-section" [@fadeInScale]>
            <h2>Estados de Carga y Micro-interacciones</h2>
            <div class="loading-demo-wrapper">
              <app-loading-states></app-loading-states>
            </div>
          </section>

          <!-- Dynamic List Animation -->
          <section class="demo-section" [@fadeInScale]>
            <h2>Listas Dinámicas</h2>
            <div class="list-controls">
              <button 
                class="control-btn"
                [@buttonHover]="addButtonHovered ? 'hovered' : 'normal'"
                (mouseenter)="addButtonHovered = true"
                (mouseleave)="addButtonHovered = false"
                (click)="addListItem()"
              >
                <i class="fas fa-plus"></i>
                Agregar Elemento
              </button>
              <button 
                class="control-btn secondary"
                [@buttonHover]="removeButtonHovered ? 'hovered' : 'normal'"
                (mouseenter)="removeButtonHovered = true"
                (mouseleave)="removeButtonHovered = false"
                (click)="removeListItem()"
              >
                <i class="fas fa-minus"></i>
                Remover Elemento
              </button>
            </div>
            
            <div class="dynamic-list" [@listAnimation]>
              <div 
                *ngFor="let item of dynamicList; trackBy: trackByItemId"
                class="list-item"
                [@slideInOut]
                [@cardHover]="item.isHovered ? 'hovered' : 'normal'"
                (mouseenter)="item.isHovered = true"
                (mouseleave)="item.isHovered = false"
              >
                <div class="item-icon">
                  <i [class]="item.icon"></i>
                </div>
                <div class="item-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <small>Agregado: {{ item.timestamp | date:'short' }}</small>
                </div>
                <button 
                  class="item-remove"
                  [@buttonHover]="item.removeHovered ? 'hovered' : 'normal'"
                  (mouseenter)="item.removeHovered = true"
                  (mouseleave)="item.removeHovered = false"
                  (click)="removeSpecificItem(item.id)"
                  [attr.aria-label]="'Remover ' + item.title"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  `,
  styles: [`
    .animations-demo-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .demo-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .demo-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
      animation: floatBackground 20s linear infinite;
    }

    @keyframes floatBackground {
      0% { transform: translateX(-50px) translateY(-50px); }
      100% { transform: translateX(50px) translateY(50px); }
    }

    .header-content {
      position: relative;
      z-index: 1;
    }

    .header-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .header-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .breadcrumb-nav {
      background: white;
      padding: 1rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .breadcrumb {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb li {
      color: #667eea;
    }

    .breadcrumb li:not(:last-child)::after {
      content: '/';
      margin-left: 0.5rem;
      color: #a0aec0;
    }

    .breadcrumb li.active {
      color: #4a5568;
      font-weight: 600;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .breadcrumb a:hover {
      color: #5a67d8;
    }

    .demo-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-sidebar {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 2rem;
    }

    .demo-sidebar h3 {
      margin: 0 0 1.5rem 0;
      color: #2d3748;
      font-size: 1.25rem;
    }

    .sidebar-sections {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar-item {
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .sidebar-item:hover {
      background: #f7fafc;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      font-weight: 500;
      color: #4a5568;
    }

    .section-header i {
      transition: transform 0.2s ease;
      color: #667eea;
    }

    .sidebar-item.expanded .section-header i {
      transform: rotate(90deg);
    }

    .section-content {
      overflow: hidden;
    }

    .section-content ul {
      list-style: none;
      padding: 0 0 0.75rem 2.5rem;
      margin: 0;
    }

    .section-content li {
      padding: 0.25rem 0;
      color: #718096;
      font-size: 0.875rem;
    }

    .demo-main {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .demo-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .demo-section h2 {
      margin: 0 0 1.5rem 0;
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .buttons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .demo-button {
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #667eea;
      color: white;
    }

    .demo-button.secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .demo-button.success {
      background: #48bb78;
    }

    .demo-button.warning {
      background: #ed8936;
    }

    .demo-button.danger {
      background: #e53e3e;
    }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .animated-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .animated-card:hover {
      border-color: #667eea;
    }

    .card-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .card-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .animated-card h3 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .animated-card p {
      color: #718096;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .card-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #667eea;
    }

    .card-action {
      width: 100%;
      padding: 0.75rem;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      color: #4a5568;
    }

    .card-action:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .loading-demo-wrapper {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .list-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .control-btn {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .control-btn.secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .control-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .dynamic-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .list-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
      border: 1px solid #e2e8f0;
    }

    .list-item:hover {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .item-icon {
      width: 40px;
      height: 40px;
      background: #667eea;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
    }

    .item-content h4 {
      margin: 0 0 0.25rem 0;
      color: #2d3748;
    }

    .item-content p {
      margin: 0 0 0.25rem 0;
      color: #718096;
      font-size: 0.875rem;
    }

    .item-content small {
      color: #a0aec0;
    }

    .item-remove {
      background: #fed7d7;
      color: #e53e3e;
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .item-remove:hover {
      background: #e53e3e;
      color: white;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .demo-content {
        grid-template-columns: 1fr;
        padding: 1rem;
      }

      .demo-sidebar {
        position: static;
        margin-bottom: 2rem;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .header-content p {
        font-size: 1rem;
      }

      .buttons-grid {
        grid-template-columns: 1fr;
      }

      .cards-container {
        grid-template-columns: 1fr;
      }

      .list-controls {
        flex-direction: column;
      }
    }
  `]
})
export class AnimationsDemoComponent implements OnInit {
  
  // Estados para hover
  addButtonHovered = false;
  removeButtonHovered = false;

  // Secciones del sidebar
  demoSections: DemoSection[] = [
    {
      id: 'buttons',
      title: 'Botones Interactivos',
      description: 'Efectos hover y micro-interacciones',
      isExpanded: true,
      items: ['Hover Effects', 'Ripple Animation', 'State Changes', 'Loading States']
    },
    {
      id: 'cards',
      title: 'Tarjetas Animadas',
      description: 'Animaciones de entrada y hover',
      isExpanded: false,
      items: ['Scale Effects', 'Shadow Transitions', 'Content Animation', '3D Transforms']
    },
    {
      id: 'lists',
      title: 'Listas Dinámicas',
      description: 'Animaciones de add/remove',
      isExpanded: false,
      items: ['Stagger Animation', 'Slide Transitions', 'Fade Effects', 'List Reordering']
    },
    {
      id: 'loading',
      title: 'Estados de Carga',
      description: 'Skeletons, spinners y progress',
      isExpanded: false,
      items: ['Skeleton Loading', 'Progress Bars', 'Spinners', 'Micro-interactions']
    }
  ];

  // Botones interactivos
  interactiveButtons = [
    { id: '1', text: 'Primario', icon: 'fas fa-rocket', class: 'primary', isHovered: false },
    { id: '2', text: 'Secundario', icon: 'fas fa-cog', class: 'secondary', isHovered: false },
    { id: '3', text: 'Éxito', icon: 'fas fa-check', class: 'success', isHovered: false },
    { id: '4', text: 'Advertencia', icon: 'fas fa-exclamation', class: 'warning', isHovered: false },
    { id: '5', text: 'Peligro', icon: 'fas fa-times', class: 'danger', isHovered: false }
  ];

  // Tarjetas animadas
  animatedCards = [
    {
      id: '1',
      title: 'Disponibilidad',
      description: 'Consulta disponibilidad en tiempo real con animaciones fluidas.',
      icon: 'fas fa-calendar-check',
      views: 1250,
      likes: 89,
      isHovered: false,
      actionHovered: false
    },
    {
      id: '2',
      title: 'Reservas',
      description: 'Sistema de reservas con micro-interacciones intuitivas.',
      icon: 'fas fa-bookmark',
      views: 980,
      likes: 67,
      isHovered: false,
      actionHovered: false
    },
    {
      id: '3',
      title: 'Eventos',
      description: 'Gestión de eventos con animaciones de feedback inmediato.',
      icon: 'fas fa-calendar-alt',
      views: 756,
      likes: 45,
      isHovered: false,
      actionHovered: false
    }
  ];

  // Lista dinámica
  dynamicList: any[] = [
    {
      id: '1',
      title: 'Hotel Bogotá Centro',
      description: 'Reserva confirmada para el 15 de diciembre',
      icon: 'fas fa-building',
      timestamp: new Date(),
      isHovered: false,
      removeHovered: false
    },
    {
      id: '2',
      title: 'Evento Corporativo',
      description: 'Sala de conferencias reservada para 50 personas',
      icon: 'fas fa-users',
      timestamp: new Date(Date.now() - 86400000),
      isHovered: false,
      removeHovered: false
    }
  ];

  private itemCounter = 3;

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  toggleSection(sectionId: string): void {
    const section = this.demoSections.find(s => s.id === sectionId);
    if (section) {
      section.isExpanded = !section.isExpanded;
    }
  }

  handleButtonAction(button: any): void {
    console.log(`Botón ${button.text} presionado`);
    // Aquí podrías agregar lógica específica para cada botón
  }

  addListItem(): void {
    const newItem = {
      id: this.itemCounter.toString(),
      title: `Nuevo Item ${this.itemCounter}`,
      description: `Descripción para el elemento ${this.itemCounter}`,
      icon: 'fas fa-star',
      timestamp: new Date(),
      isHovered: false,
      removeHovered: false
    };
    
    this.dynamicList.unshift(newItem);
    this.itemCounter++;
  }

  removeListItem(): void {
    if (this.dynamicList.length > 0) {
      this.dynamicList.pop();
    }
  }

  removeSpecificItem(itemId: string): void {
    this.dynamicList = this.dynamicList.filter(item => item.id !== itemId);
  }

  // TrackBy functions para optimización de rendimiento
  trackBySectionId(index: number, section: DemoSection): string {
    return section.id;
  }

  trackByButtonId(index: number, button: any): string {
    return button.id;
  }

  trackByCardId(index: number, card: any): string {
    return card.id;
  }

  trackByItemId(index: number, item: any): string {
    return item.id;
  }
}