"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, LayoutGrid, Trophy, Gift } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "TODAY", icon: Timer },
    { href: "/games", label: "GAMES", icon: LayoutGrid },
    { href: "/leaderboards", label: "BOARDS", icon: Trophy },
    { href: "/rewards", label: "REWARDS", icon: Gift },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-ink font-semibold" : "text-mute hover:text-ink"
              }`}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
              <span className="font-mono text-[11px] tracking-wider">{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 w-8 h-[3px] bg-acc rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
