import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, Usuario, LoginRequest, RegisterRequest } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUsuario: Usuario = {
    _id: '123456789',
    nombre: 'Test User',
    email: 'test@example.com',
    tipo: 'cliente'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        msg: 'Login exitoso',
        token: 'mock-jwt-token',
        usuario: mockUsuario,
        expiresIn: '24h'
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUsuario));
      });

      const req = httpMock.expectOne('http://localhost:4000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(credentials).subscribe(
        response => fail('Should have failed'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne('http://localhost:4000/api/auth/login');
      req.flush({ msg: 'Credenciales incorrectas' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register user successfully', () => {
      const userData: RegisterRequest = {
        nombre: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        tipo: 'cliente'
      };

      const mockResponse = {
        msg: 'Usuario registrado exitosamente',
        usuario: { ...mockUsuario, nombre: 'New User', email: 'newuser@example.com' }
      };

      service.register(userData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:4000/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and update subjects', () => {
      // Simular usuario logueado
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUsuario));
      
      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      
      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(false);
      });
      
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      localStorage.setItem('token', 'valid-token');
      
      const mockResponse = { usuario: mockUsuario };

      service.verifyToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:4000/api/auth/verify');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
      req.flush(mockResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when authenticated', () => {
      // Simular autenticación
      service['isAuthenticatedSubject'].next(true);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should return true for correct role', () => {
      service['currentUserSubject'].next(mockUsuario);
      expect(service.hasRole('cliente')).toBe(true);
    });

    it('should return false for incorrect role', () => {
      service['currentUserSubject'].next(mockUsuario);
      expect(service.hasRole('admin')).toBe(false);
    });

    it('should return false when no user', () => {
      service['currentUserSubject'].next(null);
      expect(service.hasRole('cliente')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has one of the roles', () => {
      service['currentUserSubject'].next(mockUsuario);
      expect(service.hasAnyRole(['admin', 'cliente', 'empresa'])).toBe(true);
    });

    it('should return false when user has none of the roles', () => {
      service['currentUserSubject'].next(mockUsuario);
      expect(service.hasAnyRole(['admin', 'empresa'])).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUsuario));
      expect(service.getCurrentUser()).toEqual(mockUsuario);
    });

    it('should return null when no user', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });
});
