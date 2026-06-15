import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Film, Clapperboard, CalendarRange, LogOut, Sandwich } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const navItems = [
  { path: '/admin', icon: Clapperboard, label: 'Dashboard' },
  { path: '/admin/movies', icon: Film, label: 'Películas' },
  { path: '/admin/screenings', icon: CalendarRange, label: 'Funciones' },
  { path: '/admin/snacks', icon: Sandwich, label: 'Bocadillos' },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link to="/admin" className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-primary)' }}>
            <Film size={20} /> CineMax Admin
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--bg-muted)]" style={{ color: 'var(--text-muted)' }}>
            Ver sitio
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-[var(--bg-muted)] w-full" style={{ color: 'var(--danger)' }}>
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
