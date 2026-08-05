import { MAX_ADVANCE_DAYS, MIN_LEAD_HOURS } from '@/config/site';
import { addIsoDays, isPastSlot, todayIsoDate, toDateTime, weekdayOf } from '@/lib/datetime';
import type {
  ClinicDemand,
  DateOverride,
  DemandLevel,
  GroomingBooking,
  IsoDate,
  ResolvedSlot,
  ServiceKind,
  TimeSlot,
  WeeklyTemplate,
} from './types';

/**
 * Pure domain logic for scheduling availability — no I/O, no React, `now` always injected.
 * This is the highest-risk area of the app (timezone bugs, double-booking); keep it 100% testable.
 */

function findOverride(
  overrides: DateOverride[],
  service: ServiceKind,
  date: IsoDate,
): DateOverride | undefined {
  return overrides.find((o) => o.service === service && o.date === date);
}

/** The raw slot times for a date, before booking/lead-time state is applied. */
export function baseSlotsForDate(
  date: IsoDate,
  template: WeeklyTemplate,
  overrides: DateOverride[],
): TimeSlot[] {
  const override = findOverride(overrides, template.service, date);
  if (override?.closed) return [];
  if (override?.slots) return override.slots;
  return template.slotsByWeekday[weekdayOf(date)] ?? [];
}

/** A slot becomes unbookable inside the minimum lead time even though it isn't technically past yet. */
function isWithinLeadTime(date: IsoDate, time: TimeSlot, now: Date): boolean {
  if (isPastSlot(date, time, now)) return true;
  const leadMs = MIN_LEAD_HOURS * 60 * 60 * 1000;
  return toDateTime(date, time).getTime() - now.getTime() < leadMs;
}

export function resolveSlots(
  date: IsoDate,
  template: WeeklyTemplate,
  overrides: DateOverride[],
  bookings: GroomingBooking[],
  now: Date,
): ResolvedSlot[] {
  const slots = baseSlotsForDate(date, template, overrides);
  const bookedTimes = new Set(
    bookings.filter((b) => b.date === date && b.status === 'scheduled').map((b) => b.time),
  );

  return slots
    .slice()
    .sort()
    .map((time) => {
      if (bookedTimes.has(time)) return { time, state: 'booked' as const };
      if (isWithinLeadTime(date, time, now)) return { time, state: 'past' as const };
      return { time, state: 'free' as const };
    });
}

/** Whether a calendar day should even be selectable in the booking UI (within the advance window,
 * not entirely closed/booked-out). Individual slot bookability is still resolved via resolveSlots. */
export function isDateSelectable(
  date: IsoDate,
  template: WeeklyTemplate,
  overrides: DateOverride[],
  now: Date,
): boolean {
  const today = todayIsoDate(now);
  const maxDate = addIsoDays(today, MAX_ADVANCE_DAYS);
  if (date < today || date > maxDate) return false;
  return baseSlotsForDate(date, template, overrides).length > 0;
}

export function hasFreeSlot(
  date: IsoDate,
  template: WeeklyTemplate,
  overrides: DateOverride[],
  bookings: GroomingBooking[],
  now: Date,
): boolean {
  return resolveSlots(date, template, overrides, bookings, now).some((s) => s.state === 'free');
}

/** Bookings that would become orphaned if the given slot were removed from availability —
 * used by the admin calendar editor to block destructive edits. See IMPLEMENTATION_PLAN.md §6.5. */
export function bookingsAffectedBySlotRemoval(
  date: IsoDate,
  time: TimeSlot,
  bookings: GroomingBooking[],
): GroomingBooking[] {
  return bookings.filter((b) => b.date === date && b.time === time && b.status === 'scheduled');
}

/**
 * Bookings that would be orphaned by removing `time` from the weekly template for `weekday`.
 * Only future scheduled bookings count, and dates carrying an explicit slot override are excluded —
 * an override supersedes the template, so the template edit doesn't reach them.
 */
export function bookingsAffectedByTemplateSlotRemoval(
  weekday: number,
  time: TimeSlot,
  bookings: GroomingBooking[],
  overrides: DateOverride[],
  now: Date,
): GroomingBooking[] {
  const today = todayIsoDate(now);
  const datesWithExplicitSlots = new Set(
    overrides.filter((o) => o.service === 'grooming' && o.slots !== null).map((o) => o.date),
  );

  return bookings.filter(
    (b) =>
      b.status === 'scheduled' &&
      b.date >= today &&
      b.time === time &&
      weekdayOf(b.date) === weekday &&
      !datesWithExplicitSlots.has(b.date),
  );
}

export function resolveDemandLevel(date: IsoDate, demands: ClinicDemand[]): DemandLevel {
  return demands.find((d) => d.date === date)?.level ?? 'free';
}
