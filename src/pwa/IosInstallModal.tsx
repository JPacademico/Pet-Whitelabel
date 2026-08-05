import { Share, SquarePlus } from 'lucide-react';
import { Modal } from '@/design-system/primitives/Modal';

// Split into its own lazily-loaded module so Radix Dialog (and its scroll-lock dependency tree)
// stays out of the initial bundle — only iOS Safari visitors who tap "install" ever load it.
export default function IosInstallModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Instalar o Pet Studio"
      description="No Safari, siga estes passos:"
      size="sm"
    >
      <ol className="flex flex-col gap-4 text-sm text-charcoal">
        <li className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream-deep font-bold">
            1
          </span>
          <span>
            Toque no ícone de compartilhar <Share className="inline size-4" aria-hidden="true" /> na
            barra do navegador.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream-deep font-bold">
            2
          </span>
          <span>
            Escolha <strong>"Adicionar à Tela de Início"</strong>{' '}
            <SquarePlus className="inline size-4" aria-hidden="true" />.
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream-deep font-bold">
            3
          </span>
          <span>Pronto! O Pet Studio aparecerá na sua tela inicial.</span>
        </li>
      </ol>
    </Modal>
  );
}
