import { describe, expect, it } from 'vitest';
import { applyDiscount, centsToReaisInput, formatCentsBRL, parseReaisToCents } from './money';

describe('parseReaisToCents', () => {
  it('parses a comma-decimal value', () => {
    expect(parseReaisToCents('89,90')).toBe(8990);
  });

  it('parses a dot-decimal value', () => {
    expect(parseReaisToCents('89.90')).toBe(8990);
  });

  it('parses an integer value with no decimals', () => {
    expect(parseReaisToCents('50')).toBe(5000);
  });

  it('rejects non-numeric input', () => {
    expect(parseReaisToCents('abc')).toBeNull();
  });

  it('rejects more than two decimal places', () => {
    expect(parseReaisToCents('10,999')).toBeNull();
  });
});

describe('formatCentsBRL', () => {
  it('formats cents as a BRL currency string', () => {
    expect(formatCentsBRL(8990)).toContain('89,90');
  });
});

describe('centsToReaisInput / parseReaisToCents round-trip', () => {
  it('round-trips without drift', () => {
    const cents = 12345;
    expect(parseReaisToCents(centsToReaisInput(cents))).toBe(cents);
  });
});

describe('applyDiscount', () => {
  it('applies a percentage discount and rounds to the nearest cent', () => {
    expect(applyDiscount(10000, 15)).toBe(8500);
    expect(applyDiscount(999, 33)).toBe(669); // 999 * 0.67 = 669.33 → rounds to 669
  });
});
