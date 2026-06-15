import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, CreditCard, PartyPopper, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useScreening, useScreeningSeats, useSnacks, useCreateReservation, useSimulatePayment } from '../hooks/useApi';
import { useBookingStore } from '../store/useBookingStore';
import type { Seat, Snack } from '../types';

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: i <= step ? 'var(--accent-primary)' : 'var(--bg-muted)',
              color: i <= step ? 'var(--text-on-accent)' : 'var(--text-muted)',
            }}
          >
            {i < step ? <Check size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className="w-8 h-0.5 mx-1" style={{ background: i < step ? 'var(--accent-primary)' : 'var(--bg-muted)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function SeatGrid({ seats, onSelect, isSelected }: { seats: Seat[]; onSelect: (s: Seat) => void; isSelected: (id: number) => boolean }) {
  const rows = useMemo(() => {
    const map = new Map<string, Seat[]>();
    seats.forEach((s) => {
      if (!map.has(s.rowLabel)) map.set(s.rowLabel, []);
      map.get(s.rowLabel)!.push(s);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div className="space-y-2">
      <div className="text-center mb-6">
        <div className="w-3/4 h-2 rounded mx-auto mb-1" style={{ background: 'var(--bg-muted)' }} aria-hidden />
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Pantalla</span>
      </div>
      <div className="space-y-1.5">
        {rows.map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="flex items-center gap-2 justify-center">
            <span className="text-xs w-4 text-right font-mono" style={{ color: 'var(--text-muted)' }}>{rowLabel}</span>
            <div className="flex gap-1">
              {rowSeats.sort((a, b) => a.seatNumber - b.seatNumber).map((seat) => {
                const selected = isSelected(seat.seatId);
                const isVip = seat.type === 'vip';
                let bg: string, border: string, opacity: number, cursor: string;
                if (!seat.isAvailable) {
                  bg = 'var(--bg-muted)'; border = 'transparent'; opacity = 0.4; cursor = 'not-allowed';
                } else if (selected) {
                  bg = 'var(--success)'; border = 'var(--success)'; opacity = 1; cursor = 'pointer';
                } else if (isVip) {
                  bg = 'transparent'; border = 'var(--gold)'; opacity = 1; cursor = 'pointer';
                } else {
                  bg = 'var(--accent-soft)'; border = 'var(--border-subtle)'; opacity = 1; cursor = 'pointer';
                }

                return (
                  <button
                    key={seat.seatId}
                    onClick={() => seat.isAvailable && onSelect(seat)}
                    disabled={!seat.isAvailable}
                    className="w-7 h-7 rounded text-[10px] font-mono font-bold transition-all duration-150 hover:scale-110 disabled:hover:scale-100"
                    style={{ background: bg, border: `1px solid ${border}`, opacity, cursor }}
                    aria-label={`Asiento ${rowLabel}${seat.seatNumber}${!seat.isAvailable ? ' (ocupado)' : ''}`}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
            <span className="text-xs w-4 font-mono" style={{ color: 'var(--text-muted)' }}>{rowLabel}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-subtle)' }} /> Disponible</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'var(--bg-muted)' }} /> Ocupado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'var(--success)' }} /> Seleccionado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ border: '1px solid var(--gold)', background: 'transparent' }} /> VIP</span>
      </div>
    </div>
  );
}

function SnackSelector({ snacks }: { snacks: Snack[] }) {
  const { selectedSnacks, addSnack, updateSnackQuantity } = useBookingStore();

  const grouped = useMemo(() => {
    const map: Record<string, Snack[]> = {};
    snacks.forEach((s) => {
      const cat = s.category || 'otros';
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [snacks]);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold mb-3 capitalize" style={{ color: 'var(--text-primary)' }}>{category}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((snack) => {
              const inCart = selectedSnacks.find((s) => s.snack.id === snack.id);
              const qty = inCart?.quantity || 0;
              return (
                <div key={snack.id} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{snack.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--gold)' }}>S/ {Number(snack.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {qty > 0 ? (
                      <>
                        <button onClick={() => updateSnackQuantity(snack.id, qty - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)' }} aria-label="Reducir">-</button>
                        <span className="text-sm font-medium w-5 text-center" style={{ color: 'var(--text-primary)' }}>{qty}</span>
                        <button onClick={() => updateSnackQuantity(snack.id, qty + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }} aria-label="Aumentar">+</button>
                      </>
                    ) : (
                      <button onClick={() => addSnack(snack)} className="w-full py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function PaymentForm({ onPay, loading, total }: { onPay: () => void; loading: boolean; total: number }) {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState('NOMBRE APELLIDO');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const displayNumber = formatCardNumber(cardNumber);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl p-6 aspect-[1.586] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div className="absolute top-4 right-4 opacity-80">
          <CreditCard size={32} style={{ color: 'var(--gold)' }} />
        </div>
        <div className="absolute top-4 left-4">
          <span className="text-xs tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>CINEMAX</span>
        </div>
        <div className="mt-10">
          <p className="text-xl font-mono tracking-widest" style={{ color: '#fff' }}>
            {displayNumber || '•••• •••• •••• ••••'}
          </p>
        </div>
        <div className="mt-6 flex gap-8">
          <div className="flex-1">
            <p className="text-[10px] mb-1 tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>TITULAR</p>
            <p className="text-sm font-medium tracking-wide truncate" style={{ color: '#fff' }}>{cardName || 'NOMBRE APELLIDO'}</p>
          </div>
          <div>
            <p className="text-[10px] mb-1 tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>VENCE</p>
            <p className="text-sm font-medium" style={{ color: '#fff' }}>{cardExpiry || 'MM/AA'}</p>
          </div>
          <div>
            <p className="text-[10px] mb-1 tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>CVV</p>
            <p className="text-sm font-medium" style={{ color: '#fff' }}>{cardCvv || '•••'}</p>
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Número de tarjeta</label>
          <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242" maxLength={19}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Titular</label>
          <input value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())}
            placeholder="NOMBRE APELLIDO"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Vencimiento</label>
          <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
            placeholder="MM/AA" maxLength={5}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>CVV</label>
          <input value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="123" maxLength={3} type="password"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
        </div>
      </div>
      <button
        onClick={onPay}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 hover:brightness-110"
        style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Procesando pago...
          </span>
        ) : (
          `Confirmar y Pagar — S/ ${total.toFixed(2)}`
        )}
      </button>
    </div>
  );
}

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screeningIdParam = searchParams.get('screeningId');
  const pathId = window.location.pathname.split('/booking/')[1];
  const screeningId = Number(screeningIdParam || pathId);

  const { data: screening, isLoading: loadingScreening } = useScreening(screeningId);
  const { data: seats, isLoading: loadingSeats } = useScreeningSeats(screeningId);
  const { data: snacksData, isLoading: loadingSnacks } = useSnacks();
  const createReservation = useCreateReservation();
  const simulatePayment = useSimulatePayment();

  const { selectedSeats, selectedSnacks, selectSeat, deselectSeat, isSelected, clearBooking, getTotal } = useBookingStore();

  const [step, setStep] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [success, setSuccess] = useState<{ code: string; total: number } | null>(null);

  useEffect(() => {
    if (screeningId) useBookingStore.getState().setScreeningId(screeningId);
  }, [screeningId]);

  const basePrice = Number(screening?.basePrice || 0);
  const total = getTotal(basePrice);
  const snacks = snacksData?.items || [];

  const handleNext = useCallback(() => {
    if (step === 0 && selectedSeats.length === 0) {
      toast.error('Selecciona al menos un asiento');
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  }, [step, selectedSeats]);

  const handlePay = async () => {
    setPaymentLoading(true);
    try {
      const res = await createReservation.mutateAsync({
        screeningId,
        seatIds: selectedSeats.map((s) => s.seatId),
        snacks: selectedSnacks.map((s) => ({ snackId: s.snack.id, quantity: s.quantity })),
      });
      await simulatePayment.mutateAsync(res.id);
      setSuccess({ code: res.confirmationCode, total: res.totalAmount });
      clearBooking();
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('ocupado') || msg.toLowerCase().includes('disponible')) {
        toast.error('Algunos asientos ya no están disponibles. Por favor recarga la página.', { duration: 5000 });
      } else {
        toast.error(msg || 'Error al procesar la reserva');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center max-w-md">
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
              >
                <PartyPopper size={40} style={{ color: 'var(--gold)' }} />
              </motion.div>
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
            ¡Reserva confirmada!
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Tu código de confirmación es:
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-mono font-bold tracking-wider mb-4 p-3 rounded-lg"
            style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)', border: '2px dashed var(--accent-primary)' }}
          >
            {success.code}
          </motion.div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Total pagado: <strong style={{ color: 'var(--gold)' }}>S/ {Number(success.total).toFixed(2)}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/reservations')} className="px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
              Ver mis reservas
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              Volver al inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loadingScreening) {
    return (
      <div className="min-h-screen pt-20 px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="w-8 h-8 rounded-full" style={{ background: 'var(--bg-muted)' }} />)}
          </div>
          <div className="h-96 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto">
        <StepIndicator step={step} total={3} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="seats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                    Selecciona tus asientos
                  </h3>
                  {screening && (
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      {screening.movie?.title} · {screening.room?.name} · {format(new Date(screening.startTime), "d 'de' MMMM HH:mm", { locale: es })}
                    </p>
                  )}
                  {loadingSeats ? (
                    <div className="animate-pulse space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-7 rounded" style={{ background: 'var(--bg-elevated)' }} />)}
                    </div>
                  ) : seats && seats.length > 0 ? (
                    <SeatGrid seats={seats} onSelect={(s) => isSelected(s.seatId) ? deselectSeat(s.seatId) : selectSeat(s)} isSelected={isSelected} />
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay información de asientos disponible.</p>
                  )}
                  <div className="flex justify-end mt-6">
                    <button onClick={handleNext} className="px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:brightness-110 transition-all" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="snacks" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                    Añade bocadillos
                  </h3>
                  {loadingSnacks ? (
                    <div className="animate-pulse grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />)}
                    </div>
                  ) : (
                    <SnackSelector snacks={snacks} />
                  )}
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(0)} className="px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      <ChevronLeft size={16} /> Anterior
                    </button>
                    <button onClick={handleNext} className="px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:brightness-110 transition-all" style={{ background: 'var(--accent-primary)', color: 'var(--text-on-accent)' }}>
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                    Confirmación y pago
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Función</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{screening?.movie?.title} — {screening?.room?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(new Date(screening?.startTime || ''), "d 'de' MMMM 'del' yyyy, HH:mm", { locale: es })}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Asientos ({selectedSeats.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSeats.map((s) => (
                          <span key={s.seatId} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}>
                            {s.rowLabel}{s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedSnacks.length > 0 && (
                      <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Bocadillos</p>
                        {selectedSnacks.map((item) => (
                          <div key={item.snack.id} className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span>{item.snack.name} x{item.quantity}</span>
                            <span>S/ {Number(item.snack.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <PaymentForm onPay={handlePay} loading={paymentLoading} total={total} />
                  <div className="flex justify-start mt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                      <ChevronLeft size={16} /> Anterior
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl p-4 sticky top-20" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Resumen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                  <span>Asientos ({selectedSeats.length})</span>
                  <span>S/ {(selectedSeats.length * basePrice).toFixed(2)}</span>
                </div>
                {selectedSnacks.map((item) => (
                  <div key={item.snack.id} className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{item.snack.name} x{item.quantity}</span>
                    <span>S/ {Number(item.snack.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t flex justify-between font-bold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--gold)' }}>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
