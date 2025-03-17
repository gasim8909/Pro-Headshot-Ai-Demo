-- Fix the type casting issue in the subscriptions table policies

-- First, ensure the uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if the subscriptions table exists before proceeding
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
    -- Fix policies with proper type casting
    DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
    CREATE POLICY "Users can view their own subscriptions"
      ON subscriptions FOR SELECT
      USING (auth.uid() = user_id::text);
    
    -- Allow service role to manage all subscriptions
    DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
    CREATE POLICY "Service role can manage all subscriptions"
      ON subscriptions FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role');
    
    -- Enable realtime if not already enabled
    ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
  END IF;
END $$;
