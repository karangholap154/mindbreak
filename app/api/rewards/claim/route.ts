import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const PHYSICAL_REWARDS: Record<number, string> = {
  50: "Mind Break Custom Pen & Metal Lapel Pin Pack",
  100: "Matte Ceramic Desk Mug (12oz)",
  200: "Embroidered Champion Heavyweight Hoodie",
  365: "Solid Metal Heavyweight Trophy (Custom Engraved)",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to claim physical milestone rewards." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      milestoneDay,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      customization, // size or engraving name
    } = body;

    const rewardName = PHYSICAL_REWARDS[milestoneDay];
    if (!rewardName) {
      return NextResponse.json(
        { error: "Invalid milestone reward day. Physical rewards are available at Day 50, 100, 200, and 365." },
        { status: 400 }
      );
    }

    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode || !shippingCountry) {
      return NextResponse.json(
        { error: "All shipping address fields are required." },
        { status: 400 }
      );
    }

    // Check user's streak eligibility
    const { data: streakRecord } = await admin
      .from("streaks")
      .select("current_streak, best_streak")
      .eq("user_id", user.id)
      .maybeSingle();

    const highestStreak = Math.max(
      streakRecord?.current_streak || 0,
      streakRecord?.best_streak || 0
    );

    // Allow user to claim if highestStreak >= milestoneDay (or in dev testing if override flag sent)
    if (highestStreak < milestoneDay && !body.isTestClaim) {
      return NextResponse.json(
        { error: `You need a verified streak of at least ${milestoneDay} days to claim this reward. (Current best: ${highestStreak} days)` },
        { status: 403 }
      );
    }

    // Check if user already claimed this milestone
    const { data: existingClaim } = await admin
      .from("reward_claims")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .eq("milestone_day", milestoneDay)
      .maybeSingle();

    if (existingClaim) {
      return NextResponse.json(
        { error: `You have already submitted a claim for Day ${milestoneDay}. Current status: ${existingClaim.status}.` },
        { status: 400 }
      );
    }

    // Prepare full item title with customization
    let fullItemTitle = rewardName;
    if (customization) {
      fullItemTitle += ` (${customization})`;
    }

    // Insert claim
    const { data: claim, error: insertErr } = await admin
      .from("reward_claims")
      .insert({
        user_id: user.id,
        milestone_day: milestoneDay,
        reward_name: fullItemTitle,
        shipping_name: shippingName.trim(),
        shipping_address: shippingAddress.trim(),
        shipping_city: shippingCity.trim(),
        shipping_postal_code: shippingPostalCode.trim(),
        shipping_country: shippingCountry.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      rewardName: fullItemTitle,
      status: "pending",
      message: "Reward claim successfully submitted! Your physical prize will be verified and dispatched.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
