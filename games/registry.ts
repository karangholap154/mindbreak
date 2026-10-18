import { AnyGamePlugin } from "./types";
import { make24Plugin } from "./make24";
import { sudoku4Plugin } from "./sudoku4";
import { patternRecallPlugin } from "./patternRecall";
import { stroopPlugin } from "./stroop";

export const GAMES_REGISTRY: Record<string, AnyGamePlugin> = {
  make24: make24Plugin,
  sudoku4: sudoku4Plugin,
  "pattern-recall": patternRecallPlugin,
  stroop: stroopPlugin,
};

export function getGamePlugin(id: string): AnyGamePlugin | undefined {
  return GAMES_REGISTRY[id];
}

export function getAllGames(): AnyGamePlugin[] {
  return Object.values(GAMES_REGISTRY);
}
