import { useCallback } from 'react';
import { availabilityRepository } from '@/data/repositories';
import { useLiveQuery } from '@/lib/useLiveQuery';
import type { ClinicDemand, DateOverride, WeeklyTemplate } from '@/domain/types';

const EMPTY_TEMPLATE: WeeklyTemplate = { service: 'clinic', slotsByWeekday: {} };

export function useClinicAvailability() {
  const templateFetcher = useCallback(() => availabilityRepository.getWeeklyTemplate('clinic'), []);
  const overridesFetcher = useCallback(() => availabilityRepository.listOverrides('clinic'), []);
  const demandFetcher = useCallback(() => availabilityRepository.listClinicDemand(), []);

  const template = useLiveQuery<WeeklyTemplate>('availability', templateFetcher);
  const overrides = useLiveQuery<DateOverride[]>('availability', overridesFetcher);
  const demand = useLiveQuery<ClinicDemand[]>('availability', demandFetcher);

  return {
    template: template.data ?? EMPTY_TEMPLATE,
    overrides: overrides.data ?? [],
    demand: demand.data ?? [],
    loading: template.loading || overrides.loading || demand.loading,
  };
}
