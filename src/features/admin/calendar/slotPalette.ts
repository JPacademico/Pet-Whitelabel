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
