import React from "react";

export type GameCategory = "puzzle" | "math" | "memory" | "word" | "reflex";

export interface GameProps<TPuzzle = unknown, TSubmission = unknown> {
  puzzle: TPuzzle;
  onSolve: (submission: TSubmission) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export interface RoundResult {
  gameId: string;
  gameName: string;
  score: number;
  puzzlesSolved: number;
  errors: number;
  accuracy: number;
  secondsPlayed: number;
  streakCount?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGamePlugin = GamePlugin<any, any, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GamePlugin<TPuzzle = any, TSubmission = any, TResult = any> {
  id: string;
  name: string;
  category: GameCategory;
  durationSeconds: number;
  rules: string;
  targetDescription: string;
  keyboardHints: string[];
  generate: (seed: string, difficulty?: number) => TPuzzle;
  validate: (puzzle: TPuzzle, submission: TSubmission) => TResult;
  score: (result: TResult, context?: { timeRemaining: number; streak: number }) => number;
  Component: React.ComponentType<GameProps<TPuzzle, TSubmission>>;
}
