"use client";

import Link from "next/link";
import { TickRing } from "./TickRing";

export interface LogoMarkProps {
  className?: string;
  showText?: boolean;
}

export function LogoMark({ className = "", showText = true }: LogoMarkProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none text-ink hover:opacity-90 transition-opacity ${className}`}
      aria-label="Mind Break Home"
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        <TickRing
          size={32}
          viewBoxSize={30}
          radius={12}
          tickWidth={1.4}
          tickLength={5}
          elapsed={25}
          total={60}
          showIndicatorDot={false}
        />
        <div className="absolute w-2 h-2 rounded-full bg-acc" />
      </div>

      {showText && (
        <span className="font-display font-extrabold text-[1.28rem] tracking-tight text-ink flex items-center">
          Mind<span className="text-acc font-mono mx-0.5 font-bold">/</span>Break
        </span>
      )}
    </Link>
  );
}
