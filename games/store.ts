import { create } from "zustand";
import { AnyGamePlugin, RoundResult } from "./types";

export type GameStatus = "tutorial" | "playing" | "paused" | "finished";

interface GameState {
  status: GameStatus;
  activeGame: AnyGamePlugin | null;
  duration: number;
  timeRemaining: number;
  elapsed: number;
  score: number;
  puzzlesSolved: number;
  errors: number;
  consecutiveSolves: number;
  result: RoundResult | null;

  // Actions
  initGame: (game: AnyGamePlugin, startImmediately?: boolean) => void;
  startPlaying: () => void;
  setElapsed: (elapsed: number) => void;
  recordSuccess: (points: number) => void;
  recordError: (penalty?: number) => void;
  pause: () => void;
  resume: () => void;
  finishRound: () => void;
  resetRound: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  status: "tutorial",
  activeGame: null,
  duration: 60,
  timeRemaining: 60,
  elapsed: 0,
  score: 0,
  puzzlesSolved: 0,
  errors: 0,
  consecutiveSolves: 0,
  result: null,

  initGame: (game: AnyGamePlugin, startImmediately: boolean = false) => {
    set({
      activeGame: game,
      status: startImmediately ? "playing" : "tutorial",
      duration: game.durationSeconds ?? 60,
      timeRemaining: game.durationSeconds ?? 60,
      elapsed: 0,
      score: 0,
      puzzlesSolved: 0,
      errors: 0,
      consecutiveSolves: 0,
      result: null,
    });
  },

  startPlaying: () => {
    set({ status: "playing" });
  },

  setElapsed: (elapsed: number) => {
    const { duration } = get();
    const clampedElapsed = Math.min(duration, Math.max(0, elapsed));
    const timeRemaining = Math.max(0, duration - clampedElapsed);

    set({
      elapsed: clampedElapsed,
      timeRemaining,
    });

    if (clampedElapsed >= duration) {
      get().finishRound();
    }
  },

  recordSuccess: (points: number) => {
    set((state) => ({
      score: state.score + points,
      puzzlesSolved: state.puzzlesSolved + 1,
      consecutiveSolves: state.consecutiveSolves + 1,
    }));
  },

  recordError: (penalty: number = 5) => {
    set((state) => ({
      score: Math.max(0, state.score - penalty),
      errors: state.errors + 1,
      consecutiveSolves: 0,
    }));
  },

  pause: () => {
    if (get().status === "playing") {
      set({ status: "paused" });
    }
  },

  resume: () => {
    if (get().status === "paused") {
      set({ status: "playing" });
    }
  },

  finishRound: () => {
    const { activeGame, score, puzzlesSolved, errors, elapsed } = get();
    const totalAttempts = puzzlesSolved + errors;
    const accuracy = totalAttempts > 0 ? Math.round((puzzlesSolved / totalAttempts) * 100) : 100;

    const result: RoundResult = {
      gameId: activeGame?.id || "unknown",
      gameName: activeGame?.name || "Game",
      score,
      puzzlesSolved,
      errors,
      accuracy,
      secondsPlayed: Math.round(elapsed),
    };

    set({
      status: "finished",
      result,
    });
  },

  resetRound: () => {
    const { activeGame } = get();
    if (activeGame) {
      get().initGame(activeGame, true);
    }
  },
}));
