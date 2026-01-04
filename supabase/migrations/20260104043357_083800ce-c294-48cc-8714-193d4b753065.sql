-- Add size field to products table for jewelry dimensions (e.g., "16.5 inches", "Size 7")
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size TEXT;