"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, Grid3X3, Hash, Zap, Sparkles } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { getAllGames } from "@/games/registry";
import { GameCategory } from "@/games/types";

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | GameCategory>("all");
  const games = getAllGames();

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((g) => g.category === selectedCategory);

  const categories: { id: "all" | GameCategory; label: string }[] = [
    { id: "all", label: "All Games" },
    { id: "math", label: "Math" },
    { id: "puzzle", label: "Puzzle & Logic" },
    { id: "memory", label: "Memory" },
    { id: "reflex", label: "Reflex" },
  ];

  const getIcon = (category: GameCategory) => {
    switch (category) {
      case "math":
        return <Hash className="w-5 h-5 text-acc" />;
      case "puzzle":
        return <Grid3X3 className="w-5 h-5 text-acc" />;
      case "memory":
        return <Brain className="w-5 h-5 text-acc" />;
      case "reflex":
        return <Zap className="w-5 h-5 text-acc" />;
      default:
        return <Sparkles className="w-5 h-5 text-acc" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink pb-24 md:pb-12">
      <TopNav />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 lg:px-14 py-8 md:py-14">
        {/* Page Header */}
        <div className="max-w-[680px] mb-8 sm:mb-12">
          <span className="font-mono text-[12px] font-semibold text-mute uppercase tracking-wider block mb-2">
            Instant 60-Second Library
          </span>
          <h1 className="font-display font-bold text-[38px] sm:text-[48px] tracking-tight leading-none text-ink mb-4">
            Pick your mental reset
          </h1>
          <p className="font-body text-[16px] text-mute leading-relaxed">
            Every game is calibrated for a single minute. Complete 60 valid seconds in any game to count your daily streak.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar" role="tablist">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-mono text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-ink text-surface shadow-sm"
                    : "bg-card text-mute border border-line hover:text-ink hover:border-ink/40"
                }`}
                role="tab"
                aria-selected={isSelected}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="p-7 rounded-[28px] bg-card border border-line flex flex-col justify-between hover:-translate-y-1 hover:border-ink/30 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-surface border border-line flex items-center justify-center shadow-xs">
                    {getIcon(game.category)}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-surface border border-line font-mono text-[11px] text-mute uppercase tracking-wider">
                    {game.durationSeconds}s
                  </span>
                </div>

                <span className="font-mono text-[11px] text-mute uppercase tracking-wider block mb-1">
                  {game.category}
                </span>
                <h3 className="font-display font-bold text-[24px] text-ink mb-2">
                  {game.name}
                </h3>
                <p className="font-body text-[14px] text-mute leading-relaxed mb-4">
                  {game.rules}
                </p>
              </div>

              <div className="pt-5 border-t border-line flex items-center justify-between mt-4">
                <span className="font-mono text-[12px] text-mute">
                  {game.targetDescription}
                </span>

                <Link
                  href={`/play/${game.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-acc text-ink font-bold text-[14px] shadow-xs hover:opacity-95 active:scale-95 transition-all"
                >
                  <span>Play</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Backlog Games Coming Soon Teaser */}
        <div className="mt-16 p-8 rounded-[28px] border border-dashed border-line bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-bold text-[18px] text-ink mb-1">
              More games on the way
            </h4>
            <p className="font-body text-[14px] text-mute">
              Mini KenKen, Nonogram (5×5), Tower of Hanoi, and Anagram Rush are in development for v1.1.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-surface border border-line font-mono text-[12px] text-mute font-semibold whitespace-nowrap">
            15+ Games Roadmap
          </span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
