import { z } from 'zod';

// Mirrors src/domain/types.ts. Kept as a separate file (not inferred from types) because these
// validate untrusted localStorage content — see IMPLEMENTATION_PLAN.md §3.3.

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');
export const timeSlotSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido');

export const animalTypeSchema = z.enum(['dog', 'cat']);
export const itemTypeSchema = z.enum(['food', 'toys', 'hygiene']);

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  priceCents: z.number().int().nonnegative(),
  itemType: itemTypeSchema,
  animalType: z.enum(['dog', 'cat', 'both']),
  imageUrl: z.string(),
  inStock: z.boolean(),
  sale: z
    .object({
      active: z.boolean(),
      percentOff: z.number().min(1).max(90),
    })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const productListSchema = z.array(productSchema);

export const bookingStatusSchema = z.enum(['scheduled', 'completed', 'cancelled']);

export const groomingBookingSchema = z.object({
  id: z.string(),
  petName: z.string().min(1),
  animalType: animalTypeSchema,
  tutorName: z.string().min(1),
  tutorWhatsapp: z.string().regex(/^\d{10,13}$/, 'Telefone inválido'),
  notes: z.string(),
  date: isoDateSchema,
  time: timeSlotSchema,
  status: bookingStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const groomingBookingListSchema = z.array(groomingBookingSchema);

export const serviceKindSchema = z.enum(['grooming', 'clinic', 'hotel']);

export const weeklyTemplateSchema = z.object({
  service: serviceKindSchema,
  slotsByWeekday: z.record(z.string(), z.array(timeSlotSchema)),
});
export const weeklyTemplateListSchema = z.array(weeklyTemplateSchema);

export const dateOverrideSchema = z.object({
  service: serviceKindSchema,
  date: isoDateSchema,
  closed: z.boolean(),
  slots: z.array(timeSlotSchema).nullable(),
});
export const dateOverrideListSchema = z.array(dateOverrideSchema);

export const demandLevelSchema = z.enum(['free', 'moderate', 'high', 'closed']);
export const demandEntrySchema = z.object({
  date: isoDateSchema,
  level: demandLevelSchema,
});
export const clinicDemandSchema = demandEntrySchema;
export const clinicDemandListSchema = z.array(demandEntrySchema);
export const hotelAvailabilityListSchema = z.array(demandEntrySchema);

export const galleryRatioSchema = z.enum(['tall', 'square', 'wide']);
export const galleryPhotoSchema = z.object({
  id: z.string(),
  animalType: animalTypeSchema,
  alt: z.string().min(1),
  ratio: galleryRatioSchema,
  url: z.string(),
  fullUrl: z.string(),
  createdAt: z.string(),
});
export const galleryPhotoListSchema = z.array(galleryPhotoSchema);

export const adminSessionSchema = z.object({
  user: z.string(),
  expiresAt: z.string(),
});

// Form-facing schemas (used with react-hook-form + zodResolver).

export const bookingFormSchema = z.object({
  animalType: animalTypeSchema,
  petName: z.string().trim().min(2, 'Informe o nome do pet').max(40),
  tutorName: z.string().trim().min(2, 'Informe seu nome').max(60),
  tutorWhatsapp: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Use o formato (99) 99999-9999'),
  notes: z.string().trim().max(500).optional(),
  date: isoDateSchema,
  time: timeSlotSchema,
});
export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do produto').max(80),
  description: z.string().trim().max(400).optional(),
  priceReais: z
    .string()
    .trim()
    .min(1, 'Informe o preço')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido'),
  itemType: itemTypeSchema,
  animalType: z.enum(['dog', 'cat', 'both']),
  imageUrl: z.string().trim().url('Informe uma URL de imagem válida'),
  inStock: z.boolean(),
  saleActive: z.boolean(),
  salePercentOff: z.number().min(1).max(90).optional(),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;

export const galleryPhotoFormSchema = z.object({
  animalType: animalTypeSchema,
  alt: z.string().trim().min(4, 'Descreva a foto em poucas palavras').max(120),
  ratio: galleryRatioSchema,
  url: z.string().trim().url('Informe uma URL de imagem válida'),
});
export type GalleryPhotoFormValues = z.infer<typeof galleryPhotoFormSchema>;

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;
