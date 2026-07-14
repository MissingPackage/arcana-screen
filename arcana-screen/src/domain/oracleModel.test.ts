import { describe, expect, it } from 'vitest';
import { rollOracle } from './oracleModel';

describe('Oracle model', () => {
  it('maps the roll extremes to the strongest answers on an even question', () => {
    expect(rollOracle('even', () => 0).result).toBe('No, and'); // roll 1
    expect(rollOracle('even', () => 0.95).result).toBe('Yes, and'); // roll 20
    expect(rollOracle('even', () => 0.5).result).toBe('Yes, but'); // roll 11
  });

  it('slides the same roll across the bands by likelihood', () => {
    const rng = () => 0.45; // roll 10
    expect(rollOracle('unlikely', rng).result).toBe('No'); // total 6
    expect(rollOracle('even', rng).result).toBe('No, but'); // total 10
    expect(rollOracle('likely', rng).result).toBe('Yes'); // total 14
  });

  it('reports the raw roll, shifted total and likelihood', () => {
    const answer = rollOracle('likely', () => 0);
    expect(answer).toMatchObject({ roll: 1, total: 5, likelihood: 'likely', result: 'No' });
  });
});
