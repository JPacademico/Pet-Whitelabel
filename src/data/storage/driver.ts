import type { z } from 'zod';

// localStorage is untrusted input: it can be hand-edited, left over from an older build, or
// simply unavailable (Safari private mode gives it a 0-byte quota). Every read is validated
// with Zod and every write is defensive. See IMPLEMENTATION_PLAN.md §3.3.

export const STORAGE_PREFIX = 'petstudio:v1:';

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

function detectStorage(): { store: KeyValueStore; isPersistent: boolean } {
  try {
    const probeKey = `${STORAGE_PREFIX}__probe__`;
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return { store: window.localStorage, isPersistent: true };
  } catch {
    return { store: new MemoryStore(), isPersistent: false };
  }
}

const detected = detectStorage();

/** False when localStorage is unavailable (private browsing, disabled cookies, cross-origin
 * iframe) and the app has silently fallen back to an in-memory store for this tab/session. */
export const isStoragePersistent = detected.isPersistent;

let notifiedFallback = false;
let quotaWarningHandler: (() => void) | null = null;
let unavailableWarningHandler: (() => void) | null = null;

/** Registered once by the app shell (Sonner isn't available this low in the stack). */
export function onStorageWarning(handlers: {
  onQuotaExceeded: () => void;
  onUnavailable: () => void;
}) {
  quotaWarningHandler = handlers.onQuotaExceeded;
  unavailableWarningHandler = handlers.onUnavailable;
  if (!detected.isPersistent && !notifiedFallback) {
    notifiedFallback = true;
    unavailableWarningHandler?.();
  }
}

export function readCollection<T>(key: string, schema: z.ZodType<T[]>): T[] {
  try {
    const raw = detected.store.getItem(STORAGE_PREFIX + key);
    if (!raw) return [];
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn(`[storage] invalid data at "${key}", falling back to empty`, parsed.error);
      return [];
    }
    return parsed.data;
  } catch (e) {
    console.warn(`[storage] failed to read "${key}"`, e);
    return [];
  }
}

export function writeCollection<T>(key: string, value: T[]): void {
  try {
    detected.store.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] failed to write "${key}"`, e);
    quotaWarningHandler?.();
  }
}

export function readValue<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = detected.store.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeValue<T>(key: string, value: T): void {
  try {
    detected.store.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] failed to write "${key}"`, e);
    quotaWarningHandler?.();
  }
}

export function removeValue(key: string): void {
  detected.store.removeItem(STORAGE_PREFIX + key);
}

export function readRawSchemaVersion(): number {
  try {
    const raw = detected.store.getItem(`${STORAGE_PREFIX}schema-version`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function writeSchemaVersion(version: number): void {
  detected.store.setItem(`${STORAGE_PREFIX}schema-version`, String(version));
}

/** Wipes every key under the app's storage namespace. Used by the admin "reset demo data" action
 * and by failed migrations. */
export function clearAllStorage(keys: string[]): void {
  for (const key of keys) removeValue(key);
  removeValue('schema-version');
}
