-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subscription_id)
);

-- Enable row-level security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to manage all subscriptions
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;