import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getTodayDateString } from "@/lib/dailySeed";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarInitial: string;
  gameId?: string;
  score: number;
  accuracy: number;
  puzzlesSolved: number;
  orgName?: string;
  orgType?: "college" | "company" | "community";
  department?: string | null;
}

export interface OrgLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  type: "college" | "company" | "community";
  memberCount: number;
  activeCount: number;
  participationRate: number;
  totalScore: number;
  avgScore: number;
  topScore: number;
}

export interface DepartmentLeaderboardEntry {
  rank: number;
  department: string;
  orgId?: string;
  orgName: string;
  orgType: "college" | "company" | "community";
  memberCount: number;
  activeCount: number;
  participationRate: number;
  totalScore: number;
  avgScore: number;
  topScore: number;
}

interface OrgQueryResult {
  id: string;
  name: string;
  type: "college" | "company" | "community";
  invite_code: string;
  memberships: { user_id: string; department?: string | null }[] | null;
}

interface MembershipQueryResult {
  user_id: string;
  department?: string | null;
  organizations: {
    name: string;
    type: "college" | "company" | "community";
  } | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") || "all";
    const scope = (searchParams.get("scope") || "global") as "global" | "college" | "company";
    const departmentFilter = searchParams.get("department") || null;
    const date = searchParams.get("date") || getTodayDateString();

    const admin = createAdminClient();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. If scope is "college" or "company": Return Organization & Department Rankings
    if (scope === "college" || scope === "company") {
      const { data: orgs, error: orgErr } = await admin
        .from("organizations")
        .select(`
          id,
          name,
          type,
          invite_code,
          memberships (
            user_id,
            department
          )
        `)
        .eq("type", scope);

      if (orgErr) {
        return NextResponse.json({ error: orgErr.message }, { status: 500 });
      }

      // Fetch scores
      const { data: scores } = await admin
        .from("scores")
        .select("user_id, score, date, game_id");

      const userScoresMap = new Map<string, number>();
      for (const s of scores || []) {
        if (gameId === "all" || s.game_id === gameId) {
          const current = userScoresMap.get(s.user_id) || 0;
          if (s.score > current) userScoresMap.set(s.user_id, s.score);
        }
      }

      const typedOrgs = (orgs || []) as unknown as OrgQueryResult[];

      // Collect Organization Rankings
      const orgRankings: OrgLeaderboardEntry[] = typedOrgs.map((org) => {
        const members = org.memberships || [];
        const memberCount = members.length;
        let totalScore = 0;
        let topScore = 0;
        let activeCount = 0;

        for (const m of members) {
          const sc = userScoresMap.get(m.user_id);
          if (sc !== undefined) {
            totalScore += sc;
            activeCount++;
            if (sc > topScore) topScore = sc;
          }
        }

        const avgScore = activeCount > 0 ? Math.round(totalScore / activeCount) : 0;
        const participationRate = memberCount > 0 ? Math.round((activeCount / memberCount) * 100) : 0;

        return {
          rank: 0,
          id: org.id,
          name: org.name,
          type: org.type,
          memberCount,
          activeCount,
          participationRate,
          totalScore,
          avgScore,
          topScore,
        };
      });

      // Sort by avgScore desc, then memberCount desc
      orgRankings.sort((a, b) => b.avgScore - a.avgScore || b.memberCount - a.memberCount);
      orgRankings.forEach((o, idx) => (o.rank = idx + 1));

      // Collect Department & Graduation Year Rankings
      // Group by (orgId, department)
      const deptMap = new Map<string, {
        department: string;
        orgId: string;
        orgName: string;
        orgType: "college" | "company" | "community";
        memberCount: number;
        activeCount: number;
        totalScore: number;
        topScore: number;
      }>();

      for (const org of typedOrgs) {
        for (const m of org.memberships || []) {
          const deptKey = `${org.id}::${m.department || (org.type === "college" ? "Class of 2026" : "General")}`;
          const deptName = m.department || (org.type === "college" ? "Class of 2026" : "General");

          if (!deptMap.has(deptKey)) {
            deptMap.set(deptKey, {
              department: deptName,
              orgId: org.id,
              orgName: org.name,
              orgType: org.type,
              memberCount: 0,
              activeCount: 0,
              totalScore: 0,
              topScore: 0,
            });
          }

          const dObj = deptMap.get(deptKey)!;
          dObj.memberCount++;

          const sc = userScoresMap.get(m.user_id);
          if (sc !== undefined) {
            dObj.activeCount++;
            dObj.totalScore += sc;
            if (sc > dObj.topScore) dObj.topScore = sc;
          }
        }
      }

      const departmentRankings: DepartmentLeaderboardEntry[] = Array.from(deptMap.values()).map((d) => {
        const avgScore = d.activeCount > 0 ? Math.round(d.totalScore / d.activeCount) : 0;
        const participationRate = d.memberCount > 0 ? Math.round((d.activeCount / d.memberCount) * 100) : 0;
        return {
          rank: 0,
          department: d.department,
          orgId: d.orgId,
          orgName: d.orgName,
          orgType: d.orgType,
          memberCount: d.memberCount,
          activeCount: d.activeCount,
          participationRate,
          totalScore: d.totalScore,
          avgScore,
          topScore: d.topScore,
        };
      });

      // Sort departments by avgScore desc, then participationRate desc
      departmentRankings.sort((a, b) => b.avgScore - a.avgScore || b.participationRate - a.participationRate);
      departmentRankings.forEach((d, idx) => (d.rank = idx + 1));

      return NextResponse.json({
        scope,
        date,
        gameId,
        orgRankings,
        departmentRankings,
      });
    }

