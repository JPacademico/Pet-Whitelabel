import { create } from 'zustand';
import { STORAGE_KEYS } from '@/data/storage/keys';

export type DataDomain = 'products' | 'bookings' | 'availability' | 'gallery';

interface DataVersionState {
  products: number;
  bookings: number;
  availability: number;
  gallery: number;
  bump: (domain: DataDomain) => void;
}

/**
 * A version counter per data domain, not the data itself. Repositories bump the relevant counter
 * after every successful mutation; pages depend on the counter (via useLiveQuery) to know when to
 * refetch. This is what makes "admin edits a slot, the public booking form updates" and
 * "two open tabs stay in sync" work without a heavier state-sync layer.
 * See IMPLEMENTATION_PLAN.md §3.7.
 */
export const useDataVersion = create<DataVersionState>((set) => ({
  products: 0,
  bookings: 0,
  availability: 0,
  gallery: 0,
  bump: (domain) => set((s) => ({ [domain]: s[domain] + 1 })),
}));

const availabilityKeys: string[] = [
  STORAGE_KEYS.weeklyTemplates,
  STORAGE_KEYS.dateOverrides,
  STORAGE_KEYS.clinicDemand,
];

// The native `storage` event only fires in OTHER tabs than the one that wrote the value — that's
// exactly the case same-tab bumps (called directly from repositories) don't cover.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key) return;
    if (event.key.endsWith(`:${STORAGE_KEYS.products}`)) {
      useDataVersion.getState().bump('products');
    } else if (event.key.endsWith(`:${STORAGE_KEYS.bookings}`)) {
      useDataVersion.getState().bump('bookings');
    } else if (availabilityKeys.some((k) => event.key!.endsWith(`:${k}`))) {
      useDataVersion.getState().bump('availability');
    } else if (event.key.endsWith(`:${STORAGE_KEYS.galleryPhotos}`)) {
      useDataVersion.getState().bump('gallery');
    }
  });
}
