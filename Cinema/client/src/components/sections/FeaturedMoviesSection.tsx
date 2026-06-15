import { motion } from 'framer-motion';
import { useFeaturedMovies } from '../../hooks/useApi';
import { MovieCard } from '../ui/MovieCard';

export function FeaturedMoviesSection() {
  const { data: movies, isLoading, error } = useFeaturedMovies();

  return (
    <section id="featured" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-2 text-center"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Películas <span style={{ color: 'var(--accent-primary)' }}>Destacadas</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          Lo más visto y mejor calificado de la semana
        </motion.p>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                <div className="skeleton" style={{ aspectRatio: '2/3' }} />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p style={{ color: 'var(--danger)' }}>Error al cargar películas destacadas</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg text-sm"
              style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {movies && movies.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No hay películas destacadas en este momento
          </div>
        )}

        {movies && movies.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
