import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { GroomingBooking } from '@/domain/types';
import { bookingRepository } from '@/data/repositories';
import { Modal, Button } from '@/design-system/primitives';
import { BookingCalendar } from '@/features/grooming/BookingCalendar';
import { SlotGrid } from '@/features/grooming/SlotGrid';
import { useGroomingAvailability } from '@/features/grooming/useGroomingAvailability';
import { resolveSlots } from '@/domain/availability';
import { nowInBusinessTz, formatDisplayDate } from '@/lib/datetime';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';
import { SITE } from '@/config/site';

export interface RescheduleModalProps {
  booking: GroomingBooking;
  onOpenChange: (open: boolean) => void;
}

export function RescheduleModal({ booking, onOpenChange }: RescheduleModalProps) {
  const { template, overrides, bookings, loading } = useGroomingAvailability();
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const slots = useMemo(() => {
    if (!date) return [];
    return resolveSlots(date, template, overrides, bookings, nowInBusinessTz());
  }, [date, template, overrides, bookings]);

  async function handleConfirm() {
    if (!time) return;
    setSubmitting(true);
    const result = await bookingRepository.reschedule(booking.id, date, time);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(
        result.error === 'SLOT_TAKEN' ? 'Esse horário já está ocupado.' : 'Não foi possível remarcar.',
      );
      return;
    }

    onOpenChange(false);
    const whatsappUrl = buildWhatsappUrl(
      SITE.whatsapp,
      whatsappTemplates.bookingReschedule({
        tutor: booking.tutorName,
        pet: booking.petName,
        date: formatDisplayDate(date),
        time,
      }),
    );
    toast.success('Agendamento remarcado.', {
      action: { label: 'Avisar no WhatsApp', onClick: () => window.open(whatsappUrl, '_blank', 'noopener,noreferrer') },
      duration: 6000,
    });
  }

  return (
    <Modal
      open
      onOpenChange={onOpenChange}
      title={`Alterar data/hora — ${booking.petName}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={submitting} disabled={!time}>
            Confirmar nova data
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <BookingCalendar
          template={template}
          overrides={overrides}
          bookings={bookings.filter((b) => b.id !== booking.id)}
          selected={date}
          onSelect={(d) => {
            setDate(d ?? booking.date);
            setTime(undefined);
          }}
        />
        <SlotGrid slots={slots} selected={time} loading={loading} onSelect={setTime} />
      </div>
    </Modal>
  );
}
