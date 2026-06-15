import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSnacks, useCreateSnack, useUpdateSnack, useToggleSnackAvailability, useDeleteSnack } from '../../hooks/useApi';

interface SnackForm {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

const emptyForm: SnackForm = {
  name: '', description: '', price: 0, imageUrl: '', category: 'palomitas', stock: 100,
};

const categories = ['palomitas', 'bebidas', 'dulces', 'combos', 'otro'];

export function AdminSnacksPage() {
  const { data: snacksData, isLoading } = useSnacks(true);
  const createSnack = useCreateSnack();
  const updateSnack = useUpdateSnack();
  const toggleAvailability = useToggleSnackAvailability();
  const deleteSnack = useDeleteSnack();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SnackForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const snacks = snacksData?.items || [];

  const filtered = useMemo(() => {
    return snacks.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(search.toLowerCase());
      const catMatch = categoryFilter === 'all' ? true : s.category === categoryFilter;
      return nameMatch && catMatch;
    });
  }, [snacks, search, categoryFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      description: s.description || '',
      price: Number(s.price) || 0,
      imageUrl: s.imageUrl || '',
      category: s.category || 'palomitas',
      stock: s.stock ?? 100,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateSnack.mutateAsync({ id: editingId, data: form });
      } else {
        await createSnack.mutateAsync(form);
      }
      setModalOpen(false);
    } catch {} finally { setSaving(false); }
  };

  const handleToggleAvailability = async (id: number) => {
    try { await toggleAvailability.mutateAsync(id); } catch {}
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try { await deleteSnack.mutateAsync(id); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
          Bocadillos
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
            placeholder="Buscar bocadillo..."
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          />
        </div>
        <select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
                  <th className="text-left p-3 font-medium">Imagen</th>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Categoría</th>
                  <th className="text-left p-3 font-medium">Precio</th>
                  <th className="text-left p-3 font-medium">Stock</th>
                  <th className="text-center p-3 font-medium">Disponible</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((snack) => (
                  <tr key={snack.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="p-2">
                      {snack.imageUrl ? (
                        <img src={snack.imageUrl} alt={snack.name} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/bc6c25/fff?text=' + snack.name.charAt(0); }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--bg-muted)' }} />
                      )}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-primary)' }}>{snack.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs capitalize" style={{ background: 'var(--accent-soft)', color: 'var(--accent-glow)' }}>{snack.category}</span>
                    </td>
                    <td className="p-3" style={{ color: 'var(--gold)' }}>S/ {Number(snack.price).toFixed(2)}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{snack.stock}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleAvailability(snack.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${snack.isAvailable ? '' : 'opacity-50'}`}
                        style={{ background: snack.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: snack.isAvailable ? 'var(--success)' : 'var(--danger)' }}
                        aria-label={snack.isAvailable ? 'Deshabilitar' : 'Habilitar'}>
                        {snack.isAvailable ? 'Disponible' : 'Agotado'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(snack)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)]" aria-label="Editar">
                          <Edit2 size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button onClick={() => handleDelete(snack.id, snack.name)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)]" aria-label="Eliminar">
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
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                  {editingId ? 'Editar bocadillo' : 'Nuevo bocadillo'}
                </h2>
                <button onClick={() => setModalOpen(false)} aria-label="Cerrar"><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nombre *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Precio *</label>
                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Categoría</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>URL de imagen</label>
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded mt-2" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/2a1a0e/e8a559?text=No+Image'; }} />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
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
