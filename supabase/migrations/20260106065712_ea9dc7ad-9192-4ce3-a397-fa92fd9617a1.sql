-- Create product_metals table for multiple metals per product
CREATE TABLE public.product_metals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  metal_type VARCHAR(100) NOT NULL,
  metal_weight VARCHAR(50),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_product_metals_product_id ON public.product_metals(product_id);

-- Enable RLS
ALTER TABLE public.product_metals ENABLE ROW LEVEL SECURITY;

-- Public read access (like product_stones)
CREATE POLICY "Anyone can view product metals"
  ON public.product_metals
  FOR SELECT
  USING (true);

-- Admin can manage metals
CREATE POLICY "Admins can insert product metals"
  ON public.product_metals
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product metals"
  ON public.product_metals
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product metals"
  ON public.product_metals
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));