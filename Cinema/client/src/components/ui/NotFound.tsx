import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center max-w-md">
        <Film size={64} className="mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
        <h1 className="text-6xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
          404
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          Página no encontrada
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
          <Home size={16} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
