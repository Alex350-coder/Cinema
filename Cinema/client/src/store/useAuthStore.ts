import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/endpoints';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrating: true,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('Credenciales inválidas');
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the backend call fails, clear state
    }
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const user = await authApi.updateProfile(data);
    set({ user });
  },

  hydrate: async () => {
    set({ isHydrating: true });
    try {
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isHydrating: false });
    } catch {
      set({ user: null, isAuthenticated: false, isHydrating: false });
    }
  },
}));
