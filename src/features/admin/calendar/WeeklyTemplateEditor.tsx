import { useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Check, Copy, CopyPlus, Eraser, MousePointerClick, Wand2, X } from 'lucide-react';
import type {
  GroomingBooking,
  DateOverride,
  ServiceKind,
  TimeSlot,
  WeeklyTemplate,
} from '@/domain/types';
import { Button, Modal } from '@/design-system/primitives';
import { cn } from '@/lib/cn';
import { bookingsAffectedByTemplateSlotRemoval } from '@/domain/availability';
import { nowInBusinessTz, formatDisplayDateShort, todayIsoDate, weekdayOf } from '@/lib/datetime';
import { Legend } from '@/features/admin/shared';
import {
  BUSINESS_WEEKDAYS,
  PERIOD_LABELS,
  SLOT_PALETTE,
  STANDARD_DAY_SLOTS,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
  periodOf,
  summarizeSlots,
  type SlotPeriod,
} from './slotPalette';

export interface WeeklyTemplateEditorProps {
  service: ServiceKind;
  template: WeeklyTemplate;
  bookings: GroomingBooking[];
  overrides: DateOverride[];
  onChange: (template: WeeklyTemplate) => void;
}

/** A slot closure that was refused because live bookings still sit on it. */
interface BlockedRemoval {
  weekday: number;
  time: TimeSlot;
  affected: GroomingBooking[];
}

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

/** Amber inset ring marking an hour that already has bookings on it. Written as a raw shadow
 * because it has to compose with the cell's own background rather than replace it. */
const BOOKED_RING = 'shadow-[inset_0_0_0_2px_var(--color-amber-brand)]';

/**
 * The weekly opening hours, as a grid: one row per time, one column per weekday.
 *
 * This replaces seven stacked walls of 26 chips each — the same information, but you can now see
 * the shape of the week at a glance, drag to paint a block of hours, and tell open from closed by
 * colour (teal) versus red before reading a single label.
 */
