import { AnyGamePlugin } from "./types";
import { make24Plugin } from "./make24";

export const GAMES_REGISTRY: Record<string, AnyGamePlugin> = {
  make24: make24Plugin,
};

export function getGamePlugin(id: string): AnyGamePlugin | undefined {
  return GAMES_REGISTRY[id];
}

export function getAllGames(): AnyGamePlugin[] {
  return Object.values(GAMES_REGISTRY);
}
