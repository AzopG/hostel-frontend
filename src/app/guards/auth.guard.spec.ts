import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const canActivate = guard.canActivate();

    if (canActivate instanceof Promise) {
      canActivate.then(result => {
        expect(result).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
      });
    } else if (typeof canActivate === 'boolean') {
      expect(canActivate).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    } else {
      canActivate.subscribe(result => {
        expect(result).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
      });
    }
  });

  it('should deny access and redirect when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const canActivate = guard.canActivate();

    if (canActivate instanceof Promise) {
      canActivate.then(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
    } else if (typeof canActivate === 'boolean') {
      expect(canActivate).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    } else {
      canActivate.subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
    }
  });
});