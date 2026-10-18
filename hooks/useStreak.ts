"use client";

import { useSyncExternalStore } from "react";
import { loadStreakData, STREAK_CHANGE_EVENT, StreakData } from "@/lib/streak";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(STREAK_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(STREAK_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedRaw: string | null = null;
let cachedData: StreakData | null = null;

function getSnapshot(): StreakData {
  if (typeof window === "undefined") return loadStreakData();

  const currentRaw = localStorage.getItem("mindbreak_streak_data") || "";
  if (currentRaw !== cachedRaw || !cachedData) {
    cachedRaw = currentRaw;
    cachedData = loadStreakData();
  }
  return cachedData;
}

function getServerSnapshot(): StreakData {
  return loadStreakData();
}

export function useStreak(): StreakData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
