import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Check, X, Ticket, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useReservations } from '../hooks/useApi';

function InlineEdit({ value, onSave, type = 'text' }: { value: string; onSave: (v: string) => void; type?: string }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  const handleSave = () => {
    onSave(temp);
    setEditing(false);
  };

  const handleCancel = () => {
    setTemp(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="w-full text-left group">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{value || '—'}</p>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type={type}
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
        style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--accent-primary)' }}
        autoFocus
      />
      <button onClick={handleSave} className="p-1 rounded" style={{ color: 'var(--success)' }} aria-label="Guardar"><Check size={16} /></button>
      <button onClick={handleCancel} className="p-1 rounded" style={{ color: 'var(--danger)' }} aria-label="Cancelar"><X size={16} /></button>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { data: reservations } = useReservations();
  const [avatarInput, setAvatarInput] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Debes iniciar sesión</p>
      </div>
    );
  }

  const handleSaveName = async (v: string) => {
    try { await updateProfile({ name: v }); toast.success('Nombre actualizado'); }
    catch { toast.error('Error al actualizar'); }
  };

  const handleSavePhone = async (v: string) => {
    try { await updateProfile({ phone: v }); toast.success('Teléfono actualizado'); }
    catch { toast.error('Error al actualizar'); }
  };

  const handleSaveAvatar = async () => {
    if (!avatarInput) return;
    try { await updateProfile({ avatarUrl: avatarInput }); setAvatarInput(''); toast.success('Avatar actualizado'); }
    catch { toast.error('Error al actualizar avatar'); }
  };

  const totalReservations = reservations?.length || 0;
  const recentReservations = (reservations || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Mi <span style={{ color: 'var(--accent-primary)' }}>Perfil</span>
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl p-6 text-center"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden" style={{ background: 'var(--accent-soft)', border: '3px solid var(--accent-primary)' }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={36} style={{ color: 'var(--accent-primary)' }} />
              )}
            </div>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={avatarInput}
                onChange={(e) => setAvatarInput(e.target.value)}
                placeholder="URL del avatar"
                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              />
              <button onClick={handleSaveAvatar} className="w-full py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                <Camera size={14} className="inline mr-1" />Cambiar foto
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 rounded-xl p-6 space-y-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tu cuenta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}><User size={12} className="inline mr-1" />Nombre</label>
                  <InlineEdit value={user.name} onSave={handleSaveName} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}><Mail size={12} className="inline mr-1" />Email</label>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No puedes cambiar el email</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}><Phone size={12} className="inline mr-1" />Teléfono</label>
                  <InlineEdit value={user.phone || ''} onSave={handleSavePhone} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Estadísticas</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Reservas totales', value: String(totalReservations) },
                  { label: 'Películas vistas', value: reservations ? new Set(reservations.map(r => r.screening?.movieId)).size.toString() : '—' },
                  { label: 'Miembro desde', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                    <p className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>{s.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <Ticket size={16} className="inline mr-1" /> Últimas reservas
                </h3>
                <Link to="/reservations" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                  Ver todas <ArrowRight size={12} />
                </Link>
              </div>
              {recentReservations.length > 0 ? (
                <div className="space-y-2">
                  {recentReservations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {r.screening?.movie?.title || `Reserva #${r.id}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Calendar size={10} />
                          {format(new Date(r.createdAt), 'd MMM yyyy', { locale: es })}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{
                            background: r.status === 'simulated_paid' ? 'rgba(16,185,129,0.15)' : r.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: r.status === 'simulated_paid' ? 'var(--success)' : r.status === 'cancelled' ? 'var(--danger)' : 'var(--gold)',
                          }}>
                            {r.status === 'simulated_paid' ? 'Pagada' : r.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium shrink-0" style={{ color: 'var(--gold)' }}>
                        S/ {Number(r.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aún no tienes reservas.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
