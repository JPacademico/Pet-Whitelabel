import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Camera, Cat, Dog, Images, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { AnimalType, GalleryPhoto } from '@/domain/types';
import { galleryRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import { Badge, Button, EmptyState, FilterChip, Modal, Skeleton } from '@/design-system/primitives';
import { cn } from '@/lib/cn';
import { GalleryPhotoFormModal } from './GalleryPhotoFormModal';

const RATIO_CLASS = {
  tall: 'aspect-[3/4]',
  square: 'aspect-square',
  wide: 'aspect-[4/3]',
} as const;

const ANIMAL_LABEL: Record<AnimalType, string> = { dog: 'Cão', cat: 'Gato' };
const ANIMAL_ICON: Record<AnimalType, typeof Dog> = { dog: Dog, cat: Cat };

const FILTERS: { value: AnimalType | 'all'; label: string; icon: typeof Dog }[] = [
  { value: 'all', label: 'Todas', icon: Sparkles },
  { value: 'dog', label: 'Cães', icon: Dog },
  { value: 'cat', label: 'Gatos', icon: Cat },
];

export function AdminGalleryPage() {
  const fetcher = useCallback(() => galleryRepository.list(), []);
  const { data: photos, loading, refetch } = useLiveQuery('gallery', fetcher);

  const [filter, setFilter] = useState<AnimalType | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryPhoto | null>(null);

  const filtered = useMemo(() => {
    if (!photos) return [];
    return filter === 'all' ? photos : photos.filter((p) => p.animalType === filter);
  }, [photos, filter]);

  const counts = useMemo(
    () => ({
      all: photos?.length ?? 0,
      dog: photos?.filter((p) => p.animalType === 'dog').length ?? 0,
      cat: photos?.filter((p) => p.animalType === 'cat').length ?? 0,
    }),
    [photos],
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    const removed = deleteTarget;
    await galleryRepository.remove(removed.id);
    setDeleteTarget(null);
    toast.success('Foto removida da galeria.', {
      action: {
        label: 'Desfazer',
        onClick: async () => {
          await galleryRepository.create({
            animalType: removed.animalType,
            alt: removed.alt,
            ratio: removed.ratio,
            url: removed.url,
            fullUrl: removed.fullUrl,
          });
          toast.success('Foto restaurada.');
        },
      },
      duration: 5000,
    });
  }

  return (
    <div>
      <title>Galeria — Pet Studio Admin</title>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-charcoal">Galeria</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Nova foto
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
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

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Camera className="size-10" />}
          title={photos?.length ? 'Nenhuma foto neste filtro' : 'Nenhuma foto na galeria'}
          description={
            photos?.length
              ? 'Ajuste o filtro para ver outras fotos.'
              : 'Adicione a primeira foto para que ela apareça na página pública.'
          }
          action={
            !photos?.length ? (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                Nova foto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo, index) => {
            const AnimalIcon = ANIMAL_ICON[photo.animalType];
            return (
              <div
                key={photo.id}
                style={{ '--enter-delay': `${(index % 8) * 50}ms` } as React.CSSProperties}
                className={cn(
                  'ds-admin-enter group relative overflow-hidden rounded-2xl bg-cream-deep shadow-sm',
                  RATIO_CLASS[photo.ratio],
                )}
              >
                <img
                  src={photo.url}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />

                <Badge
                  variant="neutral"
                  className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur"
                >
                  <AnimalIcon className="size-3" aria-hidden="true" />
                  {ANIMAL_LABEL[photo.animalType]}
                </Badge>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(photo)}
                  aria-label={`Remover foto: ${photo.alt}`}
                  title="Remover foto"
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-urgent opacity-0 backdrop-blur transition-opacity duration-150 hover:bg-white group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>

                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-charcoal/90 to-transparent p-2.5 text-left text-xs font-semibold text-cream transition-transform duration-300 ease-out-soft group-hover:translate-y-0">
                  {photo.alt}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {photos && photos.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <Images className="size-3.5" aria-hidden="true" />
          As fotos aparecem em /galeria na mesma ordem, mais recentes primeiro.
        </p>
      )}

      <GalleryPhotoFormModal open={formOpen} onOpenChange={setFormOpen} onSaved={refetch} />

      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remover foto"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Remover
            </Button>
          </>
        }
      >
        <p className="text-sm text-charcoal">
          Remover esta foto da galeria pública? Essa ação pode ser desfeita logo em seguida pelo
          aviso que aparecerá na tela.
        </p>
      </Modal>
    </div>
  );
}
