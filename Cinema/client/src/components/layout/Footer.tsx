import { Film, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-primary)' }}>
            <Film size={22} /> CineMax
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            La magia del cine en un solo lugar. Vive experiencias inolvidables en nuestras salas.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>Películas</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>Cartelera</li>
            <li>Próximos estrenos</li>
            <li>Destacadas</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>Salas</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>Sala Standard</li>
            <li>Sala VIP</li>
            <li>Sala IMAX</li>
            <li>Sala 4DX</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Contacto</h4>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={14} /> Av. Central 1234, Lima
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Phone size={14} /> (01) 555-0123
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Mail size={14} /> hola@cinemax.pe
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        &copy; {new Date().getFullYear()} CineMax. Todos los derechos reservados.
      </div>
    </footer>
  );
}
