import { lazy, Suspense, useState } from 'react';
import { Download } from 'lucide-react';
import { useInstallPrompt } from './useInstallPrompt';
import { cn } from '@/lib/cn';

const IosInstallModal = lazy(() => import('./IosInstallModal'));

export function InstallButton({ className, showLabel }: { className?: string; showLabel?: boolean }) {
  const { canInstall, install, isIos, hasNativePrompt } = useInstallPrompt();
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  if (!canInstall) return null;

  return (
    <>
      <button
        type="button"
        onClick={hasNativePrompt ? () => void install() : () => setShowIosInstructions(true)}
        aria-label="Instalar aplicativo"
        title="Instalar aplicativo"
        className={
          className ??
          'inline-flex size-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-cream-deep'
        }
      >
        <Download className={cn("size-5", showLabel && "shrink-0")} aria-hidden="true" />
        {showLabel && <span>Instalar aplicativo</span>}
      </button>

      {isIos && showIosInstructions && (
        <Suspense fallback={null}>
          <IosInstallModal open={showIosInstructions} onOpenChange={setShowIosInstructions} />
        </Suspense>
      )}
    </>
  );
}
