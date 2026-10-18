"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Check, Eye, Play, AlertCircle, FastForward } from "lucide-react";
import { GameProps } from "../types";
import { PatternRecallPuzzle } from "./generator";

type Phase = "showing" | "input" | "success" | "error";

export function PatternRecallGame({
  puzzle,
  onSolve,
  onSkip,
  disabled = false,
}: GameProps<PatternRecallPuzzle, { level: number }>) {
  const [phase, setPhase] = useState<Phase>("showing");
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [userStepIndex, setUserStepIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(0);

  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  // Play the sequence to the user
  const playSequence = useCallback(() => {
    clearAllTimeouts();
    setPhase("showing");
    setUserStepIndex(0);
    setActiveTile(null);
    setShowProgress(0);

    const stepDuration = 450; // ms per tile flash
    const pauseDuration = 180; // ms between flashes
    const totalStep = stepDuration + pauseDuration;

    puzzle.sequence.forEach((tileIdx, i) => {
      // Flash on
      const t1 = setTimeout(() => {
        setActiveTile(tileIdx);
        setShowProgress(i + 1);
      }, 500 + i * totalStep);

      // Flash off
      const t2 = setTimeout(() => {
        setActiveTile(null);
      }, 500 + i * totalStep + stepDuration);

      timeoutIdsRef.current.push(t1, t2);
    });

    // Switch to input phase after full sequence plays
    const endT = setTimeout(() => {
      setPhase("input");
      setActiveTile(null);
    }, 500 + puzzle.sequence.length * totalStep + 200);

    timeoutIdsRef.current.push(endT);
  }, [puzzle.sequence]);

  // Start sequence playback on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playSequence();
    }, 50);
    return () => {
      clearTimeout(timer);
      clearAllTimeouts();
    };
  }, [playSequence]);

  // Handle tile tap during input phase
  const handleTilePress = useCallback(
    (tileIdx: number) => {
      if (disabled || phase !== "input") return;

      // Flash tile momentarily on user press
      setActiveTile(tileIdx);
      setTimeout(() => setActiveTile(null), 180);

      const expectedTile = puzzle.sequence[userStepIndex];

      if (tileIdx === expectedTile) {
        // Correct step
        const nextStep = userStepIndex + 1;
        setUserStepIndex(nextStep);

        if (nextStep === puzzle.sequence.length) {
          // Solved whole pattern!
          setPhase("success");
          setTimeout(() => {
            onSolve({ level: puzzle.level });
          }, 350);
        }
      } else {
        // Incorrect step
        setPhase("error");
        setTimeout(() => {
          playSequence(); // Replay same sequence so player isn't stuck
        }, 800);
      }
    },
    [disabled, phase, puzzle.sequence, puzzle.level, userStepIndex, onSolve, playSequence]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || phase !== "input") return;

      if (e.key === "1" || e.key.toLowerCase() === "q") handleTilePress(0);
      else if (e.key === "2" || e.key.toLowerCase() === "w") handleTilePress(1);
      else if (e.key === "3" || e.key.toLowerCase() === "a") handleTilePress(2);
      else if (e.key === "4" || e.key.toLowerCase() === "s") handleTilePress(3);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, phase, handleTilePress]);

  const tileLabels = ["Q / 1", "W / 2", "A / 3", "S / 4"];

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Level & Phase Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="px-3 py-1 rounded-full bg-ink text-surface font-mono text-[12px] font-bold uppercase tracking-wider">
          Level {puzzle.level}
        </span>

        {phase === "showing" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-acc text-ink font-mono text-[12px] font-bold uppercase tracking-wider animate-pulse">
            <Eye className="w-3.5 h-3.5" />
            Watch Pattern ({showProgress}/{puzzle.sequence.length})
          </span>
        )}

        {phase === "input" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime text-lime-ink font-mono text-[12px] font-bold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-lime-ink" />
            Your Turn ({userStepIndex}/{puzzle.sequence.length})
          </span>
        )}

        {phase === "error" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error text-surface font-mono text-[12px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            Wrong Tile! Replaying...
          </span>
        )}

        {phase === "success" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime text-lime-ink font-mono text-[12px] font-bold uppercase tracking-wider">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Perfect!
          </span>
        )}
      </div>

      {/* 4-Quadrant Tactile Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-[240px] sm:w-[280px] h-[240px] sm:h-[280px] mb-6">
        {[0, 1, 2, 3].map((tileIdx) => {
          const isLit = activeTile === tileIdx;
          return (
            <button
              key={tileIdx}
              onClick={() => handleTilePress(tileIdx)}
              disabled={disabled || phase === "showing"}
              className={`rounded-[24px] border-2 transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm ${
                isLit
                  ? "bg-acc text-ink border-ink scale-105 shadow-lg brightness-110"
                  : phase === "input"
                  ? "bg-surface text-mute border-line hover:border-ink hover:text-ink active:scale-95"
                  : "bg-card text-mute/50 border-line/60 cursor-default"
              }`}
              aria-label={`Pattern quadrant ${tileIdx + 1}`}
            >
              <div
                className={`w-4 h-4 rounded-full mb-2 transition-colors ${
                  isLit ? "bg-ink" : "bg-line"
                }`}
              />
              <span className="font-mono text-[12px] font-bold tracking-wider opacity-60">
                {tileLabels[tileIdx]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sequence Dots Progress */}
      <div className="flex items-center gap-2 mb-6">
        {puzzle.sequence.map((_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i < userStepIndex
                ? "bg-lime scale-110"
                : i === userStepIndex && phase === "input"
                ? "bg-acc animate-pulse scale-125"
                : "bg-line"
            }`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSkip}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-card text-mute text-[13px] font-mono font-medium hover:text-ink hover:bg-surface disabled:opacity-40 cursor-pointer transition-all"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip level</span>
        </button>
      </div>
    </div>
  );
}
