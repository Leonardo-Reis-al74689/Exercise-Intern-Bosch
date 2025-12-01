import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from '../../app/interceptors/jwt.interceptor';
import { AuthService } from '../../app/services/auth.service';
import { StorageKeys } from '../../app/core/constants/storage-keys.constant';
import { environment } from '../../environments/environment';

describe('JwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    localStorage.clear();
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(httpClient).toBeTruthy();
  });

  describe('intercept', () => {
    it('deve adicionar header Authorization quando há token', () => {
      const token = 'mock-token';
      authService.getToken.and.returnValue(token);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('não deve adicionar header Authorization quando não há token', () => {
      authService.getToken.and.returnValue(null);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('deve adicionar token em requisições POST', () => {
      const token = 'mock-token';
      authService.getToken.and.returnValue(token);

      httpClient.post('/test', {}).subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('deve adicionar token em requisições PUT', () => {
      const token = 'mock-token';
      authService.getToken.and.returnValue(token);

      httpClient.put('/test/1', {}).subscribe();

      const req = httpMock.expectOne('/test/1');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('deve adicionar token em requisições DELETE', () => {
      const token = 'mock-token';
      authService.getToken.and.returnValue(token);

      httpClient.delete('/test/1').subscribe();

      const req = httpMock.expectOne('/test/1');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('deve usar authService.getToken para obter o token', () => {
      const token = 'mock-token';
      authService.getToken.and.returnValue(token);

      httpClient.get('/test').subscribe();

      expect(authService.getToken).toHaveBeenCalled();
      const req = httpMock.expectOne('/test');
      req.flush({});
    });
  });
});

