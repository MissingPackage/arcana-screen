// A yes/no improv oracle (Fate/Mythic-style) for adjudicating open questions at the table.
export type Likelihood = 'unlikely' | 'even' | 'likely';
export type OracleResult = 'No, and' | 'No' | 'No, but' | 'Yes, but' | 'Yes' | 'Yes, and';

export interface OracleAnswer {
  result: OracleResult;
  roll: number; // the raw d20
  total: number; // roll shifted by the likelihood
  likelihood: Likelihood;
}

// Likelihood slides the whole distribution rather than swapping tables — a "likely" question
// still leaves room for a surprising "No, and", just less of it.
const MODIFIER: Record<Likelihood, number> = { unlikely: -4, even: 0, likely: 4 };

const band = (total: number): OracleResult => {
  if (total <= 2) return 'No, and';
  if (total <= 8) return 'No';
  if (total <= 10) return 'No, but';
  if (total <= 12) return 'Yes, but';
  if (total <= 18) return 'Yes';
  return 'Yes, and';
};

export const rollOracle = (likelihood: Likelihood, rng: () => number = Math.random): OracleAnswer => {
  const roll = Math.floor(rng() * 20) + 1;
  const total = roll + MODIFIER[likelihood];
  return { result: band(total), roll, total, likelihood };
};
