import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, Monitor, DollarSign } from 'lucide-react';
import { useScreenings } from '../../hooks/useApi';

export function ScreeningsSection() {
  const navigate = useNavigate();
  const { data: screenings, isLoading, error } = useScreenings();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<number | 'all'>('all');

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const filtered = useMemo(() => {
    if (!screenings) return [];
    return screenings.filter((s) => {
      const dateMatch = isSameDay(new Date(s.startTime), days[selectedDay]);
      const movieMatch = selectedMovie === 'all' || s.movieId === selectedMovie;
      return dateMatch && movieMatch;
    });
  }, [screenings, selectedDay, selectedMovie]);

  const uniqueMovies = useMemo(() => {
    if (!screenings) return [];
    const seen = new Set<number>();
    return screenings.filter((s) => {
      if (seen.has(s.movieId)) return false;
      seen.add(s.movieId);
      return true;
    }).map((s) => ({ id: s.movie.id, title: s.movie.title }));
  }, [screenings]);

  return (
    <section id="screenings" className="py-20 px-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Cartelera — <span style={{ color: 'var(--accent-primary)' }}>Esta Semana</span>
        </motion.h2>

        <div className="flex flex-wrap gap-2 mb-8 mt-6 overflow-x-auto pb-2">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: i === selectedDay ? 'var(--accent-primary)' : 'var(--bg-muted)',
                color: i === selectedDay ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              }}
            >
              <span className="block text-xs">{format(d, 'EEE', { locale: es })}</span>
              <span className="block text-lg font-bold">{format(d, 'd')}</span>
              <span className="block text-xs">{format(d, 'MMM', { locale: es })}</span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            <option value="all">Todas las películas</option>
            {uniqueMovies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p style={{ color: 'var(--danger)' }}>Error al cargar funciones</p>
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Monitor size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay funciones para este día</p>
            <p className="text-sm mt-2">Selecciona otro día o filtro para ver más opciones</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((screening, i) => (
            <motion.div
              key={screening.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-glow rounded-xl overflow-hidden flex"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className="w-20 shrink-0">
                <img
                  src={screening.movie?.posterUrl || ''}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300/1a1a2e/ffd700?text=No+Image'; }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {screening.movie?.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Clock size={12} />{format(new Date(screening.startTime), 'HH:mm')}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{screening.room?.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}>
                      {screening.format}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                    S/ {Number(screening.basePrice).toFixed(2)}
                  </span>
                  {new Date(screening.startTime) > new Date() ? (
                    <button
                      onClick={() => navigate(`/booking/${screening.id}`)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                      style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}
                    >
                      Reservar
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
                      Comenzó
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
