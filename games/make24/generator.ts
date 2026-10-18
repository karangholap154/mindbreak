export interface Make24Puzzle {
  id: string;
  numbers: number[]; // 4 numbers, e.g. [3, 8, 3, 1]
  target: number; // Always 24
}

export type Operator = "+" | "-" | "×" | "÷";

/**
 * Checks if 4 numbers can make 24 using arithmetic operations.
 */
export function hasSolution24(nums: number[]): boolean {
  if (nums.length === 1) {
    return Math.abs(nums[0] - 24) < 1e-5;
  }

  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue;

      const a = nums[i];
      const b = nums[j];
      const remaining: number[] = [];

      for (let k = 0; k < nums.length; k++) {
        if (k !== i && k !== j) remaining.push(nums[k]);
      }

      // Try operations
      const candidates = [a + b, a - b, a * b];
      if (Math.abs(b) > 1e-6) candidates.push(a / b);

      for (const res of candidates) {
        if (hasSolution24([...remaining, res])) {
          return true;
        }
      }
    }
  }

  return false;
}

// Well-tested classic solvable sets for instantaneous generation
const SOLVABLE_SETS: [number, number, number, number][] = [
  [1, 2, 3, 4], // (1+2+3)*4 = 24
  [2, 3, 4, 5], // (5-3)*(2*4)
  [3, 3, 8, 8], // 8 / (3 - 8/3) = 24
  [1, 3, 4, 6], // 6 / (1 - 3/4) = 24
  [4, 4, 4, 4], // (4+4+4)*...
  [2, 4, 6, 8], // (8-6+2)*6
  [1, 4, 5, 6], // 4 / (1 - 5/6)
  [3, 4, 7, 8], // (8-7+4)*...
  [2, 3, 6, 8], // 8 * 3 = 24
  [1, 5, 5, 5], // 5 * (5 - 1/5) = 24
  [2, 2, 5, 7], // (5+7)*(2/2)
  [3, 5, 7, 9], // (7+5-9)*...
  [1, 8, 8, 8], // (8*8)
  [2, 6, 7, 9],
  [4, 6, 8, 9],
  [3, 6, 8, 9],
  [1, 2, 7, 7],
  [2, 5, 5, 10],
  [3, 3, 7, 7],
  [4, 5, 6, 7],
  [1, 4, 8, 9],
  [2, 4, 7, 9],
  [3, 4, 6, 8],
  [5, 6, 7, 8],
  [1, 3, 7, 9],
  [2, 4, 8, 8],
  [3, 5, 8, 8],
  [4, 6, 7, 9],
  [1, 6, 6, 8],
  [2, 7, 8, 9],
];

/**
 * Generate a solvable Make-24 puzzle from a seed or index
 */
export function generateMake24Puzzle(seed: string, index = 0): Make24Puzzle {
  // Hash seed to pick a deterministic starting set
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const setIndex = Math.abs(hash + index) % SOLVABLE_SETS.length;
  const numbers = [...SOLVABLE_SETS[setIndex]];

  // Deterministically shuffle the 4 numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.abs((hash >> (i * 2)) + index) % (i + 1);
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return {
    id: `make24-${seed}-${index}`,
    numbers,
    target: 24,
  };
}

/**
 * Safely evaluates a step-by-step arithmetic expression
 */
export function evaluateStep(a: number, op: Operator, b: number): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (Math.abs(b) < 1e-6) throw new Error("Division by zero");
      return a / b;
  }
}
