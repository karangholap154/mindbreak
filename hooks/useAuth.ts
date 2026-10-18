"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { loadStreakData } from "@/lib/streak";

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  avatarInitial: string;
  isPremium: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, email, avatar_initial, is_premium")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile({
        id: data.id,
        displayName: data.display_name,
        email: data.email,
        avatarInitial: data.avatar_initial || "P",
        isPremium: data.is_premium || false,
      });

      // Sync guest streak into Supabase if DB streak is lower
      const localStreak = loadStreakData();
      if (localStreak.currentStreak > 0) {
        const { data: dbStreak } = await supabase
          .from("streaks")
          .select("current_streak")
          .eq("user_id", userId)
          .maybeSingle();

        if ((dbStreak?.current_streak || 0) < localStreak.currentStreak) {
          await supabase.from("streaks").upsert({
            user_id: userId,
            current_streak: localStreak.currentStreak,
            best_streak: localStreak.bestStreak,
            freezes_held: localStreak.freezesHeld,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then((res: { data: { user: User | null } }) => {
      const u = res.data.user;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signOut,
  };
}
