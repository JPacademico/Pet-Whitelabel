import { useEffect, useState } from 'react';
import { SITE } from '@/config/site';
import { nowInBusinessTz } from '@/lib/datetime';

function computeIsOpen(now: Date): boolean {
  const weekday = now.getDay() as keyof typeof SITE.hours;
  const ranges = SITE.hours[weekday];
  const minutes = now.getHours() * 60 + now.getMinutes();
  return ranges.some(({ open, close }) => {
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    const openMinutes = openH! * 60 + openM!;
    const closeMinutes = closeH! * 60 + closeM!;
    return minutes >= openMinutes && minutes < closeMinutes;
  });
}

/** "Open now" is evaluated against the business's own timezone, not the visitor's device clock —
 * see IMPLEMENTATION_PLAN.md §3.4/§5.1. Re-checks every minute. */
export function useIsOpenNow(): boolean {
  const [isOpen, setIsOpen] = useState(() => computeIsOpen(nowInBusinessTz()));

  useEffect(() => {
    const id = setInterval(() => setIsOpen(computeIsOpen(nowInBusinessTz())), 60_000);
    return () => clearInterval(id);
  }, []);

  return isOpen;
}
