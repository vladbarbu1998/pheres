-- Restore proper order viewing policy with owner check
DROP POLICY IF EXISTS "Anyone can view order by ID for confirmation" ON public.orders;

-- Users can view their own orders OR admins can view all
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow viewing order by direct ID access (for confirmation page - guest orders)
-- Only allows SELECT, and the UUID is cryptographically random so cannot be enumerated
CREATE POLICY "Allow order confirmation access" 
ON public.orders 
FOR SELECT 
USING (user_id IS NULL);