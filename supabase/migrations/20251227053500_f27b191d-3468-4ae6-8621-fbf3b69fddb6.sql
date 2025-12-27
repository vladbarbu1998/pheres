-- Drop the trigger that uses pg_net since it's not available
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;

-- Drop the function that depends on pg_net
DROP FUNCTION IF EXISTS public.notify_order_status_change();