export type AnimalType = 'dog' | 'cat';
export type ItemType = 'food' | 'toys' | 'hygiene';

/** 'yyyy-MM-dd' — a LOCAL calendar date, never a serialized Date. See src/lib/datetime.ts. */
export type IsoDate = string;
/** 'HH:mm' in 24h. */
export type TimeSlot = string;

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Integer cents. Never a float for money — see src/lib/money.ts. */
  priceCents: number;
  itemType: ItemType;
  animalType: AnimalType | 'both';
  imageUrl: string;
  inStock: boolean;
  sale: { active: boolean; percentOff: number } | null;
  createdAt: string;
  updatedAt: string;
}

export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProductFilter {
  itemType?: ItemType;
  animalType?: AnimalType;
  query?: string;
  onlyInStock?: boolean;
  onlyOnSale?: boolean;
}

export type BookingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface GroomingBooking {
  id: string;
  petName: string;
  animalType: AnimalType;
  tutorName: string;
  /** E.164 without '+', e.g. '5579999999999'. */
  tutorWhatsapp: string;
  notes: string;
  date: IsoDate;
  time: TimeSlot;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type NewBooking = Pick<
  GroomingBooking,
  'petName' | 'animalType' | 'tutorName' | 'tutorWhatsapp' | 'notes' | 'date' | 'time'
>;

export interface BookingRange {
  from: IsoDate;
  to: IsoDate;
}

export type ServiceKind = 'grooming' | 'clinic' | 'hotel';

/** Weekday keys: 0=Sunday … 6=Saturday. */
export interface WeeklyTemplate {
  service: ServiceKind;
  slotsByWeekday: Record<number, TimeSlot[]>;
}

export interface DateOverride {
  service: ServiceKind;
  date: IsoDate;
  /** Closed for the whole day (holiday, etc). */
  closed: boolean;
  /** null = inherit the weekly template for this date. */
  slots: TimeSlot[] | null;
}

export type DemandLevel = 'free' | 'moderate' | 'high' | 'closed';

/** A per-date occupancy signal shown on a public, view-only calendar. */
export interface DemandEntry {
  date: IsoDate;
  level: DemandLevel;
}

/** Clinic: how busy the consulting rooms are that day. */
export type ClinicDemand = DemandEntry;
/** Hotel: how many kennel places are left that night. Same shape, different wording in the UI. */
export type HotelAvailability = DemandEntry;

export type SlotState = 'free' | 'booked' | 'past';

export interface ResolvedSlot {
  time: TimeSlot;
  state: SlotState;
}

export interface AdminSession {
  user: string;
  expiresAt: string;
}

/** Discriminated result type for business errors that are expected, not exceptional. */
export type Result<T, E extends string> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T, E extends string>(value: T): Result<T, E> {
  return { ok: true, value };
}

export function err<T, E extends string>(error: E): Result<T, E> {
  return { ok: false, error };
}
