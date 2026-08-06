export const STORAGE_KEYS = {
  products: 'products',
  bookings: 'bookings',
  weeklyTemplates: 'weekly-templates',
  dateOverrides: 'date-overrides',
  clinicDemand: 'clinic-demand',
  hotelAvailability: 'hotel-availability',
  galleryPhotos: 'gallery-photos',
  session: 'session',
} as const;

export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS);
