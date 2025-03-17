-- This migration fixes inconsistencies in user_id references
-- Some queries use user_id and others use id to reference the user

-- Add index on user_id to improve query performance
CREATE INDEX IF NOT EXISTS users_user_id_idx ON users(user_id);

-- Add index on id to improve query performance
CREATE INDEX IF NOT EXISTS users_id_idx ON users(id);

-- Update subscription_tier for all users based on their active subscriptions
UPDATE users
SET subscription_tier = 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.user_id::text = users.id::text 
      AND subscriptions.status = 'active' 
      AND subscriptions.polar_price_id ILIKE '%pro%'
    ) THEN 'pro'
    WHEN EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.user_id::text = users.id::text 
      AND subscriptions.status = 'active' 
      AND subscriptions.polar_price_id ILIKE '%premium%'
    ) THEN 'premium'
    WHEN EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.user_id::text = users.id::text 
      AND subscriptions.status = 'active'
    ) THEN 'premium'
    ELSE COALESCE(subscription_tier, 'free')
  END
WHERE id IS NOT NULL;

-- Ensure user_id matches id for all users
UPDATE users
SET user_id = id
WHERE user_id IS NULL OR user_id::text != id::text;
