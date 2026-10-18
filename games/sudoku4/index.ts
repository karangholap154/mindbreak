import { GamePlugin } from "../types";
import { generateSudoku4Puzzle, Sudoku4Puzzle, isValidSudoku4 } from "./generator";
import { Sudoku4Game } from "./Sudoku4Game";

export const sudoku4Plugin: GamePlugin<Sudoku4Puzzle, { grid: number[][] }, { solved: boolean }> = {
  id: "sudoku4",
  name: "Mini Sudoku",
  category: "puzzle",
  durationSeconds: 60,
  rules: "Fill the 4×4 grid so every row, column, and 2×2 box contains the digits 1, 2, 3, and 4 without duplicates. Solve as many grids as you can in 60s.",
  targetDescription: "Fill rows, columns & boxes with 1-4",
  keyboardHints: ["1-4: Input digits", "Arrow keys: Move cell", "Backspace: Erase"],

  generate: (seed: string, index = 0) => {
    return generateSudoku4Puzzle(seed, index);
  },

  validate: (_puzzle, submission) => {
    return { solved: isValidSudoku4(submission?.grid) };
  },

  score: (result, context) => {
    if (!result.solved) return 0;
    const streak = context?.streak ?? 0;
    return 100 + Math.min(streak * 15, 60);
  },

  Component: Sudoku4Game,
};
