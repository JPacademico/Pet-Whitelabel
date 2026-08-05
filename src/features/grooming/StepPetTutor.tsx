import { useFormContext } from 'react-hook-form';
import { Dog, Cat } from 'lucide-react';
import type { BookingFormValues } from '@/domain/schemas';
import { FieldWrapper, Input, Textarea } from '@/design-system/primitives';
import { formatBrPhone } from '@/lib/phoneMask';
import { cn } from '@/lib/cn';

export function StepPetTutor() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  const animalType = watch('animalType');
  const notes = watch('notes') ?? '';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-charcoal">
          Tipo de animal <span className="text-urgent">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['dog', 'cat'] as const).map((type) => {
            const TypeIcon = type === 'dog' ? Dog : Cat;
            const active = animalType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setValue('animalType', type, { shouldValidate: true })}
                aria-pressed={active}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border-2 py-4 font-semibold transition-colors',
                  active ? 'border-teal bg-teal/10 text-teal-deep' : 'border-cream-deep text-charcoal hover:border-teal',
                )}
              >
                <TypeIcon className="size-8" aria-hidden="true" />
                {type === 'dog' ? 'Cão' : 'Gato'}
              </button>
            );
          })}
        </div>
      </div>

      <FieldWrapper label="Nome do pet" required error={errors.petName?.message}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            invalid={!!errors.petName}
            placeholder="Ex: Thor"
            {...register('petName')}
          />
        )}
      </FieldWrapper>

      <FieldWrapper label="Seu nome" required error={errors.tutorName?.message}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            invalid={!!errors.tutorName}
            placeholder="Ex: Ana Beatriz"
            {...register('tutorName')}
          />
        )}
      </FieldWrapper>

      <FieldWrapper
        label="WhatsApp"
        required
        error={errors.tutorWhatsapp?.message}
        hint="Usaremos para confirmar o agendamento."
      >
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            invalid={!!errors.tutorWhatsapp}
            placeholder="(79) 99999-9999"
            inputMode="tel"
            {...register('tutorWhatsapp', {
              onChange: (e) => {
                e.target.value = formatBrPhone(e.target.value);
              },
            })}
          />
        )}
      </FieldWrapper>

      <FieldWrapper
        label="Observações"
        error={errors.notes?.message}
        hint={`${notes.length}/500 — alergias, preferência de tosa, etc. (opcional)`}
      >
        {({ inputId, describedBy }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            invalid={!!errors.notes}
            rows={3}
            maxLength={500}
            placeholder="Ex: alergia a shampoo com fragrância"
            {...register('notes')}
          />
        )}
      </FieldWrapper>
    </div>
  );
}
