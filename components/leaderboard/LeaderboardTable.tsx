"use client";

import React from "react";
import { Trophy, Medal, Award, Building2, GraduationCap, Users, User } from "lucide-react";
import { LeaderboardEntry, OrgLeaderboardEntry } from "@/app/api/leaderboards/route";

interface LeaderboardTableProps {
  scope: "global" | "college" | "company";
  entries: LeaderboardEntry[];
  orgRankings: OrgLeaderboardEntry[];
  loading: boolean;
  userRank: { rank: number; score: number; percentile: string } | null;
  onOpenOrgModal: () => void;
}

export function LeaderboardTable({
  scope,
  entries,
  orgRankings,
  loading,
  userRank,
  onOpenOrgModal,
}: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-acc animate-spin mb-4" />
        <p className="font-mono text-[13px] text-mute uppercase tracking-wider">
          Fetching live rankings...
        </p>
      </div>
    );
  }

  // 1. Organization Rankings (Colleges or Companies)
  if (scope === "college" || scope === "company") {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* Banner to Join or Add Organization */}
        <div className="p-6 rounded-[24px] bg-card border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-acc shrink-0">
              {scope === "college" ? (
                <GraduationCap className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-display font-bold text-[17px] text-ink">
                Represent your {scope === "college" ? "College" : "Company"}
              </h4>
              <p className="font-body text-[13px] text-mute">
                Join your institution’s team using your team code or domain to contribute your daily scores.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenOrgModal}
            className="px-5 py-2.5 rounded-full bg-ink text-surface font-semibold text-[13.5px] hover:bg-ink/90 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Join or Create Team
          </button>
        </div>

        {/* Organizations Table */}
        <div className="overflow-hidden rounded-[24px] bg-card border border-line shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-surface/50 font-mono text-[11px] uppercase tracking-wider text-mute">
                <th className="py-4 px-6 w-16 text-center">Rank</th>
                <th className="py-4 px-6">Institution</th>
                <th className="py-4 px-6 text-center">Members</th>
                <th className="py-4 px-6 text-right">Top Score</th>
                <th className="py-4 px-6 text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-body text-[14px]">
              {orgRankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mute font-body text-[14px]">
                    No institutions registered yet. Be the first to add your team!
                  </td>
                </tr>
              ) : (
                orgRankings.map((org) => {
                  return (
                    <tr
                      key={org.id}
                      className="hover:bg-surface/50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-center font-mono font-bold">
                        {org.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FFE500]/20 text-[#B38F00] text-[13px]">
                            1
                          </span>
                        ) : org.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[13px]">
                            2
                          </span>
                        ) : org.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200/50 text-amber-800 text-[13px]">
                            3
                          </span>
                        ) : (
                          <span className="text-mute text-[13px]">#{org.rank}</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-mute shrink-0">
                            {org.type === "college" ? (
                              <GraduationCap className="w-4 h-4 text-acc" />
                            ) : (
                              <Building2 className="w-4 h-4 text-lime-ink" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-ink block leading-tight">
                              {org.name}
                            </span>
                            <span className="font-mono text-[11px] text-mute uppercase">
                              {org.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center font-mono text-mute text-[13px]">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{org.memberCount}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-[13px] text-mute">
                        {org.topScore}
                      </td>

                      <td className="py-4 px-6 text-right font-mono font-bold text-[16px] text-ink">
                        {org.avgScore}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. Global Player Rankings
  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="order-2 md:order-1 p-6 rounded-[24px] bg-card border border-line shadow-xs flex flex-col items-center text-center relative hover:scale-[1.01] transition-transform">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mb-3 text-slate-700 shadow-xs">
                <Medal className="w-6 h-6" />
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1">
                2nd Place
              </span>
              <h3 className="font-display font-bold text-[20px] text-ink leading-tight mb-1 truncate max-w-full">
                {topThree[1].displayName}
              </h3>
              {topThree[1].orgName && (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface border border-line font-mono text-[11px] text-mute mb-3">
                  {topThree[1].orgName}
                </span>
              )}
              <div className="font-mono font-bold text-[32px] text-ink leading-none mt-2">
                {topThree[1].score}
              </div>
              <span className="font-mono text-[11px] text-mute uppercase mt-1">
                {topThree[1].accuracy}% Accuracy · {topThree[1].puzzlesSolved} Solved
              </span>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 p-7 rounded-[26px] bg-card border-2 border-acc shadow-md flex flex-col items-center text-center relative -translate-y-2 hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 rounded-full bg-[#FFE500]/25 border-2 border-[#FFE500] flex items-center justify-center mb-3 text-[#B38F00] shadow-sm">
                <Trophy className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="font-mono text-[12px] font-bold text-acc uppercase tracking-widest mb-1">
                1st Place Champion
              </span>
              <h3 className="font-display font-bold text-[24px] text-ink leading-tight mb-1 truncate max-w-full">
                {topThree[0].displayName}
              </h3>
              {topThree[0].orgName && (
                <span className="inline-block px-3 py-0.5 rounded-full bg-surface border border-line font-mono text-[11px] text-mute mb-3">
                  {topThree[0].orgName}
                </span>
              )}
              <div className="font-mono font-bold text-[40px] text-ink leading-none mt-2">
                {topThree[0].score}
              </div>
              <span className="font-mono text-[12px] text-mute uppercase mt-1">
                {topThree[0].accuracy}% Accuracy · {topThree[0].puzzlesSolved} Solved
              </span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="order-3 p-6 rounded-[24px] bg-card border border-line shadow-xs flex flex-col items-center text-center relative hover:scale-[1.01] transition-transform">
              <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mb-3 text-amber-800 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <span className="font-mono text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-1">
                3rd Place
              </span>
              <h3 className="font-display font-bold text-[20px] text-ink leading-tight mb-1 truncate max-w-full">
                {topThree[2].displayName}
              </h3>
              {topThree[2].orgName && (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface border border-line font-mono text-[11px] text-mute mb-3">
                  {topThree[2].orgName}
                </span>
              )}
              <div className="font-mono font-bold text-[32px] text-ink leading-none mt-2">
                {topThree[2].score}
              </div>
              <span className="font-mono text-[11px] text-mute uppercase mt-1">
                {topThree[2].accuracy}% Accuracy · {topThree[2].puzzlesSolved} Solved
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-hidden rounded-[24px] bg-card border border-line shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface/50 font-mono text-[11px] uppercase tracking-wider text-mute">
              <th className="py-4 px-6 w-16 text-center">Rank</th>
              <th className="py-4 px-6">Player</th>
              <th className="py-4 px-6 text-center">Solved</th>
              <th className="py-4 px-6 text-center">Accuracy</th>
              <th className="py-4 px-6 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-body text-[14px]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-mute font-body text-[14px]">
                  No scores recorded today yet. Play a 60s round to claim the #1 spot!
                </td>
              </tr>
            ) : (
              remaining.map((entry) => (
                <tr
                  key={entry.userId}
                  className="hover:bg-surface/50 transition-colors"
                >
                  <td className="py-4 px-6 text-center font-mono font-bold text-mute text-[13px]">
                    #{entry.rank}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lime text-lime-ink font-bold text-[13px] flex items-center justify-center shrink-0 border border-line">
                        {entry.avatarInitial}
                      </div>
                      <div>
                        <span className="font-semibold text-ink block leading-tight">
                          {entry.displayName}
                        </span>
                        {entry.orgName && (
                          <span className="font-mono text-[11px] text-mute">
                            {entry.orgName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-mono text-mute text-[13px]">
                    {entry.puzzlesSolved}
                  </td>
                  <td className="py-4 px-6 text-center font-mono text-mute text-[13px]">
                    {entry.accuracy}%
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-[16px] text-ink">
                    {entry.score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pinned Bottom Sticky User Standing Bar */}
      {userRank && (
        <div className="sticky bottom-6 z-20 w-full max-w-[800px] mx-auto p-4 px-6 rounded-full bg-ink text-surface shadow-2xl border border-line flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lime text-lime-ink font-bold text-[13px] flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono font-bold text-[14px] text-surface block leading-tight">
                Your Rank: #{userRank.rank}
              </span>
              <span className="font-mono text-[11px] text-lime">
                {userRank.percentile} of active players
              </span>
            </div>
          </div>

          <div className="font-mono font-bold text-[20px] text-surface">
            {userRank.score} <span className="text-[12px] text-mute font-normal">PTS</span>
          </div>
        </div>
      )}
    </div>
  );
}
