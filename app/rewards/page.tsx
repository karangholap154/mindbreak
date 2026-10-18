"use client";

import React from "react";
import Link from "next/link";
import { Flame, Shield, Check, Lock, ArrowRight, Truck, Info } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useStreak } from "@/hooks/useStreak";
import { StreakLadder, MILESTONES } from "@/components/rewards/StreakLadder";

export default function RewardsPage() {
  const streak = useStreak();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink pb-24 md:pb-12">
      <TopNav />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 lg:px-14 py-8 md:py-14">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="font-mono text-[12px] font-semibold text-mute uppercase tracking-wider block mb-2">
              Retention & Milestone Gifts
            </span>
            <h1 className="font-display font-bold text-[38px] sm:text-[48px] tracking-tight text-ink leading-none">
              Daily habit. Real rewards.
            </h1>
            <p className="font-body text-[16px] text-mute mt-3 max-w-[560px]">
              Every 60-second play day moves you forward. Digital gifts unlock consistency perks; physical gear ships directly to your desk or hostel.
            </p>
          </div>

          {/* Quick Streak Stats Card */}
          <div className="flex items-center gap-4 p-4 sm:p-5 rounded-[24px] bg-card border border-line shadow-xs">
            <div className="flex items-center gap-3 pr-4 border-r border-line">
              <div className="w-12 h-12 rounded-full bg-acc/15 flex items-center justify-center">
                <Flame className="w-6 h-6 text-acc fill-acc" />
              </div>
              <div>
                <span className="font-mono font-bold text-[26px] text-ink leading-none block">
                  {streak.currentStreak}
                </span>
                <span className="font-mono text-[11px] text-mute uppercase">Days Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-lime-ink" />
              </div>
              <div>
                <span className="font-mono font-bold text-[26px] text-ink leading-none block">
                  {streak.freezesHeld}
                </span>
                <span className="font-mono text-[11px] text-mute uppercase">Freezes Held</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Streak Progression Ladder */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-card border border-line shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display font-bold text-[22px] text-ink">Milestone Track</h2>
              <p className="font-body text-[13px] text-mute">
                Circles indicate digital rewards; rounded squares are physical milestone products.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[12px]">
              <span className="w-3 h-3 rounded-full bg-ink" />
              <span className="text-mute mr-3">Digital</span>
              <span className="w-3 h-3 rounded-[4px] bg-lime border border-lime-ink" />
              <span className="text-mute mr-3">Physical</span>
              <span className="w-3 h-3 rounded-full bg-acc" />
              <span className="text-mute">Current</span>
            </div>
          </div>

          <StreakLadder currentStreak={streak.currentStreak} />
        </div>

        {/* Milestone Cards Grid */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-[28px] text-ink">
              All Milestone Rewards
            </h2>
            <Link
              href="/play/make24"
              className="inline-flex items-center gap-1.5 font-mono text-[13px] text-acc font-semibold hover:underline"
            >
              <span>Play today’s round</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MILESTONES.map((m) => {
              const isUnlocked = streak.currentStreak >= m.day;
              const daysLeft = Math.max(0, m.day - streak.currentStreak);

              return (
                <div
                  key={m.day}
                  className={`p-6 rounded-[28px] border transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? "bg-card border-lime shadow-sm"
                      : "bg-card/70 border-line"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-bold text-[20px] text-ink">
                        {m.day} DAYS
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isUnlocked
                            ? "bg-lime text-lime-ink"
                            : "bg-surface border border-line text-mute"
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Unlocked</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>{daysLeft}d left</span>
                          </>
                        )}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-mute uppercase tracking-wider block mb-1">
                      {m.type === "digital" ? "Digital Gift" : "Physical Milestone Gear"}
                    </span>
                    <h3 className="font-display font-bold text-[22px] text-ink mb-2">
                      {m.name}
                    </h3>
                    <p className="font-body text-[14px] text-mute leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                    {m.type === "physical" ? (
                      <Link
                        href={`/rewards/claim?milestone=${m.day}`}
                        className={`px-4 py-1.5 rounded-full font-mono text-[12px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                          isUnlocked
                            ? "bg-acc text-ink shadow-xs hover:opacity-95"
                            : "bg-surface border border-line text-mute hover:text-ink"
                        }`}
                      >
                        <span>{isUnlocked ? "Claim Delivery" : "Preview Prize"}</span>
                      </Link>
                    ) : isUnlocked ? (
                      <span className="font-mono text-[12px] text-lime-ink font-bold">
                        Active in profile
                      </span>
                    ) : (
                      <span className="font-mono text-[12px] text-mute">
                        Keep streak to claim
                      </span>
                    )}

                    <span className="font-mono text-[12px] text-mute">
                      {m.type === "physical" ? "Free Shipping" : "Instant"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Honest Rules & Anti-Cheat Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-line">
          <div className="p-6 rounded-[24px] bg-card border border-line">
            <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-acc" />
            </div>
            <h4 className="font-display font-bold text-[18px] text-ink mb-2">
              Streak Freezes
            </h4>
            <p className="font-body text-[13px] text-mute leading-relaxed">
              Streak freezes exist to forgive busy days. They automatically protect one missed day so your hard work isn&apos;t lost.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-card border border-line">
            <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-4">
              <Truck className="w-5 h-5 text-acc" />
            </div>
            <h4 className="font-display font-bold text-[18px] text-ink mb-2">
              Physical Fulfillment
            </h4>
            <p className="font-body text-[13px] text-mute leading-relaxed">
              Physical items at 50, 100, 200, and 365 days are shipped free of charge. Your shipping address is deleted after delivery.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-card border border-line">
            <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-4">
              <Info className="w-5 h-5 text-acc" />
            </div>
            <h4 className="font-display font-bold text-[18px] text-ink mb-2">
              The 60-Second Rule
            </h4>
            <p className="font-body text-[13px] text-mute leading-relaxed">
              One full 60-second round satisfies your play day. You can play unlimited replays or explore other games after your habit is locked.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
