import type { TimeSlot } from '@/domain/types';

/** The full grid of times the admin can switch on/off for a weekday. */
export function buildSlotPalette(startHour = 7, endHour = 20, stepMinutes = 30): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let minutes = startHour * 60; minutes < endHour * 60; minutes += stepMinutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
}

export const SLOT_PALETTE = buildSlotPalette();

export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

/** Column headers — the full names don't fit seven abreast. */
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

/** Monday–Friday, the range the "copy to weekdays" shortcut writes to. */
export const BUSINESS_WEEKDAYS = [1, 2, 3, 4, 5] as const;

/** The preset a fresh weekday gets from the wand shortcut: hourly, 08:00 through 17:00. */
export const STANDARD_DAY_SLOTS: TimeSlot[] = SLOT_PALETTE.filter(
  (t) => t >= '08:00' && t <= '17:00' && t.endsWith(':00'),
);

export type SlotPeriod = 'morning' | 'afternoon' | 'evening';

export const PERIOD_LABELS: Record<SlotPeriod, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
};

/** Splitting the day into three named blocks is what turns a 26-row wall of times into something
 * an admin can scan. Boundaries match how the business talks about its own day, not the clock. */
export function periodOf(time: TimeSlot): SlotPeriod {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Compresses a day's slots into readable ranges, e.g. ['08:00–11:00', '13:00–17:00'].
 *
 * `maxGapMinutes` is a tolerance, not a step: templates in this app mix hourly and half-hourly
 * times, so anything up to an hour apart is treated as one continuous block and only a real break
 * (a lunch gap, an evening shift) splits the summary.
 */
export function summarizeSlots(slots: TimeSlot[], maxGapMinutes = 60): string[] {
  const toMinutes = (t: TimeSlot) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const sorted = [...slots].sort();
  const first = sorted[0];
  if (first === undefined) return [];

  const ranges: string[] = [];
  let start = first;
  let previous = first;

  for (const time of sorted.slice(1)) {
    if (toMinutes(time) - toMinutes(previous) > maxGapMinutes) {
      ranges.push(start === previous ? start : `${start}–${previous}`);
      start = time;
    }
    previous = time;
  }
  ranges.push(start === previous ? start : `${start}–${previous}`);
  return ranges;
}
