// Single source of truth for establishment data. Replace placeholders with real values
// before launch — see IMPLEMENTATION_PLAN.md Appendix C.
export const SITE = {
  name: 'Pet Studio',
  whatsapp: '5579999999999',
  phoneDisplay: '(79) 99999-9999',
  instagram: 'https://instagram.com/petstudio',
  timezone: 'America/Maceio',
  address: {
    street: 'Av. Exemplo, 123',
    neighborhood: 'Centro',
    city: 'Aracaju',
    state: 'SE',
    zip: '49000-000',
  },
  coords: { lat: -10.9472, lng: -37.0731 },
  /** 0 = Sunday … 6 = Saturday. Empty array = closed that day. */
  hours: {
    0: [],
    1: [{ open: '08:00', close: '18:00' }],
    2: [{ open: '08:00', close: '18:00' }],
    3: [{ open: '08:00', close: '18:00' }],
    4: [{ open: '08:00', close: '18:00' }],
    5: [{ open: '08:00', close: '18:00' }],
    6: [{ open: '08:00', close: '12:00' }],
  } satisfies Record<number, { open: string; close: string }[]>,
} as const;

export const MAX_ADVANCE_DAYS = 60;
export const MIN_LEAD_HOURS = 2;
