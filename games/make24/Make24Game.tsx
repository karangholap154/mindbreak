"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, FastForward, Check, AlertCircle } from "lucide-react";
import { GameProps } from "../types";
import { Make24Puzzle, Operator, evaluateStep } from "./generator";
import { playTapSound, playCorrectSound, playErrorSound } from "@/lib/sound";

interface TileState {
  id: string;
  value: number;
}

interface StepHistory {
  tiles: TileState[];
  description: string;
}

export function Make24Game({
  puzzle,
  onSolve,
  onSkip,
  disabled = false,
}: GameProps<Make24Puzzle, { steps: string[] }>) {
  // Tile state initialized from the 4 puzzle numbers
  const [tiles, setTiles] = useState<TileState[]>(() =>
    puzzle.numbers.map((num, i) => ({ id: `tile-${i}-${num}`, value: num }))
  );

  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const [history, setHistory] = useState<StepHistory[]>([]);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Undo last step
  const handleUndo = useCallback(() => {
    if (history.length === 0 || disabled || isSuccess) return;
    playTapSound();
    const previous = history[history.length - 1];
    setTiles(previous.tiles);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedTileId(null);
    setSelectedOp(null);
    setErrorFeedback(null);
  }, [history, disabled, isSuccess]);

  // Handle operator click
  const handleOpClick = useCallback(
    (op: Operator) => {
      if (disabled || isSuccess) return;
      playTapSound();
      if (!selectedTileId) {
        setErrorFeedback("Select a number first");
        return;
      }
      setErrorFeedback(null);
      setSelectedOp(op);
    },
    [disabled, isSuccess, selectedTileId]
  );

  // Handle tile click
  const handleTileClick = useCallback(
    (tile: TileState) => {
      if (disabled || isSuccess) return;
      setErrorFeedback(null);

      // If no tile selected yet, select this tile
      if (!selectedTileId) {
        playTapSound();
        setSelectedTileId(tile.id);
        return;
      }

      // If clicked the same tile, deselect
      if (selectedTileId === tile.id) {
        playTapSound();
        setSelectedTileId(null);
        setSelectedOp(null);
        return;
      }

      // If a tile is selected but no operator yet, switch selection to this new tile
      if (!selectedOp) {
        playTapSound();
        setSelectedTileId(tile.id);
        return;
      }

      // Both Tile A and Operator are chosen, now combining with Tile B
      const firstTile = tiles.find((t) => t.id === selectedTileId);
      if (!firstTile) return;

      try {
        const resultVal = evaluateStep(firstTile.value, selectedOp, tile.value);

        if (!isFinite(resultVal)) {
          playErrorSound();
          setErrorFeedback("Cannot divide by 0");
          return;
        }

        playTapSound();
        const newStepDesc = `${firstTile.value} ${selectedOp} ${tile.value} = ${Number(resultVal.toFixed(2))}`;
        const newHistory: StepHistory[] = [
          ...history,
          {
            tiles: [...tiles],
            description: newStepDesc,
          },
        ];
        setHistory(newHistory);

        const nextTiles: TileState[] = tiles
          .filter((t) => t.id !== firstTile.id && t.id !== tile.id)
          .concat({
            id: `res-${Date.now()}`,
            value: Number(resultVal.toFixed(2)),
          });

        setTiles(nextTiles);
        setSelectedTileId(null);
        setSelectedOp(null);

        // Check if finished (1 tile remaining)
        if (nextTiles.length === 1) {
          if (Math.abs(nextTiles[0].value - 24) < 1e-4) {
            setIsSuccess(true);
            playCorrectSound();
            setTimeout(() => {
              onSolve({ steps: newHistory.map((h) => h.description) });
            }, 350);
          } else {
            playErrorSound();
            setErrorFeedback(`Reached ${nextTiles[0].value}, target is 24`);
          }
        }
      } catch {
        playErrorSound();
        setErrorFeedback("Invalid operation");
      }
    },
    [disabled, isSuccess, selectedTileId, selectedOp, tiles, history, onSolve]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Backspace" || e.key === "z") {
        handleUndo();
      } else if (e.key === "+") {
        handleOpClick("+");
      } else if (e.key === "-") {
        handleOpClick("-");
      } else if (e.key === "*" || e.key === "x") {
        handleOpClick("×");
      } else if (e.key === "/") {
        handleOpClick("÷");
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (tiles[index]) {
          handleTileClick(tiles[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, tiles, handleTileClick, handleOpClick, handleUndo]);

  const operators: Operator[] = ["+", "-", "×", "÷"];

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Target Tile Banner */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink text-surface font-mono text-[13px] font-semibold tracking-wider mb-6">
        <span>TARGET:</span>
        <span className="text-lime text-[16px] font-bold">24</span>
      </div>

      {/* Available Number Tiles */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 min-h-[72px]">
        {tiles.map((tile) => {
          const isSelected = selectedTileId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className={`w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[18px] border font-mono font-bold text-[28px] sm:text-[32px] flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                isSelected
                  ? "bg-acc text-ink border-ink scale-105 shadow-md"
                  : isSuccess
                  ? "bg-lime text-lime-ink border-lime-ink"
                  : "bg-surface text-ink border-line hover:border-ink/40 active:scale-95"
              }`}
              aria-label={`Number tile ${tile.value}`}
            >
              {tile.value}
            </button>
          );
        })}
      </div>

      {/* Operator Buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
        {operators.map((op) => {
          const isSelected = selectedOp === op;
          return (
            <button
              key={op}
              onClick={() => handleOpClick(op)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border font-mono font-bold text-[22px] sm:text-[24px] flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-ink text-surface border-ink scale-105"
                  : "bg-card text-ink border-ink/20 hover:border-ink hover:bg-surface active:scale-95"
              }`}
              aria-label={`Operator ${op}`}
            >
              {op}
            </button>
          );
        })}
      </div>

      {/* Control Actions (Undo, Skip) & Feedback */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleUndo}
          disabled={history.length === 0 || disabled || isSuccess}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-card text-ink text-[13px] font-mono font-medium hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        <button
          onClick={onSkip}
          disabled={disabled || isSuccess}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line bg-card text-mute text-[13px] font-mono font-medium hover:text-ink hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip (-10 pts)</span>
        </button>
      </div>

      {/* Error or Success notification */}
      {errorFeedback && (
        <div className="flex items-center gap-1.5 text-error font-body text-[13px] mt-3 animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{errorFeedback}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-1.5 text-lime-ink font-body text-[13px] font-bold mt-3 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Equal 24! Great solve!</span>
        </div>
      )}
    </div>
  );
}
