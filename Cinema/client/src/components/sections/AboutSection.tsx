import { motion } from 'framer-motion';
import { Building2, Cpu, CupSoda } from 'lucide-react';

export function AboutSection() {
  const items = [
    {
      icon: Building2,
      title: '4 Salas Modernas',
      desc: 'Desde salas estándar hasta experiencias VIP con asientos reclinables y servicio personalizado.',
    },
    {
      icon: Cpu,
      title: 'Tecnología de Punta',
      desc: 'Proyección IMAX, sonido Dolby Atmos y efectos 4DX que te sumergen en la película.',
    },
    {
      icon: CupSoda,
      title: 'Gastronomía Gourmet',
      desc: 'Palomitas artesanales, combos exclusivos y bocadillos preparados al momento.',
    },
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
            Vive la experiencia{' '}
            <span style={{ color: 'var(--accent-primary)' }}>CineMax</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Más que un cine, un destino donde cada función es una experiencia única.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card-glow rounded-xl p-8 text-center"
              style={{ background: 'var(--bg-surface)' }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'var(--accent-soft)' }}
              >
                <item.icon size={32} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl overflow-hidden text-center py-12 px-4"
          style={{
            background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-elevated))',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
            "El cine es la más hermosa de las mentiras"
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>— Jean-Luc Godard</p>
        </motion.div>
      </div>
    </section>
  );
}
