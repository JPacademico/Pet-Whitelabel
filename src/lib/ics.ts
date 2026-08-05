import type { IsoDate, TimeSlot } from '@/domain/types';
import { SITE } from '@/config/site';

function toIcsDateTime(date: IsoDate, time: TimeSlot): string {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

/** Generates a downloadable .ics file for a confirmed booking — small, offline, high perceived value. */
export function downloadBookingIcs(params: {
  petName: string;
  date: IsoDate;
  time: TimeSlot;
  durationMinutes?: number;
}): void {
  const { petName, date, time, durationMinutes = 60 } = params;
  const start = toIcsDateTime(date, time);
  const [h, m] = time.split(':').map(Number);
  const endMinutes = h! * 60 + m! + durationMinutes;
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
  const end = toIcsDateTime(date, endTime);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pet Studio//Agendamento//PT-BR',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@petstudio`,
    `DTSTAMP:${start}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Banho & Tosa — ${petName}`,
    `LOCATION:${SITE.address.street}, ${SITE.address.city}/${SITE.address.state}`,
    'DESCRIPTION:Agendamento de banho e tosa no Pet Studio.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `banho-tosa-${petName.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
