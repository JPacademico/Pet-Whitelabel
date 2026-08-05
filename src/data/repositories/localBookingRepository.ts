import type { GroomingBooking, NewBooking, WeeklyTemplate } from '@/domain/types';
import { groomingBookingListSchema, weeklyTemplateListSchema, dateOverrideListSchema } from '@/domain/schemas';
import { readCollection, writeCollection } from '@/data/storage/driver';
import { STORAGE_KEYS } from '@/data/storage/keys';
import { simulatedLatency } from '@/lib/delay';
import { nowInBusinessTz } from '@/lib/datetime';
import { resolveSlots } from '@/domain/availability';
import { err, ok } from '@/domain/types';
import { useDataVersion } from '@/store/dataVersion';
import type { BookingRepository } from '@/data/ports';

function readAll(): GroomingBooking[] {
  return readCollection(STORAGE_KEYS.bookings, groomingBookingListSchema);
}

function writeAll(bookings: GroomingBooking[]): void {
  writeCollection(STORAGE_KEYS.bookings, bookings);
}

function readGroomingTemplate(): WeeklyTemplate {
  const templates = readCollection(STORAGE_KEYS.weeklyTemplates, weeklyTemplateListSchema);
  return (
    templates.find((t) => t.service === 'grooming') ?? { service: 'grooming', slotsByWeekday: {} }
  );
}

function readGroomingOverrides() {
  return readCollection(STORAGE_KEYS.dateOverrides, dateOverrideListSchema).filter(
    (o) => o.service === 'grooming',
  );
}

/** Re-validates a (date, time) slot at write time — not just on the initial form render — so two
 * tabs (or a slow submit) can't both land the same slot. Excludes `excludeBookingId` so a
 * reschedule doesn't collide with its own current slot. See IMPLEMENTATION_PLAN.md §3.6, §5.3. */
function validateSlot(
  date: string,
  time: string,
  excludeBookingId?: string,
): 'free' | 'booked' | 'invalid' {
  const template = readGroomingTemplate();
  const overrides = readGroomingOverrides();
  const bookings = readAll().filter((b) => b.id !== excludeBookingId);
  const resolved = resolveSlots(date, template, overrides, bookings, nowInBusinessTz());
  const slot = resolved.find((s) => s.time === time);
  if (!slot) return 'invalid';
  if (slot.state === 'booked') return 'booked';
  if (slot.state === 'past') return 'invalid';
  return 'free';
}

export const localBookingRepository: BookingRepository = {
  async list() {
    await simulatedLatency();
    return readAll();
  },

  async get(id) {
    await simulatedLatency();
    return readAll().find((b) => b.id === id) ?? null;
  },

  async create(input: NewBooking) {
    await simulatedLatency();
    const state = validateSlot(input.date, input.time);
    if (state === 'booked') return err('SLOT_TAKEN');
    if (state === 'invalid') return err('SLOT_INVALID');

    const now = new Date().toISOString();
    const booking: GroomingBooking = {
      ...input,
      id: crypto.randomUUID(),
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    writeAll([booking, ...readAll()]);
    useDataVersion.getState().bump('bookings');
    return ok(booking);
  },

  async reschedule(id, date, time) {
    await simulatedLatency();
    const bookings = readAll();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return err('NOT_FOUND');

    const state = validateSlot(date, time, id);
    if (state === 'booked') return err('SLOT_TAKEN');
    if (state === 'invalid') return err('SLOT_INVALID');

    const updated: GroomingBooking = {
      ...bookings[index]!,
      date,
      time,
      updatedAt: new Date().toISOString(),
    };
    bookings[index] = updated;
    writeAll(bookings);
    useDataVersion.getState().bump('bookings');
    return ok(updated);
  },

  async setStatus(id, status) {
    await simulatedLatency();
    const bookings = readAll();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Booking ${id} not found`);
    const updated: GroomingBooking = {
      ...bookings[index]!,
      status,
      updatedAt: new Date().toISOString(),
    };
    bookings[index] = updated;
    writeAll(bookings);
    useDataVersion.getState().bump('bookings');
    return updated;
  },
};
