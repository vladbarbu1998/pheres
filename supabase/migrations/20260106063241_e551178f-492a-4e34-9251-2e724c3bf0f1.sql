-- Add model_number column for Couture products (optional field)
ALTER TABLE public.products
ADD COLUMN model_number TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.model_number IS 'Optional model number for Couture products only. Should be NULL for Ready To Wear products.';

-- Create validation trigger to ensure model_number is only set for Couture products
CREATE OR REPLACE FUNCTION public.validate_couture_model_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear model_number for non-Couture products
  IF NEW.product_type != 'couture' AND NEW.model_number IS NOT NULL THEN
    NEW.model_number := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER enforce_couture_model_number
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.validate_couture_model_number();