import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import type { DateRange } from 'react-day-picker';
import type { HotelAvailability, DemandLevel } from '@/domain/types';
import { addIsoDays, nowInBusinessTz, parseIsoDate, todayIsoDate, toIsoDate } from '@/lib/datetime';
import { resolveDemandLevel } from '@/domain/availability';

export interface HotelCalendarProps {
  availability: HotelAvailability[];
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
}

/** Two months ahead, as requested — shown side by side on desktop so a whole holiday fits on screen. */
const MONTHS_AHEAD = 2;

export function HotelCalendar({ availability, range, onRangeChange }: HotelCalendarProps) {
  const now = nowInBusinessTz();
  const today = todayIsoDate(now);
  // Two calendar months of lookahead; the day limit keeps it aligned with the seeded data.
  const maxDate = addIsoDays(today, 60);

  const levelIs = (level: DemandLevel) => (date: Date) =>
    resolveDemandLevel(toIsoDate(date), availability) === level;

  return (
    <div>
      <DayPicker
        mode="range"
        locale={ptBR}
        numberOfMonths={MONTHS_AHEAD}
        selected={range}
        onSelect={onRangeChange}
        startMonth={parseIsoDate(today)}
        endMonth={parseIsoDate(maxDate)}
        disabled={[{ before: parseIsoDate(today) }, { after: parseIsoDate(maxDate) }, levelIs('closed')]}
        modifiers={{
          vacancy: levelIs('free'),
          limited: levelIs('moderate'),
          packed: levelIs('high'),
        }}
        modifiersClassNames={{
          vacancy: 'rdp-day-demand-free',
          limited: 'rdp-day-demand-moderate',
          packed: 'rdp-day-demand-high',
        }}
        className="mx-auto w-fit rounded-3xl border-2 border-cream-deep bg-white p-4 shadow-[0_16px_40px_-28px_rgba(43,42,40,0.7)]"
      />

      <ul className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-success/70" /> Vagas disponíveis
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-amber-brand/70" /> Poucas vagas
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-urgent/70" /> Quase lotado
        </li>
      </ul>
    </div>
  );
}
