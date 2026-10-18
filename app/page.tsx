"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, RotateCcw, Flame, Sparkles, ArrowRight, Brain, Zap, Hash, Grid3X3 } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { TickRing } from "@/components/brand/TickRing";
import { useStreak } from "@/hooks/useStreak";
import { getDailyFeaturedGame } from "@/lib/dailySeed";
import { getGamePlugin } from "@/games/registry";

export default function Home() {
  const streak = useStreak();
  const [featuredGameId, setFeaturedGameId] = useState<string>("make24");

  useEffect(() => {
    setFeaturedGameId(getDailyFeaturedGame());
  }, []);

  const featuredGame = getGamePlugin(featuredGameId);
  // Interactive test timer for the signature 60-tick stopwatch ring
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= 60) {
            setIsRunning(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const remaining = Math.max(0, 60 - elapsed);

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink pb-24 md:pb-12">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 lg:px-14 py-8 md:py-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-line text-mute font-mono text-[12px] tracking-wider mb-6 uppercase">
              <span className="w-2 h-2 rounded-full bg-acc animate-pulse" />
              Daily 60-Second Mental Reset
            </div>

            {/* Hero H1 */}
            <h1 className="font-display font-extrabold text-[44px] sm:text-[64px] lg:text-[76px] leading-[0.96] tracking-[-0.04em] text-ink mb-6">
              One minute. <br />
              One reset. <br />
              <span className="text-acc">Don’t break it.</span>
            </h1>

            {/* Sub-headline */}
            <p className="font-body text-[18px] sm:text-[20px] text-mute leading-[1.5] max-w-[540px] mb-8">
              Micro-games built for study gaps and meeting breathers. Play 60 seconds
              a day, protect your streak, and earn real milestone rewards.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href={`/play/${featuredGameId}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-acc text-ink font-bold text-[17px] shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Play today’s round</span>
                <ArrowRight className="w-5 h-5 stroke-[2.2]" />
              </Link>

              <Link
                href="#games"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full border-[1.5px] border-ink bg-transparent text-ink font-semibold text-[16px] hover:bg-card transition-colors cursor-pointer"
              >
                Explore 4 launch games
              </Link>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-3 gap-6 pt-10 mt-8 border-t border-line w-full max-w-[520px]">
              <div>
                <p className="font-mono text-[22px] font-semibold text-ink">60s</p>
                <p className="font-body text-[13px] text-mute">Daily habit</p>
              </div>
              <div>
                <p className="font-mono text-[22px] font-semibold text-ink">0 Signup</p>
                <p className="font-body text-[13px] text-mute">Play first round</p>
              </div>
              <div>
                <p className="font-mono text-[22px] font-semibold text-ink">Physical</p>
                <p className="font-body text-[13px] text-mute">Milestone gifts</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Live Stopwatch Card */}
          <div className="lg:col-span-5 relative">
            {/* Floating Sticker Chips */}
            <div className="absolute -top-3 -left-2 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink text-surface font-mono text-[13px] font-medium shadow-sm transform -rotate-3">
              <Flame className="w-4 h-4 text-acc fill-acc" />
              <span>Streak: {streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"}</span>
            </div>

            <div className="absolute -bottom-3 -right-2 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime text-lime-ink font-mono text-[13px] font-bold shadow-sm transform rotate-3">
              <Sparkles className="w-4 h-4 text-lime-ink" />
              <span>Next reward: {streak.currentStreak >= 3 ? "Day 7" : "Day 3"}</span>
            </div>

            {/* Card Container */}
            <div className="p-7 sm:p-10 rounded-[28px] bg-card border border-line shadow-hero flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="font-mono text-[12px] font-semibold text-mute tracking-wider uppercase">
                  Featured Daily Game
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface border border-line font-mono text-[11px] text-acc font-semibold">
                  TODAY’S PUZZLE
                </span>
              </div>

              {/* The Signature 60-Tick Stopwatch Ring */}
              <div className="w-[280px] sm:w-[320px] my-2">
                <TickRing
                  viewBoxSize={340}
                  elapsed={elapsed}
                  total={60}
                  showIndicatorDot={true}
                >
                  <div className="text-center">
                    <span className="font-mono font-medium text-[68px] sm:text-[76px] leading-none tracking-[-0.05em] text-ink block">
                      {remaining.toString().padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[13px] font-medium text-mute tracking-widest uppercase block mt-1">
                      SECONDS LEFT
                    </span>
                  </div>
                </TickRing>
              </div>

              {/* Interactive Stopwatch Controller Bar */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-5 py-2.5 rounded-full bg-ink text-surface font-medium text-[14px] flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  aria-label={isRunning ? "Pause preview timer" : "Start preview timer"}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-surface" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-surface" />
                      <span>Test Ring</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetTimer}
                  className="p-2.5 rounded-full border border-line bg-surface text-mute hover:text-ink hover:border-ink active:scale-95 transition-all cursor-pointer"
                  aria-label="Reset preview timer"
                  title="Reset to 0s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Active Game Info */}
              <div className="w-full mt-6 pt-5 border-t border-line text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime/20 border border-lime-ink/30 text-lime-ink font-mono text-[11px] font-semibold uppercase tracking-wider mb-1">
                  Featured Today
                </div>
                <p className="font-display font-bold text-[18px] text-ink">{featuredGame?.name || "Daily Reset"}</p>
                <p className="font-body text-[13px] text-mute mt-0.5">
                  {featuredGame?.rules || "Micro-game calibrated for a 60-second reset"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 4 Launch Games Bento Grid */}
        <section id="games" className="mt-20 md:mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="font-mono text-[12px] font-semibold text-mute tracking-wider uppercase block mb-2">
                Launch Games
              </span>
              <h2 className="font-display font-bold text-[32px] sm:text-[40px] tracking-tight text-ink leading-none">
                4 ways to reset in 60 seconds
              </h2>
            </div>
            <p className="font-body text-mute text-[15px] max-w-[360px]">
              Every game has a 60-second limit, deterministic daily seeds, and instant scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Game 1: Make-24 */}
            <Link
              href="/play/make24"
              className={`p-7 rounded-[28px] bg-card border flex flex-col justify-between hover:-translate-y-1 hover:border-ink/30 transition-all cursor-pointer group relative ${
                featuredGameId === "make24" ? "border-acc ring-2 ring-acc/20" : "border-line"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Hash className="w-5 h-5 text-acc" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-mute uppercase tracking-wider block">
                    Math
                  </span>
                  {featuredGameId === "make24" && (
                    <span className="px-2 py-0.5 rounded-full bg-acc text-ink font-mono text-[10px] font-bold uppercase tracking-wider">
                      Today’s pick
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-[22px] text-ink mb-2">Make-24</h3>
                <p className="font-body text-[14px] text-mute leading-relaxed">
                  Combine four numbers using +, −, ×, and ÷ to equal exactly 24.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[13px] font-mono">
                <span className="text-mute">Target: 24</span>
                <span className="text-acc font-semibold group-hover:underline">Play now →</span>
              </div>
            </Link>

            {/* Game 2: Mini Sudoku */}
            <Link
              href="/play/sudoku4"
              className={`p-7 rounded-[28px] bg-card border flex flex-col justify-between hover:-translate-y-1 hover:border-ink/30 transition-all cursor-pointer group relative ${
                featuredGameId === "sudoku4" ? "border-acc ring-2 ring-acc/20" : "border-line"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Grid3X3 className="w-5 h-5 text-acc" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-mute uppercase tracking-wider block">
                    Puzzle · Logic
                  </span>
                  {featuredGameId === "sudoku4" && (
                    <span className="px-2 py-0.5 rounded-full bg-acc text-ink font-mono text-[10px] font-bold uppercase tracking-wider">
                      Today’s pick
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-[22px] text-ink mb-2">Mini Sudoku</h3>
                <p className="font-body text-[14px] text-mute leading-relaxed">
                  Rapid-fire 4×4 Sudoku grids. Fill missing digits 1–4 without repeats.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[13px] font-mono">
                <span className="text-mute">Grid: 4×4</span>
                <span className="text-acc font-semibold group-hover:underline">Play now →</span>
              </div>
            </Link>

            {/* Game 3: Pattern Recall */}
            <Link
              href="/play/pattern-recall"
              className={`p-7 rounded-[28px] bg-card border flex flex-col justify-between hover:-translate-y-1 hover:border-ink/30 transition-all cursor-pointer group relative ${
                featuredGameId === "pattern-recall" ? "border-acc ring-2 ring-acc/20" : "border-line"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5 text-acc" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-mute uppercase tracking-wider block">
                    Memory · Sequence
                  </span>
                  {featuredGameId === "pattern-recall" && (
                    <span className="px-2 py-0.5 rounded-full bg-acc text-ink font-mono text-[10px] font-bold uppercase tracking-wider">
                      Today’s pick
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-[22px] text-ink mb-2">Pattern Recall</h3>
                <p className="font-body text-[14px] text-mute leading-relaxed">
                  Watch the flashing tile sequence and repeat it accurately as it extends.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[13px] font-mono">
                <span className="text-mute">Growing levels</span>
                <span className="text-acc font-semibold group-hover:underline">Play now →</span>
              </div>
            </Link>

            {/* Game 4: Stroop Test */}
            <Link
              href="/play/stroop"
              className={`p-7 rounded-[28px] bg-card border flex flex-col justify-between hover:-translate-y-1 hover:border-ink/30 transition-all cursor-pointer group relative ${
                featuredGameId === "stroop" ? "border-acc ring-2 ring-acc/20" : "border-line"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-acc" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-mute uppercase tracking-wider block">
                    Reflex · Focus
                  </span>
                  {featuredGameId === "stroop" && (
                    <span className="px-2 py-0.5 rounded-full bg-acc text-ink font-mono text-[10px] font-bold uppercase tracking-wider">
                      Today’s pick
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-[22px] text-ink mb-2">Stroop Test</h3>
                <p className="font-body text-[14px] text-mute leading-relaxed">
                  Tap the font color of the word, not what the word reads. Reflex speed test.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-[13px] font-mono">
                <span className="text-mute">Color reflex</span>
                <span className="text-acc font-semibold group-hover:underline">Play now →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Section 3: Streak & Real Rewards Ladder Teaser */}
        <section className="mt-20 md:mt-24 p-8 sm:p-12 rounded-[32px] bg-ink text-surface flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-[500px]">
            <span className="px-3 py-1 rounded-full bg-lime text-lime-ink font-mono text-[12px] font-bold tracking-wider uppercase inline-block mb-4">
              Real Rewards System
            </span>
            <h2 className="font-display font-bold text-[32px] sm:text-[42px] leading-[1.05] tracking-tight mb-4">
              Consistency pays off. Digital gifts at 7 days, physical gear at 50+.
            </h2>
            <p className="font-body text-[#9AA59D] text-[16px] leading-relaxed">
              Circles are digital rewards; rounded squares are real physical milestones shipped to your door.
            </p>
          </div>

          {/* Reward Nodes Preview */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-surface/10 border border-surface/20 flex items-center justify-center font-mono font-bold text-surface text-[15px]">
                3d
              </div>
              <span className="font-mono text-[11px] text-[#9AA59D]">Avatar</span>
            </div>

            <div className="w-6 h-[1.5px] bg-surface/20" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-surface/10 border border-surface/20 flex items-center justify-center font-mono font-bold text-surface text-[15px]">
                7d
              </div>
              <span className="font-mono text-[11px] text-[#9AA59D]">Freeze</span>
            </div>

            <div className="w-6 h-[1.5px] bg-surface/20" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-[12px] bg-lime text-lime-ink border border-lime flex items-center justify-center font-mono font-bold text-[16px] shadow-sm">
                50d
              </div>
              <span className="font-mono text-[11px] text-lime font-bold">Pen & Pin</span>
            </div>

            <div className="w-6 h-[1.5px] bg-surface/20" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-[12px] bg-lime text-lime-ink border border-lime flex items-center justify-center font-mono font-bold text-[16px] shadow-sm">
                100d
              </div>
              <span className="font-mono text-[11px] text-lime font-bold">Desk Mug</span>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

