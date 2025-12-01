import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThemeMode } from '../enums/theme-mode.enum';
import { StorageKeys } from '../constants/storage-keys.constant';
import { ThemeColors } from '../classes/theme-colors.class';

/**
 * Serviço para gestão de temas (claro/escuro)
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject: BehaviorSubject<ThemeMode>;
  public currentTheme$: Observable<ThemeMode>;

  constructor() {
    const savedTheme = this.getSavedTheme();
    this.currentThemeSubject = new BehaviorSubject<ThemeMode>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    this.applyTheme(savedTheme);
  }

  /**
   * Obtém o tema salvo no localStorage ou retorna o padrão
   */
  private getSavedTheme(): ThemeMode {
    const saved = localStorage.getItem(StorageKeys.THEME_MODE);
    if (saved === ThemeMode.DARK || saved === ThemeMode.LIGHT) {
      return saved;
    }
    // Verifica preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return ThemeMode.DARK;
    }
    return ThemeMode.LIGHT;
  }

  /**
   * Obtém o tema atual
   */
  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.value;
  }

  /**
   * Alterna entre tema claro e escuro
   */
  toggleTheme(): void {
    const newTheme = this.currentThemeSubject.value === ThemeMode.LIGHT 
      ? ThemeMode.DARK 
      : ThemeMode.LIGHT;
    this.setTheme(newTheme);
  }

  /**
   * Define o tema
   */
  setTheme(theme: ThemeMode): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem(StorageKeys.THEME_MODE, theme);
    this.applyTheme(theme);
  }

  /**
   * Aplica o tema ao documento
   */
  private applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;
    const colors = theme === ThemeMode.LIGHT ? ThemeColors.LIGHT : ThemeColors.DARK;

    root.setAttribute('data-theme', theme);
    
    // Aplica variáveis CSS
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-secondary-hover', colors.secondaryHover);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-gradient', colors.backgroundGradient);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-shadow', colors.shadow);
    root.style.setProperty('--color-shadow-hover', colors.shadowHover);
  }
}

