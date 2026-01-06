
-- Create product_type enum
CREATE TYPE public.product_type AS ENUM ('couture', 'ready_to_wear');

-- Add product_type column to products table
ALTER TABLE public.products 
ADD COLUMN product_type public.product_type NOT NULL DEFAULT 'ready_to_wear';

-- Update existing products based on their linked collections
UPDATE public.products p
SET product_type = 'couture'
WHERE EXISTS (
  SELECT 1 FROM public.product_collections pc
  JOIN public.collections c ON pc.collection_id = c.id
  WHERE pc.product_id = p.id AND c.collection_type = 'couture'
);

-- Create trigger function to validate product-collection type matching
CREATE OR REPLACE FUNCTION public.validate_product_collection_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_product_type public.product_type;
  v_collection_type public.collection_type;
BEGIN
  -- Get the product type
  SELECT product_type INTO v_product_type
  FROM public.products
  WHERE id = NEW.product_id;

  -- Get the collection type (from the collection or its parent)
  SELECT collection_type INTO v_collection_type
  FROM public.collections
  WHERE id = NEW.collection_id;

  -- Validate type matching
  IF v_product_type::text != v_collection_type::text THEN
    RAISE EXCEPTION 'Product type (%) does not match collection type (%). Couture products can only be linked to Couture collections, and Ready To Wear products can only be linked to Ready To Wear collections.',
      v_product_type, v_collection_type;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on product_collections
CREATE TRIGGER enforce_product_collection_type
  BEFORE INSERT OR UPDATE ON public.product_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_collection_type();

-- Create trigger function to validate couture products don't require price
-- (Couture products can have base_price = 0 or NULL-like behavior, but we'll use 0 for inquiry-only)
CREATE OR REPLACE FUNCTION public.validate_product_type_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- For couture products, set base_price to 0 if not provided
  IF NEW.product_type = 'couture' THEN
    -- Couture products are inquiry-only, so we normalize price to 0
    IF NEW.base_price IS NULL OR NEW.base_price < 0 THEN
      NEW.base_price := 0;
    END IF;
  ELSE
    -- Ready to wear products must have a valid price
    IF NEW.base_price IS NULL OR NEW.base_price <= 0 THEN
      RAISE EXCEPTION 'Ready To Wear products must have a valid price greater than 0.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on products
CREATE TRIGGER validate_product_fields_by_type
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_type_fields();

-- Add comment for documentation
COMMENT ON COLUMN public.products.product_type IS 'couture = inquiry-only (no price required), ready_to_wear = purchasable (price required)';
