-- Mind Break: Migration 003 - Add Department & Year Cohort to Memberships (PRD §9 & §12)

-- 1. Add department column to memberships table
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Index for fast department querying within organizations
CREATE INDEX IF NOT EXISTS idx_memberships_org_dept 
ON public.memberships(org_id, department);
