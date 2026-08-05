import { adminSessionSchema } from '@/domain/schemas';
import { readValue, removeValue, writeValue } from '@/data/storage/driver';
import { STORAGE_KEYS } from '@/data/storage/keys';
import { simulatedLatency } from '@/lib/delay';
import { err, ok, type AdminSession } from '@/domain/types';
import type { AuthRepository } from '@/data/ports';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Frontend-simulated auth — this proves the flow, it is not security. Real credentials never
// belong here; only the demo values below (from env, never hardcoded secrets).
// See IMPLEMENTATION_PLAN.md §0.4 and §6.1.
const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME || 'admin';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'petstudio';

export const localAuthRepository: AuthRepository = {
  async login(username, password) {
    await simulatedLatency();
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return err('INVALID_CREDENTIALS');
    }
    const session: AdminSession = {
      user: username,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    writeValue(STORAGE_KEYS.session, session);
    return ok(session);
  },

  async logout() {
    await simulatedLatency();
    removeValue(STORAGE_KEYS.session);
  },

  async getSession() {
    const session = readValue(STORAGE_KEYS.session, adminSessionSchema);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      removeValue(STORAGE_KEYS.session);
      return null;
    }
    return session;
  },
};
