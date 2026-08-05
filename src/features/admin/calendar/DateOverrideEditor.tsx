import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarOff, CalendarCheck } from 'lucide-react';
import type { DateOverride, GroomingBooking, ServiceKind } from '@/domain/types';
import { Button } from '@/design-system/primitives';
import {
  addIsoDays,
  formatDisplayDate,
  nowInBusinessTz,
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
} from '@/lib/datetime';
import { MAX_ADVANCE_DAYS } from '@/config/site';
import { notify } from '@/lib/notify';

export interface DateOverrideEditorProps {
  service: ServiceKind;
  overrides: DateOverride[];
  bookings: GroomingBooking[];
  onUpsert: (override: DateOverride) => void;
}

export function DateOverrideEditor({ service, overrides, bookings, onUpsert }: DateOverrideEditorProps) {
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const closedDates = overrides.filter((o) => o.closed).map((o) => parseIsoDate(o.date));
  const current = selectedDate ? overrides.find((o) => o.date === selectedDate) : undefined;

  function handleToggleClosed() {
    if (!selectedDate) return;
    const nextClosed = !current?.closed;

    if (nextClosed && service === 'grooming') {
      const affected = bookings.filter((b) => b.date === selectedDate && b.status === 'scheduled');
      if (affected.length > 0) {
        notify.error(
          'Existem agendamentos neste dia.',
          `Cancele ou remarque os ${affected.length} agendamento(s) antes de fechar a data.`,
        );
        return;
      }
    }

    onUpsert({ service, date: selectedDate, closed: nextClosed, slots: current?.slots ?? null });
    notify.success(nextClosed ? 'Data marcada como fechada.' : 'Data reaberta.');
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <DayPicker
        mode="single"
        locale={ptBR}
        selected={selectedDate ? parseIsoDate(selectedDate) : undefined}
        onSelect={(d) => setSelectedDate(d ? toIsoDate(d) : undefined)}
        startMonth={parseIsoDate(today)}
        endMonth={parseIsoDate(addIsoDays(today, MAX_ADVANCE_DAYS))}
        modifiers={{ closed: closedDates }}
        modifiersClassNames={{ closed: 'rdp-day-closed' }}
        className="rounded-2xl bg-white p-4 shadow-sm"
      />

      <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
        {!selectedDate ? (
          <p className="text-sm text-muted">Selecione uma data para editar as exceções.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-display font-bold text-charcoal capitalize">
              {formatDisplayDate(selectedDate)}
            </p>
            <p className="text-sm text-muted">
              {current?.closed
                ? 'Esta data está marcada como fechada.'
                : 'Esta data segue o horário padrão da semana.'}
            </p>
            <Button
              variant={current?.closed ? 'secondary' : 'danger'}
              onClick={handleToggleClosed}
              className="self-start"
            >
              {current?.closed ? (
                <>
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Reabrir esta data
                </>
              ) : (
                <>
                  <CalendarOff className="size-4" aria-hidden="true" />
                  Fechar esta data
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
