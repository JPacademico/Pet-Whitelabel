// Single place the app resolves its repositories from. Today this only ever wires the
// localStorage-backed implementations; adding an HTTP-backed set in data/http/ later means
// switching these four exports behind an env flag — no other file in the app needs to change.
// See IMPLEMENTATION_PLAN.md §10.
import { localProductRepository } from './localProductRepository';
import { localBookingRepository } from './localBookingRepository';
import { localAvailabilityRepository } from './localAvailabilityRepository';
import { localAuthRepository } from './localAuthRepository';

export const productRepository = localProductRepository;
export const bookingRepository = localBookingRepository;
export const availabilityRepository = localAvailabilityRepository;
export const authRepository = localAuthRepository;

// Storage health is part of the data layer's public surface: the app shell needs to surface
// quota/unavailable warnings to the user, but must not reach into the storage internals to do it.
export { onStorageWarning, isStoragePersistent } from '@/data/storage/driver';
export { resetDemoData } from '@/data/storage/migrations';
