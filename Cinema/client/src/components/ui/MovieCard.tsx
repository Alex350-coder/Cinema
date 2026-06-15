import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '../../types';

interface Props {
  movie: Movie;
}

export const MovieCard = memo(function MovieCard({ movie }: Props) {
  const navigate = useNavigate();

  const genres = Array.isArray(movie.genres) ? movie.genres : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-glow rounded-xl overflow-hidden cursor-pointer group"
      style={{ background: 'var(--bg-surface)', minWidth: 280, maxWidth: 320 }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
        <img
          src={movie.posterUrl || ''}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x450/1a1a2e/ffd700?text=No+Image'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm line-clamp-3">{movie.description}</p>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {movie.rating && (
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                background: movie.rating === 'R' ? 'var(--danger)' : movie.rating === 'PG-13' ? 'var(--gold)' : 'var(--success)',
                color: '#fff',
              }}
            >
              {movie.rating}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1">
          <Star size={14} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
          <span className="text-xs" style={{ color: 'var(--gold)' }}>{movie.releaseYear}</span>
        </div>
        <h3 className="font-semibold text-base leading-tight" style={{ color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Clock size={12} />{movie.durationMinutes} min</span>
          <span className="flex items-center gap-1"><Calendar size={12} />{movie.releaseYear}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {genres.map((g) => (
            <span
              key={g.id}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}
            >
              {g.name}
            </span>
          ))}
        </div>
        {movie.director && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Dir. {movie.director}
          </p>
        )}
      </div>
    </motion.div>
  );
});
