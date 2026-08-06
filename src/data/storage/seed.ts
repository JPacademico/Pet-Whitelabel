import type {
  ClinicDemand,
  DateOverride,
  GalleryPhoto,
  GalleryRatio,
  GroomingBooking,
  HotelAvailability,
  Product,
  WeeklyTemplate,
} from '@/domain/types';
import { addIsoDays, todayIsoDate } from '@/lib/datetime';

// All names, phone numbers and photos below are fictitious demo content — see
// IMPLEMENTATION_PLAN.md §3.8 and §0.4 (no real tutor data in the seed).

function makeId(): string {
  return crypto.randomUUID();
}

/**
 * Placeholder product photography, keyword-locked so each product keeps a stable, on-theme image
 * instead of a random one. Swap for real catalogue photography before launch (Appendix C item 3).
 */
function placeholderImage(keywords: string, lock: number): string {
  return `https://loremflickr.com/600/600/${keywords}?lock=${lock}`;
}

const GROOMING_SLOTS_WEEKDAY = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const GROOMING_SLOTS_SATURDAY = ['08:00', '09:00', '10:00', '11:00'];
const CLINIC_SLOTS_WEEKDAY = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
const CLINIC_SLOTS_SATURDAY = ['08:00', '09:00', '10:00', '11:00'];
const HOTEL_SLOTS = ['08:00', '10:00', '14:00', '16:00', '18:00'];

export function buildWeeklyTemplateSeed(): WeeklyTemplate[] {
  return [
    {
      service: 'grooming',
      slotsByWeekday: {
        0: [],
        1: GROOMING_SLOTS_WEEKDAY,
        2: GROOMING_SLOTS_WEEKDAY,
        3: GROOMING_SLOTS_WEEKDAY,
        4: GROOMING_SLOTS_WEEKDAY,
        5: GROOMING_SLOTS_WEEKDAY,
        6: GROOMING_SLOTS_SATURDAY,
      },
    },
    {
      service: 'clinic',
      slotsByWeekday: {
        0: [],
        1: CLINIC_SLOTS_WEEKDAY,
        2: CLINIC_SLOTS_WEEKDAY,
        3: CLINIC_SLOTS_WEEKDAY,
        4: CLINIC_SLOTS_WEEKDAY,
        5: CLINIC_SLOTS_WEEKDAY,
        6: CLINIC_SLOTS_SATURDAY,
      },
    },
    {
      // The hotel takes check-ins/check-outs at set times; nightly vacancy is tracked separately
      // via the hotel-availability collection.
      service: 'hotel',
      slotsByWeekday: {
        0: HOTEL_SLOTS,
        1: HOTEL_SLOTS,
        2: HOTEL_SLOTS,
        3: HOTEL_SLOTS,
        4: HOTEL_SLOTS,
        5: HOTEL_SLOTS,
        6: HOTEL_SLOTS,
      },
    },
  ];
}

/** Nightly vacancy for the next ~2 months, so the public hotel calendar always has data. */
export function buildHotelAvailabilitySeed(now: Date): HotelAvailability[] {
  const today = todayIsoDate(now);
  const pattern: HotelAvailability['level'][] = [
    'free',
    'free',
    'moderate',
    'free',
    'moderate',
    'high',
    'high',
  ];
  return Array.from({ length: 60 }, (_, i) => ({
    date: addIsoDays(today, i),
    // Weekends and holidays fill up first — mirrors how a real pet hotel books.
    level: pattern[i % pattern.length]!,
  }));
}

export function buildDateOverrideSeed(now: Date): DateOverride[] {
  const today = todayIsoDate(now);
  return [
    { service: 'grooming', date: addIsoDays(today, 14), closed: true, slots: null },
    { service: 'clinic', date: addIsoDays(today, 14), closed: true, slots: null },
  ];
}

/** Demand for the next ~2 months so the public clinic calendar is never blank on later months. */
export function buildClinicDemandSeed(now: Date): ClinicDemand[] {
  const today = todayIsoDate(now);
  const pattern: ClinicDemand['level'][] = [
    'high',
    'moderate',
    'free',
    'moderate',
    'high',
    'free',
    'free',
  ];
  return Array.from({ length: 60 }, (_, i) => ({
    date: addIsoDays(today, i),
    level: pattern[i % pattern.length]!,
  }));
}

