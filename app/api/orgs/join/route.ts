import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to join an organization." }, { status: 401 });
    }

    const body = await req.json();
    const { inviteCode, orgId } = body;

    let targetOrgId = orgId;

    if (!targetOrgId && inviteCode) {
      const code = inviteCode.trim().toUpperCase();
      const { data: org, error: findErr } = await admin
        .from("organizations")
        .select("id, name")
        .eq("invite_code", code)
        .maybeSingle();

      if (findErr || !org) {
        return NextResponse.json({ error: "Invalid team invite code. Check and try again." }, { status: 404 });
      }
      targetOrgId = org.id;
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: "Please provide an invite code or organization." }, { status: 400 });
    }

    // Insert membership
    const { error: joinErr } = await admin.from("memberships").upsert(
      {
        user_id: user.id,
        org_id: targetOrgId,
        role: "member",
      },
      { onConflict: "user_id, org_id" }
    );

    if (joinErr) {
      return NextResponse.json({ error: joinErr.message }, { status: 500 });
    }

    // Fetch org details
    const { data: org } = await admin
      .from("organizations")
      .select("id, name, type, invite_code")
      .eq("id", targetOrgId)
      .single();

    return NextResponse.json({
      success: true,
      organization: org,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
