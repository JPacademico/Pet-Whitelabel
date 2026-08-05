import { useEffect } from 'react';
import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';

/**
 * `registerType: 'prompt'` means a new service worker waits until we tell it to activate. Auto-
 * updating would reload the page mid-form (e.g. halfway through a booking), so the new version is
 * offered as a persistent toast instead. See IMPLEMENTATION_PLAN.md §7.3.
 */
export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const updateSW = registerSW({
      onNeedRefresh() {
        toast('Nova versão disponível', {
          description: 'Atualize para carregar as novidades.',
          duration: Infinity,
          action: {
            label: 'Atualizar',
            onClick: () => void updateSW(true),
          },
        });
      },
      onOfflineReady() {
        toast.success('Pronto para uso offline. 🐾');
      },
    });
  }, []);
}
