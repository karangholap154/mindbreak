"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/brand/LogoMark";

export function TopNav() {
  const pathname = usePathname();
  const [muted, setMuted] = useState(true);

  const links = [
    { href: "/", label: "Today" },
    { href: "/games", label: "Games" },
    { href: "/leaderboards", label: "Leaderboard" },
    { href: "/rewards", label: "Rewards" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-bg/85 backdrop-blur-md border-b border-line">
      <div className="max-w-[1360px] h-full mx-auto px-5 lg:px-14 flex items-center justify-between">
        {/* Brand Logo */}
        <LogoMark />

        {/* Center Navigation Links (Hidden on small mobile) */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
                  active
                    ? "bg-ink text-surface"
                    : "text-mute hover:text-ink hover:bg-card"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle (Off by default per DESIGN.md §9) */}
          <button
            onClick={() => setMuted(!muted)}
            className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-mute hover:text-ink hover:border-ink transition-colors cursor-pointer"
            aria-label={muted ? "Unmute game sound" : "Mute game sound"}
            title={muted ? "Sound: Off (click to unmute)" : "Sound: On (click to mute)"}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 stroke-[1.75]" />
            ) : (
              <Volume2 className="w-4 h-4 stroke-[1.75]" />
            )}
          </button>

          {/* Streak Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-card text-ink font-mono text-[13px] font-medium">
            <Flame className="w-4 h-4 text-acc fill-acc" />
            <span>0</span>
            <span className="text-mute text-[12px]">DAYS</span>
          </div>

          {/* Avatar (40px circle, lime fill, ink initial per DESIGN.md §6.10) */}
          <button
            className="w-10 h-10 rounded-full bg-lime text-ink font-bold text-[15px] flex items-center justify-center border border-line hover:scale-105 active:scale-95 transition-transform"
            aria-label="User Profile"
          >
            G
          </button>
        </div>
      </div>
    </header>
  );
}
