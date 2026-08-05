import type {
  AdminSession,
  ClinicDemand,
  DateOverride,
  GroomingBooking,
  HotelAvailability,
  NewBooking,
  NewProduct,
  Product,
  ProductFilter,
  Result,
  ServiceKind,
  WeeklyTemplate,
} from '@/domain/types';

/**
 * The boundary the UI is allowed to see. Every method is a Promise even though the local
 * implementation is synchronous under the hood — that keeps loading/error states exercised now,
 * and means swapping in an HTTP implementation later touches zero UI code.
 * See IMPLEMENTATION_PLAN.md §3.6 and §10.
 */

export interface ProductRepository {
  list(filter?: ProductFilter): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
  create(input: NewProduct): Promise<Product>;
  update(id: string, patch: Partial<NewProduct>): Promise<Product>;
  remove(id: string): Promise<void>;
}

export type BookingCreateError = 'SLOT_TAKEN' | 'SLOT_INVALID';
export type BookingRescheduleError = 'SLOT_TAKEN' | 'SLOT_INVALID' | 'NOT_FOUND';

export interface BookingRepository {
  list(): Promise<GroomingBooking[]>;
  get(id: string): Promise<GroomingBooking | null>;
  create(input: NewBooking): Promise<Result<GroomingBooking, BookingCreateError>>;
  reschedule(
    id: string,
    date: string,
    time: string,
  ): Promise<Result<GroomingBooking, BookingRescheduleError>>;
  setStatus(id: string, status: GroomingBooking['status']): Promise<GroomingBooking>;
}

export interface AvailabilityRepository {
  getWeeklyTemplate(service: ServiceKind): Promise<WeeklyTemplate>;
  setWeeklyTemplate(service: ServiceKind, template: WeeklyTemplate): Promise<void>;
  listOverrides(service: ServiceKind): Promise<DateOverride[]>;
  upsertOverride(override: DateOverride): Promise<void>;
  listClinicDemand(): Promise<ClinicDemand[]>;
  setClinicDemand(entry: ClinicDemand): Promise<void>;
  listHotelAvailability(): Promise<HotelAvailability[]>;
  setHotelAvailability(entry: HotelAvailability): Promise<void>;
}

export type LoginError = 'INVALID_CREDENTIALS';

export interface AuthRepository {
  login(username: string, password: string): Promise<Result<AdminSession, LoginError>>;
  logout(): Promise<void>;
  getSession(): Promise<AdminSession | null>;
}