export function buildProductSeed(now: Date): Product[] {
  const iso = now.toISOString();
  const items: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> = [
    // food
    { name: 'Ração Premium Adulto Cães 15kg', description: 'Alimento completo para cães adultos de porte médio.', priceCents: 18990, itemType: 'food', animalType: 'dog', imageUrl: placeholderImage('dog,food', 101), inStock: true, sale: null },
    { name: 'Ração Filhotes Cães 10kg', description: 'Fórmula para filhotes até 12 meses.', priceCents: 15990, itemType: 'food', animalType: 'dog', imageUrl: placeholderImage('puppy,food', 102), inStock: true, sale: { active: true, percentOff: 15 } },
    { name: 'Ração Gatos Castrados 3kg', description: 'Controle de peso para gatos castrados.', priceCents: 8990, itemType: 'food', animalType: 'cat', imageUrl: placeholderImage('cat,food', 103), inStock: true, sale: null },
    { name: 'Ração Filhotes Gatos 3kg', description: 'Nutrição completa para gatos filhotes.', priceCents: 9490, itemType: 'food', animalType: 'cat', imageUrl: placeholderImage('kitten,food', 104), inStock: false, sale: null },
    { name: 'Petisco Natural Bifinho', description: 'Petisco 100% carne bovina desidratada.', priceCents: 2490, itemType: 'food', animalType: 'both', imageUrl: placeholderImage('dog,treat', 105), inStock: true, sale: { active: true, percentOff: 20 } },
    { name: 'Sachê Gatos Sabor Salmão', description: 'Alimento úmido em molho, caixa com 12 unidades.', priceCents: 4290, itemType: 'food', animalType: 'cat', imageUrl: placeholderImage('cat,salmon', 106), inStock: true, sale: null },
    { name: 'Ração Sênior Cães 12kg', description: 'Fórmula para cães a partir de 7 anos.', priceCents: 19990, itemType: 'food', animalType: 'dog', imageUrl: placeholderImage('dog,kibble', 107), inStock: true, sale: null },
    { name: 'Biscoito Dental Cães', description: 'Ajuda na higiene bucal, pacote com 500g.', priceCents: 3190, itemType: 'food', animalType: 'dog', imageUrl: placeholderImage('dog,biscuit', 108), inStock: true, sale: null },

    // toys
    { name: 'Bolinha de Borracha Resistente', description: 'Brinquedo para mastigação, tamanho único.', priceCents: 1990, itemType: 'toys', animalType: 'dog', imageUrl: placeholderImage('dog,ball', 201), inStock: true, sale: null },
    { name: 'Novelo de Lã com Guizo', description: 'Estimula o instinto de caça dos gatos.', priceCents: 1490, itemType: 'toys', animalType: 'cat', imageUrl: placeholderImage('cat,yarn', 202), inStock: true, sale: { active: true, percentOff: 10 } },
    { name: 'Corda de Algodão Trançada', description: 'Brinquedo de puxar, reforça os dentes.', priceCents: 2290, itemType: 'toys', animalType: 'dog', imageUrl: placeholderImage('dog,rope,toy', 203), inStock: true, sale: null },
    { name: 'Varinha com Penas', description: 'Brinquedo interativo para gatos.', priceCents: 2690, itemType: 'toys', animalType: 'cat', imageUrl: placeholderImage('cat,feather,toy', 204), inStock: true, sale: null },
    { name: 'Arranhador Torre Pequeno', description: 'Torre de sisal com plataforma.', priceCents: 12990, itemType: 'toys', animalType: 'cat', imageUrl: placeholderImage('cat,scratching,post', 205), inStock: false, sale: null },
    { name: 'Brinquedo Mordedor Osso', description: 'Látex atóxico, ajuda na saúde bucal.', priceCents: 2590, itemType: 'toys', animalType: 'dog', imageUrl: placeholderImage('dog,bone,toy', 206), inStock: true, sale: null },
    { name: 'Túnel Dobrável para Gatos', description: 'Túnel de tecido com som crepitante.', priceCents: 5990, itemType: 'toys', animalType: 'cat', imageUrl: placeholderImage('cat,tunnel,play', 207), inStock: true, sale: { active: true, percentOff: 25 } },
    { name: 'Kit 3 Bolinhas Sonoras', description: 'Bolinhas leves com guizo interno.', priceCents: 1790, itemType: 'toys', animalType: 'both', imageUrl: placeholderImage('pet,toy,balls', 208), inStock: true, sale: null },

    // hygiene
    { name: 'Shampoo Neutro 500ml', description: 'Para cães e gatos de todas as idades.', priceCents: 3490, itemType: 'hygiene', animalType: 'both', imageUrl: placeholderImage('dog,shampoo,bath', 301), inStock: true, sale: null },
    { name: 'Condicionador Pelos Longos', description: 'Facilita o desembaraço, 500ml.', priceCents: 3690, itemType: 'hygiene', animalType: 'both', imageUrl: placeholderImage('pet,grooming,bottle', 302), inStock: true, sale: null },
    { name: 'Escova Removedora de Pelos', description: 'Reduz a queda de pelos em até 90%.', priceCents: 6990, itemType: 'hygiene', animalType: 'both', imageUrl: placeholderImage('pet,brush,grooming', 303), inStock: true, sale: { active: true, percentOff: 30 } },
    { name: 'Tapete Higiênico 30un', description: 'Alta absorção, com gel secante.', priceCents: 4990, itemType: 'hygiene', animalType: 'dog', imageUrl: placeholderImage('puppy,training,pad', 304), inStock: true, sale: null },
    { name: 'Areia Higiênica Aglomerante 4kg', description: 'Controle de odor, baixa poeira.', priceCents: 3290, itemType: 'hygiene', animalType: 'cat', imageUrl: placeholderImage('cat,litter', 305), inStock: true, sale: null },
    { name: 'Perfume Pet Colônia', description: 'Fragrância suave, 120ml.', priceCents: 2990, itemType: 'hygiene', animalType: 'both', imageUrl: placeholderImage('pet,perfume,groomed', 306), inStock: false, sale: null },
    { name: 'Cortador de Unhas Profissional', description: 'Lâmina em aço inoxidável com trava de segurança.', priceCents: 4490, itemType: 'hygiene', animalType: 'both', imageUrl: placeholderImage('dog,paw,nails', 307), inStock: true, sale: null },
    { name: 'Escova de Dentes + Pasta Enzimática', description: 'Kit de higiene bucal para cães.', priceCents: 3890, itemType: 'hygiene', animalType: 'dog', imageUrl: placeholderImage('dog,teeth,brush', 308), inStock: true, sale: { active: true, percentOff: 15 } },
  ];

  return items.map((item) => ({
    ...item,
    id: makeId(),
    createdAt: iso,
    updatedAt: iso,
  }));
}