export function WeeklyTemplateEditor({
  service,
  template,
  bookings,
  overrides,
  onChange,
}: WeeklyTemplateEditorProps) {
  const [blocked, setBlocked] = useState<BlockedRemoval[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [pop, setPop] = useState<{ cell: string; nonce: number } | null>(null);
  const [painting, setPainting] = useState(false);

  // A pointer drag can cross several cells before React re-renders, so the handlers read the
  // working template from a ref instead of the (momentarily stale) prop. The effect resyncs
  // whenever the parent hands down a different template — a service tab switch, or a discarded draft.
  const workingRef = useRef(template);
  useEffect(() => {
    workingRef.current = template;
  }, [template]);

  // Paint direction is decided by the first cell of a drag: starting on a closed hour opens
  // everything dragged over, starting on an open hour closes it.
  const paintingRef = useRef(false);
  const paintModeRef = useRef(true);
  const deferredBlocksRef = useRef<BlockedRemoval[]>([]);

  const today = todayIsoDate(nowInBusinessTz());

  const times = useMemo(() => {
    // A saved template can hold times outside the palette (a narrower palette in a past version,
    // imported data). Union them in so an active hour can never become invisible.
    const extra = WEEKDAYS.flatMap((d) => template.slotsByWeekday[d] ?? []);
    return [...new Set([...SLOT_PALETTE, ...extra])].sort();
  }, [template]);

  /**
   * Future scheduled bookings per weekday+time. Mirrors the exclusions in
   * `bookingsAffectedByTemplateSlotRemoval` — that function stays the authority for *blocking* a
   * change; this map only decides which cells wear the "has bookings" marker.
   */
  const bookingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (service !== 'grooming') return counts;
    const datesWithExplicitSlots = new Set(
      overrides.filter((o) => o.service === 'grooming' && o.slots !== null).map((o) => o.date),
    );
    for (const booking of bookings) {
      if (booking.status !== 'scheduled') continue;
      if (booking.date < today) continue;
      if (datesWithExplicitSlots.has(booking.date)) continue;
      const key = `${weekdayOf(booking.date)}|${booking.time}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [service, bookings, overrides, today]);

  const slotsFor = (weekday: number): TimeSlot[] => workingRef.current.slotsByWeekday[weekday] ?? [];
  const totalForDay = (weekday: number) => (template.slotsByWeekday[weekday] ?? []).length;
  const weekTotal = WEEKDAYS.reduce((sum, d) => sum + totalForDay(d), 0);

  /** Every closure in `next` that would orphan a live booking. Only grooming is bookable. */
  function collectBlocked(next: WeeklyTemplate): BlockedRemoval[] {
    if (service !== 'grooming') return [];
    const now = nowInBusinessTz();
    const found: BlockedRemoval[] = [];
    for (const weekday of WEEKDAYS) {
      const before = workingRef.current.slotsByWeekday[weekday] ?? [];
      const after = new Set(next.slotsByWeekday[weekday] ?? []);
      for (const time of before) {
        if (after.has(time)) continue;
        const affected = bookingsAffectedByTemplateSlotRemoval(
          weekday,
          time,
          bookings,
          overrides,
          now,
        );
        if (affected.length > 0) found.push({ weekday, time, affected });
      }
    }
    return found;
  }

  /**
   * The single write path. Every edit — one cell, a whole row, a preset, a day cleared — goes
   * through here, so the "don't orphan a booking" guard covers bulk actions too. It previously
   * only wrapped single toggles, which the copy and preset shortcuts silently bypassed.
   */
  function commit(next: WeeklyTemplate, { defer = false } = {}): boolean {
    const refused = collectBlocked(next);
    if (refused.length > 0) {
      if (defer) deferredBlocksRef.current.push(...refused);
      else setBlocked(refused);
      return false;
    }
    workingRef.current = next;
    onChange(next);
    return true;
  }

  function setSlots(weekday: number, slots: TimeSlot[], options?: { defer?: boolean }): boolean {
    return commit(
      {
        ...workingRef.current,
        slotsByWeekday: { ...workingRef.current.slotsByWeekday, [weekday]: [...slots].sort() },
      },
      options,
    );
  }

  function applyCell(weekday: number, time: TimeSlot, open: boolean, options?: { defer?: boolean }) {
    const current = slotsFor(weekday);
    if (current.includes(time) === open) return;
    const next = open ? [...current, time] : current.filter((t) => t !== time);
    if (setSlots(weekday, next, options)) {
      setPop((prev) => ({ cell: `${weekday}|${time}`, nonce: (prev?.nonce ?? 0) + 1 }));
    }
  }

  /** Row header action: open a time across the whole week, or close it if it's already everywhere. */
  function toggleTimeAcrossWeek(time: TimeSlot) {
    const isEverywhere = WEEKDAYS.every((d) => slotsFor(d).includes(time));
    const next: Record<number, TimeSlot[]> = { ...workingRef.current.slotsByWeekday };
    for (const weekday of WEEKDAYS) {
      const current = next[weekday] ?? [];
      next[weekday] = isEverywhere
        ? current.filter((t) => t !== time)
        : [...new Set([...current, time])].sort();
    }
    commit({ ...workingRef.current, slotsByWeekday: next });
  }

  function copyDayTo(weekday: number, targets: readonly number[]) {
    const source = slotsFor(weekday);
    const next: Record<number, TimeSlot[]> = { ...workingRef.current.slotsByWeekday };
    for (const target of targets) next[target] = [...source];
    commit({ ...workingRef.current, slotsByWeekday: next });
  }

  // --- Drag painting ---------------------------------------------------------------------------
  // Only a mouse paints. Capturing a finger drag here would fight the grid's own scrolling, so on
  // touch every cell stays a plain tap target.
  useEffect(() => {
    if (!painting) return;
    const stop = () => {
      paintingRef.current = false;
      setPainting(false);
      // Cells refused mid-drag are collected rather than interrupting the drag with a dialog.
      if (deferredBlocksRef.current.length > 0) {
        setBlocked(deferredBlocksRef.current);
        deferredBlocksRef.current = [];
      }
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [painting]);

  function handleCellPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    weekday: number,
    time: TimeSlot,
  ) {
    if (event.button !== 0) return;
    const open = !slotsFor(weekday).includes(time);
    const isMouse = event.pointerType === 'mouse';

    if (isMouse) {
      paintModeRef.current = open;
      paintingRef.current = true;
      deferredBlocksRef.current = [];
      setPainting(true);
    }
    applyCell(weekday, time, open, { defer: isMouse });
  }

  function handleCellPointerEnter(
    event: React.PointerEvent<HTMLButtonElement>,
    weekday: number,
    time: TimeSlot,
  ) {
    if (!paintingRef.current || event.buttons !== 1) return;
    applyCell(weekday, time, paintModeRef.current, { defer: true });
  }

  /** Keyboard activation only. A pointer-driven click was already handled by `pointerdown`;
   * `detail === 0` is what distinguishes Enter/Space from a real click. */
  function handleCellClick(
    event: React.MouseEvent<HTMLButtonElement>,
    weekday: number,
    time: TimeSlot,
  ) {
    if (event.detail !== 0) return;
    applyCell(weekday, time, !slotsFor(weekday).includes(time));
  }

  const selectedDaySlots = selectedDay === null ? [] : (template.slotsByWeekday[selectedDay] ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Legend
          items={[
            { swatch: 'bg-teal', label: 'Aberto para agendamento' },
            { swatch: 'bg-urgent/25', label: 'Fechado' },
            { swatch: `bg-teal ${BOOKED_RING}`, label: 'Aberto e já tem agendamento' },
          ]}
        />
        <p className="text-sm text-muted">
          <strong className="font-display text-base text-charcoal tabular-nums">{weekTotal}</strong>{' '}
          {weekTotal === 1 ? 'horário aberto' : 'horários abertos'} na semana
        </p>
      </div>

      <p className="hidden items-center gap-1.5 text-xs text-muted md:flex">
        <MousePointerClick className="size-3.5 shrink-0" aria-hidden="true" />
        Clique e arraste para abrir ou fechar vários horários de uma vez. Clique no horário à
        esquerda para aplicá-lo à semana inteira, ou no dia no topo para as ações do dia.
      </p>

      {/* Per-day toolbar. Lives outside the scrolling grid on purpose: a popover anchored to a
       * column header would be clipped by the grid's own overflow. */}
      {selectedDay !== null && (
        <div className="ds-slide-down flex flex-wrap items-center gap-2 rounded-2xl border-2 border-amber-brand bg-amber-soft/40 p-3">
          <span className="mr-1 font-display font-bold text-charcoal">
            {WEEKDAY_LABELS[selectedDay]}
            <span className="ml-2 text-xs font-normal text-muted">
              {selectedDaySlots.length === 0
                ? 'fechado'
                : summarizeSlots(selectedDaySlots).join(' · ')}
            </span>
          </span>
          <Button size="sm" variant="ghost" onClick={() => setSlots(selectedDay, STANDARD_DAY_SLOTS)}>
            <Wand2 className="size-3.5" aria-hidden="true" />
            08:00–17:00
          </Button>
          <Button size="sm" variant="ghost" onClick={() => copyDayTo(selectedDay, BUSINESS_WEEKDAYS)}>
            <Copy className="size-3.5" aria-hidden="true" />
            Copiar p/ seg–sex
          </Button>
          <Button size="sm" variant="ghost" onClick={() => copyDayTo(selectedDay, WEEKDAYS)}>
            <CopyPlus className="size-3.5" aria-hidden="true" />
            Copiar p/ todos
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-urgent hover:bg-urgent/10"
            onClick={() => setSlots(selectedDay, [])}
          >
            <Eraser className="size-3.5" aria-hidden="true" />
            Fechar o dia
          </Button>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            aria-label="Fechar ações do dia"
            className="ml-auto flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-charcoal"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div
        className={cn(
          'max-h-[32rem] overflow-auto overscroll-contain rounded-2xl border-2 border-cream-deep bg-white',
          painting && 'ds-slot-grid--painting',
        )}
      >
        <div
          className="grid w-full min-w-[27rem]"
          style={{ gridTemplateColumns: '4.25rem repeat(7, minmax(3.25rem, 1fr))' }}
        >
          {/* Header row — sticks to the top of the scroll box so the weekday is never lost. */}
          <div className="sticky top-0 left-0 z-30 border-r border-b border-cream-deep bg-white" />
          {WEEKDAYS.map((weekday) => {
            const count = totalForDay(weekday);
            const isSelected = selectedDay === weekday;
            return (
              <button
                key={weekday}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : weekday)}
                aria-pressed={isSelected}
                title={`Ações de ${WEEKDAY_LABELS[weekday]}`}
                className={cn(
                  'sticky top-0 z-20 flex flex-col items-center justify-center gap-1 border-b border-cream-deep px-1 py-2',
                  'text-xs font-bold transition-colors',
                  isSelected
                    ? 'bg-amber-soft text-charcoal'
                    : 'bg-white text-charcoal hover:bg-cream',
                )}
              >
                {WEEKDAY_SHORT[weekday]}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[0.6rem] leading-none font-extrabold tabular-nums',
                    count === 0 ? 'bg-urgent/15 text-urgent' : 'bg-teal/15 text-teal-deep',
                  )}
                >
                  {count === 0 ? 'fechado' : count}
                </span>
              </button>
            );
          })}

          {times.map((time, index) => {
            const previous = index > 0 ? times[index - 1] : undefined;
            return (
            <TimeRow
              key={time}
              time={time}
              period={periodOf(time)}
              showPeriodBand={previous === undefined || periodOf(previous) !== periodOf(time)}
              slotsByWeekday={template.slotsByWeekday}
              bookingCounts={bookingCounts}
              selectedDay={selectedDay}
              popCell={pop?.cell}
              popNonce={pop?.nonce ?? 0}
              onToggleRow={toggleTimeAcrossWeek}
              onCellClick={handleCellClick}
              onCellPointerDown={handleCellPointerDown}
              onCellPointerEnter={handleCellPointerEnter}
            />
            );
          })}
        </div>
      </div>

      <Modal
        open={!!blocked}
        onOpenChange={(open) => !open && setBlocked(null)}
        title={
          blocked && blocked.length > 1
            ? 'Alguns horários não podem ser fechados'
            : 'Não é possível fechar este horário'
        }
        description="Existem agendamentos ativos nestes horários."
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setBlocked(null)}>
            Entendi
          </Button>
        }
      >
        <p className="mb-3 text-sm text-charcoal">
          Cancele ou remarque os agendamentos abaixo em <strong>Banho &amp; Tosa</strong> antes de
          fechar {blocked && blocked.length > 1 ? 'estes horários' : 'este horário'}.
        </p>
        <ul className="flex flex-col gap-3">
          {blocked?.map((entry) => (
            <li key={`${entry.weekday}|${entry.time}`}>
              <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-charcoal">
                <Ban className="size-4 shrink-0 text-urgent" aria-hidden="true" />
                {WEEKDAY_LABELS[entry.weekday]} às {entry.time}
              </p>
              <ul className="flex flex-col gap-1.5 pl-5">
                {entry.affected.map((booking) => (
                  <li key={booking.id} className="rounded-xl bg-cream-deep px-3 py-2 text-sm">
                    <strong className="text-charcoal">{booking.petName}</strong>{' '}
                    <span className="text-muted">
                      — {booking.tutorName}, {formatDisplayDateShort(booking.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

interface TimeRowProps {
  time: TimeSlot;
  period: SlotPeriod;
  showPeriodBand: boolean;
  slotsByWeekday: Record<number, TimeSlot[]>;
  bookingCounts: Map<string, number>;
  selectedDay: number | null;
  popCell: string | undefined;
  popNonce: number;
  onToggleRow: (time: TimeSlot) => void;
  onCellClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    weekday: number,
    time: TimeSlot,
  ) => void;
  onCellPointerDown: (
    event: React.PointerEvent<HTMLButtonElement>,
    weekday: number,
    time: TimeSlot,
  ) => void;
  onCellPointerEnter: (
    event: React.PointerEvent<HTMLButtonElement>,
    weekday: number,
    time: TimeSlot,
  ) => void;
}

function TimeRow({
  time,
  period,
  showPeriodBand,
  slotsByWeekday,
  bookingCounts,
  selectedDay,
  popCell,
  popNonce,
  onToggleRow,
  onCellClick,
  onCellPointerDown,
  onCellPointerEnter,
}: TimeRowProps) {
  const isEverywhere = WEEKDAYS.every((d) => (slotsByWeekday[d] ?? []).includes(time));

  return (
    <>
      {showPeriodBand && (
        <div
          className="border-y border-cream-deep bg-cream-deep/70"
          style={{ gridColumn: '1 / -1' }}
        >
          {/* The band spans the full grid width, so the label itself has to stick when the grid is
           * scrolled sideways on a narrow screen. */}
          <span className="sticky left-0 block px-3 py-1 text-[0.65rem] font-extrabold tracking-widest text-muted uppercase">
            {PERIOD_LABELS[period]}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggleRow(time)}
        title={isEverywhere ? `Fechar ${time} em todos os dias` : `Abrir ${time} em todos os dias`}
        className={cn(
          'sticky left-0 z-10 flex h-10 items-center justify-center border-r border-b border-cream-deep bg-white',
          'text-xs font-bold tabular-nums transition-colors hover:bg-cream hover:text-charcoal',
          isEverywhere ? 'text-teal-deep' : 'text-muted',
        )}
      >
        {time}
      </button>

      {WEEKDAYS.map((weekday) => {
        const isOpen = (slotsByWeekday[weekday] ?? []).includes(time);
        const cellKey = `${weekday}|${time}`;
        const bookingCount = bookingCounts.get(cellKey) ?? 0;
        const isPopping = popCell === cellKey;

        return (
          <button
            key={weekday}
            type="button"
            aria-pressed={isOpen}
            aria-label={`${WEEKDAY_LABELS[weekday]} às ${time} — ${isOpen ? 'aberto' : 'fechado'}${
              bookingCount > 0 ? `, ${bookingCount} agendamento(s)` : ''
            }`}
            title={
              bookingCount > 0
                ? `${bookingCount} agendamento(s) neste horário`
                : isOpen
                  ? 'Aberto — clique para fechar'
                  : 'Fechado — clique para abrir'
            }
            onClick={(event) => onCellClick(event, weekday, time)}
            onPointerDown={(event) => onCellPointerDown(event, weekday, time)}
            onPointerEnter={(event) => onCellPointerEnter(event, weekday, time)}
            className={cn(
              'ds-slot-cell relative flex h-10 items-center justify-center border-r border-b border-cream-deep',
              'transition-colors duration-150',
              isOpen
                ? 'bg-teal text-white hover:bg-teal-deep'
                : 'bg-urgent/10 text-urgent/70 hover:bg-teal/20 hover:text-teal-deep',
              // Highlighting the column being edited keeps the toolbar above tied to a place in the grid.
              selectedDay === weekday && 'border-x-amber-brand',
              bookingCount > 0 && BOOKED_RING,
            )}
          >
            <span
              key={isPopping ? `${cellKey}-${popNonce}` : cellKey}
              className={cn('block', isPopping && 'ds-slot-pop')}
            >
              {isOpen ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <X className="size-3.5" aria-hidden="true" />
              )}
            </span>
            {bookingCount > 0 && (
              <span className="absolute right-0.5 bottom-0.5 rounded-full bg-amber-brand px-1 text-[0.6rem] leading-tight font-extrabold text-charcoal tabular-nums">
                {bookingCount}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
