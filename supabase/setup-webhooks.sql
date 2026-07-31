-- Enable pg_net for outbound HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the generic webhook function
CREATE OR REPLACE FUNCTION invoke_resend_webhook()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT := 'https://hpkpkkjmfpnbklpctyiy.supabase.co';
  edge_function_url TEXT := project_url || '/functions/v1/resend-email-handler';
  payload JSONB;
BEGIN
  -- Construct the payload to look exactly like Supabase Database Webhooks
  IF TG_OP = 'UPDATE' THEN
    payload := json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    )::jsonb;
  ELSE
    payload := json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )::jsonb;
  END IF;

  -- Fire the request
  PERFORM net.http_post(
    url := edge_function_url,
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Trigger for Welcome Email on 'profiles'
DROP TRIGGER IF EXISTS resend_profiles_webhook ON profiles;
CREATE TRIGGER resend_profiles_webhook
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION invoke_resend_webhook();

-- 2. Trigger for Funding Email on 'transactions'
DROP TRIGGER IF EXISTS resend_transactions_webhook ON transactions;
CREATE TRIGGER resend_transactions_webhook
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION invoke_resend_webhook();

-- 3. Trigger for Order Receipts on 'social_media_orders'
DROP TRIGGER IF EXISTS resend_social_orders_webhook ON social_media_orders;
CREATE TRIGGER resend_social_orders_webhook
  AFTER INSERT ON social_media_orders
  FOR EACH ROW
  EXECUTE FUNCTION invoke_resend_webhook();

-- 4. Trigger for OTP Orders on 'otp_orders'
DROP TRIGGER IF EXISTS resend_otp_orders_webhook ON otp_orders;
CREATE TRIGGER resend_otp_orders_webhook
  AFTER INSERT OR UPDATE ON otp_orders
  FOR EACH ROW
  EXECUTE FUNCTION invoke_resend_webhook();
