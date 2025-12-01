import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../app/core/services/theme.service';
import { ThemeMode } from '../../../app/core/enums/theme-mode.enum';
import { StorageKeys } from '../../../app/core/constants/storage-keys.constant';
import { ThemeColors } from '../../../app/core/classes/theme-colors.class';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageSpy: jasmine.Spy;
  let matchMediaSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    // Mock localStorage
    localStorage.clear();
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    // Mock matchMedia
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true
    } as MediaQueryList);

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getSavedTheme', () => {
    it('deve retornar tema salvo do localStorage quando disponível', () => {
      localStorageSpy.and.callFake((key: string) => {
        return key === StorageKeys.THEME_MODE ? ThemeMode.DARK : null;
      });

      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe(ThemeMode.DARK);
    });

    it('deve retornar tema claro quando não há tema salvo e sistema prefere claro', () => {
      localStorageSpy.and.returnValue(null);
      matchMediaSpy.and.returnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      } as MediaQueryList);

      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe(ThemeMode.LIGHT);
    });

    it('deve retornar tema escuro quando sistema prefere escuro', () => {
      localStorageSpy.and.returnValue(null);
      matchMediaSpy.and.returnValue({
        matches: true,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      } as MediaQueryList);

      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe(ThemeMode.DARK);
    });
  });

  describe('getCurrentTheme', () => {
    it('deve retornar o tema atual', () => {
      const theme = service.getCurrentTheme();
      expect([ThemeMode.LIGHT, ThemeMode.DARK]).toContain(theme);
    });
  });

  describe('toggleTheme', () => {
    it('deve alternar de LIGHT para DARK', () => {
      service.setTheme(ThemeMode.LIGHT);
      service.toggleTheme();
      expect(service.getCurrentTheme()).toBe(ThemeMode.DARK);
    });

    it('deve alternar de DARK para LIGHT', () => {
      service.setTheme(ThemeMode.DARK);
      service.toggleTheme();
      expect(service.getCurrentTheme()).toBe(ThemeMode.LIGHT);
    });
  });

  describe('setTheme', () => {
    it('deve definir o tema e guardar no localStorage', () => {
      service.setTheme(ThemeMode.DARK);
      
      expect(service.getCurrentTheme()).toBe(ThemeMode.DARK);
      expect(localStorage.setItem).toHaveBeenCalledWith(StorageKeys.THEME_MODE, ThemeMode.DARK);
    });

    it('deve aplicar o tema ao documento', () => {
      const root = document.documentElement;
      service.setTheme(ThemeMode.DARK);

      expect(root.getAttribute('data-theme')).toBe(ThemeMode.DARK);
      expect(root.style.getPropertyValue('--color-primary')).toBe(ThemeColors.DARK.primary);
    });

    it('deve aplicar cores corretas para tema claro', () => {
      const root = document.documentElement;
      service.setTheme(ThemeMode.LIGHT);

      expect(root.getAttribute('data-theme')).toBe(ThemeMode.LIGHT);
      expect(root.style.getPropertyValue('--color-primary')).toBe(ThemeColors.LIGHT.primary);
      expect(root.style.getPropertyValue('--color-background')).toBe(ThemeColors.LIGHT.background);
    });

    it('deve aplicar cores corretas para tema escuro', () => {
      const root = document.documentElement;
      service.setTheme(ThemeMode.DARK);

      expect(root.getAttribute('data-theme')).toBe(ThemeMode.DARK);
      expect(root.style.getPropertyValue('--color-primary')).toBe(ThemeColors.DARK.primary);
      expect(root.style.getPropertyValue('--color-background')).toBe(ThemeColors.DARK.background);
    });
  });

  describe('currentTheme$', () => {
    it('deve emitir o tema atual', (done) => {
      service.currentTheme$.subscribe(theme => {
        expect([ThemeMode.LIGHT, ThemeMode.DARK]).toContain(theme);
        done();
      });
    });

    it('deve emitir novo tema quando alterado', (done) => {
      let count = 0;
      service.currentTheme$.subscribe(theme => {
        count++;
        if (count === 1) {
          expect(theme).toBeDefined();
        } else if (count === 2) {
          expect(theme).toBe(ThemeMode.DARK);
          done();
        }
      });

      service.setTheme(ThemeMode.DARK);
    });
  });
});

