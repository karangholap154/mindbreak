export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  freezesHeld: number;
  lastPlayedDate: string; // YYYY-MM-DD
  secondsPlayedToday: number;
  isTodayCompleted: boolean;
  history: Record<string, number>; // date -> seconds played
  freezeLogs: { date: string; action: "earned" | "used" }[];
}

const STORAGE_KEY = "mindbreak_streak_data";
export const STREAK_CHANGE_EVENT = "mindbreak_streak_updated";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  freezesHeld: 1, // 1 starter freeze
  lastPlayedDate: "",
  secondsPlayedToday: 0,
  isTodayCompleted: false,
  history: {},
  freezeLogs: [{ date: getTodayDateString(), action: "earned" }],
};

export function loadStreakData(): StreakData {
  if (typeof window === "undefined") return DEFAULT_STREAK;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STREAK;

    const data: StreakData = JSON.parse(raw);
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    // Check if new day started
    if (data.lastPlayedDate !== today) {
      const secondsToday = data.history[today] || 0;
      const wasYesterdayPlayed = data.history[yesterday] >= 60;
      const isTodayDone = secondsToday >= 60;

      let newStreak = data.currentStreak;
      let freezes = data.freezesHeld;
      const logs = [...data.freezeLogs];

      // If yesterday was NOT played and streak was active > 0
      if (!wasYesterdayPlayed && data.lastPlayedDate && data.lastPlayedDate !== yesterday) {
        if (freezes > 0) {
          // Auto-consume 1 streak freeze to protect streak
          freezes -= 1;
          logs.push({ date: yesterday, action: "used" });
        } else {
          // No freeze, reset streak
          newStreak = isTodayDone ? 1 : 0;
        }
      }

      const updatedData: StreakData = {
        ...data,
        currentStreak: newStreak,
        freezesHeld: freezes,
        secondsPlayedToday: secondsToday,
        isTodayCompleted: isTodayDone,
        freezeLogs: logs,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return updatedData;
    }

    return data;
  } catch {
    return DEFAULT_STREAK;
  }
}

export function saveStreakData(data: StreakData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(STREAK_CHANGE_EVENT));
}

/**
 * Record played seconds for a completed game round.
 * Satisfies the 60-second play day rule.
 */
export function recordPlayTime(seconds: number): StreakData {
  const current = loadStreakData();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const prevSecondsToday = current.history[today] || 0;
  const newSecondsToday = prevSecondsToday + Math.round(seconds);
  const nowCompleted = newSecondsToday >= 60;
  const wasAlreadyCompleted = prevSecondsToday >= 60;

  let newStreak = current.currentStreak;
  let freezes = current.freezesHeld;
  const logs = [...current.freezeLogs];

  // If today just crossed 60s for the first time
  if (nowCompleted && !wasAlreadyCompleted) {
    const wasYesterdayCompleted = (current.history[yesterday] || 0) >= 60;

    if (wasYesterdayCompleted || current.currentStreak === 0) {
      newStreak = current.currentStreak + 1;
    } else {
      // Missing days were either covered by freeze or started fresh
      newStreak = current.currentStreak > 0 ? current.currentStreak + 1 : 1;
    }

    // Award freeze at Day 7, and at every 30-day milestone
    if (newStreak === 7 || (newStreak > 7 && newStreak % 30 === 0)) {
      if (freezes < 2) {
        freezes = Math.min(2, freezes + 1);
        logs.push({ date: today, action: "earned" });
      }
    }
  }

  const bestStreak = Math.max(current.bestStreak, newStreak);

  const updated: StreakData = {
    ...current,
    currentStreak: newStreak,
    bestStreak,
    freezesHeld: freezes,
    lastPlayedDate: today,
    secondsPlayedToday: newSecondsToday,
    isTodayCompleted: nowCompleted,
    history: {
      ...current.history,
      [today]: newSecondsToday,
    },
    freezeLogs: logs,
  };

  saveStreakData(updated);
  return updated;
}
