const SEED_SECRET = process.env.DAILY_SEED_SECRET || "mindbreak-daily-puzzle-secret-key-2026";

/**
 * Launch game rotation sequence (PRD §6.2):
 * Category rotation ensuring no category repeats within 3 days.
 * 4 launch games across 4 distinct categories.
 */
export const FEATURED_ROTATION: string[] = [
  "make24",         // Math
  "sudoku4",        // Puzzle & Logic
  "pattern-recall", // Memory
  "stroop",         // Reflex
];

/**
 * Format today's date in YYYY-MM-DD format (local user calendar day).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Deterministically computes the daily puzzle seed for a given game and date.
 * seed = hash(secret, date + gameId)
 * All users worldwide receive the exact same puzzle for the day.
 * Pure TypeScript implementation compatible with Client, Server, and Edge runtimes.
 */
export function getDailyGameSeed(gameId: string, dateString?: string): string {
  const date = dateString || getTodayDateString();
  const input = `${SEED_SECRET}:${date}:${gameId}`;

  // 64-bit FNV-1a avalanche hash producing 16 hex characters
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code;
    h2 = Math.imul(h2, 0x01000193);
  }

  h1 ^= h2 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  h2 ^= h1 >>> 16;
  h2 = Math.imul(h2, 0x7feb352d);
  h2 ^= h2 >>> 13;
  h2 = Math.imul(h2, 0x846ca68b);
  h2 ^= h2 >>> 16;

  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `${hex1}${hex2}`;
}

/**
 * Returns the game ID of the daily featured game for the given date.
 * Rotates predictably across all launch categories without repeats within 3 days.
 */
export function getDailyFeaturedGame(dateString?: string): string {
  const date = dateString || getTodayDateString();
  const [year, month, day] = date.split("-").map(Number);

  // Use UTC day difference from epoch (2026-01-01)
  const targetUtc = Date.UTC(year, (month || 1) - 1, day || 1);
  const epochUtc = Date.UTC(2026, 0, 1);
  const dayNumber = Math.floor((targetUtc - epochUtc) / 86400000);

  const index = ((dayNumber % FEATURED_ROTATION.length) + FEATURED_ROTATION.length) % FEATURED_ROTATION.length;
  return FEATURED_ROTATION[index];
}
