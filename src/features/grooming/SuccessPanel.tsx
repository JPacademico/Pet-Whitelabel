import { CalendarPlus, MessageCircle, PartyPopper } from 'lucide-react';
import type { GroomingBooking } from '@/domain/types';
import { Button } from '@/design-system/primitives';
import { formatDisplayDate } from '@/lib/datetime';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';
import { downloadBookingIcs } from '@/lib/ics';
import { SITE } from '@/config/site';

export function SuccessPanel({ booking, onNewBooking }: { booking: GroomingBooking; onNewBooking: () => void }) {
  const whatsappUrl = buildWhatsappUrl(
    SITE.whatsapp,
    whatsappTemplates.bookingConfirm({
      tutor: booking.tutorName,
      pet: booking.petName,
      date: formatDisplayDate(booking.date),
      time: booking.time,
    }),
  );

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm">
      <PartyPopper className="size-12 text-amber-brand" aria-hidden="true" />
      <h2 className="font-display text-2xl font-bold text-charcoal">Agendamento confirmado!</h2>
      <p className="text-muted">
        {booking.petName} está agendado(a) para{' '}
        <strong className="text-charcoal">{formatDisplayDate(booking.date)}</strong> às{' '}
        <strong className="text-charcoal">{booking.time}</strong>.
      </p>

      <div className="mt-2 flex w-full flex-col gap-3">
        <Button asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" aria-hidden="true" />
            Enviar confirmação no WhatsApp
          </a>
        </Button>
        <Button
          variant="secondary"
          onClick={() => downloadBookingIcs({ petName: booking.petName, date: booking.date, time: booking.time })}
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          Adicionar ao calendário
        </Button>
        <Button variant="ghost" onClick={onNewBooking}>
          Fazer outro agendamento
        </Button>
      </div>
    </div>
  );
}
