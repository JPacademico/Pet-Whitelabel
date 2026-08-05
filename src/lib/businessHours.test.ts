import { describe, expect, it } from 'vitest';
import { groupBusinessHours, formatRanges, type HourRange } from './businessHours';

const NINE_TO_SIX: HourRange[] = [{ open: '08:00', close: '18:00' }];
const HALF_DAY: HourRange[] = [{ open: '08:00', close: '12:00' }];

describe('groupBusinessHours', () => {
  it('collapses consecutive weekdays that share the same hours into one range label', () => {
    const groups = groupBusinessHours({
      0: [],
      1: NINE_TO_SIX,
      2: NINE_TO_SIX,
      3: NINE_TO_SIX,
      4: NINE_TO_SIX,
      5: NINE_TO_SIX,
      6: HALF_DAY,
    });

    expect(groups.map((g) => g.label)).toEqual(['Seg a Sex', 'Sábado', 'Domingo']);
    expect(groups[0]!.weekdays).toEqual([1, 2, 3, 4, 5]);
    expect(groups[2]!.closed).toBe(true);
  });

  it('keeps a midweek exception visible instead of merging across it', () => {
    const groups = groupBusinessHours({
      0: [],
      1: NINE_TO_SIX,
      2: NINE_TO_SIX,
      3: HALF_DAY, // Wednesday differs
      4: NINE_TO_SIX,
      5: NINE_TO_SIX,
      6: [],
    });

    expect(groups.map((g) => g.label)).toEqual(['Seg e Ter', 'Quarta', 'Qui e Sex', 'Sáb e Dom']);
  });

  it('produces a single group when every day is identical', () => {
    const groups = groupBusinessHours({
      0: NINE_TO_SIX,
      1: NINE_TO_SIX,
      2: NINE_TO_SIX,
      3: NINE_TO_SIX,
      4: NINE_TO_SIX,
      5: NINE_TO_SIX,
      6: NINE_TO_SIX,
    });

    expect(groups).toHaveLength(1);
    expect(groups[0]!.label).toBe('Seg a Dom');
  });

  it('treats different range shapes as distinct even when they overlap', () => {
    const split: HourRange[] = [
      { open: '08:00', close: '12:00' },
      { open: '14:00', close: '18:00' },
    ];
    const groups = groupBusinessHours({
      0: [],
      1: split,
      2: split,
      3: NINE_TO_SIX,
      4: NINE_TO_SIX,
      5: NINE_TO_SIX,
      6: [],
    });

    expect(groups.map((g) => g.label)).toEqual(['Seg e Ter', 'Qua a Sex', 'Sáb e Dom']);
  });

  it('uses the full weekday name for a lone day', () => {
    const groups = groupBusinessHours({
      0: [],
      1: NINE_TO_SIX,
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    });
    expect(groups[0]!.label).toBe('Segunda');
  });
});

describe('formatRanges', () => {
  it('renders a closed day', () => {
    expect(formatRanges([])).toBe('Fechado');
  });

  it('renders a single range', () => {
    expect(formatRanges(NINE_TO_SIX)).toBe('08:00 às 18:00');
  });

  it('joins split shifts', () => {
    expect(
      formatRanges([
        { open: '08:00', close: '12:00' },
        { open: '14:00', close: '18:00' },
      ]),
    ).toBe('08:00 às 12:00 e 14:00 às 18:00');
  });
});
