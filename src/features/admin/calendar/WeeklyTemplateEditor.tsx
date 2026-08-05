import { useState } from 'react';
import { Copy, Wand2 } from 'lucide-react';
import type { GroomingBooking, DateOverride, ServiceKind, TimeSlot, WeeklyTemplate } from '@/domain/types';
import { Button, Modal } from '@/design-system/primitives';
import { cn } from '@/lib/cn';
import { bookingsAffectedByTemplateSlotRemoval } from '@/domain/availability';
import { nowInBusinessTz, formatDisplayDateShort } from '@/lib/datetime';
import { SLOT_PALETTE, WEEKDAY_LABELS } from './slotPalette';

export interface WeeklyTemplateEditorProps {
  service: ServiceKind;
  template: WeeklyTemplate;
  bookings: GroomingBooking[];
  overrides: DateOverride[];
  onChange: (template: WeeklyTemplate) => void;
}

export function WeeklyTemplateEditor({
  service,
  template,
  bookings,
  overrides,
  onChange,
}: WeeklyTemplateEditorProps) {
  const [blockedRemoval, setBlockedRemoval] = useState<{
    weekday: number;
    time: TimeSlot;
    affected: GroomingBooking[];
  } | null>(null);

  function slotsFor(weekday: number): TimeSlot[] {
    return template.slotsByWeekday[weekday] ?? [];
  }

  function setSlots(weekday: number, slots: TimeSlot[]) {
    onChange({
      ...template,
      slotsByWeekday: { ...template.slotsByWeekday, [weekday]: [...slots].sort() },
    });
  }

  function toggleSlot(weekday: number, time: TimeSlot) {
    const current = slotsFor(weekday);
    const isRemoving = current.includes(time);

    // Removing a slot that still has active bookings would orphan them — block and show which.
    // Only grooming is bookable, so only grooming needs the guard. See IMPLEMENTATION_PLAN.md §6.5.
    if (isRemoving && service === 'grooming') {
      const affected = bookingsAffectedByTemplateSlotRemoval(
        weekday,
        time,
        bookings,
        overrides,
        nowInBusinessTz(),
      );
      if (affected.length > 0) {
        setBlockedRemoval({ weekday, time, affected });
        return;
      }
    }

    setSlots(weekday, isRemoving ? current.filter((s) => s !== time) : [...current, time]);
  }

  function copyToAllWeekdays(weekday: number) {
    const source = slotsFor(weekday);
    const next: Record<number, TimeSlot[]> = { ...template.slotsByWeekday };
    for (let d = 1; d <= 5; d++) next[d] = [...source];
    onChange({ ...template, slotsByWeekday: next });
  }

  function applyStandardRange(weekday: number) {
    setSlots(
      weekday,
      SLOT_PALETTE.filter((t) => t >= '08:00' && t <= '17:00' && t.endsWith(':00')),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {WEEKDAY_LABELS.map((label, weekday) => {
        const active = slotsFor(weekday);
        return (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-bold text-charcoal">
                {label}{' '}
                <span className="text-xs font-normal text-muted">
                  ({active.length} {active.length === 1 ? 'horário' : 'horários'})
                </span>
              </h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => applyStandardRange(weekday)}>
                  <Wand2 className="size-3.5" aria-hidden="true" />
                  08:00–17:00
                </Button>
                <Button size="sm" variant="ghost" onClick={() => copyToAllWeekdays(weekday)}>
                  <Copy className="size-3.5" aria-hidden="true" />
                  Copiar p/ seg–sex
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SLOT_PALETTE.map((time) => {
                const isActive = active.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleSlot(weekday, time)}
                    aria-pressed={isActive}
                    className={cn(
                      'min-h-9 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
                      isActive
                        ? 'border-teal bg-teal text-white'
                        : 'border-cream-deep bg-cream text-muted hover:border-teal',
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <Modal
        open={!!blockedRemoval}
        onOpenChange={(open) => !open && setBlockedRemoval(null)}
        title="Não é possível remover este horário"
        description="Existem agendamentos ativos neste horário."
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setBlockedRemoval(null)}>
            Entendi
          </Button>
        }
      >
        <p className="mb-3 text-sm text-charcoal">
          Cancele ou remarque os agendamentos abaixo antes de remover o horário{' '}
          <strong>{blockedRemoval?.time}</strong> de{' '}
          <strong>{blockedRemoval && WEEKDAY_LABELS[blockedRemoval.weekday]}</strong>.
        </p>
        <ul className="flex flex-col gap-2">
          {blockedRemoval?.affected.map((b) => (
            <li key={b.id} className="rounded-xl bg-cream-deep px-3 py-2 text-sm">
              <strong className="text-charcoal">{b.petName}</strong>{' '}
              <span className="text-muted">
                — {b.tutorName}, {formatDisplayDateShort(b.date)} às {b.time}
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
