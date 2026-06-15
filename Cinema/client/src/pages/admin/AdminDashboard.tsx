import { motion } from 'framer-motion';
import { Film, CalendarRange, Ticket, DollarSign, Star, TrendingUp } from 'lucide-react';
import { useMovies, useScreenings, useAllReservations } from '../../hooks/useApi';

export function AdminDashboard() {
  const { data: movies } = useMovies();
  const { data: screenings } = useScreenings();
  const { data: reservations } = useAllReservations();

  const activeMovies = (movies || []).filter((m) => m.isActive);
  const featuredMovies = (movies || []).filter((m) => m.isFeatured);
  const activeScreenings = (screenings || []).filter((s) => s.isActive);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReservations = (reservations || []).filter((r) => r.createdAt?.startsWith(todayStr));

  const stats = [
    { label: 'Películas activas', value: activeMovies.length, icon: Film, color: 'var(--accent-primary)' },
    { label: 'Destacadas', value: featuredMovies.length, icon: Star, color: 'var(--gold)' },
    { label: 'Funciones activas', value: activeScreenings.length, icon: CalendarRange, color: 'var(--accent-glow)' },
    { label: 'Reservas hoy', value: todayReservations.length, icon: TrendingUp, color: 'var(--success)' },
    {
      label: 'Ingresos totales',
      value: `S/ ${(reservations || []).filter((r) => r.status !== 'cancelled').reduce((s, r) => s + Number(r.totalAmount), 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'var(--gold)',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-4 card-glow"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Reservas recientes</h2>
        {reservations && reservations.length > 0 ? (
          <div className="space-y-2">
            {reservations.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-3 text-sm">
                  <span style={{ color: 'var(--text-primary)' }}>{r.screening?.movie?.title || `#${r.id}`}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.user?.name || `Usuario #${r.userId}`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--gold)' }}>S/ {Number(r.totalAmount).toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: r.status === 'simulated_paid' ? 'rgba(16,185,129,0.15)' : r.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: r.status === 'simulated_paid' ? 'var(--success)' : r.status === 'cancelled' ? 'var(--danger)' : 'var(--gold)',
                    }}>
                    {r.status === 'simulated_paid' ? 'Pagada' : r.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay reservas aún</p>
        )}
      </div>
    </div>
  );
}
