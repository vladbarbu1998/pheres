-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path for generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'PH-' || to_char(now(), 'YYYYMMDD') || '-' || 
         lpad((COALESCE(
           (SELECT COUNT(*) + 1 FROM public.orders 
            WHERE created_at::date = now()::date), 1
         ))::TEXT, 5, '0')
  INTO new_number;
  
  NEW.order_number = new_number;
  RETURN NEW;
END;
$$;