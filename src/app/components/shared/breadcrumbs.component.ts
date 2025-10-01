import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-container" aria-label="Navegación de páginas">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/" class="breadcrumb-link home-link" aria-label="Inicio">
            <i class="fas fa-home" aria-hidden="true"></i>
            <span class="sr-only">Inicio</span>
          </a>
        </li>
        <li 
          *ngFor="let breadcrumb of breadcrumbs; let last = last" 
          class="breadcrumb-item"
          [class.active]="last"
        >
          <i class="fas fa-chevron-right breadcrumb-separator" aria-hidden="true"></i>
          <a 
            *ngIf="!last" 
            [routerLink]="breadcrumb.url" 
            class="breadcrumb-link"
            [attr.aria-label]="'Ir a ' + breadcrumb.label"
          >
            <i *ngIf="breadcrumb.icon" [class]="breadcrumb.icon" aria-hidden="true"></i>
            {{ breadcrumb.label }}
          </a>
          <span *ngIf="last" class="breadcrumb-current" aria-current="page">
            <i *ngIf="breadcrumb.icon" [class]="breadcrumb.icon" aria-hidden="true"></i>
            {{ breadcrumb.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,250,0.95));
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 0.75rem 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 0.875rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .breadcrumb-link {
      color: #667eea;
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-link:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #5a67d8;
      transform: translateY(-1px);
    }

    .home-link {
      padding: 0.5rem;
      border-radius: 50%;
    }

    .breadcrumb-separator {
      margin: 0 0.5rem;
      color: #cbd5e0;
      font-size: 0.75rem;
    }

    .breadcrumb-current {
      color: #4a5568;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-item.active {
      color: #2d3748;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 768px) {
      .breadcrumb-container {
        padding: 0.5rem 1rem;
      }
      
      .breadcrumb {
        font-size: 0.8rem;
      }
      
      .breadcrumb-link span:not(.sr-only) {
        display: none;
      }
    }
  `]
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  private breadcrumbMap: { [key: string]: { label: string; icon?: string } } = {
    '/dashboard': { label: 'Panel de Control', icon: 'fas fa-tachometer-alt' },
    '/dashboard/hoteles': { label: 'Hoteles', icon: 'fas fa-building' },
    '/dashboard/habitaciones': { label: 'Habitaciones', icon: 'fas fa-bed' },
    '/dashboard/salones': { label: 'Salones', icon: 'fas fa-users' },
    '/dashboard/reservas': { label: 'Reservas', icon: 'fas fa-calendar-check' },
    '/dashboard/eventos': { label: 'Eventos', icon: 'fas fa-calendar-alt' },
    '/dashboard/disponibilidad': { label: 'Disponibilidad', icon: 'fas fa-calendar' },
    '/dashboard/reportes': { label: 'Reportes', icon: 'fas fa-chart-bar' },
    '/dashboard/usuarios': { label: 'Usuarios', icon: 'fas fa-users-cog' },
    '/dashboard/paquetes': { label: 'Paquetes', icon: 'fas fa-box-open' },
    '/dashboard/inventario': { label: 'Inventario', icon: 'fas fa-warehouse' },
    '/dashboard/mis-reservas': { label: 'Mis Reservas', icon: 'fas fa-bookmark' },
    '/dashboard/historial': { label: 'Historial', icon: 'fas fa-history' },
    '/login': { label: 'Iniciar Sesión', icon: 'fas fa-sign-in-alt' }
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap(route => route.data)
      )
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const mappedBreadcrumb = this.breadcrumbMap[url];
      if (mappedBreadcrumb) {
        breadcrumbs.push({
          label: mappedBreadcrumb.label,
          url: url,
          icon: mappedBreadcrumb.icon
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}