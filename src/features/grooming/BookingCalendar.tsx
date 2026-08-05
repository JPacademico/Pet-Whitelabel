import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import type { DateOverride, GroomingBooking, IsoDate, WeeklyTemplate } from '@/domain/types';
import { addIsoDays, nowInBusinessTz, parseIsoDate, todayIsoDate, toIsoDate } from '@/lib/datetime';
import { hasFreeSlot, isDateSelectable } from '@/domain/availability';
import { MAX_ADVANCE_DAYS } from '@/config/site';

export interface BookingCalendarProps {
  template: WeeklyTemplate;
  overrides: DateOverride[];
  bookings: GroomingBooking[];
  selected: IsoDate | undefined;
  onSelect: (date: IsoDate | undefined) => void;
}

export function BookingCalendar({ template, overrides, bookings, selected, onSelect }: BookingCalendarProps) {
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  const maxDate = addIsoDays(today, MAX_ADVANCE_DAYS);

  // "Lotado" (fully booked) is a visual hint, not a hard block — the slot grid still shows the
  // user why nothing is bookable. Computed once per render for the whole advance window.
  const fullyBookedDates = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i <= MAX_ADVANCE_DAYS; i++) {
      const date = addIsoDays(today, i);
      if (isDateSelectable(date, template, overrides, now) && !hasFreeSlot(date, template, overrides, bookings, now)) {
        set.add(date);
      }
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, overrides, bookings, today]);

  return (
    <DayPicker
      mode="single"
      locale={ptBR}
      selected={selected ? parseIsoDate(selected) : undefined}
      onSelect={(date) => onSelect(date ? toIsoDate(date) : undefined)}
      startMonth={parseIsoDate(today)}
      endMonth={parseIsoDate(maxDate)}
      disabled={(date) => !isDateSelectable(toIsoDate(date), template, overrides, now)}
      modifiers={{ full: (date) => fullyBookedDates.has(toIsoDate(date)) }}
      modifiersClassNames={{ full: 'rdp-day-full' }}
      className="rounded-2xl bg-white p-4 shadow-sm"
    />
  );
}
