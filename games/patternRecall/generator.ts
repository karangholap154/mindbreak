export interface PatternRecallPuzzle {
  id: string;
  sequence: number[]; // Array of tile indices (0, 1, 2, 3)
  level: number;
}

export function generatePatternRecallPuzzle(seed: string, index = 0): PatternRecallPuzzle {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  // Sequence length starts at 3, increases with level
  const length = 3 + index;
  const sequence: number[] = [];

  for (let i = 0; i < length; i++) {
    const val = Math.abs((hash * 37 + (i + 1) * 23 + (index + 1) * 11)) % 4;
    sequence.push(val);
    hash = (hash << 2) + 13;
  }

  return {
    id: `pattern-${seed}-${index}`,
    sequence,
    level: index + 1,
  };
}
