-- Add customer_email column to orders table for direct email access
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);