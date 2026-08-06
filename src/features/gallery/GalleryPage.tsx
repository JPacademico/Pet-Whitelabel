import { useCallback, useMemo, useState } from 'react';
import { Dog, Cat, Sparkles, Camera } from 'lucide-react';
import type { AnimalType } from '@/domain/types';
import { galleryRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { cn } from '@/lib/cn';
import { SectionHeading, Blob } from '@/design-system/decorative';
import { Reveal, FloatingObject } from '@/design-system/motion';
import { FilterChip, Skeleton, EmptyState } from '@/design-system/primitives';
import { GalleryLightbox } from './GalleryLightbox';

const FILTERS: { value: AnimalType | 'all'; label: string; icon: typeof Dog }[] = [
  { value: 'all', label: 'Todos', icon: Sparkles },
  { value: 'dog', label: 'Cães', icon: Dog },
  { value: 'cat', label: 'Gatos', icon: Cat },
];

const RATIO_CLASS = {
  tall: 'aspect-[3/4]',
  square: 'aspect-square',
  wide: 'aspect-[4/3]',
} as const;

const SKELETON_RATIOS = ['tall', 'square', 'wide', 'square'] as const;

export function GalleryPage() {
  const fetcher = useCallback(() => galleryRepository.list(), []);
  const { data: galleryPhotos, loading } = useLiveQuery('gallery', fetcher);

  const [filter, setFilter] = useState<AnimalType | 'all'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = useMemo(() => {
    if (!galleryPhotos) return [];
    return filter === 'all' ? galleryPhotos : galleryPhotos.filter((p) => p.animalType === filter);
  }, [galleryPhotos, filter]);

  const counts = useMemo(
    () => ({
      all: galleryPhotos?.length ?? 0,
      dog: galleryPhotos?.filter((p) => p.animalType === 'dog').length ?? 0,
      cat: galleryPhotos?.filter((p) => p.animalType === 'cat').length ?? 0,
    }),
    [galleryPhotos],
  );

  return (
    <div className="relative overflow-hidden">
      <title>Galeria — Pet Studio</title>

      <Blob className="bg-teal/10" size={380} top="6%" right="-12%" />
      <Blob className="bg-amber-brand/15" size={300} top="52%" left="-10%" delay={4} />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="relative">
          <FloatingObject
            shape="paw"
            top="-8%"
            left="86%"
            size={56}
            delay={0.5}
            className="hidden text-amber-brand/50 sm:block"
          />
          <SectionHeading
            eyebrow="nossos clientes"
            title="Galeria"
            description="Pets que já passaram por aqui — e saíram de rabo abanando."
          />
        </div>

        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                icon={f.icon}
                label={f.label}
                count={counts[f.value]}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              />
            ))}
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  'mb-4 w-full break-inside-avoid',
                  RATIO_CLASS[SKELETON_RATIOS[i % SKELETON_RATIOS.length]!],
                )}
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            icon={<Camera className="size-10" />}
            title="Nenhuma foto por aqui ainda"
            description="Em breve teremos fotos dos nossos clientes de quatro patas."
            className="mt-10"
          />
        ) : (
          <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {photos.map((photo, i) => (
              <Reveal
                key={photo.id}
                delay={(i % 4) * 90}
                direction="zoom"
                className="mb-4 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Ampliar foto: ${photo.alt}`}
                  className={cn(
                    'group relative block w-full overflow-hidden rounded-2xl bg-cream-deep shadow-[0_10px_30px_-18px_rgba(43,42,40,0.6)]',
                    'transition-transform duration-300 ease-out-soft hover:-translate-y-1.5 hover:rotate-[0.6deg]',
                    RATIO_CLASS[photo.ratio],
                  )}
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-110"
                  />
                  {/* Caption slides up on hover instead of permanently covering the photo. */}
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-charcoal/90 to-transparent p-3 text-left text-xs font-semibold text-cream transition-transform duration-300 ease-out-soft group-hover:translate-y-0">
                    <Camera className="mr-1 inline size-3.5" aria-hidden="true" />
                    {photo.alt}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          photos={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
