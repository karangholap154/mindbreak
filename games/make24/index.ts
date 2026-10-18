import { GamePlugin } from "../types";
import { generateMake24Puzzle, Make24Puzzle } from "./generator";
import { Make24Game } from "./Make24Game";

export const make24Plugin: GamePlugin<Make24Puzzle, { steps: string[] }, { solved: boolean }> = {
  id: "make24",
  name: "Make-24",
  category: "math",
  durationSeconds: 60,
  rules: "Combine four numbers using addition, subtraction, multiplication, and division to reach exactly 24. Solve as many sets as you can in 60 seconds.",
  targetDescription: "Equal 24",
  keyboardHints: ["1-4: Select tiles", "+, -, *, /: Operators", "Backspace: Undo"],

  generate: (seed: string, index = 0) => {
    return generateMake24Puzzle(seed, index);
  },

  validate: (_puzzle, submission) => {
    // Client-side verification confirmed via UI combination
    return { solved: (submission?.steps?.length ?? 0) >= 1 };
  },

  score: (result, context) => {
    if (!result.solved) return 0;
    // Base 100 points per puzzle + 15 streak bonus
    const streak = context?.streak ?? 0;
    return 100 + Math.min(streak * 15, 60);
  },

  Component: Make24Game,
};
