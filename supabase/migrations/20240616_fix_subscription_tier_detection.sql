-- This migration ensures that all users with active subscriptions have the correct subscription_tier set

-- First, make sure the subscription_tier column exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
    ALTER TABLE users ADD COLUMN subscription_tier text;
  END IF;
END $$;

-- Update subscription_tier for users with active subscriptions based on price_id
UPDATE users
SET subscription_tier = 
  CASE 
    WHEN s.polar_price_id ILIKE '%pro%' THEN 'pro'
    WHEN s.polar_price_id ILIKE '%premium%' THEN 'premium'
    WHEN s.status = 'active' THEN 'premium' -- Default to premium for any active subscription
    ELSE 'free'
  END
FROM subscriptions s
WHERE users.user_id = s.user_id
AND s.status = 'active'
AND (users.subscription_tier IS NULL OR users.subscription_tier = 'free');

-- Also update users who have a subscription field set but no subscription_tier
UPDATE users
SET subscription_tier = 
  CASE 
    WHEN s.polar_price_id ILIKE '%pro%' THEN 'pro'
    WHEN s.polar_price_id ILIKE '%premium%' THEN 'premium'
    WHEN s.status = 'active' THEN 'premium' -- Default to premium for any active subscription
    ELSE 'free'
  END
FROM subscriptions s
WHERE users.subscription = s.polar_id
AND s.status = 'active'
AND (users.subscription_tier IS NULL OR users.subscription_tier = 'free');
