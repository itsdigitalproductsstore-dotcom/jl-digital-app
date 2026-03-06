-- =============================================
-- CLIENTS MANAGEMENT - SQL MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- Step 1: Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed', 'lost')),
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies
-- Policy: Users can only see their own clients
DROP POLICY IF EXISTS "Users can only see own clients" ON clients;
CREATE POLICY "Users can only see own clients" ON clients
  FOR SELECT USING (auth.uid() = owner_id);

-- Policy: Users can insert their own clients
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own clients
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Users can delete their own clients
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = owner_id);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_archived ON clients(archived);

-- Step 5: Enable updated_at trigger (if trigger function exists)
-- This requires the trigger function to exist - skip if you get an error
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Table created successfully!
-- Now go to the Command Center to manage clients
-- =============================================
