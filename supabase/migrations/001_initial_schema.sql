-- Mind Break: Initial Supabase Schema (PRD §15.3)

-- 1. Profiles (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  avatar_initial TEXT DEFAULT 'P',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Organizations (Colleges & Companies)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('college', 'company', 'community')),
  domain TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Organization Memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'lead')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, org_id)
);

-- 4. Game Sessions (Anti-cheat timing & seeds)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  seed TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  seconds_played NUMERIC(6, 2) DEFAULT 0,
  is_valid BOOLEAN DEFAULT true
);

-- 5. Scores (Daily & leaderboard submissions)
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  puzzles_solved INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 100,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Play Days (Habit tracking: 60s rule)
CREATE TABLE IF NOT EXISTS public.play_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  seconds_played INTEGER DEFAULT 0,
  counted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 7. Streaks & Freezes
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  freezes_held INTEGER DEFAULT 1,
  last_played_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Reward Claims (Physical fulfillment)
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_day INTEGER NOT NULL,
  reward_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered')),
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning-fast leaderboards
CREATE INDEX IF NOT EXISTS idx_scores_game_date ON public.scores(game_id, date, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_play_days_user_date ON public.play_days(user_id, date);
CREATE INDEX IF NOT EXISTS idx_streaks_rank ON public.streaks(current_streak DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: everyone can view display name/avatar; users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Scores: Everyone can view leaderboard scores
CREATE POLICY "Scores are viewable by everyone" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks: Everyone can view streaks for leaderboards
CREATE POLICY "Streaks are viewable by everyone" ON public.streaks FOR SELECT USING (true);
CREATE POLICY "Users can update own streak" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Play days: Private to each user
CREATE POLICY "Users can view own play days" ON public.play_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own play days" ON public.play_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own play days" ON public.play_days FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile trigger on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_initial)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Player'),
    NEW.email,
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'P') FROM 1 FOR 1))
  );

  INSERT INTO public.streaks (user_id, current_streak, best_streak, freezes_held)
  VALUES (NEW.id, 0, 0, 1)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
