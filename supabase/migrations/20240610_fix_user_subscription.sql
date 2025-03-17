-- Ensure users table has subscription column
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription TEXT;

-- Update users table with active subscriptions
UPDATE users
SET subscription = s.polar_id
FROM subscriptions s
WHERE users.user_id = s.user_id
AND s.status = 'active'
AND users.subscription IS NULL;

-- Clear subscription for users with non-active subscriptions
UPDATE users
SET subscription = NULL
WHERE user_id IN (
  SELECT user_id FROM subscriptions WHERE status != 'active'
)
AND subscription IS NOT NULL;

-- Skip adding users table to realtime publication since it's already there
