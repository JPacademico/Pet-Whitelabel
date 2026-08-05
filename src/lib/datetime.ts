import { TZDate } from '@date-fns/tz';
import { format, parse, isValid, addDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SITE } from '@/config/site';
import type { IsoDate, TimeSlot } from '@/domain/types';

/**
 * All business-hours / "is it open now" logic runs against this fixed timezone, not the
 * visitor's device clock — a single physical location shouldn't appear "open" to a visitor
 * browsing from another timezone. See IMPLEMENTATION_PLAN.md §3.4.
 */
export const BUSINESS_TZ = SITE.timezone;

/** Current instant, expressed in the business timezone. Always pass this explicitly into pure
 * domain functions instead of calling `new Date()` inside them — keeps them deterministic/testable. */
export function nowInBusinessTz(): Date {
  return TZDate.tz(BUSINESS_TZ);
}

/** Parses a 'yyyy-MM-dd' string as a calendar date in the business timezone (never as UTC midnight). */
export function parseIsoDate(date: IsoDate): Date {
  return parse(date, 'yyyy-MM-dd', TZDate.tz(BUSINESS_TZ));
}

export function toIsoDate(date: Date): IsoDate {
  return format(date, 'yyyy-MM-dd');
}

export function todayIsoDate(now: Date = nowInBusinessTz()): IsoDate {
  return toIsoDate(now);
}

export function addIsoDays(date: IsoDate, days: number): IsoDate {
  return toIsoDate(addDays(parseIsoDate(date), days));
}

/** 0 = Sunday … 6 = Saturday, matching WeeklyTemplate.slotsByWeekday keys. */
export function weekdayOf(date: IsoDate): number {
  return getDay(parseIsoDate(date));
}

export function formatDisplayDate(date: IsoDate): string {
  return format(parseIsoDate(date), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatDisplayDateShort(date: IsoDate): string {
  return format(parseIsoDate(date), 'dd/MM/yyyy');
}

/** Combines an IsoDate + TimeSlot into a real Date instant in the business timezone, for comparisons. */
export function toDateTime(date: IsoDate, time: TimeSlot): Date {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', TZDate.tz(BUSINESS_TZ));
}

export function isPastSlot(date: IsoDate, time: TimeSlot, now: Date = nowInBusinessTz()): boolean {
  return toDateTime(date, time).getTime() <= now.getTime();
}

export function isValidIsoDate(value: string): value is IsoDate {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parse(value, 'yyyy-MM-dd', new Date()));
}
