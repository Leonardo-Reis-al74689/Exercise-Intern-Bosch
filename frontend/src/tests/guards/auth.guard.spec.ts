import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../../app/guards/auth.guard';
import { AuthService } from '../../app/services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

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

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/tasks' } as RouterStateSnapshot;
  });

  it('deve ser criado', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('deve retornar true quando utilizador está autenticado', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = guard.canActivate(route, state);

      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('deve retornar false e navegar para login quando utilizador não está autenticado', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = guard.canActivate(route, state);

      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    });

    it('deve incluir returnUrl nos queryParams ao redirecionar', () => {
      authService.isAuthenticated.and.returnValue(false);
      state.url = '/tasks/1/edit';

      guard.canActivate(route, state);

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/tasks/1/edit' }
      });
    });
  });
});

