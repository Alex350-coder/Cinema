import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFeaturedMovies } from '../../hooks/useApi';

export function HeroSection() {
  const { data: featured } = useFeaturedMovies();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const bgMovie = featured && featured.length > 0
    ? featured[Math.floor(Math.random() * featured.length)]
    : null;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        {bgMovie?.posterUrl ? (
          <img
            src={bgMovie.posterUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--bg-base), var(--accent-soft))' }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(13,10,26,0.4) 0%, rgba(13,10,26,0.9) 70%, var(--bg-base) 100%)',
          }}
        />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 text-center px-4 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          La magia del{' '}
          <span style={{ color: 'var(--accent-primary)' }}>cine</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Vive experiencias inolvidables en nuestras salas IMAX, 4DX y VIP.
          Descubre la cartelera más completa de la ciudad.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onClick={() => document.getElementById('screenings')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-3 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)', boxShadow: 'var(--shadow-glow)' }}
        >
          Ver cartelera
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator"
        style={{ opacity }}
        aria-hidden="true"
      >
        <ChevronDown size={32} style={{ color: 'var(--accent-primary)' }} />
      </motion.div>
    </section>
  );
}
