import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, phone: phone || undefined });
      useAuthStore.setState({ user: res.user, isAuthenticated: true });
      toast.success('Cuenta creada exitosamente');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Film size={40} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
            Crear cuenta
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Únete a la experiencia CineMax
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              placeholder="Tu nombre" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              placeholder="tu@email.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Contraseña</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              placeholder="Mínimo 6 caracteres" />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Teléfono (opcional)</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              placeholder="999 111 222" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Inicia sesión</Link>
        </p>
      </motion.div>
    </div>
  );
}
