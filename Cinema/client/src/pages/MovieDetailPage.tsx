import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, MapPin, ChevronLeft, Play, Globe, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMovie } from '../hooks/useApi';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = Number(id);
  const { data: movie, isLoading, error } = useMovie(movieId);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-[50vh] rounded-xl mb-6" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-8 w-1/2 mb-4 rounded" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-4 w-3/4 mb-2 rounded" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-4 w-1/2 rounded" style={{ background: 'var(--bg-elevated)' }} />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--danger)' }}>Película no encontrada</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const genres = Array.isArray(movie.genres) ? movie.genres : [];
  let cast: string[] = [];
  try { cast = JSON.parse(movie.castList || '[]'); } catch { cast = []; }

  const hasTrailer = movie.trailerUrl && movie.trailerUrl.length > 0;
  const trailerId = hasTrailer ? extractYouTubeId(movie.trailerUrl!) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-16" style={{ background: 'var(--bg-base)' }}
    >
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={movie.posterUrl || ''} alt=""
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x600/1a1a2e/ffd700?text=No+Image'; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,26,0.3) 0%, rgba(13,10,26,0.95) 100%)' }} />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 w-10 h-10 rounded-full flex items-center justify-center glass hover:scale-105 transition-transform"
          aria-label="Volver"
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-48 shrink-0 hidden md:block"
          >
            <img src={movie.posterUrl || ''} alt={movie.title} className="w-full rounded-xl shadow-xl" style={{ boxShadow: 'var(--shadow-glow)' }} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/192x288/1a1a2e/ffd700?text=No+Image'; }} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {movie.rating && (
                <span className="px-2 py-0.5 rounded text-xs font-bold" style={{
                  background: movie.rating === 'R' ? 'var(--danger)' : movie.rating === 'PG-13' ? 'var(--gold)' : 'var(--success)',
                  color: '#fff'
                }}>
                  {movie.rating}
                </span>
              )}
              {movie.isFeatured && (
                <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: 'var(--gold)', color: '#000' }}>
                  DESTACADA
                </span>
              )}
              {movie.language && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}>
                  <Globe size={10} /> {movie.language}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Clock size={14} />{movie.durationMinutes} min</span>
              <span className="flex items-center gap-1"><Calendar size={14} />{movie.releaseYear}</span>
              <span className="flex items-center gap-1"><Star size={14} style={{ color: 'var(--gold)' }} />{movie.director}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {genres.map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}>
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {movie.description}
            </p>

            {cast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  <Users size={14} /> Reparto
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cast.map((actor, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      {actor}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {trailerId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  <Play size={14} /> Trailer
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerId}`}
                    title="Trailer"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {movie.upcomingScreenings && movie.upcomingScreenings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Próximas funciones</h3>
                <div className="space-y-2">
                  {movie.upcomingScreenings.map((s) => (
                    <motion.div
                      key={s.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{format(new Date(s.startTime), 'EEE d MMM', { locale: es })}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{format(new Date(s.startTime), 'HH:mm')}</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}>{s.format}</span>
                        <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <MapPin size={12} /> {s.room?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>S/ {Number(s.basePrice).toFixed(2)}</span>
                        <button onClick={() => navigate(`/booking/${s.id}`)}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                          style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                          Reservar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {(!movie.upcomingScreenings || movie.upcomingScreenings.length === 0) && (
              <p className="text-sm mt-6" style={{ color: 'var(--text-muted)' }}>No hay funciones programadas próximamente.</p>
            )}

            <button onClick={() => navigate('/')} className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-muted)]" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft size={16} /> Volver a la cartelera
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
