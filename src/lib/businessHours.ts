import { SITE } from '@/config/site';

export interface HourRange {
  open: string;
  close: string;
}

export interface HoursGroup {
  /** Weekday indices covered by this group, in display order (Mon..Sun). */
  weekdays: number[];
  label: string;
  ranges: HourRange[];
  closed: boolean;
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

/** Monday-first display order — how opening hours are conventionally read in pt-BR. */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function rangesKey(ranges: readonly HourRange[]): string {
  return ranges.map((r) => `${r.open}-${r.close}`).join('|');
}

function labelFor(weekdays: number[]): string {
  if (weekdays.length === 1) return WEEKDAY_NAMES[weekdays[0]!]!;

  // Consecutive in display order collapses to a range ("Seg a Sex"); otherwise list them.
  const positions = weekdays.map((d) => DISPLAY_ORDER.indexOf(d));
  const isConsecutive = positions.every((p, i) => i === 0 || p === positions[i - 1]! + 1);

  // Two days read better joined by "e"; three or more as a span.
  if (weekdays.length === 2) {
    const joiner = isConsecutive ? ' e ' : ', ';
    return weekdays.map((d) => WEEKDAY_SHORT[d]).join(joiner);
  }
  if (isConsecutive) {
    return `${WEEKDAY_SHORT[weekdays[0]!]} a ${WEEKDAY_SHORT[weekdays[weekdays.length - 1]!]}`;
  }
  return weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ');
}

/**
 * Collapses the per-weekday hours into groups that share identical opening times, so the UI shows
 * "Seg a Sex — 08:00–18:00" instead of listing seven near-identical lines.
 * Only *adjacent* days (in display order) merge, so a midweek exception stays visible.
 */
export function groupBusinessHours(
  hours: Record<number, readonly HourRange[]> = SITE.hours,
): HoursGroup[] {
  const groups: HoursGroup[] = [];

  for (const weekday of DISPLAY_ORDER) {
    const ranges = [...(hours[weekday] ?? [])];
    const key = rangesKey(ranges);
    const previous = groups[groups.length - 1];

    if (previous && rangesKey(previous.ranges) === key) {
      previous.weekdays.push(weekday);
      previous.label = labelFor(previous.weekdays);
      continue;
    }

    groups.push({
      weekdays: [weekday],
      label: labelFor([weekday]),
      ranges,
      closed: ranges.length === 0,
    });
  }

  return groups;
}

export function formatRanges(ranges: readonly HourRange[]): string {
  if (ranges.length === 0) return 'Fechado';
  return ranges.map((r) => `${r.open} às ${r.close}`).join(' e ');
}
