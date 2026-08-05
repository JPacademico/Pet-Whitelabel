import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MessageCircle, CalendarCog, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { bookingRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import type { BookingStatus, GroomingBooking } from '@/domain/types';
import { Button, DataTable, EmptyState, Badge, Modal, Input, Select } from '@/design-system/primitives';
import type { DataTableColumn } from '@/design-system/primitives/DataTable';
import { formatDisplayDate, formatDisplayDateShort, nowInBusinessTz, todayIsoDate } from '@/lib/datetime';
import { normalizeForSearch } from '@/lib/search';
import { buildWhatsappUrl, whatsappTemplates } from '@/lib/whatsapp';
import { RescheduleModal } from './RescheduleModal';

const STATUS_LABEL: Record<BookingStatus, string> = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const STATUS_VARIANT: Record<BookingStatus, 'new' | 'success' | 'out-of-stock'> = {
  scheduled: 'new',
  completed: 'success',
  cancelled: 'out-of-stock',
};

type PeriodFilter = 'all' | 'today' | 'upcoming' | 'past';

/** Persist the change first, then *offer* WhatsApp as a separate step. Opening a tab automatically
 * is hostile, and a popup blocker would make the action look like it failed.
 * See IMPLEMENTATION_PLAN.md §6.4. */
function offerWhatsapp(message: string, phone: string, toastMessage: string) {
  const url = buildWhatsappUrl(phone, message);
  toast.success(toastMessage, {
    action: {
      label: 'Avisar no WhatsApp',
      onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
    },
    duration: 6000,
  });
}

export function AdminBookingsPage() {
  const fetcher = useCallback(() => bookingRepository.list(), []);
  const { data: bookings, loading } = useLiveQuery('bookings', fetcher);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [cancelTarget, setCancelTarget] = useState<GroomingBooking | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<GroomingBooking | null>(null);

  const today = todayIsoDate(nowInBusinessTz());

  const filtered = useMemo(() => {
    if (!bookings) return [];
    const q = normalizeForSearch(search);
    return bookings
      .filter((b) => (statusFilter === 'all' ? true : b.status === statusFilter))
      .filter((b) => {
        if (periodFilter === 'today') return b.date === today;
        if (periodFilter === 'upcoming') return b.date >= today;
        if (periodFilter === 'past') return b.date < today;
        return true;
      })
      .filter((b) =>
        q ? normalizeForSearch(`${b.petName} ${b.tutorName}`).includes(q) : true,
      )
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  }, [bookings, search, statusFilter, periodFilter, today]);

  async function handleCancel() {
    if (!cancelTarget) return;
    const booking = cancelTarget;
    await bookingRepository.setStatus(booking.id, 'cancelled');
    setCancelTarget(null);
    offerWhatsapp(
      whatsappTemplates.bookingCancel({
        tutor: booking.tutorName,
        pet: booking.petName,
        date: formatDisplayDate(booking.date),
      }),
      booking.tutorWhatsapp,
      'Agendamento cancelado.',
    );
  }

  async function handleComplete(booking: GroomingBooking) {
    await bookingRepository.setStatus(booking.id, 'completed');
    offerWhatsapp(
      whatsappTemplates.bookingDone({ tutor: booking.tutorName, pet: booking.petName }),
      booking.tutorWhatsapp,
      'Agendamento concluído.',
    );
  }

  const columns: DataTableColumn<GroomingBooking>[] = [
    {
      key: 'pet',
      header: 'Pet / Tutor',
      render: (b) => (
        <div>
          <p className="font-semibold text-charcoal">
            {b.petName} <span className="text-xs text-muted">({b.animalType === 'dog' ? 'Cão' : 'Gato'})</span>
          </p>
          <p className="text-xs text-muted">{b.tutorName}</p>
        </div>
      ),
    },
    {
      key: 'when',
      header: 'Data / Hora',
      render: (b) => (
        <div>
          <p className={b.date === today ? 'font-bold text-teal-deep' : 'text-charcoal'}>
            {formatDisplayDateShort(b.date)}
            {b.date === today && ' (hoje)'}
          </p>
          <p className="text-xs text-muted">{b.time}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <Badge variant={STATUS_VARIANT[b.status]}>{STATUS_LABEL[b.status]}</Badge>,
    },
    {
      key: 'notes',
      header: 'Observações',
      hideOnMobile: true,
      render: (b) => <span className="text-xs text-muted">{b.notes || '—'}</span>,
    },
  ];

  return (
    <div>
      <title>Banho & Tosa — Pet Studio Admin</title>
      <h1 className="mb-4 font-display text-2xl font-bold text-charcoal">Agendamentos</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pet ou tutor…"
          aria-label="Buscar agendamentos"
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
          aria-label="Filtrar por status"
          className="max-w-40"
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendados</option>
          <option value="completed">Concluídos</option>
          <option value="cancelled">Cancelados</option>
        </Select>
        <Select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
          aria-label="Filtrar por período"
          className="max-w-40"
        >
          <option value="all">Todo o período</option>
          <option value="today">Hoje</option>
          <option value="upcoming">Próximos</option>
          <option value="past">Passados</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(b) => b.id}
          emptyState={
            <EmptyState
              icon={<CalendarClock className="size-10" />}
              title="Nenhum agendamento encontrado"
              description="Ajuste os filtros para ver outros agendamentos."
            />
          }
          actions={(b) => (
            <>
              <a
                href={buildWhatsappUrl(
                  b.tutorWhatsapp,
                  whatsappTemplates.bookingConfirm({
                    tutor: b.tutorName,
                    pet: b.petName,
                    date: formatDisplayDate(b.date),
                    time: b.time,
                  }),
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contatar tutor de ${b.petName}`}
                title="Contatar tutor"
                className="flex size-9 items-center justify-center rounded-full text-[#25D366] hover:bg-cream-deep"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </a>

              {b.status === 'scheduled' && (
                <>
                  <button
                    type="button"
                    onClick={() => setRescheduleTarget(b)}
                    aria-label={`Alterar data de ${b.petName}`}
                    title="Alterar data/hora"
                    className="flex size-9 items-center justify-center rounded-full text-charcoal hover:bg-cream-deep"
                  >
                    <CalendarCog className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleComplete(b)}
                    aria-label={`Marcar ${b.petName} como concluído`}
                    title="Marcar como concluído"
                    className="flex size-9 items-center justify-center rounded-full text-success hover:bg-success/10"
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelTarget(b)}
                    aria-label={`Cancelar agendamento de ${b.petName}`}
                    title="Cancelar"
                    className="flex size-9 items-center justify-center rounded-full text-urgent hover:bg-urgent/10"
                  >
                    <XCircle className="size-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </>
          )}
        />
      )}

      <Modal
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancelar agendamento"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button variant="danger" onClick={() => void handleCancel()}>
              Cancelar agendamento
            </Button>
          </>
        }
      >
        <p className="text-sm text-charcoal">
          Cancelar o agendamento de <strong>{cancelTarget?.petName}</strong> em{' '}
          <strong>{cancelTarget && formatDisplayDateShort(cancelTarget.date)}</strong> às{' '}
          <strong>{cancelTarget?.time}</strong>? O horário voltará a ficar disponível.
        </p>
      </Modal>

      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          onOpenChange={(open) => !open && setRescheduleTarget(null)}
        />
      )}
    </div>
  );
}
