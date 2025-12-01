/**
 * Classe para definir as cores do tema
 */
export class ThemeColors {
  // Modo Claro - Cores azul/verde (não roxo/rosa)
  static readonly LIGHT = {
    primary: '#2563eb',      // Azul
    primaryHover: '#1d4ed8',
    secondary: '#059669',    // Verde
    secondaryHover: '#047857',
    background: '#f8fafc',
    backgroundGradient: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
    card: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#dc2626',
    success: '#16a34a',
    warning: '#ea580c',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)'
  };

  // Modo Escuro - Cores azul/verde escuro
  static readonly DARK = {
    primary: '#3b82f6',      // Azul claro
    primaryHover: '#60a5fa',
    secondary: '#10b981',    // Verde claro
    secondaryHover: '#34d399',
    background: '#0f172a',
    backgroundGradient: 'linear-gradient(135deg, #1e3a8a 0%, #065f46 100%)',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#334155',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f97316',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHover: 'rgba(0, 0, 0, 0.4)'
  };
}

