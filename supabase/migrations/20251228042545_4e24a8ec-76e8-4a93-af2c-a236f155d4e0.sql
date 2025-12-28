-- Create product_stones table for storing multiple stones per product
CREATE TABLE public.product_stones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stone_type TEXT NOT NULL,
  stone_carat TEXT,
  stone_color TEXT,
  stone_clarity TEXT,
  stone_cut TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_stones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view product stones"
ON public.product_stones
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product stones"
ON public.product_stones
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient lookups
CREATE INDEX idx_product_stones_product_id ON public.product_stones(product_id);

-- Migrate existing stone data from products table to product_stones
INSERT INTO public.product_stones (product_id, stone_type, stone_carat, stone_color, stone_clarity, stone_cut, display_order)
SELECT 
  id,
  stone_type,
  stone_carat,
  stone_color,
  stone_clarity,
  stone_cut,
  0
FROM public.products
WHERE stone_type IS NOT NULL;