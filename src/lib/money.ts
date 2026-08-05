const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCentsBRL(cents: number): string {
  return brlFormatter.format(cents / 100);
}

/** Parses a user-typed "89,90" / "89.90" / "89" into integer cents. Returns null if not parseable. */
export function parseReaisToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(parseFloat(normalized) * 100);
}

export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function applyDiscount(priceCents: number, percentOff: number): number {
  return Math.round(priceCents * (1 - percentOff / 100));
}
