import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../app/services/auth.service';
import { ApiService } from '../../app/services/api.service';
import { StorageKeys } from '../../app/core/constants/storage-keys.constant';
import { User, LoginResponse } from '../../app/models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.Spy;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  };

  const mockLoginResponse: LoginResponse = {
    access_token: 'mock-token',
    token_type: 'Bearer',
    user: mockUser
  };

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Limpar localStorage antes de cada teste
    localStorage.clear();
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentUser (testa getUserFromStorage indiretamente)', () => {
    it('deve retornar null quando não há utilizador no localStorage', () => {
      localStorageSpy.and.returnValue(null);
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('deve retornar o utilizador quando existe no localStorage', () => {
      localStorageSpy.and.callFake((key: string) => {
        return key === StorageKeys.USER ? JSON.stringify(mockUser) : null;
      });
      const authService = new AuthService(apiService, router);
      const user = authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });
  });

  describe('register', () => {
    it('deve chamar apiService.post com os dados corretos', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      apiService.post.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.register(userData);

      expect(apiService.post).toHaveBeenCalledWith('/auth/register', userData);
    });
  });

  describe('login', () => {
    it('deve chamar apiService.post com os dados de login corretos', () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };
      apiService.post.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.login(loginData);

      expect(apiService.post).toHaveBeenCalledWith('/auth/login', loginData);
    });
  });

  describe('setAuthData', () => {
    it('deve guardar token e utilizador no localStorage e atualizar o BehaviorSubject', () => {
      service.setAuthData(mockLoginResponse);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        StorageKeys.ACCESS_TOKEN,
        mockLoginResponse.access_token
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        StorageKeys.USER,
        JSON.stringify(mockLoginResponse.user)
      );

      service.currentUser$.subscribe((user: any) => {
        expect(user).toEqual(mockUser);
      });
    });
  });

  describe('logout', () => {
    it('deve remover token e utilizador do localStorage e navegar para login', () => {
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKeys.ACCESS_TOKEN);
      expect(localStorage.removeItem).toHaveBeenCalledWith(StorageKeys.USER);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar false quando não há token', () => {
      localStorageSpy.and.returnValue(null);
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('deve retornar true quando há token', () => {
      localStorageSpy.and.returnValue('mock-token');
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar o utilizador atual do BehaviorSubject', () => {
      service.setAuthData(mockLoginResponse);
      const user = service.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('deve retornar null quando não há utilizador', () => {
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getToken', () => {
    it('deve retornar o token do localStorage', () => {
      localStorageSpy.and.returnValue('mock-token');
      const token = service.getToken();
      expect(token).toBe('mock-token');
      expect(localStorage.getItem).toHaveBeenCalledWith(StorageKeys.ACCESS_TOKEN);
    });

    it('deve retornar null quando não há token', () => {
      localStorageSpy.and.returnValue(null);
      const token = service.getToken();
      expect(token).toBeNull();
    });
  });

  describe('currentUser$', () => {
    it('deve emitir o utilizador atual quando definido', (done) => {
      service.setAuthData(mockLoginResponse);
      
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });

    it('deve emitir null após logout', (done) => {
      service.setAuthData(mockLoginResponse);
      service.logout();

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });
  });
});

