import { create } from 'zustand';
import { authRepository } from '@/data/repositories';
import type { AdminSession } from '@/domain/types';

interface AuthState {
  session: AdminSession | null;
  status: 'idle' | 'checking' | 'ready';
  checkSession: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: 'idle',

  checkSession: async () => {
    set({ status: 'checking' });
    const session = await authRepository.getSession();
    set({ session, status: 'ready' });
  },

  login: async (username, password) => {
    const result = await authRepository.login(username, password);
    if (!result.ok) return false;
    set({ session: result.value, status: 'ready' });
    return true;
  },

  logout: async () => {
    await authRepository.logout();
    set({ session: null, status: 'ready' });
  },
}));
