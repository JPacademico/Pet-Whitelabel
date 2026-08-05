import {
  clinicDemandListSchema,
  dateOverrideListSchema,
  groomingBookingListSchema,
  hotelAvailabilityListSchema,
  productListSchema,
  weeklyTemplateListSchema,
} from '@/domain/schemas';
import { nowInBusinessTz } from '@/lib/datetime';
import {
  buildBookingSeed,
  buildClinicDemandSeed,
  buildDateOverrideSeed,
  buildHotelAvailabilitySeed,
  buildProductSeed,
  buildWeeklyTemplateSeed,
} from './seed';
import { readCollection, readRawSchemaVersion, writeCollection, writeSchemaVersion } from './driver';
import { ALL_STORAGE_KEYS, STORAGE_KEYS } from './keys';

// v2 added the hotel service (weekly template + nightly availability).
const CURRENT_SCHEMA_VERSION = 2;

function seedAll(): void {
  const now = nowInBusinessTz();
  writeCollection(STORAGE_KEYS.products, buildProductSeed(now));
  writeCollection(STORAGE_KEYS.bookings, buildBookingSeed(now));
  writeCollection(STORAGE_KEYS.weeklyTemplates, buildWeeklyTemplateSeed());
  writeCollection(STORAGE_KEYS.dateOverrides, buildDateOverrideSeed(now));
  writeCollection(STORAGE_KEYS.clinicDemand, buildClinicDemandSeed(now));
  writeCollection(STORAGE_KEYS.hotelAvailability, buildHotelAvailabilitySeed(now));
  writeSchemaVersion(CURRENT_SCHEMA_VERSION);
}

/** Runs once before the first render. Fresh browsers get seeded; a version mismatch from a future
 * release would get a migration chain here — for v1 there's nothing to migrate from, so a mismatch
 * just re-seeds (documented tradeoff, not silent data loss: this only ever fires post-launch). */
export function bootstrapStorage(): void {
  const version = readRawSchemaVersion();

  if (version === 0) {
    seedAll();
    return;
  }

  if (version !== CURRENT_SCHEMA_VERSION) {
    console.warn(`[storage] schema version ${version} unrecognized, resetting to seed data`);
    seedAll();
    return;
  }

  // Version matches — validate what's there; if any collection fails validation (readCollection
  // swallows parse errors into []), reseed just that collection so one corrupted key doesn't take
  // down the rest of the app. Distinguishing "genuinely empty" from "was corrupt" isn't possible
  // after the fact, so an empty collection is always treated as needing a reseed.
  const now = nowInBusinessTz();

  if (readCollection(STORAGE_KEYS.products, productListSchema).length === 0) {
    writeCollection(STORAGE_KEYS.products, buildProductSeed(now));
  }
  if (readCollection(STORAGE_KEYS.bookings, groomingBookingListSchema).length === 0) {
    writeCollection(STORAGE_KEYS.bookings, buildBookingSeed(now));
  }
  if (readCollection(STORAGE_KEYS.weeklyTemplates, weeklyTemplateListSchema).length === 0) {
    writeCollection(STORAGE_KEYS.weeklyTemplates, buildWeeklyTemplateSeed());
  }
  if (readCollection(STORAGE_KEYS.dateOverrides, dateOverrideListSchema).length === 0) {
    writeCollection(STORAGE_KEYS.dateOverrides, buildDateOverrideSeed(now));
  }
  if (readCollection(STORAGE_KEYS.clinicDemand, clinicDemandListSchema).length === 0) {
    writeCollection(STORAGE_KEYS.clinicDemand, buildClinicDemandSeed(now));
  }
  if (readCollection(STORAGE_KEYS.hotelAvailability, hotelAvailabilityListSchema).length === 0) {
    writeCollection(STORAGE_KEYS.hotelAvailability, buildHotelAvailabilitySeed(now));
  }
}

export function resetDemoData(): void {
  seedAll();
}

export { ALL_STORAGE_KEYS };
