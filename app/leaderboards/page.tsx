"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe, GraduationCap, Building2, Flame } from "lucide-react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { OrgJoinModal } from "@/components/leaderboard/OrgJoinModal";
import { LeaderboardEntry, OrgLeaderboardEntry, DepartmentLeaderboardEntry } from "@/app/api/leaderboards/route";

const GAME_TABS = [
  { id: "all", label: "All Games" },
  { id: "make24", label: "Make-24" },
  { id: "sudoku4", label: "Mini Sudoku" },
  { id: "pattern-recall", label: "Pattern Recall" },
  { id: "stroop", label: "Stroop Test" },
];

export default function LeaderboardsPage() {
  const [scope, setScope] = useState<"global" | "college" | "company">("global");
  const [gameId, setGameId] = useState("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [orgRankings, setOrgRankings] = useState<OrgLeaderboardEntry[]>([]);
  const [departmentRankings, setDepartmentRankings] = useState<DepartmentLeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; score: number; percentile: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  // Countdown timer to Midnight UTC
  const [timeRemainingUtc, setTimeRemainingUtc] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextUtcMidnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0
      ));
      const diffMs = nextUtcMidnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeRemainingUtc(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/leaderboards?scope=${scope}&gameId=${gameId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.entries) setEntries(data.entries);
        else setEntries([]);
        if (data.orgRankings) setOrgRankings(data.orgRankings);
        else setOrgRankings([]);
        if (data.departmentRankings) setDepartmentRankings(data.departmentRankings);
        else setDepartmentRankings([]);
        if (data.userRank) setUserRank(data.userRank);
        else setUserRank(null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scope, gameId, refreshKey]);

  return (
    <main className="w-full max-w-[1180px] mx-auto px-5 py-8 sm:py-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-line font-mono text-[12px] text-mute uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-acc" />
            <span>Daily Competition</span>
          </div>
          <h1 className="font-display font-bold text-[34px] sm:text-[42px] text-ink leading-tight">
            Leaderboards
          </h1>
          <p className="font-body text-[15px] text-mute max-w-[500px]">
            Rankings reset daily at Midnight UTC. Play your 60-second rounds to secure top rank!
          </p>
        </div>

        {/* Reset Countdown Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-card border border-line shrink-0 shadow-xs">
          <Clock className="w-4 h-4 text-acc" />
          <span className="font-mono text-[11px] text-mute uppercase tracking-wider">Resets in:</span>
          <span className="font-mono font-bold text-[15px] text-ink">{timeRemainingUtc || "00:00:00"}</span>
        </div>
      </div>

      {/* Scope Switcher Tabs (Global, Colleges, Companies) */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => {
            setScope("global");
            setLoading(true);
          }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-[13px] font-semibold tracking-wide uppercase transition-all cursor-pointer ${
            scope === "global"
              ? "bg-ink text-surface shadow-xs"
              : "bg-card border border-line text-mute hover:text-ink hover:border-ink"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Global Players</span>
        </button>

        <button
          onClick={() => {
            setScope("college");
            setLoading(true);
          }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-[13px] font-semibold tracking-wide uppercase transition-all cursor-pointer ${
            scope === "college"
              ? "bg-ink text-surface shadow-xs"
              : "bg-card border border-line text-mute hover:text-ink hover:border-ink"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Colleges & Universities</span>
        </button>

        <button
          onClick={() => {
            setScope("company");
            setLoading(true);
          }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-[13px] font-semibold tracking-wide uppercase transition-all cursor-pointer ${
            scope === "company"
              ? "bg-ink text-surface shadow-xs"
              : "bg-card border border-line text-mute hover:text-ink hover:border-ink"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Companies & Workplaces</span>
        </button>
      </div>

      {/* Game Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 no-scrollbar">
        {GAME_TABS.map((tab) => {
          const active = gameId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setGameId(tab.id);
                setLoading(true);
              }}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors shrink-0 cursor-pointer ${
                active
                  ? "bg-acc text-ink font-semibold"
                  : "bg-card border border-line text-mute hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Leaderboard Table / Rankings */}
      <LeaderboardTable
        scope={scope}
        entries={entries}
        orgRankings={orgRankings}
        departmentRankings={departmentRankings}
        loading={loading}
        userRank={userRank}
        onOpenOrgModal={() => setOrgModalOpen(true)}
      />

      {/* Team / Organization Join Modal */}
      <OrgJoinModal
        isOpen={orgModalOpen}
        onClose={() => setOrgModalOpen(false)}
        onJoined={() => {
          setLoading(true);
          setRefreshKey((k) => k + 1);
        }}
      />
    </main>
  );
}
