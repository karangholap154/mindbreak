"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, HelpCircle } from "lucide-react";
import { AnyGamePlugin } from "@/games/types";
import { useGameStore } from "@/games/store";
import { TickRing } from "@/components/brand/TickRing";
import { ResultScreen } from "./ResultScreen";

interface GameShellProps {
  game: AnyGamePlugin;
}

export function GameShell({ game }: GameShellProps) {
  const store = useGameStore();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(() => game.generate("today-seed", 0));
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  // Initialize store when game prop changes
  const activeGameId = store.activeGame?.id;
  const initGame = store.initGame;
  useEffect(() => {
    if (activeGameId !== game.id) {
      initGame(game);
    }
  }, [game, activeGameId, initGame]);

  // Window blur / focus listeners (Pause on blur UX)
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Timer loop via requestAnimationFrame
  const status = store.status;
  const elapsed = store.elapsed;
  const duration = store.duration;
  const setElapsed = store.setElapsed;

  useEffect(() => {
    if (status !== "playing") return;

    const startTimestamp = performance.now() - elapsed * 1000;
    let rafId: number;

    const loop = () => {
      const currentElapsed = (performance.now() - startTimestamp) / 1000;
      setElapsed(currentElapsed);

      if (currentElapsed < duration) {
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [status, duration, elapsed, setElapsed]);

  // Handlers
  const handleSolve = (submission: unknown) => {
    const validation = game.validate(currentPuzzle, submission);
    const points = game.score(validation, {
      timeRemaining: store.timeRemaining,
      streak: store.consecutiveSolves,
    });

    store.recordSuccess(points);

    // Advance to next puzzle
    const nextIdx = currentPuzzleIndex + 1;
    setCurrentPuzzleIndex(nextIdx);
    setCurrentPuzzle(game.generate("today-seed", nextIdx));
  };

  const handleSkip = () => {
    store.recordError(10);
    const nextIdx = currentPuzzleIndex + 1;
    setCurrentPuzzleIndex(nextIdx);
    setCurrentPuzzle(game.generate("today-seed", nextIdx));
  };

  const handleStartRound = () => {
    store.startPlaying();
  };

  const handleReplay = () => {
    store.resetRound();
    setCurrentPuzzleIndex(0);
    setCurrentPuzzle(game.generate("today-seed", 0));
    store.startPlaying();
  };

  // If game round finished, display Result Screen
  if (store.status === "finished" && store.result) {
    return <ResultScreen result={store.result} onReplay={handleReplay} />;
  }

  const GameComponent = game.Component;

  return (
    <div className="w-full max-w-[1360px] mx-auto py-6 sm:py-8 select-none">
      {/* Mobile Top Score Strip */}
      <div className="md:hidden flex items-center justify-between p-4 mb-4 rounded-[20px] bg-card border border-line">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-mute">SCORE:</span>
          <span className="font-mono font-bold text-[20px] text-ink">{store.score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-mute">TIME:</span>
          <span className="font-mono font-bold text-[20px] text-acc">
            {Math.ceil(store.timeRemaining)}s
          </span>
        </div>
      </div>

      {/* Main 3-Column Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Game Rules & Target (3 cols) */}
        <aside className="md:col-span-3 flex flex-col gap-4 order-2 md:order-1">
          <div className="p-6 rounded-[28px] bg-card border border-line">
            <span className="font-mono text-[11px] font-semibold text-mute tracking-wider uppercase block mb-1">
              Category · {game.category}
            </span>
            <h1 className="font-display font-bold text-[28px] text-ink leading-tight mb-3">
              {game.name}
            </h1>
            <p className="font-body text-[14px] text-mute leading-relaxed mb-4">
              {game.rules}
            </p>

            <div className="pt-4 border-t border-line">
              <span className="font-mono text-[11px] text-mute uppercase block mb-1">
                Objective
              </span>
              <p className="font-body text-[14px] font-semibold text-ink">
                {game.targetDescription}
              </p>
            </div>
          </div>
        </aside>

        {/* Center Column: The 60-Tick Ring and Game Area (6 cols) */}
        <section className="md:col-span-6 flex flex-col items-center order-1 md:order-2 relative">
          {/* Pause on blur dim overlay */}
          {!isWindowFocused && store.status === "playing" && (
            <div className="absolute inset-0 z-30 bg-bg/90 backdrop-blur-sm rounded-[28px] border border-line flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <Pause className="w-12 h-12 text-acc mb-4 animate-pulse" />
              <h3 className="font-display font-bold text-[24px] text-ink mb-2">
                Round paused (Tab unfocused)
              </h3>
              <p className="font-body text-[14px] text-mute max-w-[320px] mb-6">
                Click below to return. Keep in mind time continues running per anti-cheat rules.
              </p>
              <button
                onClick={() => setIsWindowFocused(true)}
                className="px-6 py-3 rounded-full bg-acc text-ink font-bold text-[15px] shadow-sm hover:opacity-95 cursor-pointer"
              >
                Return to the round
              </button>
            </div>
          )}

          {/* 5-second Tutorial Overlay for First Play */}
          {store.status === "tutorial" && (
            <div className="w-full max-w-[480px] p-8 sm:p-10 rounded-[28px] bg-card border border-line shadow-hero flex flex-col items-center text-center my-6 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-lime text-lime-ink flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="font-display font-bold text-[28px] text-ink mb-2">
                Ready for {game.name}?
              </h2>
              <p className="font-body text-[15px] text-mute mb-8 max-w-[340px]">
                You have exactly 60 seconds. Combine numbers to reach 24 as many times as you can!
              </p>
              <button
                onClick={handleStartRound}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-acc text-ink font-bold text-[17px] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-ink" />
                <span>Start 60s Round</span>
              </button>
            </div>
          )}

          {/* Active Gameplay Arena */}
          {store.status !== "tutorial" && (
            <div className="w-full flex flex-col items-center">
              {/* Ring Container with Countdown Numerals */}
              <div className="w-[280px] sm:w-[360px] my-4 relative flex items-center justify-center">
                <TickRing
                  viewBoxSize={440}
                  radius={200}
                  tickWidth={3}
                  tickLength={22}
                  elapsed={store.elapsed}
                  total={store.duration}
                  showIndicatorDot={true}
                >
                  <div className="text-center">
                    <span className="font-mono font-medium text-[72px] sm:text-[90px] leading-none tracking-[-0.05em] text-ink block">
                      {Math.ceil(store.timeRemaining).toString().padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[13px] font-medium text-mute tracking-widest uppercase block mt-1">
                      SECONDS LEFT
                    </span>
                  </div>
                </TickRing>
              </div>

              {/* Game Plugin Play Area - key forces clean remount per puzzle */}
              <div className="w-full max-w-[480px] p-6 rounded-[28px] bg-card border border-line shadow-sm mt-2">
                <GameComponent
                  key={(currentPuzzle as { id?: string })?.id || currentPuzzleIndex}
                  puzzle={currentPuzzle}
                  onSolve={handleSolve}
                  onSkip={handleSkip}
                  disabled={store.status !== "playing"}
                />
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Score Card & Key Hints (3 cols) */}
        <aside className="md:col-span-3 flex flex-col gap-4 order-3">
          {/* Live Score Card */}
          <div className="p-6 rounded-[28px] bg-card border border-line flex flex-col">
            <span className="font-mono text-[11px] font-semibold text-mute tracking-wider uppercase mb-1">
              Current Score
            </span>
            <div className="font-mono font-bold text-[44px] text-ink leading-none my-2">
              {store.score}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line font-mono text-[13px]">
              <div>
                <span className="text-mute block text-[11px] uppercase">Solved</span>
                <span className="font-bold text-ink">{store.puzzlesSolved}</span>
              </div>
              <div>
                <span className="text-mute block text-[11px] uppercase">Streak</span>
                <span className="font-bold text-acc">
                  {store.consecutiveSolves}x
                </span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="p-6 rounded-[28px] bg-card border border-line hidden sm:block">
            <span className="font-mono text-[11px] font-semibold text-mute tracking-wider uppercase block mb-3">
              Keyboard Hints
            </span>
            <ul className="space-y-2">
              {game.keyboardHints.map((hint, idx) => (
                <li
                  key={idx}
                  className="font-mono text-[12px] text-mute flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-acc" />
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
