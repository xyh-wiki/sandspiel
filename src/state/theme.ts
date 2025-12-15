import { create } from 'zustand';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'sandspiel_theme';

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
};

export const bootstrapTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
  const next = stored ?? getSystemTheme();
  applyTheme(next);
  return next;
};

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: typeof window !== 'undefined' ? bootstrapTheme() : 'light',
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, theme);
      applyTheme(theme);
    }
    set({ theme });
  }
}));
