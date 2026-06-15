import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a tema cálido' : 'Cambiar a tema oscuro'}
      className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
      style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)' }}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon size={18} style={{ color: 'var(--accent-primary)' }} />
        ) : (
          <Sun size={18} style={{ color: 'var(--gold)' }} />
        )}
      </motion.div>
    </button>
  );
}
