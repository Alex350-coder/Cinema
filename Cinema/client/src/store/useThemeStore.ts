import { create } from 'zustand';

type Theme = 'dark' | 'warm';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

const stored = (typeof window !== 'undefined' ? localStorage.getItem('cinemax_theme') : null) as Theme | null;
const initial: Theme = stored === 'warm' ? 'warm' : 'dark';
if (typeof window !== 'undefined') applyTheme(initial);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initial,

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'warm' : 'dark';
      localStorage.setItem('cinemax_theme', next);
      applyTheme(next);
      return { theme: next };
    });
  },
}));
