-- Ensure subscription dates are properly stored and formatted

-- First, make sure all date fields have the correct type
ALTER TABLE subscriptions
  ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN current_period_end TYPE TIMESTAMP WITH TIME ZONE USING current_period_end::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN cancel_at TYPE TIMESTAMP WITH TIME ZONE USING cancel_at::TIMESTAMP WITH TIME ZONE;

-- Make sure user_id is properly typed as UUID
ALTER TABLE subscriptions
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Make sure the subscription field in users table is properly typed
ALTER TABLE users
  ALTER COLUMN subscription TYPE TEXT;

-- Enable realtime for subscriptions table
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
