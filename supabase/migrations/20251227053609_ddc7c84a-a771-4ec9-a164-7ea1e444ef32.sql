-- Add product_number column
ALTER TABLE public.products ADD COLUMN product_number TEXT;

-- Create function to generate product number
CREATE OR REPLACE FUNCTION public.generate_product_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(product_number FROM 2) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.products
  WHERE product_number IS NOT NULL;
  
  NEW.product_number = '#' || next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating product numbers
CREATE TRIGGER set_product_number
BEFORE INSERT ON public.products
FOR EACH ROW
WHEN (NEW.product_number IS NULL)
EXECUTE FUNCTION public.generate_product_number();

-- Update existing products with numbers
UPDATE public.products 
SET product_number = '#' || row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
  FROM public.products
) AS numbered
WHERE products.id = numbered.id;