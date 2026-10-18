"use client";

import React from "react";
import { Gift, Award, Check } from "lucide-react";

export interface MilestoneItem {
  day: number;
  type: "digital" | "physical" | "top";
  name: string;
  description: string;
}

export const MILESTONES: MilestoneItem[] = [
  { day: 3, type: "digital", name: "Custom Avatar", description: "Unlock exclusive profile theme" },
  { day: 7, type: "digital", name: "Streak Freeze", description: "+1 emergency day protection" },
  { day: 14, type: "digital", name: "Game Unlock", description: "Unlock bonus difficulty mode" },
  { day: 30, type: "digital", name: "Focus Master", description: "Profile badge + 1 freeze" },
  { day: 50, type: "physical", name: "Pen & Pin Pack", description: "Matte metal pen & enamel pin" },
  { day: 100, type: "physical", name: "Desk Mug", description: "Ceramic desk mug shipped free" },
  { day: 200, type: "physical", name: "Team Hoodie", description: "Heavyweight embroidered hoodie" },
  { day: 365, type: "top", name: "Founder Trophy", description: "Custom engraved brass trophy" },
];

interface StreakLadderProps {
  currentStreak: number;
}

export function StreakLadder({ currentStreak }: StreakLadderProps) {
  return (
    <div className="w-full py-8">
      {/* Horizontal Scrollable Track */}
      <div className="overflow-x-auto pb-6 pt-4 no-scrollbar">
        <div className="min-w-[840px] flex items-center justify-between relative px-6">
          {/* Track Lines */}
          <div className="absolute left-10 right-10 top-7 h-[2px] bg-line -z-0" />

          {MILESTONES.map((m, idx) => {
            const isCompleted = currentStreak >= m.day;
            const isCurrent =
              currentStreak < m.day &&
              (idx === 0 || currentStreak >= MILESTONES[idx - 1].day);

            return (
              <div
                key={m.day}
                className="flex flex-col items-center relative z-10 group"
              >
                {/* Node Shape per DESIGN.md §5.2 */}
                {m.type === "digital" && (
                  // Digital Node: Circle
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-[15px] transition-all shadow-sm ${
                      isCompleted
                        ? "bg-ink text-surface border-2 border-ink"
                        : isCurrent
                        ? "bg-acc text-ink border-[3px] border-ink ring-4 ring-acc/30 scale-110"
                        : "bg-surface text-mute border border-line"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-lime stroke-[3]" />
                    ) : (
                      <span>{m.day}d</span>
                    )}
                  </div>
                )}

                {m.type === "physical" && (
                  // Physical Node: Rounded Square (12px radius, lime fill)
                  <div
                    className={`w-14 h-14 rounded-[12px] flex flex-col items-center justify-center font-mono font-bold text-[15px] transition-all shadow-sm ${
                      isCompleted
                        ? "bg-lime text-lime-ink border-2 border-lime-ink"
                        : isCurrent
                        ? "bg-lime text-lime-ink border-2 border-ink ring-4 ring-acc/40 scale-110"
                        : "bg-card text-mute border border-dashed border-line"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-lime-ink stroke-[3]" />
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mb-0.5 text-lime-ink/70" />
                        <span className="text-[13px]">{m.day}d</span>
                      </>
                    )}
                  </div>
                )}

                {m.type === "top" && (
                  // Top Node: Ink Square with Lime Numeral
                  <div
                    className={`w-14 h-14 rounded-[12px] flex flex-col items-center justify-center font-mono font-bold text-[14px] transition-all shadow-sm ${
                      isCompleted
                        ? "bg-ink text-lime border-2 border-lime"
                        : isCurrent
                        ? "bg-ink text-lime border-2 border-acc ring-4 ring-acc/40 scale-110"
                        : "bg-ink/80 text-lime/50 border border-ink"
                    }`}
                  >
                    <Award className="w-4 h-4 mb-0.5 text-lime" />
                    <span>365d</span>
                  </div>
                )}

                {/* "You are here" label */}
                {isCurrent && (
                  <span className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-acc text-ink font-mono font-bold text-[10px] uppercase tracking-wider whitespace-nowrap shadow-xs animate-bounce">
                    You are here
                  </span>
                )}

                {/* Node Labels below */}
                <div className="mt-3 text-center">
                  <p className="font-mono font-semibold text-[13px] text-ink whitespace-nowrap">
                    {m.name}
                  </p>
                  <p className="font-body text-[11px] text-mute max-w-[90px] leading-tight mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
