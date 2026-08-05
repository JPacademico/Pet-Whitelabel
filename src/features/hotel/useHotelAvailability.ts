import { useCallback } from 'react';
import { availabilityRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import type { HotelAvailability } from '@/domain/types';

export function useHotelAvailability() {
  const fetcher = useCallback(() => availabilityRepository.listHotelAvailability(), []);
  const { data, loading } = useLiveQuery<HotelAvailability[]>('availability', fetcher);
  return { availability: data ?? [], loading };
}
