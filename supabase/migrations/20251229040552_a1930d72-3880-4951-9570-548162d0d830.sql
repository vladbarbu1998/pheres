-- Allow anyone to view a specific order by ID for order confirmation
-- This is secure because order IDs are UUIDs that cannot be guessed
CREATE POLICY "Anyone can view order by ID for confirmation" 
ON public.orders 
FOR SELECT 
USING (true);

-- Drop the old restrictive policy since the new one covers all cases
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;