"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getGamePlugin } from "@/games/registry";
import { GameShell } from "@/components/game/GameShell";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

interface PlayClientProps {
  params: Promise<{ gameId: string }>;
}

export function PlayClient({ params }: PlayClientProps) {
  const resolvedParams = use(params);
  const game = getGamePlugin(resolvedParams.gameId);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink pb-24 md:pb-12">
      <TopNav />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 lg:px-14 py-4 sm:py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[13px] text-mute hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </Link>
        </div>

        {/* If game found, render GameShell */}
        {game ? (
          <GameShell game={game} />
        ) : (
          <div className="max-w-[480px] mx-auto p-10 rounded-[28px] bg-card border border-line text-center my-12">
            <AlertCircle className="w-10 h-10 text-acc mx-auto mb-4" />
            <h2 className="font-display font-bold text-[24px] text-ink mb-2">
              Game Not Found
            </h2>
            <p className="font-body text-[14px] text-mute mb-6">
              The game “{resolvedParams.gameId}” does not exist or has not been unlocked yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-full bg-acc text-ink font-bold text-[15px]"
            >
              Return Home
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
