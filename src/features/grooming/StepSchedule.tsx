import { useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import type { BookingFormValues } from '@/domain/schemas';
import { resolveSlots } from '@/domain/availability';
import { nowInBusinessTz, formatDisplayDate } from '@/lib/datetime';
import { BookingCalendar } from './BookingCalendar';
import { SlotGrid } from './SlotGrid';
import { useGroomingAvailability } from './useGroomingAvailability';

export function StepSchedule() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  const date = watch('date');
  const time = watch('time');
  const { template, overrides, bookings, loading } = useGroomingAvailability();

  const slots = useMemo(() => {
    if (!date) return [];
    return resolveSlots(date, template, overrides, bookings, nowInBusinessTz());
  }, [date, template, overrides, bookings]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-charcoal">
          Escolha o dia <span className="text-urgent">*</span>
        </p>
        <BookingCalendar
          template={template}
          overrides={overrides}
          bookings={bookings}
          selected={date || undefined}
          onSelect={(d) => {
            setValue('date', d ?? '', { shouldValidate: true });
            setValue('time', '', { shouldValidate: true });
          }}
        />
        {errors.date && <p className="mt-2 text-xs font-semibold text-urgent">{errors.date.message}</p>}
      </div>

      {date && (
        <div>
          <p className="mb-2 text-sm font-semibold text-charcoal">
            {formatDisplayDate(date)} — escolha o horário <span className="text-urgent">*</span>
          </p>
          <SlotGrid
            slots={slots}
            selected={time || undefined}
            loading={loading}
            onSelect={(t) => setValue('time', t, { shouldValidate: true })}
          />
          {errors.time && <p className="mt-2 text-xs font-semibold text-urgent">{errors.time.message}</p>}
        </div>
      )}
    </div>
  );
}
