import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, X, EyeOff, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useScreenings, useMovies, useRooms, useCreateScreening, useUpdateScreening, useDeactivateScreening } from '../../hooks/useApi';

interface ScreeningForm {
  movieId: number;
  roomId: number;
  startTime: string;
  basePrice: number;
  format: string;
  language: string;
  subtitleLanguage: string;
}

const emptyForm: ScreeningForm = {
  movieId: 0, roomId: 0, startTime: '', basePrice: 0,
  format: '2D', language: 'Español', subtitleLanguage: '',
};

const formats = ['2D', '3D', 'IMAX', '4DX'];

export function AdminScreeningsPage() {
  const { data: screenings, isLoading } = useScreenings(true);
  const { data: movies } = useMovies();
  const { data: rooms } = useRooms();
  const createScreening = useCreateScreening();
  const updateScreening = useUpdateScreening();
  const deactivateScreening = useDeactivateScreening();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ScreeningForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = useMemo(() => {
    if (!screenings) return [];
    return screenings.filter((s) => {
      const nameMatch = s.movie?.title?.toLowerCase().includes(search.toLowerCase()) ?? true;
      const statusMatch = statusFilter === 'all' ? true : statusFilter === 'active' ? s.isActive : !s.isActive;
      return nameMatch && statusMatch;
    });
  }, [screenings, search, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      movieId: s.movieId || 0,
      roomId: s.roomId || 0,
      startTime: s.startTime ? format(new Date(s.startTime), "yyyy-MM-dd'T'HH:mm") : '',
      basePrice: Number(s.basePrice) || 0,
      format: s.format || '2D',
      language: s.language || 'Español',
      subtitleLanguage: s.subtitleLanguage || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.movieId || !form.roomId || !form.startTime) {
      toast.error('Película, sala y horario son requeridos');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateScreening.mutateAsync({ id: editingId, data: form });
      } else {
        await createScreening.mutateAsync(form);
      }
      setModalOpen(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('¿Desactivar esta función?')) return;
    try { await deactivateScreening.mutateAsync(id); } catch {}
  };

  const sortedScreenings = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [filtered]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
          Funciones
        </h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
          <Plus size={16} /> Nueva función
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por película..."
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
                  <th className="text-left p-3 font-medium">Película</th>
                  <th className="text-left p-3 font-medium">Sala</th>
                  <th className="text-left p-3 font-medium">Inicio</th>
                  <th className="text-left p-3 font-medium">Fin</th>
                  <th className="text-left p-3 font-medium">Precio</th>
                  <th className="text-left p-3 font-medium">Formato</th>
                  <th className="text-center p-3 font-medium">Activa</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedScreenings.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="p-3" style={{ color: 'var(--text-primary)' }}>{s.movie?.title || `#${s.movieId}`}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{s.room?.name || `Sala #${s.roomId}`}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>
                      {format(new Date(s.startTime), 'd MMM HH:mm', { locale: es })}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(s.endTime), 'HH:mm', { locale: es })}
                    </td>
                    <td className="p-3" style={{ color: 'var(--gold)' }}>S/ {Number(s.basePrice).toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}>{s.format}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.isActive ? 'var(--success)' : 'var(--danger)' }} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)]" aria-label="Editar">
                          <Edit2 size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button onClick={() => handleDeactivate(s.id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)]" aria-label="Desactivar">
                          <EyeOff size={16} style={{ color: 'var(--danger)' }} />
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
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                  {editingId ? 'Editar función' : 'Nueva función'}
                </h2>
                <button onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Película *</label>
                  <select value={form.movieId} onChange={(e) => setForm({ ...form, movieId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                    <option value={0}>Seleccionar película</option>
                    {(movies || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Sala *</label>
                  <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                    <option value={0}>Seleccionar sala</option>
                    {(rooms || []).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.roomType})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Fecha y hora de inicio *</label>
                  <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Precio base *</label>
                    <input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Formato</label>
                    <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                      {formats.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Idioma</label>
                    <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Subtítulos</label>
                    <input value={form.subtitleLanguage} onChange={(e) => setForm({ ...form, subtitleLanguage: e.target.value })}
                      placeholder="Ninguno"
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>Cancelar</button>
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
