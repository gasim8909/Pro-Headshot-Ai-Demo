-- Add credits tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_reset_date TEXT;

-- Create function to reset credits monthly
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(CURRENT_DATE, 'YYYY-MM');
  
  -- If it's a new month or reset_date is null, reset credits
  IF NEW.credits_reset_date IS NULL OR NEW.credits_reset_date <> current_month THEN
    NEW.credits_used := 0;
    NEW.credits_reset_date := current_month;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reset credits monthly
DROP TRIGGER IF EXISTS reset_credits_trigger ON users;
CREATE TRIGGER reset_credits_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION reset_monthly_credits();

-- Note: We're not adding users to supabase_realtime as it's already a member
