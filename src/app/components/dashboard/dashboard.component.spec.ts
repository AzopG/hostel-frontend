import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService, Usuario } from '../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let store: jasmine.SpyObj<Store>;

  const mockUser: Usuario = {
    _id: '123',
    nombre: 'Test User',
    email: 'test@example.com',
    tipo: 'admin_central'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(mockUser)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: storeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    component.ngOnInit();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should dispatch load hoteles action on init', () => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should logout and redirect to home', () => {
    component.logout();
    
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to analytics dashboard', () => {
    component.goToAnalytics();
    expect(router.navigate).toHaveBeenCalledWith(['/analytics-dashboard']);
  });

  it('should navigate to maps', () => {
    component.goToMaps();
    expect(router.navigate).toHaveBeenCalledWith(['/hotel-map']);
  });

  it('should navigate to material showcase', () => {
    component.goToMaterial();
    expect(router.navigate).toHaveBeenCalledWith(['/material-showcase']);
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