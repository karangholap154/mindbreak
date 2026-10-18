"use client";

import React, { useId } from "react";

export interface TickRingProps {
  /** Size in pixels (or responsive container size) */
  size?: number | string;
  /** Internal viewBox dimension (340 for hero, 440 for game screen, 30 for logo) */
  viewBoxSize?: number;
  /** Seconds or units elapsed */
  elapsed: number;
  /** Total seconds or units (default 60) */
  total?: number;
  /** Radius of the ring circle */
  radius?: number;
  /** Width of each tick mark */
  tickWidth?: number;
  /** Length (height) of each tick mark */
  tickLength?: number;
  /** Optional children rendered at the center of the ring */
  children?: React.ReactNode;
  /** Extra CSS classes */
  className?: string;
  /** Whether to show the current-second indicator dot */
  showIndicatorDot?: boolean;
}

export function TickRing({
  size = "100%",
  viewBoxSize = 340,
  elapsed = 0,
  total = 60,
  radius,
  tickWidth,
  tickLength,
  children,
  className = "",
  showIndicatorDot = true,
}: TickRingProps) {
  const maskId = useId();

  // Preset measurements based on DESIGN.md §5.1
  const r = radius ?? (viewBoxSize >= 400 ? 200 : viewBoxSize <= 50 ? 12 : 150);
  const tWidth = tickWidth ?? (viewBoxSize >= 400 ? 3 : viewBoxSize <= 50 ? 1.4 : 2.4);
  const tLength = tickLength ?? (viewBoxSize >= 400 ? 22 : viewBoxSize <= 50 ? 5 : 16);

  const center = viewBoxSize / 2;
  const circumference = 2 * Math.PI * r;
  const period = circumference / 60;
  const inactiveDashArray = `${tWidth} ${Math.max(0, period - tWidth)}`;

  // Clamped progress between 0 and 1
  const progressRatio = Math.min(Math.max(elapsed / total, 0), 1);
  const activeLength = circumference * progressRatio;

  // Indicator dot angle and coordinate
  // Angle starts at 12 o'clock (-90 degrees) and rotates clockwise
  const dotAngle = progressRatio * 360 - 90;
  const dotRadians = (dotAngle * Math.PI) / 180;
  const dotX = center + r * Math.cos(dotRadians);
  const dotY = center + r * Math.sin(dotRadians);
  const dotRadius = Math.max(3, viewBoxSize * 0.024);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        aspectRatio: "1 / 1",
      }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full transform -rotate-90 origin-center"
        aria-label={`${Math.round(elapsed)} seconds elapsed, ${Math.max(0, total - Math.round(elapsed))} left`}
        role="img"
      >
        <defs>
          {/* Mask to reveal active ticks based on progress */}
          <mask id={maskId}>
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={tLength + 4}
              strokeDasharray={`${activeLength} ${circumference}`}
            />
          </mask>
        </defs>

        {/* Inactive ring (all 60 ticks in line color) */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={tLength}
          strokeDasharray={inactiveDashArray}
        />

        {/* Active progress ring (orange ticks clipped by mask) */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--acc)"
          strokeWidth={tLength}
          strokeDasharray={inactiveDashArray}
          mask={`url(#${maskId})`}
        />

        {/* Current-second indicator dot */}
        {showIndicatorDot && progressRatio > 0 && viewBoxSize > 60 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={dotRadius}
            fill="var(--acc)"
            stroke="var(--ink)"
            strokeWidth="2.5"
            className="transition-all duration-75"
          />
        )}
      </svg>

      {/* Centered content (numerals, score, or game prompts) */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}
