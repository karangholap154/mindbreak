import crypto from "crypto";

const SEED_SECRET = process.env.DAILY_SEED_SECRET || "mindbreak-daily-puzzle-secret-key-2026";

/**
 * Deterministically computes the daily puzzle seed for a given game and date.
 * seed = HMAC(secret, date + gameId)
 * All users worldwide receive the exact same puzzle for the day.
 */
export function getDailyGameSeed(gameId: string, dateString?: string): string {
  const date = dateString || getTodayDateString();
  const hmac = crypto.createHmac("sha256", SEED_SECRET);
  hmac.update(`${date}-${gameId}`);
  return hmac.digest("hex").slice(0, 16);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
