-- Add archived flag to collections
ALTER TABLE public.collections 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Add archived flag to products
ALTER TABLE public.products 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for faster filtering
CREATE INDEX idx_collections_archived ON public.collections (archived);
CREATE INDEX idx_products_archived ON public.products (archived);

-- Add comments for documentation
COMMENT ON COLUMN public.collections.archived IS 'Archived collections and their products cannot be purchased but remain visible for historical/SEO purposes';
COMMENT ON COLUMN public.products.archived IS 'Archived products cannot be purchased but remain visible for historical/SEO purposes';