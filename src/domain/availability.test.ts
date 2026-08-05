import { describe, expect, it } from 'vitest';
import {
  baseSlotsForDate,
  bookingsAffectedBySlotRemoval,
  bookingsAffectedByTemplateSlotRemoval,
  hasFreeSlot,
  isDateSelectable,
  resolveDemandLevel,
  resolveSlots,
} from './availability';
import type { DateOverride, GroomingBooking, WeeklyTemplate } from './types';
import { toDateTime } from '@/lib/datetime';

// A fixed Monday, so weekday-based template lookups are deterministic across runs.
const MONDAY = '2026-08-10';
const TUESDAY = '2026-08-11';
const SUNDAY = '2026-08-09';

const template: WeeklyTemplate = {
  service: 'grooming',
  slotsByWeekday: {
    0: [],
    1: ['08:00', '09:00', '10:00'],
    2: ['08:00', '09:00', '10:00'],
    3: ['08:00', '09:00', '10:00'],
    4: ['08:00', '09:00', '10:00'],
    5: ['08:00', '09:00', '10:00'],
    6: ['08:00'],
  },
};

function booking(overrides: Partial<GroomingBooking>): GroomingBooking {
  return {
    id: 'b1',
    petName: 'Rex',
    animalType: 'dog',
    tutorName: 'Tutor',
    tutorWhatsapp: '5599900000000',
    notes: '',
    date: MONDAY,
    time: '09:00',
    status: 'scheduled',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// "now" well before any slot on MONDAY, so lead-time rules don't interfere with basic tests.
const earlyNow = toDateTime(MONDAY, '00:00');

describe('baseSlotsForDate', () => {
  it('returns the template slots for the weekday when there is no override', () => {
    expect(baseSlotsForDate(MONDAY, template, [])).toEqual(['08:00', '09:00', '10:00']);
  });

  it('returns an empty list for a fully-closed weekday', () => {
    expect(baseSlotsForDate(SUNDAY, template, [])).toEqual([]);
  });

  it('is overridden by a closed date override, even on a normally-open weekday', () => {
    const overrides: DateOverride[] = [{ service: 'grooming', date: MONDAY, closed: true, slots: null }];
    expect(baseSlotsForDate(MONDAY, template, overrides)).toEqual([]);
  });

  it('is overridden by explicit slots on a date override', () => {
    const overrides: DateOverride[] = [
      { service: 'grooming', date: MONDAY, closed: false, slots: ['13:00', '14:00'] },
    ];
    expect(baseSlotsForDate(MONDAY, template, overrides)).toEqual(['13:00', '14:00']);
  });
});

describe('resolveSlots', () => {
  it('marks a slot with a scheduled booking as booked', () => {
    const bookings = [booking({ date: MONDAY, time: '09:00', status: 'scheduled' })];
    const result = resolveSlots(MONDAY, template, [], bookings, earlyNow);
    expect(result.find((s) => s.time === '09:00')?.state).toBe('booked');
  });

  it('does not treat a cancelled booking as occupying the slot', () => {
    const bookings = [booking({ date: MONDAY, time: '09:00', status: 'cancelled' })];
    const result = resolveSlots(MONDAY, template, [], bookings, earlyNow);
    expect(result.find((s) => s.time === '09:00')?.state).toBe('free');
  });

  it('marks a slot inside the minimum lead time as past/unbookable', () => {
    // "now" is 08:30 on the same day the slot list includes 09:00 (< 2h lead time away).
    const now = toDateTime(MONDAY, '08:30');
    const result = resolveSlots(MONDAY, template, [], [], now);
    expect(result.find((s) => s.time === '09:00')?.state).toBe('past');
    // 10:00 is exactly on the 2h boundary from 08:30 → still within lead time.
    expect(result.find((s) => s.time === '10:00')?.state).toBe('past');
  });

  it('leaves slots comfortably beyond the lead time as free', () => {
    const now = toDateTime(MONDAY, '00:00');
    const result = resolveSlots(MONDAY, template, [], [], now);
    expect(result.every((s) => s.state === 'free')).toBe(true);
  });

  it('returns slots sorted chronologically regardless of template order', () => {
    const shuffled: WeeklyTemplate = {
      service: 'grooming',
      slotsByWeekday: { 1: ['10:00', '08:00', '09:00'] },
    };
    const result = resolveSlots(MONDAY, shuffled, [], [], earlyNow);
    expect(result.map((s) => s.time)).toEqual(['08:00', '09:00', '10:00']);
  });
});

describe('isDateSelectable', () => {
  it('rejects dates in the past', () => {
    const now = toDateTime(TUESDAY, '00:00');
    expect(isDateSelectable(MONDAY, template, [], now)).toBe(false);
  });

  it('rejects dates beyond the max advance window', () => {
    const now = toDateTime(MONDAY, '00:00');
    expect(isDateSelectable('2027-01-01', template, [], now)).toBe(false);
  });

  it('rejects a day with no configured slots (e.g. Sunday)', () => {
    const now = toDateTime(MONDAY, '00:00');
    expect(isDateSelectable(SUNDAY, template, [], now)).toBe(false);
  });

  it('accepts an open day within the advance window', () => {
    const now = toDateTime(MONDAY, '00:00');
    expect(isDateSelectable(TUESDAY, template, [], now)).toBe(true);
  });
});

describe('hasFreeSlot', () => {
  it('is false when every slot is booked', () => {
    const bookings = ['08:00', '09:00', '10:00'].map((time) => booking({ date: MONDAY, time }));
    expect(hasFreeSlot(MONDAY, template, [], bookings, earlyNow)).toBe(false);
  });

  it('is true when at least one slot is free', () => {
    const bookings = [booking({ date: MONDAY, time: '08:00' })];
    expect(hasFreeSlot(MONDAY, template, [], bookings, earlyNow)).toBe(true);
  });
});

describe('bookingsAffectedBySlotRemoval', () => {
  it('finds only scheduled bookings matching the exact date/time', () => {
    const bookings = [
      booking({ id: 'a', date: MONDAY, time: '09:00', status: 'scheduled' }),
      booking({ id: 'b', date: MONDAY, time: '09:00', status: 'cancelled' }),
      booking({ id: 'c', date: MONDAY, time: '10:00', status: 'scheduled' }),
    ];
    const affected = bookingsAffectedBySlotRemoval(MONDAY, '09:00', bookings);
    expect(affected.map((b) => b.id)).toEqual(['a']);
  });
});

describe('bookingsAffectedByTemplateSlotRemoval', () => {
  // now = the Monday itself, so MONDAY and the following Monday are both "future".
  const now = toDateTime(MONDAY, '00:00');
  const NEXT_MONDAY = '2026-08-17';
  const LAST_MONDAY = '2026-08-03';

  it('finds future scheduled bookings on the same weekday and time', () => {
    const bookings = [
      booking({ id: 'a', date: MONDAY, time: '09:00' }),
      booking({ id: 'b', date: NEXT_MONDAY, time: '09:00' }),
    ];
    const affected = bookingsAffectedByTemplateSlotRemoval(1, '09:00', bookings, [], now);
    expect(affected.map((b) => b.id).sort()).toEqual(['a', 'b']);
  });

  it('ignores bookings in the past', () => {
    const bookings = [booking({ id: 'old', date: LAST_MONDAY, time: '09:00' })];
    expect(bookingsAffectedByTemplateSlotRemoval(1, '09:00', bookings, [], now)).toEqual([]);
  });

  it('ignores bookings on a different weekday', () => {
    const bookings = [booking({ id: 'tue', date: TUESDAY, time: '09:00' })];
    expect(bookingsAffectedByTemplateSlotRemoval(1, '09:00', bookings, [], now)).toEqual([]);
  });

  it('ignores cancelled bookings', () => {
    const bookings = [booking({ id: 'x', date: MONDAY, time: '09:00', status: 'cancelled' })];
    expect(bookingsAffectedByTemplateSlotRemoval(1, '09:00', bookings, [], now)).toEqual([]);
  });

  it('ignores dates whose slots are set by an explicit override, since the template does not reach them', () => {
    const bookings = [booking({ id: 'a', date: MONDAY, time: '09:00' })];
    const overrides: DateOverride[] = [
      { service: 'grooming', date: MONDAY, closed: false, slots: ['09:00', '10:00'] },
    ];
    expect(bookingsAffectedByTemplateSlotRemoval(1, '09:00', bookings, overrides, now)).toEqual([]);
  });
});

describe('resolveDemandLevel', () => {
  it('defaults to free when no demand entry exists for the date', () => {
    expect(resolveDemandLevel(MONDAY, [])).toBe('free');
  });

  it('returns the configured level when present', () => {
    expect(resolveDemandLevel(MONDAY, [{ date: MONDAY, level: 'high' }])).toBe('high');
  });
});
