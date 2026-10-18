import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDailyGameSeed, getTodayDateString } from "@/lib/dailySeed";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, score, puzzlesSolved, accuracy, secondsPlayed } = body;

    if (!gameId || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Anti-cheat verification: seconds played cannot be less than 5s for high scores
    if (score > 100 && secondsPlayed < 5) {
      return NextResponse.json(
        { error: "Suspicious session timing. Score rejected." },
        { status: 403 }
      );
    }

    const today = getTodayDateString();
    const expectedSeed = getDailyGameSeed(gameId, today);

    // Get current authenticated user if any
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest player: return verified payload so client local storage records it
      return NextResponse.json({
        success: true,
        isGuest: true,
        verifiedScore: score,
        seed: expectedSeed,
        message: "Guest score recorded locally. Sign up to compete on global leaderboards!",
      });
    }

    // Authenticated user: record into Supabase database
    const { data: scoreRecord, error: scoreErr } = await supabase
      .from("scores")
      .insert({
        user_id: user.id,
        game_id: gameId,
        score,
        puzzles_solved: puzzlesSolved || 0,
        accuracy: accuracy || 100,
        date: today,
      })
      .select()
      .single();

    if (scoreErr) {
      console.error("Failed to insert score:", scoreErr.message);
      return NextResponse.json({ error: scoreErr.message }, { status: 500 });
    }

    // Record or update play_days for habit tracking (60s rule)
    const { data: existingDay } = await supabase
      .from("play_days")
      .select("seconds_played, counted")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    const currentSeconds = (existingDay?.seconds_played || 0) + Math.round(secondsPlayed || 0);
    const counted = currentSeconds >= 60;

    await supabase.from("play_days").upsert({
      user_id: user.id,
      date: today,
      seconds_played: currentSeconds,
      counted,
    });

    // If day is newly counted, update streak in database
    if (counted && !existingDay?.counted) {
      const { data: streakRecord } = await supabase
        .from("streaks")
        .select("current_streak, best_streak, freezes_held, last_played_date")
        .eq("user_id", user.id)
        .maybeSingle();

      const newStreak = (streakRecord?.current_streak || 0) + 1;
      const best = Math.max(streakRecord?.best_streak || 0, newStreak);

      await supabase.from("streaks").upsert({
        user_id: user.id,
        current_streak: newStreak,
        best_streak: best,
        last_played_date: today,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      scoreRecord,
      countedToday: counted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
