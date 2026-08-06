import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cat, Dog, ImageOff, RectangleHorizontal, RectangleVertical, Square } from 'lucide-react';
import { galleryPhotoFormSchema, type GalleryPhotoFormValues } from '@/domain/schemas';
import type { AnimalType, GalleryRatio } from '@/domain/types';
import { galleryRepository } from '@/data/repositories';
import { Modal, Button, FieldWrapper, Input } from '@/design-system/primitives';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/cn';

export interface GalleryPhotoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const ANIMAL_OPTIONS: { value: AnimalType; label: string; icon: typeof Dog }[] = [
  { value: 'dog', label: 'Cão', icon: Dog },
  { value: 'cat', label: 'Gato', icon: Cat },
];

const RATIO_OPTIONS: { value: GalleryRatio; label: string; icon: typeof Square; className: string }[] = [
  { value: 'tall', label: 'Retrato', icon: RectangleVertical, className: 'aspect-[3/4]' },
  { value: 'square', label: 'Quadrado', icon: Square, className: 'aspect-square' },
  { value: 'wide', label: 'Paisagem', icon: RectangleHorizontal, className: 'aspect-[4/3]' },
];

const DEFAULT_VALUES: GalleryPhotoFormValues = {
  animalType: 'dog',
  alt: '',
  ratio: 'square',
  url: '',
};

export function GalleryPhotoFormModal({ open, onOpenChange, onSaved }: GalleryPhotoFormModalProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GalleryPhotoFormValues>({
    resolver: zodResolver(galleryPhotoFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const url = watch('url');
  const ratio = watch('ratio');

  function handleOpenChange(next: boolean) {
    if (!next) reset(DEFAULT_VALUES);
    setPreviewFailed(false);
    onOpenChange(next);
  }

  async function onSubmit(values: GalleryPhotoFormValues) {
    await galleryRepository.create({
      animalType: values.animalType,
      alt: values.alt,
      ratio: values.ratio,
      url: values.url,
      fullUrl: values.url,
    });
    notify.success('Foto adicionada à galeria.');
    onSaved();
    handleOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Nova foto"
      description="A foto aparece imediatamente na página pública da galeria."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Adicionar foto
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldWrapper label="URL da imagem" required error={errors.url?.message}>
          {({ inputId, describedBy }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              invalid={!!errors.url}
              placeholder="https://…"
              {...register('url', { onChange: () => setPreviewFailed(false) })}
            />
          )}
        </FieldWrapper>

        {/* A broken URL is the single most likely mistake here — showing the image before it's
         * saved catches it on the spot instead of after the admin leaves the page. */}
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden rounded-xl bg-cream-deep',
            RATIO_OPTIONS.find((r) => r.value === ratio)?.className ?? 'aspect-square',
          )}
        >
          {url && !previewFailed ? (
            <img
              src={url}
              alt=""
              onError={() => setPreviewFailed(true)}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-4 text-center text-xs text-muted">
              <ImageOff className="size-6" aria-hidden="true" />
              {url ? 'Não foi possível carregar esta imagem.' : 'A prévia aparece aqui.'}
            </div>
          )}
        </div>

        <FieldWrapper label="Descrição" required error={errors.alt?.message} hint="Usada como legenda e texto alternativo.">
          {({ inputId, describedBy }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              invalid={!!errors.alt}
              placeholder="Ex.: Golden retriever sorridente após o banho"
              {...register('alt')}
            />
          )}
        </FieldWrapper>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-charcoal">
            Animal <span className="text-urgent" aria-hidden="true">*</span>
          </p>
          <Controller
            control={control}
            name="animalType"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Animal">
                {ANIMAL_OPTIONS.map((opt) => {
                  const OptIcon = opt.icon;
                  const active = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        'flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold',
                        'transition-all duration-150 ease-out-soft',
                        active
                          ? 'border-teal bg-teal text-white'
                          : 'border-cream-deep bg-white text-charcoal hover:border-teal hover:text-teal-deep',
                      )}
                    >
                      <OptIcon className="size-4" aria-hidden="true" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-charcoal">Formato</p>
          <Controller
            control={control}
            name="ratio"
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Formato da imagem">
                {RATIO_OPTIONS.map((opt) => {
                  const OptIcon = opt.icon;
                  const active = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        'flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 text-xs font-bold',
                        'transition-all duration-150 ease-out-soft',
                        active
                          ? 'border-teal bg-teal text-white'
                          : 'border-cream-deep bg-white text-charcoal hover:border-teal hover:text-teal-deep',
                      )}
                    >
                      <OptIcon className="size-4" aria-hidden="true" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
