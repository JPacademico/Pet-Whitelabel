/** Strips accents so "ração" matches a search for "racao" — required for pt-BR free-text search. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
