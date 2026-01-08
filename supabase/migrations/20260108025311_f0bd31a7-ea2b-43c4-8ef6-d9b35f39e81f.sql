-- Create couture_inquiries table for storing inquiry submissions
CREATE TABLE public.couture_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('email', 'phone', 'virtual')),
  phone TEXT,
  message TEXT,
  interested_in_viewing BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.couture_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit inquiries (public form)
CREATE POLICY "Anyone can submit couture inquiries"
ON public.couture_inquiries
FOR INSERT
WITH CHECK (true);

-- Admins can view all inquiries
CREATE POLICY "Admins can view couture inquiries"
ON public.couture_inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage (update/delete) inquiries
CREATE POLICY "Admins can manage couture inquiries"
ON public.couture_inquiries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups by product
CREATE INDEX idx_couture_inquiries_product_id ON public.couture_inquiries(product_id);

-- Add index for admin filtering
CREATE INDEX idx_couture_inquiries_is_read ON public.couture_inquiries(is_read);
CREATE INDEX idx_couture_inquiries_created_at ON public.couture_inquiries(created_at DESC);