import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Capture the event globally immediately when the script runs.
// This prevents missing the event if it fires before React components mount.
let globalDeferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(e: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferred = e as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener(globalDeferred));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferred = null;
    listeners.forEach((listener) => listener(null));
  });
}

function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

/**
 * `beforeinstallprompt` only fires on Chromium — iOS Safari has no programmatic install prompt at
 * all, so on iOS the same header button opens a manual-instructions modal instead.
 * See IMPLEMENTATION_PLAN.md §7.2.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(globalDeferred);
  const [installed, setInstalled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    // If the event fired before this component mounted, we already have it in state via initial value.
    // Here we just subscribe to future updates.
    const listener = (e: BeforeInstallPromptEvent | null) => setDeferred(e);
    listeners.add(listener);
    
    const onInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', onInstalled);
    
    return () => {
      listeners.delete(listener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const isIos = isIosSafari();
  const canInstall = (!!deferred || isIos) && !installed;

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') toast.success('Pet Studio instalado! 🐾');
    globalDeferred = null;
    listeners.forEach(l => l(null));
  }, [deferred]);

  return { canInstall, install, installed, isIos, hasNativePrompt: !!deferred };
}
