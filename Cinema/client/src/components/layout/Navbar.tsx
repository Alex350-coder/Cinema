import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Menu, X, User, Ticket, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuthStore } from '../../store/useAuthStore';

const sections = [
  { id: 'featured', label: 'Destacadas' },
  { id: 'screenings', label: 'Cartelera' },
  { id: 'about', label: 'Nosotros' },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [isHome]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/#${id}`);
    }
    setMobileOpen(false);
  };

  const isDark = document.documentElement.getAttribute('data-theme') !== 'warm';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? isDark ? 'rgba(13, 10, 26, 0.85)' : 'rgba(26, 18, 8, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-primary)' }}>
          <Film size={24} />
          CineMax
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isHome && sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="relative text-sm transition-colors py-1"
              style={{ color: activeSection === id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              {label}
              {activeSection === id && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'var(--accent-primary)' }}
                />
              )}
            </button>
          ))}
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--accent-primary)', border: '2px solid var(--accent-glow)' }}
                aria-label="Menú de usuario"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} style={{ color: 'var(--text-on-accent)' }} />
                )}
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>
                    <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-muted)]" style={{ color: 'var(--text-secondary)' }}>
                      <User size={16} /> Perfil
                    </button>
                    <button onClick={() => { navigate('/reservations'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-muted)]" style={{ color: 'var(--text-secondary)' }}>
                      <Ticket size={16} /> Mis reservas
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={() => { navigate('/admin'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-muted)]" style={{ color: 'var(--accent-primary)' }}>
                        Admin
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-muted)] border-t" style={{ color: 'var(--danger)', borderColor: 'var(--border-subtle)' }}>
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>Iniciar sesión</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>Registrarse</Link>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="px-4 py-3 space-y-2">
              {isHome && sections.map(({ id, label }) => (
                <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left py-2" style={{ color: 'var(--text-secondary)' }}>{label}</button>
              ))}
              {isAuthenticated ? (
                <>
                  <button onClick={() => { navigate('/profile'); setMobileOpen(false); }} className="block w-full text-left py-2" style={{ color: 'var(--text-secondary)' }}>Perfil</button>
                  <button onClick={() => { navigate('/reservations'); setMobileOpen(false); }} className="block w-full text-left py-2" style={{ color: 'var(--text-secondary)' }}>Reservas</button>
                  <button onClick={handleLogout} className="block w-full text-left py-2" style={{ color: 'var(--danger)' }}>Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
                  <Link to="/register" className="block py-2" style={{ color: 'var(--accent-primary)' }} onClick={() => setMobileOpen(false)}>Registrarse</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