const FICTITIOUS_TUTORS: Array<{ tutor: string; pet: string; animalType: 'dog' | 'cat' }> = [
  { tutor: 'Ana Beatriz', pet: 'Thor', animalType: 'dog' },
  { tutor: 'Carlos Eduardo', pet: 'Mel', animalType: 'cat' },
  { tutor: 'Fernanda Lima', pet: 'Bidu', animalType: 'dog' },
  { tutor: 'Juliana Alves', pet: 'Nina', animalType: 'cat' },
  { tutor: 'Rafael Souza', pet: 'Zeus', animalType: 'dog' },
  { tutor: 'Patrícia Gomes', pet: 'Luna', animalType: 'cat' },
  { tutor: 'Marcos Vinícius', pet: 'Rex', animalType: 'dog' },
  { tutor: 'Camila Rocha', pet: 'Mia', animalType: 'cat' },
  { tutor: 'Bruno Costa', pet: 'Fred', animalType: 'dog' },
  { tutor: 'Letícia Ferreira', pet: 'Amora', animalType: 'cat' },
  { tutor: 'Diego Martins', pet: 'Bolt', animalType: 'dog' },
  { tutor: 'Isabela Cardoso', pet: 'Simba', animalType: 'cat' },
  { tutor: 'Gustavo Pereira', pet: 'Duque', animalType: 'dog' },
  { tutor: 'Larissa Nunes', pet: 'Frida', animalType: 'cat' },
  { tutor: 'Thiago Batista', pet: 'Bento', animalType: 'dog' },
];

