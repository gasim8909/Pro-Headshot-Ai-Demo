-- Create user_headshots table to store saved headshots
CREATE TABLE IF NOT EXISTS user_headshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Add RLS policies
ALTER TABLE user_headshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (using DO block for conditional drops)
DO $$ 
BEGIN
  -- Drop view policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_headshots' AND policyname = 'Users can view their own headshots'
  ) THEN
    DROP POLICY "Users can view their own headshots" ON user_headshots;
  END IF;
  
  -- Drop insert policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_headshots' AND policyname = 'Users can insert their own headshots'
  ) THEN
    DROP POLICY "Users can insert their own headshots" ON user_headshots;
  END IF;
  
  -- Drop delete policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_headshots' AND policyname = 'Users can delete their own headshots'
  ) THEN
    DROP POLICY "Users can delete their own headshots" ON user_headshots;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Users can view their own headshots"
  ON user_headshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own headshots"
  ON user_headshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own headshots"
  ON user_headshots FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE user_headshots;
