import { useEffect, type ReactNode } from 'react';
import { Toaster, toast } from 'sonner';
import { onStorageWarning } from '@/data/repositories';
import { useServiceWorkerUpdate } from '@/pwa/useServiceWorkerUpdate';

export function Providers({ children }: { children: ReactNode }) {
  useServiceWorkerUpdate();

  useEffect(() => {
    onStorageWarning({
      onQuotaExceeded: () => {
        toast.error('Não foi possível salvar localmente.', {
          description: 'O armazenamento do navegador está cheio ou indisponível.',
        });
      },
      onUnavailable: () => {
        toast.info('Modo de demonstração sem salvamento persistente.', {
          description: 'Seu navegador bloqueou o armazenamento local (modo privado?). As alterações não serão salvas ao recarregar a página.',
          duration: 8000,
        });
      },
    });
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton expand={false} />
    </>
  );
}
