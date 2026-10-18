"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, Delete, FastForward } from "lucide-react";
import { GameProps } from "../types";
import { Sudoku4Puzzle, isValidSudoku4 } from "./generator";

export function Sudoku4Game({
  puzzle,
  onSolve,
  onSkip,
  disabled = false,
}: GameProps<Sudoku4Puzzle, { grid: number[][] }>) {
  // Current 4x4 grid values
  const [grid, setGrid] = useState<number[][]>(() =>
    puzzle.initialGrid.map((row) => [...row])
  );

  // Selected cell coordinates [row, col]
  const [selectedCell, setSelectedCell] = useState<[number, number]>(() => {
    // Default select first empty cell
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (puzzle.initialGrid[r][c] === 0) return [r, c];
      }
    }
    return [0, 0];
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorCell, setErrorCell] = useState<[number, number] | null>(null);

  // Check if a cell is an initial fixed clue
  const isClue = useCallback(
    (r: number, c: number) => puzzle.initialGrid[r][c] !== 0,
    [puzzle.initialGrid]
  );

  // Input a number into the currently selected cell
  const handleInputNumber = useCallback(
    (num: number) => {
      if (disabled || isSuccess) return;
      const [r, c] = selectedCell;
      if (isClue(r, c)) return;

      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      setErrorCell(null);

      // Check if grid is full
      const isFull = newGrid.every((row) => row.every((val) => val > 0));
      if (isFull) {
        if (isValidSudoku4(newGrid)) {
          setIsSuccess(true);
          setTimeout(() => {
            onSolve({ grid: newGrid });
          }, 350);
        } else {
          setErrorCell([r, c]);
        }
      }
    },
    [disabled, isSuccess, selectedCell, isClue, grid, onSolve]
  );

  // Erase the selected cell
  const handleErase = useCallback(() => {
    if (disabled || isSuccess) return;
    const [r, c] = selectedCell;
    if (isClue(r, c)) return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = 0;
    setGrid(newGrid);
    setErrorCell(null);
  }, [disabled, isSuccess, selectedCell, isClue, grid]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || isSuccess) return;

      if (["1", "2", "3", "4"].includes(e.key)) {
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key === "ArrowUp") {
        setSelectedCell(([r, c]) => [Math.max(0, r - 1), c]);
      } else if (e.key === "ArrowDown") {
        setSelectedCell(([r, c]) => [Math.min(3, r + 1), c]);
      } else if (e.key === "ArrowLeft") {
        setSelectedCell(([r, c]) => [r, Math.max(0, c - 1)]);
      } else if (e.key === "ArrowRight") {
        setSelectedCell(([r, c]) => [r, Math.min(3, c + 1)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isSuccess, handleInputNumber, handleErase]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 4x4 Sudoku Grid */}
      <div className="grid grid-cols-4 gap-1 p-2 rounded-[20px] bg-card border-2 border-ink shadow-sm mb-6">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selectedCell[0] === r && selectedCell[1] === c;
            const fixed = isClue(r, c);
            const isErr = errorCell && errorCell[0] === r && errorCell[1] === c;

            // Border styling for 2x2 blocks
            const borderClasses = `${r === 1 ? "border-b-2 border-b-ink" : ""} ${
              c === 1 ? "border-r-2 border-r-ink" : ""
            }`;

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => setSelectedCell([r, c])}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[8px] font-mono font-bold text-[24px] sm:text-[28px] flex items-center justify-center transition-all cursor-pointer ${borderClasses} ${
                  isSelected
                    ? "bg-acc text-ink scale-105 z-10 shadow-md"
                    : fixed
                    ? "bg-surface text-ink/90 font-extrabold cursor-default"
                    : isSuccess
                    ? "bg-lime text-lime-ink"
                    : isErr
                    ? "bg-error/20 text-error border border-error"
                    : "bg-surface/60 text-ink hover:bg-surface"
                }`}
                aria-label={`Cell row ${r + 1} column ${c + 1}`}
              >
                {val > 0 ? val : ""}
              </button>
            );
          })
        )}
      </div>

      {/* Number Pad for Input */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleInputNumber(num)}
            disabled={disabled || isSuccess}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface border border-line hover:border-ink font-mono font-bold text-[22px] sm:text-[24px] text-ink active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-40"
          >
            {num}
          </button>
        ))}

        <button
          onClick={handleErase}
          disabled={disabled || isSuccess}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card border border-line hover:border-ink flex items-center justify-center text-mute hover:text-ink active:scale-95 transition-all cursor-pointer disabled:opacity-40"
          aria-label="Erase cell"
          title="Erase (Backspace)"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Skip Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSkip}
          disabled={disabled || isSuccess}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-card text-mute text-[13px] font-mono font-medium hover:text-ink hover:bg-surface disabled:opacity-40 cursor-pointer transition-all"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip grid (-10 pts)</span>
        </button>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="flex items-center gap-1.5 text-lime-ink font-body text-[13px] font-bold mt-3 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Grid Complete!</span>
        </div>
      )}
    </div>
  );
}
