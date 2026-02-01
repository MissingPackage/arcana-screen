/**
 * Advanced Dice Formula Parser
 * Supports D&D-style dice notation with multiple terms and keep mechanics
 *
 * Supported formats:
 * - Simple: 2d6, d20, 3d8+5
 * - Complex: 1d20+3+1d4, 2d6+1d8+5
 * - Keep highest: 4d6kh3, 2d20kh1
 * - Keep lowest: 4d6kl1, 2d20kl1
 */

export interface DiceTerm {
  type: 'dice' | 'modifier';
  operation: '+' | '-';
  // For dice terms
  count?: number;
  sides?: number;
  keep?: {
    type: 'highest' | 'lowest';
    count: number;
  };
  // For modifier terms
  value?: number;
}

export interface ParseResult {
  valid: boolean;
  terms: DiceTerm[];
  error?: string;
}

/**
 * Parses a dice formula string into structured terms
 * @param formula - The formula string to parse (e.g., "2d6+5", "1d20+3+1d4")
 * @returns ParseResult with validity, terms array, and optional error message
 */
export function parseDiceFormula(formula: string): ParseResult {
  if (!formula || !formula.trim()) {
    return {
      valid: false,
      terms: [],
      error: 'Formula cannot be empty'
    };
  }

  const normalized = formula.trim().toLowerCase().replace(/\s+/g, '');
  const terms: DiceTerm[] = [];

  // Split by + and - while preserving the operators
  const tokens: Array<{ value: string; op: '+' | '-' }> = [];
  let currentToken = '';
  let currentOp: '+' | '-' = '+';

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char === '+' || char === '-') {
      if (currentToken) {
        tokens.push({ value: currentToken, op: currentOp });
        currentToken = '';
      }
      currentOp = char;
    } else {
      currentToken += char;
    }
  }
  if (currentToken) {
    tokens.push({ value: currentToken, op: currentOp });
  }

  if (tokens.length === 0) {
    return {
      valid: false,
      terms: [],
      error: 'Invalid formula format'
    };
  }

  // Parse each token
  for (const token of tokens) {
    const parsedTerm = parseToken(token.value, token.op);
    if (!parsedTerm.valid) {
      return parsedTerm;
    }
    terms.push(...parsedTerm.terms);
  }

  return {
    valid: true,
    terms
  };
}

/**
 * Parses a single token (dice notation or constant)
 */
function parseToken(token: string, operation: '+' | '-'): ParseResult {
  // Check if it's a dice notation (contains 'd')
  if (token.includes('d')) {
    return parseDiceToken(token, operation);
  }

  // Otherwise it's a constant modifier
  const value = parseInt(token);
  if (isNaN(value)) {
    return {
      valid: false,
      terms: [],
      error: `Invalid number: "${token}"`
    };
  }

  return {
    valid: true,
    terms: [{
      type: 'modifier',
      operation,
      value
    }]
  };
}

/**
 * Parses a dice notation token (e.g., "2d6", "4d6kh3", "d20")
 */
function parseDiceToken(token: string, operation: '+' | '-'): ParseResult {
  // Match patterns like: d20, 2d6, 4d6kh3, 2d20kl1
  const dicePattern = /^(\d*)d(\d+)(?:k([hl])(\d+))?$/;
  const match = token.match(dicePattern);

  if (!match) {
    return {
      valid: false,
      terms: [],
      error: `Invalid dice notation: "${token}". Use format like "2d6" or "4d6kh3"`
    };
  }

  const count = match[1] ? parseInt(match[1]) : 1;
  const sides = parseInt(match[2]);
  const keepType = match[3] as 'h' | 'l' | undefined;
  const keepCount = match[4] ? parseInt(match[4]) : undefined;

  // Validate dice count and sides
  if (count < 1 || count > 100) {
    return {
      valid: false,
      terms: [],
      error: `Dice count must be between 1 and 100, got ${count}`
    };
  }

  if (sides < 2 || sides > 100) {
    return {
      valid: false,
      terms: [],
      error: `Dice sides must be between 2 and 100, got ${sides}`
    };
  }

  // Build the dice term
  const term: DiceTerm = {
    type: 'dice',
    operation,
    count,
    sides
  };

  // Add keep mechanic if present
  if (keepType && keepCount !== undefined) {
    if (keepCount < 1 || keepCount > count) {
      return {
        valid: false,
        terms: [],
        error: `Keep count must be between 1 and ${count}, got ${keepCount}`
      };
    }

    term.keep = {
      type: keepType === 'h' ? 'highest' : 'lowest',
      count: keepCount
    };
  }

  return {
    valid: true,
    terms: [term]
  };
}

/**
 * Rolls dice according to parsed terms and returns results
 * @param terms - Array of parsed dice terms
 * @returns Object with individual results and final total
 */
export interface RollResult {
  results: number[];
  total: number;
  breakdown: string[];
}

export function executeFormula(terms: DiceTerm[]): RollResult {
  const results: number[] = [];
  const breakdown: string[] = [];
  let total = 0;

  for (const term of terms) {
    if (term.type === 'dice' && term.count && term.sides) {
      const rolls: number[] = [];

      // Roll the dice
      for (let i = 0; i < term.count; i++) {
        rolls.push(Math.floor(Math.random() * term.sides) + 1);
      }

      let termValue: number;
      let termBreakdown: string;

      // Apply keep mechanic if present
      if (term.keep) {
        const sortedRolls = [...rolls].sort((a, b) => b - a);
        const keptRolls = term.keep.type === 'highest'
          ? sortedRolls.slice(0, term.keep.count)
          : sortedRolls.slice(-term.keep.count);

        termValue = keptRolls.reduce((sum, roll) => sum + roll, 0);
        termBreakdown = `${term.count}d${term.sides}k${term.keep.type[0]}${term.keep.count}[${rolls.join(',')}→${keptRolls.join(',')}]`;
      } else {
        termValue = rolls.reduce((sum, roll) => sum + roll, 0);
        termBreakdown = `${term.count}d${term.sides}[${rolls.join(',')}]`;
      }

      results.push(...rolls);

      if (term.operation === '-') {
        total -= termValue;
        breakdown.push(`-${termBreakdown}`);
      } else {
        total += termValue;
        breakdown.push(termBreakdown);
      }
    } else if (term.type === 'modifier' && term.value !== undefined) {
      if (term.operation === '-') {
        total -= term.value;
        breakdown.push(`-${term.value}`);
      } else {
        total += term.value;
        breakdown.push(`+${term.value}`);
      }
    }
  }

  return {
    results,
    total,
    breakdown
  };
}
