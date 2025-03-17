-- Drop existing policies on users table
DROP POLICY IF EXISTS "Public access" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Create policies that allow proper access
-- Allow public read access to users table
CREATE POLICY "Public access"
  ON users FOR SELECT
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Allow service role to insert users
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
