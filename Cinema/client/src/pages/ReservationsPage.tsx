import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, Calendar, MapPin, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useReservations, useCancelReservation } from '../hooks/useApi';
import type { Reservation } from '../types';

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  simulated_paid: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  confirmed: { bg: 'rgba(124,58,237,0.15)', text: '#7C3AED' },
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  simulated_paid: 'Pagada',
  cancelled: 'Cancelada',
  confirmed: 'Confirmada',
};

export function ReservationsPage() {
  const { data: reservations, isLoading } = useReservations();
  const cancelMutation = useCancelReservation();
  const [selected, setSelected] = useState<Reservation | null>(null);

  const handleCancel = async (id: number) => {
    try {
      await cancelMutation.mutateAsync(id);
    } catch {}
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          Mis <span style={{ color: 'var(--accent-primary)' }}>Reservas</span>
        </motion.h1>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        )}

        {reservations && reservations.length === 0 && (
          <div className="text-center py-20">
            <Ticket size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No tienes reservas aún</p>
          </div>
        )}

        <div className="space-y-4">
          {reservations?.map((reservation, i) => {
            const colors = statusColors[reservation.status] || statusColors.pending;
            return (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-glow rounded-xl overflow-hidden cursor-pointer"
                style={{ background: 'var(--bg-surface)' }}
                onClick={() => setSelected(reservation)}
              >
                <div className="flex">
                  <div className="w-20 shrink-0">
                    <img src={reservation.screening?.movie?.posterUrl || ''} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x120/1a1a2e/ffd700?text=N'; }} />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {reservation.screening?.movie?.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1"><Calendar size={12} />{format(new Date(reservation.screening?.startTime || reservation.createdAt), 'd MMM yyyy', { locale: es })}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{format(new Date(reservation.screening?.startTime || reservation.createdAt), 'HH:mm')}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} />{reservation.screening?.room?.name}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {reservation.reservationSeats?.map((rs) => (
                            <span key={rs.id} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                              {rs.seat?.rowLabel}{rs.seat?.seatNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>S/ {Number(reservation.totalAmount).toFixed(2)}</span>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: colors.bg, color: colors.text }}>
                            {statusLabels[reservation.status]}
                          </span>
                        </div>
                        {reservation.confirmationCode && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            #{reservation.confirmationCode}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {reservation.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancel(reservation.id); }}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-lg rounded-2xl p-6"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Detalle de reserva</h3>
                  <button onClick={() => setSelected(null)} aria-label="Cerrar"><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <img src={selected.screening?.movie?.posterUrl || ''} alt="" className="w-12 h-16 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x64/1a1a2e/ffd700?text=N'; }} />
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.screening?.movie?.title}</p>
                      <p style={{ color: 'var(--text-muted)' }}>{selected.screening?.room?.name} · {selected.screening?.format}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={14} />
                    {format(new Date(selected.screening?.startTime || selected.createdAt), "d 'de' MMMM 'del' yyyy", { locale: es })}
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <Clock size={14} />
                    {format(new Date(selected.screening?.startTime || selected.createdAt), 'HH:mm')} — {format(new Date(selected.screening?.endTime || selected.createdAt), 'HH:mm')}
                  </div>
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Asientos</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.reservationSeats?.map((rs) => (
                        <span key={rs.id} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--bg-muted)', color: 'var(--accent-primary)' }}>
                          {rs.seat?.rowLabel}{rs.seat?.seatNumber} — S/ {Number(rs.price).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selected.reservationSnacks && selected.reservationSnacks.length > 0 && (
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Bocadillos</p>
                      {selected.reservationSnacks.map((rs) => (
                        <div key={rs.id} className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{rs.snack?.name} x{rs.quantity}</span>
                          <span>S/ {Number(rs.unitPrice * rs.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="text-lg font-bold" style={{ color: 'var(--gold)' }}>S/ {Number(selected.totalAmount).toFixed(2)}</span>
                  </div>
                  {selected.confirmationCode && (
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                      <CreditCard size={14} style={{ color: 'var(--accent-primary)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Código: <strong style={{ color: 'var(--text-primary)' }}>{selected.confirmationCode}</strong></span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
