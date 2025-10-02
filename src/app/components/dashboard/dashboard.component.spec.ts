import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService, Usuario } from '../../services/auth.service';
import { EstadisticasService } from '../../services/estadisticas.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({ 
  template: '',
  standalone: false
})
class DummyComponent { }

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let store: jasmine.SpyObj<Store>;
  let estadisticasService: jasmine.SpyObj<EstadisticasService>;

  const mockUser: Usuario = {
    _id: '123',
    nombre: 'Test User',
    email: 'test@example.com',
    tipo: 'admin_central'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'getCurrentUser'], {
      currentUser$: of(mockUser),
      isAuthenticated$: of(true)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    const estadisticasServiceSpy = jasmine.createSpyObj('EstadisticasService', ['obtenerEstadisticasGenerales']);
    
    storeSpy.select.and.returnValue(of([])); // Mock para hoteles$
    estadisticasServiceSpy.obtenerEstadisticasGenerales.and.returnValue(of({
      success: true,
      stats: {
        totalHoteles: 12,
        totalReservas: 1250,
        totalClientes: 3800,
        ingresosTotales: 2400000
      }
    }));

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule.withRoutes([
          { path: 'dashboard/home', component: DummyComponent },
          { path: 'dashboard/hoteles', component: DummyComponent },
          { path: 'dashboard/usuarios', component: DummyComponent },
          { path: 'dashboard/reportes', component: DummyComponent },
          { path: 'dashboard/habitaciones', component: DummyComponent },
          { path: 'dashboard/reservas', component: DummyComponent },
          { path: 'dashboard/salones', component: DummyComponent },
          { path: 'mis-reservas', component: DummyComponent },
          { path: 'login', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: EstadisticasService, useValue: estadisticasServiceSpy },
        provideNoopAnimations()
      ],
      declarations: [DummyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    estadisticasService = TestBed.inject(EstadisticasService) as jasmine.SpyObj<EstadisticasService>;
    
    // Spy on router.navigate method
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    // Configure the spy methods
    (authService as any).getCurrentUser.and.returnValue(mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    component.ngOnInit();
    expect((authService as any).getCurrentUser).toHaveBeenCalled();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should dispatch load hoteles action on init', () => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should logout and redirect to login', () => {
    component.logout();
    
    expect((authService as any).logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to specified route', () => {
    const testRoute = '/test-route';
    component.navigateTo(testRoute);
    expect(router.navigate).toHaveBeenCalledWith([testRoute]);
  });

  it('should get current user type', () => {
    component.currentUser = mockUser;
    expect(component.getCurrentUserType()).toBe('admin_central');
  });

  it('should get current user name', () => {
    component.currentUser = mockUser;
    expect(component.getCurrentUserName()).toBe('Test User');
  });

  it('should handle user role correctly', () => {
    expect(component.currentUser?.tipo).toBe('admin_central');
  });

  it('should display user name in template', () => {
    component.currentUser = mockUser;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test User');
  });
});