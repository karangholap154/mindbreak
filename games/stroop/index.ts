import { GamePlugin } from "../types";
import { generateStroopPuzzle, StroopPuzzle, StroopColor } from "./generator";
import { StroopGame } from "./StroopGame";

export const stroopPlugin: GamePlugin<
  StroopPuzzle,
  { selectedColor: StroopColor; correct: boolean },
  { solved: boolean }
> = {
  id: "stroop",
  name: "Stroop Test",
  category: "reflex",
  durationSeconds: 60,
  rules: "Tap the actual font color of the word as fast as you can. Do not be tricked by what the word reads!",
  targetDescription: "Select matching font color",
  keyboardHints: ["1, 2, 3, 4 or R, B, G, Y: Match color"],

  generate: (seed: string, index = 0) => {
    return generateStroopPuzzle(seed, index);
  },

  validate: (_puzzle, submission) => {
    return { solved: submission?.correct === true };
  },

  score: (result, context) => {
    if (!result.solved) return 0;
    const streak = context?.streak ?? 0;
    // Fast-paced: 25 base points + streak bonus
    return 25 + Math.min(streak * 5, 25);
  },

  Component: StroopGame,
};
