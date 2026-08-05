import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingFormSchema, type BookingFormValues } from '@/domain/schemas';
import { bookingRepository } from '@/data/repositories';
import { Button } from '@/design-system/primitives';
import { SectionHeading, Blob } from '@/design-system/decorative';
import { FloatingObject } from '@/design-system/motion';
import { notify } from '@/lib/notify';
import { StepPetTutor } from './StepPetTutor';
import { StepSchedule } from './StepSchedule';
import { ConfirmationModal } from './ConfirmationModal';
import { SuccessPanel } from './SuccessPanel';
import type { GroomingBooking } from '@/domain/types';

type Step = 1 | 2;

const STEP_FIELDS: Record<Step, (keyof BookingFormValues)[]> = {
  1: ['animalType', 'petName', 'tutorName', 'tutorWhatsapp', 'notes'],
  2: ['date', 'time'],
};

export function GroomingPage() {
  const [step, setStep] = useState<Step>(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<GroomingBooking | null>(null);

  const methods = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      animalType: 'dog',
      petName: '',
      tutorName: '',
      tutorWhatsapp: '',
      notes: '',
      date: '',
      time: '',
    },
    mode: 'onBlur',
  });

  const { trigger, handleSubmit, getValues, reset } = methods;

  async function goToStep2() {
    const valid = await trigger(STEP_FIELDS[1]);
    if (valid) setStep(2);
  }

  async function openConfirmation() {
    const valid = await trigger(STEP_FIELDS[2]);
    if (valid) setConfirmOpen(true);
  }

  async function onConfirm() {
    setSubmitting(true);
    const values = getValues();
    const result = await bookingRepository.create({
      petName: values.petName,
      animalType: values.animalType,
      tutorName: values.tutorName,
      tutorWhatsapp: values.tutorWhatsapp.replace(/\D/g, ''),
      notes: values.notes ?? '',
      date: values.date,
      time: values.time,
    });
    setSubmitting(false);

    if (!result.ok) {
      setConfirmOpen(false);
      if (result.error === 'SLOT_TAKEN') {
        notify.error('Esse horário acabou de ser preenchido.', 'Escolha outro horário disponível.');
        methods.setValue('time', '');
      } else {
        notify.error('Não foi possível confirmar o agendamento.', 'Escolha outro dia ou horário.');
      }
      return;
    }

    setConfirmOpen(false);
    setConfirmedBooking(result.value);
    notify.success('Agendamento confirmado!');
  }

  function handleNewBooking() {
    reset();
    setConfirmedBooking(null);
    setStep(1);
  }

  if (confirmedBooking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <title>Agendamento confirmado — Pet Studio</title>
        <SuccessPanel booking={confirmedBooking} onNewBooking={handleNewBooking} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="relative mx-auto max-w-2xl overflow-visible px-4 py-12 sm:px-6">
        <title>Banho & Tosa — Pet Studio</title>
        <Blob className="bg-teal/10" size={340} top="2%" left="-24%" />
        <Blob className="bg-amber-brand/15" size={280} top="60%" right="-22%" delay={4} />

        <div className="relative">
          <FloatingObject
            shape="bone"
            top="-4%"
            left="-6%"
            size={54}
            interactive
            label="Ossinho saltitante"
            className="hidden text-amber-brand sm:block"
          />
          <FloatingObject
            shape="yarn"
            top="4%"
            left="94%"
            size={48}
            delay={1.3}
            interactive
            label="Novelo de lã"
            className="hidden text-teal sm:block"
          />
          <SectionHeading
            eyebrow="hora do banho"
            title="Agende o Banho & Tosa"
            description={`Passo ${step} de 2 — leva menos de um minuto.`}
          />
          <div className="mx-auto mt-4 flex max-w-40 gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-teal' : 'bg-cream-deep'}`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-teal' : 'bg-cream-deep'}`}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit(() => {
            void openConfirmation();
          })}
          className="relative mt-8 rounded-3xl border-2 border-cream-deep bg-white/80 p-5 backdrop-blur sm:p-7"
        >
          {step === 1 ? <StepPetTutor /> : <StepSchedule />}

          <div className="mt-6 flex justify-between gap-3">
            {step === 2 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                Voltar
              </Button>
            ) : (
              <span />
            )}

            {step === 1 ? (
              <Button type="button" onClick={() => void goToStep2()}>
                Continuar
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="submit">Agendar</Button>
            )}
          </div>
        </form>

        <ConfirmationModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          values={getValues()}
          submitting={submitting}
          onConfirm={() => void onConfirm()}
        />
      </div>
    </FormProvider>
  );
}
