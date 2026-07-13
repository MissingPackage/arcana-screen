import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeFormula, parseDiceFormula } from './diceFormulaParser';

describe('dice formula parser', () => {
  afterEach(() => vi.restoreAllMocks());

  it('parses quantity, modifiers, multiple terms and keep-highest', () => {
    const parsed = parseDiceFormula('4d6kh3 + 1d4 - 2');
    expect(parsed.valid).toBe(true);
    expect(parsed.terms).toEqual([
      { type: 'dice', operation: '+', count: 4, sides: 6, keep: { type: 'highest', count: 3 } },
      { type: 'dice', operation: '+', count: 1, sides: 4 },
      { type: 'modifier', operation: '-', value: 2 },
    ]);
  });

  it('returns actionable errors for malformed notation', () => {
    expect(parseDiceFormula('1d2junk')).toMatchObject({ valid: false, error: expect.stringContaining('Invalid dice notation') });
    expect(parseDiceFormula('101d6')).toMatchObject({ valid: false, error: expect.stringContaining('between 1 and 100') });
  });

  it('executes deterministically when randomness is controlled', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.5);
    const parsed = parseDiceFormula('2d6+3');
    if (!parsed.valid) throw new Error('fixture must parse');
    expect(executeFormula(parsed.terms)).toEqual({ results: [1, 4], total: 8, breakdown: ['2d6[1,4]', '+3'] });
  });
});
