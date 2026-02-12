
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  payload jsonb;
  supabase_url text;
  service_key text;
BEGIN
  -- Only fire when status changes to 'paid' (skip pending/insert entirely)
  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    payload := jsonb_build_object(
      'order_id', NEW.id,
      'status', NEW.status,
      'previous_status', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      'notify_admin', true
    );

    SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1;
    SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;

    IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/order-emails',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := payload
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
