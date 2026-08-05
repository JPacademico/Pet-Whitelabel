/** Formats digits as the user types into "(99) 99999-9999" / "(99) 9999-9999". */
export function formatBrPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** "(79) 99999-9999" -> "5579999999999" (E.164 without '+', assumes BR country code). */
export function brPhoneToE164(formatted: string): string {
  const digits = formatted.replace(/\D/g, '');
  return `55${digits}`;
}
