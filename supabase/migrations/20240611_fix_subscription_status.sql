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
WHERE subscription IN (
  SELECT polar_id FROM subscriptions WHERE status != 'active'
);

-- Create or replace the update_user_subscription function
CREATE OR REPLACE FUNCTION update_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's subscription column with the subscription ID
  IF NEW.status = 'active' THEN
    UPDATE public.users
    SET subscription = NEW.polar_id
    WHERE user_id = NEW.user_id;
  ELSE
    -- If status is not active, clear the subscription
    UPDATE public.users
    SET subscription = NULL
    WHERE user_id = NEW.user_id AND subscription = NEW.polar_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_user_subscription_trigger ON public.subscriptions;
CREATE TRIGGER update_user_subscription_trigger
AFTER INSERT OR UPDATE OF status ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_user_subscription();
