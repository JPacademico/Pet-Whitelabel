import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryPhoto } from '@/domain/types';

export interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function GalleryLightbox({ photos, index, onIndexChange, onClose }: GalleryLightboxProps) {
  const photo = photos[index];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + photos.length) % photos.length);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, photos.length, onIndexChange]);

  if (!photo) return null;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/90" />
        <Dialog.Content
          className="fixed inset-0 z-[51] flex items-center justify-center p-4"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{photo.alt}</Dialog.Title>
          <Dialog.Close asChild>
            <button
              aria-label="Fechar"
              className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </Dialog.Close>

          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
            className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>

          <img
            src={photo.fullUrl}
            alt={photo.alt}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />

          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => onIndexChange((index + 1) % photos.length)}
            className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
