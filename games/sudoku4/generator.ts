export interface Sudoku4Puzzle {
  id: string;
  initialGrid: number[][]; // 4x4 numbers, 0 for empty cells
  solution: number[][];    // 4x4 solution
}

const TEMPLATE_SOLUTIONS: number[][][] = [
  [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ],
  [
    [2, 3, 4, 1],
    [4, 1, 2, 3],
    [3, 2, 1, 4],
    [1, 4, 3, 2],
  ],
  [
    [3, 4, 1, 2],
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [2, 1, 4, 3],
  ],
  [
    [4, 1, 2, 3],
    [2, 3, 4, 1],
    [1, 4, 3, 2],
    [3, 2, 1, 4],
  ],
  [
    [1, 3, 2, 4],
    [4, 2, 1, 3],
    [3, 1, 4, 2],
    [2, 4, 3, 1],
  ],
  [
    [2, 4, 1, 3],
    [3, 1, 4, 2],
    [4, 2, 3, 1],
    [1, 3, 2, 4],
  ],
];

export function generateSudoku4Puzzle(seed: string, index = 0): Sudoku4Puzzle {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const baseSolution = TEMPLATE_SOLUTIONS[Math.abs(hash + index) % TEMPLATE_SOLUTIONS.length];

  // Deep copy
  const solution = baseSolution.map((row) => [...row]);
  const initialGrid = baseSolution.map((row) => [...row]);

  // Remove 4 to 6 cells deterministically so the puzzle is fast to complete in 60s
  const cellsToBlank = 4 + (Math.abs(hash >> (index % 16)) % 3); // 4, 5, or 6 blanks
  const allIndices = Array.from({ length: 16 }, (_, i) => i);

  // Deterministic Fisher-Yates shuffle
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.abs((hash * 37 + index * 19 + i * 23)) % (i + 1);
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }

  const pickedIndices = allIndices.slice(0, cellsToBlank);

  pickedIndices.forEach((cellIdx) => {
    const r = Math.floor(cellIdx / 4);
    const c = cellIdx % 4;
    initialGrid[r][c] = 0;
  });

  return {
    id: `sudoku4-${seed}-${index}`,
    initialGrid,
    solution,
  };
}

export function isValidSudoku4(grid: number[][]): boolean {
  // Check rows and columns
  for (let i = 0; i < 4; i++) {
    const rowSet = new Set<number>();
    const colSet = new Set<number>();
    for (let j = 0; j < 4; j++) {
      const rowVal = grid[i][j];
      const colVal = grid[j][i];
      if (rowVal < 1 || rowVal > 4 || rowSet.has(rowVal)) return false;
      if (colVal < 1 || colVal > 4 || colSet.has(colVal)) return false;
      rowSet.add(rowVal);
      colSet.add(colVal);
    }
  }

  // Check 2x2 blocks
  for (let blockR = 0; blockR < 4; blockR += 2) {
    for (let blockC = 0; blockC < 4; blockC += 2) {
      const blockSet = new Set<number>();
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const val = grid[blockR + r][blockC + c];
          if (val < 1 || val > 4 || blockSet.has(val)) return false;
          blockSet.add(val);
        }
      }
    }
  }

  return true;
}
