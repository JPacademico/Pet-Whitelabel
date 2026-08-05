import type {
  ClinicDemand,
  DateOverride,
  HotelAvailability,
  ServiceKind,
  WeeklyTemplate,
} from '@/domain/types';
import {
  clinicDemandListSchema,
  dateOverrideListSchema,
  hotelAvailabilityListSchema,
  weeklyTemplateListSchema,
} from '@/domain/schemas';
import { readCollection, writeCollection } from '@/data/storage/driver';
import { STORAGE_KEYS } from '@/data/storage/keys';
import { simulatedLatency } from '@/lib/delay';
import { useDataVersion } from '@/store/dataVersion';
import type { AvailabilityRepository } from '@/data/ports';

export const localAvailabilityRepository: AvailabilityRepository = {
  async getWeeklyTemplate(service: ServiceKind) {
    await simulatedLatency();
    const templates = readCollection(STORAGE_KEYS.weeklyTemplates, weeklyTemplateListSchema);
    return templates.find((t) => t.service === service) ?? { service, slotsByWeekday: {} };
  },

  async setWeeklyTemplate(service: ServiceKind, template: WeeklyTemplate) {
    await simulatedLatency();
    const templates = readCollection(STORAGE_KEYS.weeklyTemplates, weeklyTemplateListSchema);
    const index = templates.findIndex((t) => t.service === service);
    if (index === -1) templates.push(template);
    else templates[index] = template;
    writeCollection(STORAGE_KEYS.weeklyTemplates, templates);
    useDataVersion.getState().bump('availability');
  },

  async listOverrides(service: ServiceKind) {
    await simulatedLatency();
    return readCollection(STORAGE_KEYS.dateOverrides, dateOverrideListSchema).filter(
      (o) => o.service === service,
    );
  },

  async upsertOverride(override: DateOverride) {
    await simulatedLatency();
    const overrides = readCollection(STORAGE_KEYS.dateOverrides, dateOverrideListSchema);
    const index = overrides.findIndex(
      (o) => o.service === override.service && o.date === override.date,
    );
    if (index === -1) overrides.push(override);
    else overrides[index] = override;
    writeCollection(STORAGE_KEYS.dateOverrides, overrides);
    useDataVersion.getState().bump('availability');
  },

  async listClinicDemand() {
    await simulatedLatency();
    return readCollection(STORAGE_KEYS.clinicDemand, clinicDemandListSchema);
  },

  async setClinicDemand(entry: ClinicDemand) {
    await simulatedLatency();
    const demands = readCollection(STORAGE_KEYS.clinicDemand, clinicDemandListSchema);
    const index = demands.findIndex((d) => d.date === entry.date);
    if (index === -1) demands.push(entry);
    else demands[index] = entry;
    writeCollection(STORAGE_KEYS.clinicDemand, demands);
    useDataVersion.getState().bump('availability');
  },

  async listHotelAvailability() {
    await simulatedLatency();
    return readCollection(STORAGE_KEYS.hotelAvailability, hotelAvailabilityListSchema);
  },

  async setHotelAvailability(entry: HotelAvailability) {
    await simulatedLatency();
    const entries = readCollection(STORAGE_KEYS.hotelAvailability, hotelAvailabilityListSchema);
    const index = entries.findIndex((e) => e.date === entry.date);
    if (index === -1) entries.push(entry);
    else entries[index] = entry;
    writeCollection(STORAGE_KEYS.hotelAvailability, entries);
    useDataVersion.getState().bump('availability');
  },
};