export function buildBookingSeed(now: Date): GroomingBooking[] {
  const iso = now.toISOString();
  const today = todayIsoDate(now);

  const offsets = [-6, -5, -4, -3, -2, -1, -1, 0, 0, 1, 2, 3, 4, 5, 7];
  const statusFor = (offset: number): GroomingBooking['status'] => {
    if (offset < 0) return Math.random() > 0.15 ? 'completed' : 'cancelled';
    return 'scheduled';
  };
  const timesPool = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  return FICTITIOUS_TUTORS.map((entry, i) => {
    const offset = offsets[i % offsets.length]!;
    const date = addIsoDays(today, offset);
    const time = timesPool[i % timesPool.length]!;
    return {
      id: makeId(),
      petName: entry.pet,
      animalType: entry.animalType,
      tutorName: entry.tutor,
      tutorWhatsapp: `5599${String(90000000 + i * 137).padStart(8, '0')}`,
      notes: i % 4 === 0 ? 'Alergia a shampoo com fragrância.' : '',
      date,
      time,
      status: statusFor(offset),
      createdAt: iso,
      updatedAt: iso,
    };
  });
}

const GALLERY_RATIO_SIZES: Record<GalleryRatio, [number, number]> = {
  tall: [600, 800],
  square: [600, 600],
  wide: [600, 440],
};

/**
 * Placeholder pet photography, keyword-locked so each tile keeps a stable, on-theme image instead
 * of a random one. `lock` makes the choice deterministic — without it every reload reshuffles the
 * gallery. Replace with the establishment's real photos before launch (Appendix C item 2).
 */
function galleryPhoto(
  id: string,
  animalType: GalleryPhoto['animalType'],
  keywords: string,
  alt: string,
  ratio: GalleryRatio,
  lock: number,
  createdAt: string,
): GalleryPhoto {
  const [w, h] = GALLERY_RATIO_SIZES[ratio];
  return {
    id,
    animalType,
    alt,
    ratio,
    url: `https://loremflickr.com/${w}/${h}/${keywords}?lock=${lock}`,
    fullUrl: `https://loremflickr.com/1200/1500/${keywords}?lock=${lock}`,
    createdAt,
  };
}

export function buildGalleryPhotoSeed(now: Date): GalleryPhoto[] {
  const iso = now.toISOString();
  return [
    galleryPhoto('g1', 'dog', 'golden,retriever', 'Golden retriever sorridente após o banho', 'tall', 501, iso),
    galleryPhoto('g2', 'cat', 'tabby,cat', 'Gato malhado relaxando após a tosa', 'square', 502, iso),
    galleryPhoto('g3', 'dog', 'puppy,dog', 'Filhote recém-banhado enrolado na toalha', 'wide', 503, iso),
    galleryPhoto('g4', 'cat', 'siamese,cat', 'Gato siamês com laço após o banho', 'tall', 504, iso),
    galleryPhoto('g5', 'dog', 'poodle', 'Poodle tosado no estilo teddy bear', 'square', 505, iso),
    galleryPhoto('g6', 'cat', 'persian,cat', 'Filhote de gato persa recém-escovado', 'tall', 506, iso),
    galleryPhoto('g7', 'dog', 'shihtzu,dog', 'Shih tzu com a pelagem escovada', 'wide', 507, iso),
    galleryPhoto('g8', 'cat', 'ginger,cat', 'Gato laranja em consulta veterinária', 'square', 508, iso),
    galleryPhoto('g9', 'dog', 'labrador', 'Labrador aguardando atendimento na clínica', 'tall', 509, iso),
    galleryPhoto('g10', 'cat', 'blackandwhite,cat', 'Gato preto e branco em dia de spa', 'wide', 510, iso),
    galleryPhoto('g11', 'dog', 'frenchbulldog', 'Bulldog francês com laço colorido', 'square', 511, iso),
    galleryPhoto('g12', 'cat', 'kitten,playing', 'Gatinho brincando com novelo de lã', 'tall', 512, iso),
    galleryPhoto('g13', 'dog', 'yorkshire,terrier', 'Yorkshire com tosa higiênica', 'square', 513, iso),
    galleryPhoto('g14', 'cat', 'cat,sleeping', 'Gata descansando no hotel', 'wide', 514, iso),
    galleryPhoto('g15', 'dog', 'germanshepherd', 'Pastor alemão após o check-up', 'tall', 515, iso),
    galleryPhoto('g16', 'cat', 'grey,cat', 'Gato cinza no espaço do hotel', 'square', 516, iso),
  ];
}
