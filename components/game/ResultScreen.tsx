"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ArrowRight, Share2, Flame, Shield, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { RoundResult } from "@/games/types";

interface ResultScreenProps {
  result: RoundResult;
  onReplay: () => void;
}

export function ResultScreen({ result, onReplay }: ResultScreenProps) {
  // Score count-up animation
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Confetti celebration if score > 0
    if (result.score > 0) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#FF5A2B", "#CFEA6B", "#0E1411"],
        });
      } catch {
        // Safe fallback if canvas not available
      }
    }

    const duration = 700; // ms
    const startTime = performance.now();
    const targetScore = result.score;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easeProgress * targetScore));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [result.score]);

  return (
    <div className="w-full max-w-[1080px] mx-auto py-6 sm:py-10 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Score & Stats (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Score Card */}
          <div className="p-8 sm:p-12 rounded-[28px] bg-card border border-line shadow-sm flex flex-col items-center sm:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line font-mono text-[12px] text-mute tracking-wider uppercase mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-ink" />
              Round Completed · {result.gameName}
            </div>

            <div className="my-2">
              <span className="font-mono font-bold text-[84px] sm:text-[110px] leading-none tracking-[-0.05em] text-ink block">
                {displayScore}
              </span>
              <span className="font-mono text-[14px] text-mute uppercase tracking-widest block mt-2">
                FINAL POINTS
              </span>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-4 w-full mt-8 pt-6 border-t border-line">
              <div>
                <p className="font-mono text-[24px] sm:text-[28px] font-bold text-ink">
                  {result.puzzlesSolved}
                </p>
                <p className="font-body text-[13px] text-mute">Puzzles Solved</p>
              </div>

              <div>
                <p className="font-mono text-[24px] sm:text-[28px] font-bold text-ink">
                  {result.accuracy}%
                </p>
                <p className="font-body text-[13px] text-mute">Accuracy</p>
              </div>

              <div>
                <p className="font-mono text-[24px] sm:text-[28px] font-bold text-ink">
                  {result.secondsPlayed}s
                </p>
                <p className="font-body text-[13px] text-mute">Play Time</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onReplay}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-acc text-ink font-bold text-[16px] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
              <span>Play again</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-[1.5px] border-ink bg-transparent text-ink font-semibold text-[15px] hover:bg-card active:scale-95 transition-all cursor-pointer"
            >
              <span>Back to home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Mind Break",
                    text: `I scored ${result.score} points on Mind Break's ${result.gameName}! Can you beat it?`,
                    url: window.location.href,
                  });
                }
              }}
              className="p-3.5 rounded-full border border-line bg-card text-mute hover:text-ink hover:border-ink transition-colors cursor-pointer"
              aria-label="Share score"
              title="Share score"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Streak Progress & Rewards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dark Streak Feature Card */}
          <div className="p-8 rounded-[28px] bg-ink text-surface shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-lime text-lime-ink font-mono text-[11px] font-bold tracking-wider uppercase">
                  Play Day Counted
                </span>
                <div className="flex items-center gap-1 font-mono text-[12px] text-[#9AA59D]">
                  <Shield className="w-3.5 h-3.5 text-lime" />
                  <span>1 FREEZE</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <Flame className="w-8 h-8 text-acc fill-acc" />
                <span className="font-mono font-bold text-[48px] sm:text-[56px] leading-none text-surface">
                  1
                </span>
                <span className="font-mono text-[16px] text-[#9AA59D] uppercase tracking-wider">
                  Day Streak
                </span>
              </div>

              <p className="font-body text-[14px] text-[#9AA59D] leading-relaxed mb-6">
                You’ve completed your 60-second habit for today! Consistency unlocks milestone rewards.
              </p>
            </div>

            {/* Progress to Next Reward */}
            <div className="pt-6 border-t border-surface/15">
              <div className="flex items-center justify-between font-mono text-[12px] mb-2">
                <span className="text-[#9AA59D]">NEXT MILESTONE</span>
                <span className="text-lime font-bold">Day 3 · Avatar</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface/15 overflow-hidden">
                <div className="h-full bg-acc rounded-full" style={{ width: "33%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
