import { create } from 'zustand';
import type { Seat, Snack } from '../types';

interface SnackItem {
  snack: Snack;
  quantity: number;
}

interface BookingStore {
  selectedSeats: Seat[];
  selectedSnacks: SnackItem[];
  screeningId: number | null;
  setScreeningId: (id: number) => void;
  selectSeat: (seat: Seat) => void;
  deselectSeat: (seatId: number) => void;
  isSelected: (seatId: number) => boolean;
  addSnack: (snack: Snack) => void;
  removeSnack: (snackId: number) => void;
  updateSnackQuantity: (snackId: number, qty: number) => void;
  clearBooking: () => void;
  getSeatsTotal: (basePrice: number) => number;
  getSnacksTotal: () => number;
  getTotal: (basePrice: number) => number;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  selectedSeats: [],
  selectedSnacks: [],
  screeningId: null,

  setScreeningId: (id: number) => set({ screeningId: id }),

  selectSeat: (seat: Seat) =>
    set((state) => ({
      selectedSeats: [...state.selectedSeats, seat],
    })),

  deselectSeat: (seatId: number) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((s) => s.seatId !== seatId),
    })),

  isSelected: (seatId: number) => get().selectedSeats.some((s) => s.seatId === seatId),

  addSnack: (snack: Snack) =>
    set((state) => {
      const existing = state.selectedSnacks.find((s) => s.snack.id === snack.id);
      if (existing) {
        return {
          selectedSnacks: state.selectedSnacks.map((s) =>
            s.snack.id === snack.id ? { ...s, quantity: s.quantity + 1 } : s
          ),
        };
      }
      return { selectedSnacks: [...state.selectedSnacks, { snack, quantity: 1 }] };
    }),

  removeSnack: (snackId: number) =>
    set((state) => ({
      selectedSnacks: state.selectedSnacks.filter((s) => s.snack.id !== snackId),
    })),

  updateSnackQuantity: (snackId: number, qty: number) =>
    set((state) => {
      if (qty <= 0) {
        return { selectedSnacks: state.selectedSnacks.filter((s) => s.snack.id !== snackId) };
      }
      return {
        selectedSnacks: state.selectedSnacks.map((s) =>
          s.snack.id === snackId ? { ...s, quantity: qty } : s
        ),
      };
    }),

  clearBooking: () => set({ selectedSeats: [], selectedSnacks: [], screeningId: null }),

  getSeatsTotal: (basePrice: number) => get().selectedSeats.length * basePrice,
  getSnacksTotal: () => get().selectedSnacks.reduce((sum, s) => sum + s.snack.price * s.quantity, 0),
  getTotal: (basePrice: number) => get().getSeatsTotal(basePrice) + get().getSnacksTotal(),
}));
