-- Mind Break: Organizations & Memberships RLS Policies & Initial Seed Data

-- 1. Organizations Policies
CREATE POLICY "Organizations are viewable by everyone" 
  ON public.organizations FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create organizations" 
  ON public.organizations FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- 2. Memberships Policies
CREATE POLICY "Memberships are viewable by everyone" 
  ON public.memberships FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own memberships" 
  ON public.memberships FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memberships" 
  ON public.memberships FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Initial Seed Organizations (Colleges & Companies)
INSERT INTO public.organizations (name, type, domain, invite_code)
VALUES
  ('Stanford University', 'college', 'stanford.edu', 'STAN42'),
  ('MIT', 'college', 'mit.edu', 'MIT001'),
  ('Harvard University', 'college', 'harvard.edu', 'HARV01'),
  ('UC Berkeley', 'college', 'berkeley.edu', 'CAL001'),
  ('Google', 'company', 'google.com', 'GOOG01'),
  ('Microsoft', 'company', 'microsoft.com', 'MSFT01'),
  ('Apple', 'company', 'apple.com', 'AAPL01'),
  ('Meta', 'company', 'meta.com', 'META01')
ON CONFLICT (invite_code) DO NOTHING;
