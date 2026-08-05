import { describe, expect, it } from 'vitest';
import { addIsoDays, isPastSlot, parseIsoDate, toDateTime, toIsoDate, weekdayOf } from './datetime';

describe('parseIsoDate / toIsoDate round-trip', () => {
  it('never shifts across the UTC-midnight boundary that broke naive `new Date(string)` parsing', () => {
    // This is the exact bug class described in IMPLEMENTATION_PLAN.md §3.4: `new Date('2026-08-10')`
    // parses as UTC midnight, which renders as the previous day in negative-UTC-offset timezones.
    const date = '2026-08-10';
    expect(toIsoDate(parseIsoDate(date))).toBe(date);
  });
});

describe('weekdayOf', () => {
  it('matches the JS Date weekday convention (0=Sunday)', () => {
    expect(weekdayOf('2026-08-09')).toBe(0); // Sunday
    expect(weekdayOf('2026-08-10')).toBe(1); // Monday
  });
});

describe('addIsoDays', () => {
  it('adds days without drifting the calendar date', () => {
    expect(addIsoDays('2026-08-10', 1)).toBe('2026-08-11');
    expect(addIsoDays('2026-08-31', 1)).toBe('2026-09-01');
  });
});

describe('isPastSlot', () => {
  it('is false for a slot after "now"', () => {
    const now = toDateTime('2026-08-10', '08:00');
    expect(isPastSlot('2026-08-10', '09:00', now)).toBe(false);
  });

  it('is true for a slot before "now"', () => {
    const now = toDateTime('2026-08-10', '10:00');
    expect(isPastSlot('2026-08-10', '09:00', now)).toBe(true);
  });

  it('is true for a slot on an earlier date regardless of time', () => {
    const now = toDateTime('2026-08-11', '00:00');
    expect(isPastSlot('2026-08-10', '23:00', now)).toBe(true);
  });
});
