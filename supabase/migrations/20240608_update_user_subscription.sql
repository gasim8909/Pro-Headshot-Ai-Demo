-- Create a function to update the user's subscription column when a subscription is created or updated
CREATE OR REPLACE FUNCTION update_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's subscription column with the subscription ID
  UPDATE public.users
  SET subscription = NEW.polar_id
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function when a subscription is inserted or updated
DROP TRIGGER IF EXISTS update_user_subscription_trigger ON public.subscriptions;
CREATE TRIGGER update_user_subscription_trigger
AFTER INSERT OR UPDATE OF status ON public.subscriptions
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION update_user_subscription();

-- Create a function to clear the user's subscription when a subscription is canceled
CREATE OR REPLACE FUNCTION clear_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Only clear if the status changed from active to something else
  IF OLD.status = 'active' AND NEW.status != 'active' THEN
    UPDATE public.users
    SET subscription = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function when a subscription status is updated to non-active
DROP TRIGGER IF EXISTS clear_user_subscription_trigger ON public.subscriptions;
CREATE TRIGGER clear_user_subscription_trigger
AFTER UPDATE OF status ON public.subscriptions
FOR EACH ROW
WHEN (OLD.status = 'active' AND NEW.status != 'active')
EXECUTE FUNCTION clear_user_subscription();

-- Run a one-time update to sync existing active subscriptions with users
UPDATE public.users u
SET subscription = s.polar_id
FROM public.subscriptions s
WHERE s.user_id = u.user_id AND s.status = 'active';
