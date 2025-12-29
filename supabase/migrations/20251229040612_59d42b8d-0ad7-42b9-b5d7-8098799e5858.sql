-- Allow viewing order items for guest orders (where parent order has no user_id)
CREATE POLICY "Allow order items for guest orders" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id IS NULL
));