-- Add gross_weight column to products table
ALTER TABLE public.products
ADD COLUMN gross_weight text;