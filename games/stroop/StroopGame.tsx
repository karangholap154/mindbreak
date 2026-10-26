"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, AlertCircle, FastForward } from "lucide-react";
import { GameProps } from "../types";
import { StroopPuzzle, StroopColor, STROOP_COLORS } from "./generator";
import { playCorrectSound, playErrorSound } from "@/lib/sound";

export function StroopGame({
  puzzle,
  onSolve,
  onSkip,
  disabled = false,
}: GameProps<StroopPuzzle, { selectedColor: StroopColor; correct: boolean }>) {
  const [feedback, setFeedback] = useState<"correct" | "error" | null>(null);

  const handleSelectColor = useCallback(
    (chosenColor: StroopColor) => {
      if (disabled || feedback !== null) return;

      const isCorrect = chosenColor === puzzle.fontColor;

      if (isCorrect) {
        playCorrectSound();
        setFeedback("correct");
        setTimeout(() => {
          onSolve({ selectedColor: chosenColor, correct: true });
        }, 180);
      } else {
        playErrorSound();
        setFeedback("error");
        setTimeout(() => {
          setFeedback(null);
          // Advance on mistake too with penalty
          onSolve({ selectedColor: chosenColor, correct: false });
        }, 320);
      }
    },
    [disabled, feedback, puzzle.fontColor, onSolve]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || feedback !== null) return;

      const key = e.key.toLowerCase();
      if (key === "1" || key === "r") handleSelectColor("red");
      else if (key === "2" || key === "b") handleSelectColor("blue");
      else if (key === "3" || key === "g") handleSelectColor("green");
      else if (key === "4" || key === "y") handleSelectColor("yellow");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, feedback, handleSelectColor]);

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      {/* Reminder Eyebrow */}
      <span className="font-mono text-[12px] font-semibold text-mute uppercase tracking-wider mb-4">
        Tap the <strong className="text-acc">Font Color</strong> (ignore the text)
      </span>

      {/* Main Stimulus Word Display */}
      <div
        className={`w-full h-32 rounded-[24px] bg-surface border border-line flex items-center justify-center transition-all shadow-sm my-2 ${
          feedback === "correct"
            ? "border-lime bg-lime/10 scale-105"
            : feedback === "error"
            ? "border-error bg-error/10 animate-shake"
            : ""
        }`}
      >
        <span
          className="font-display font-extrabold text-[54px] sm:text-[68px] leading-none tracking-tight transition-transform"
          style={{ color: puzzle.fontColorHex }}
        >
          {puzzle.wordText}
        </span>
      </div>

      {/* 4 Color Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[360px] my-6">
        {STROOP_COLORS.map((col, idx) => {
          const keyShortcuts = ["1 / R", "2 / B", "3 / G", "4 / Y"];
          return (
            <button
              key={col.name}
              onClick={() => handleSelectColor(col.name)}
              disabled={disabled || feedback !== null}
              className={`h-14 sm:h-16 rounded-[18px] border-2 font-mono font-bold text-[16px] sm:text-[18px] flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 ${
                col.name === "red"
                  ? "bg-[#E53935]/15 text-[#E53935] border-[#E53935] hover:bg-[#E53935] hover:text-white"
                  : col.name === "blue"
                  ? "bg-[#1E88E5]/15 text-[#1E88E5] border-[#1E88E5] hover:bg-[#1E88E5] hover:text-white"
                  : col.name === "green"
                  ? "bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white"
                  : "bg-[#D49E00]/15 text-[#8D6B00] border-[#D49E00] hover:bg-[#D49E00] hover:text-ink"
              }`}
            >
              <span>{col.label}</span>
              <span className="text-[11px] opacity-75 font-normal tracking-wider">
                {keyShortcuts[idx]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action / Skip Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSkip}
          disabled={disabled || feedback !== null}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-card text-mute text-[13px] font-mono font-medium hover:text-ink hover:bg-surface disabled:opacity-40 cursor-pointer transition-all"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip word (-10 pts)</span>
        </button>
      </div>

      {/* Feedback status */}
      {feedback === "correct" && (
        <div className="flex items-center gap-1.5 text-lime-ink font-body text-[13px] font-bold mt-3 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Fast Match!</span>
        </div>
      )}

      {feedback === "error" && (
        <div className="flex items-center gap-1.5 text-error font-body text-[13px] font-bold mt-3">
          <AlertCircle className="w-4 h-4" />
          <span>Mistake! Word said &ldquo;{puzzle.wordText}&rdquo; but font was {puzzle.fontColor.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
