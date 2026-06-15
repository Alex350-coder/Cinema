import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Star, StarOff, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMovies, useCreateMovie, useUpdateMovie, useDeleteMovie, useToggleFeatured } from '../../hooks/useApi';

interface MovieForm {
  title: string;
  description: string;
  durationMinutes: number;
  rating: string;
  posterUrl: string;
  director: string;
  castList: string;
  releaseYear: number;
  language: string;
  isActive: boolean;
  isFeatured: boolean;
}

const emptyForm: MovieForm = {
  title: '', description: '', durationMinutes: 120, rating: 'PG-13',
  posterUrl: '', director: '', castList: '', releaseYear: 2024,
  language: 'Español', isActive: true, isFeatured: false,
};

const ratings = ['G', 'PG', 'PG-13', 'R'];

export function AdminMoviesPage() {
  const { data: movies, isLoading } = useMovies(true);
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();
  const toggleFeatured = useToggleFeatured();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = useMemo(() => {
    if (!movies) return [];
    return movies.filter((m) => {
      const nameMatch = m.title.toLowerCase().includes(search.toLowerCase());
      const statusMatch = statusFilter === 'all' ? true : statusFilter === 'active' ? m.isActive : !m.isActive;
      return nameMatch && statusMatch;
    });
  }, [movies, search, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (movie: any) => {
    setEditingId(movie.id);
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      durationMinutes: movie.durationMinutes || 120,
      rating: movie.rating || 'PG-13',
      posterUrl: movie.posterUrl || '',
      director: movie.director || '',
      castList: movie.castList || '',
      releaseYear: movie.releaseYear || 2024,
      language: movie.language || 'Español',
      isActive: movie.isActive !== false,
      isFeatured: movie.isFeatured === true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.durationMinutes) {
      toast.error('Título y duración son requeridos');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateMovie.mutateAsync({ id: editingId, data: form });
      } else {
        await createMovie.mutateAsync(form as any);
      }
      setModalOpen(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`¿Eliminar "${title}"?`)) return;
    try {
      await deleteMovie.mutateAsync(id);
    } catch {}
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleFeatured.mutateAsync(id);
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
          Películas
        </h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
          <Plus size={16} /> Añadir
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar película..."
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
        </div>
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th className="text-left p-3 font-medium">Poster</th>
                  <th className="text-left p-3 font-medium">Título</th>
                  <th className="text-left p-3 font-medium">Duración</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-center p-3 font-medium">Destacada</th>
                  <th className="text-center p-3 font-medium">Activa</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((movie) => (
                  <tr key={movie.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="p-2">
                      <img src={movie.posterUrl || ''} alt="" className="w-10 h-14 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x56/1a1a2e/ffd700?text=N'; }} />
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-primary)' }}>{movie.title}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{movie.durationMinutes} min</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{
                        background: movie.rating === 'R' ? 'rgba(239,68,68,0.15)' : movie.rating === 'PG-13' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color: movie.rating === 'R' ? 'var(--danger)' : movie.rating === 'PG-13' ? 'var(--gold)' : 'var(--success)',
                      }}>
                        {movie.rating}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleFeatured(movie.id)} aria-label="Toggle destacada">
                        {movie.isFeatured
                          ? <Star size={18} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
                          : <StarOff size={18} style={{ color: 'var(--text-muted)' }} />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: movie.isActive ? 'var(--success)' : 'var(--danger)' }} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(movie)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)]" aria-label="Editar">
                          <Edit2 size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button onClick={() => handleDelete(movie.id, movie.title)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)]" aria-label="Eliminar">
                          <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-2xl p-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                  {editingId ? 'Editar película' : 'Nueva película'}
                </h2>
                <button onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Título *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Duración (min) *</label>
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Rating</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                    {ratings.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Director</label>
                  <input value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Año</label>
                  <input type="number" value={form.releaseYear} onChange={(e) => setForm({ ...form, releaseYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Idioma</label>
                  <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>URL del póster</label>
                  <input value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  {form.posterUrl && (
                    <img src={form.posterUrl} alt="Preview" className="w-16 h-24 object-cover rounded mt-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Reparto (JSON array)</label>
                  <input value={form.castList} onChange={(e) => setForm({ ...form, castList: e.target.value })}
                    placeholder='["Actor 1", "Actor 2"]'
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    Activa
                  </label>
                  <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    Destacada
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                  {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
