import { useCallback } from 'react';
import { availabilityRepository, bookingRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import type { DateOverride, GroomingBooking, WeeklyTemplate } from '@/domain/types';

const EMPTY_TEMPLATE: WeeklyTemplate = { service: 'grooming', slotsByWeekday: {} };

export function useGroomingAvailability() {
  const templateFetcher = useCallback(() => availabilityRepository.getWeeklyTemplate('grooming'), []);
  const overridesFetcher = useCallback(() => availabilityRepository.listOverrides('grooming'), []);
  const bookingsFetcher = useCallback(() => bookingRepository.list(), []);

  const template = useLiveQuery<WeeklyTemplate>('availability', templateFetcher);
  const overrides = useLiveQuery<DateOverride[]>('availability', overridesFetcher);
  const bookings = useLiveQuery<GroomingBooking[]>('bookings', bookingsFetcher);

  return {
    template: template.data ?? EMPTY_TEMPLATE,
    overrides: overrides.data ?? [],
    bookings: bookings.data ?? [],
    loading: template.loading || overrides.loading || bookings.loading,
  };
}