    // 2. Global Leaderboard: Return Top Players
    let scoreQuery = admin
      .from("scores")
      .select("id, user_id, game_id, score, accuracy, puzzles_solved, date")
      .order("score", { ascending: false })
      .limit(100);

    if (gameId !== "all") {
      scoreQuery = scoreQuery.eq("game_id", gameId);
    }

    const { data: rawScores, error: scoreErr } = await scoreQuery;

    if (scoreErr) {
      return NextResponse.json({ error: scoreErr.message }, { status: 500 });
    }

    const userIds = Array.from(new Set((rawScores || []).map((s) => s.user_id)));
    const profileMap = new Map<string, { displayName: string; avatarInitial: string }>();

    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, display_name, avatar_initial")
        .in("id", userIds);

      for (const p of profiles || []) {
        profileMap.set(p.id, {
          displayName: p.display_name,
          avatarInitial: p.avatar_initial,
        });
      }
    }

    // Fetch user memberships to attach institutional badges and departments
    const { data: allMemberships } = await admin
      .from("memberships")
      .select("user_id, department, organizations (name, type)");

    const typedMemberships = (allMemberships || []) as unknown as MembershipQueryResult[];
    const userOrgMap = new Map<string, { name: string; type: "college" | "company" | "community"; department?: string | null }>();
    for (const m of typedMemberships) {
      const org = m.organizations;
      if (org) {
        userOrgMap.set(m.user_id, { name: org.name, type: org.type, department: m.department });
      }
    }

    // Keep highest score per user
    const seenUsers = new Set<string>();
    const entries: LeaderboardEntry[] = [];

    for (const s of rawScores || []) {
      if (seenUsers.has(s.user_id)) continue;
      seenUsers.add(s.user_id);

      const prof = profileMap.get(s.user_id);
      const org = userOrgMap.get(s.user_id);

      // Filter by department if requested
      if (departmentFilter && org?.department !== departmentFilter) {
        continue;
      }

      entries.push({
        rank: entries.length + 1,
        userId: s.user_id,
        displayName: prof?.displayName || "Anonymous Player",
        avatarInitial: prof?.avatarInitial || "P",
        gameId: s.game_id,
        score: s.score,
        accuracy: s.accuracy || 100,
        puzzlesSolved: s.puzzles_solved || 0,
        orgName: org?.name,
        orgType: org?.type,
        department: org?.department,
      });
    }

    // Determine current user's rank
    let userRankInfo: { rank: number; score: number; percentile: string } | null = null;
    if (user) {
      const userIdx = entries.findIndex((e) => e.userId === user.id);
      if (userIdx !== -1) {
        const rank = userIdx + 1;
        const total = Math.max(entries.length, 1);
        const topPercent = Math.max(1, Math.round((rank / total) * 100));
        userRankInfo = {
          rank,
          score: entries[userIdx].score,
          percentile: `Top ${topPercent}%`,
        };
      }
    }

    return NextResponse.json({
      scope: "global",
      date,
      gameId,
      entries: entries.slice(0, 50),
      totalPlayers: entries.length,
      userRank: userRankInfo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
