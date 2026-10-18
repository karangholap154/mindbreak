import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const admin = createAdminClient();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch all active organizations
    const { data: orgs, error } = await admin
      .from("organizations")
      .select("id, name, type, domain, invite_code")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch user's joined orgs if authenticated
    let userOrgIds: string[] = [];
    if (user) {
      const { data: memberships } = await admin
        .from("memberships")
        .select("org_id")
        .eq("user_id", user.id);

      userOrgIds = (memberships || []).map((m: { org_id: string }) => m.org_id);
    }

    return NextResponse.json({
      organizations: orgs,
      userOrgIds,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to create an organization." }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, domain } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Organization name and type are required." }, { status: 400 });
    }

    // Generate random 6-character uppercase alphanumeric code
    const baseLetters = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const inviteCode = `${baseLetters}${randomDigits}`;

    const { data: newOrg, error: orgErr } = await admin
      .from("organizations")
      .insert({
        name: name.trim(),
        type,
        domain: domain?.trim() || null,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (orgErr) {
      return NextResponse.json({ error: orgErr.message }, { status: 500 });
    }

    // Automatically join creator as admin
    await admin.from("memberships").insert({
      user_id: user.id,
      org_id: newOrg.id,
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      organization: newOrg,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
