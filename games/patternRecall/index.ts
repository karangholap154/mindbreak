import { GamePlugin } from "../types";
import { generatePatternRecallPuzzle, PatternRecallPuzzle } from "./generator";
import { PatternRecallGame } from "./PatternRecallGame";

export const patternRecallPlugin: GamePlugin<PatternRecallPuzzle, { level: number }, { solved: boolean }> = {
  id: "pattern-recall",
  name: "Pattern Recall",
  category: "memory",
  durationSeconds: 60,
  rules: "Memorize the sequence of flashing quadrant pads, then repeat it in the exact order. The sequence lengthens with each level.",
  targetDescription: "Repeat sequence of increasing lengths",
  keyboardHints: ["Q, W, A, S or 1, 2, 3, 4: Tap quadrants"],

  generate: (seed: string, index = 0) => {
    return generatePatternRecallPuzzle(seed, index);
  },

  validate: (_puzzle, submission) => {
    return { solved: (submission?.level ?? 0) >= 1 };
  },

  score: (_result, context) => {
    const streak = context?.streak ?? 0;
    return 100 + streak * 25;
  },

  Component: PatternRecallGame,
};
