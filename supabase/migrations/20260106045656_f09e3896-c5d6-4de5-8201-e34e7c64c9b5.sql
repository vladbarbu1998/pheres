-- Add parent_id column to collections table for hierarchy
ALTER TABLE public.collections 
ADD COLUMN parent_id uuid REFERENCES public.collections(id) ON DELETE CASCADE;

-- Add index for faster parent-child queries
CREATE INDEX idx_collections_parent_id ON public.collections(parent_id);

-- Add comment for clarity
COMMENT ON COLUMN public.collections.parent_id IS 'NULL = root/parent collection, NOT NULL = child collection. Products can only be linked to child collections.';

-- Create the two root parent collections
INSERT INTO public.collections (id, name, slug, description, collection_type, is_active, display_order, parent_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Couture', 'couture', 'One-of-a-kind pieces available by inquiry only.', 'couture', true, 1, NULL),
  ('00000000-0000-0000-0000-000000000002', 'Ready To Wear', 'ready-to-wear', 'Exquisite pieces available for purchase.', 'ready_to_wear', true, 2, NULL);

-- Create a function to validate that products can only be linked to child collections
CREATE OR REPLACE FUNCTION public.validate_product_collection_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the collection is a child (has parent_id)
  IF NOT EXISTS (
    SELECT 1 FROM public.collections 
    WHERE id = NEW.collection_id AND parent_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Products can only be linked to child collections, not parent collections.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce the validation
CREATE TRIGGER enforce_child_collection_link
BEFORE INSERT OR UPDATE ON public.product_collections
FOR EACH ROW
EXECUTE FUNCTION public.validate_product_collection_link();

-- Create a function to ensure child collection_type matches parent
CREATE OR REPLACE FUNCTION public.sync_child_collection_type()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a child collection (has parent_id), sync collection_type from parent
  IF NEW.parent_id IS NOT NULL THEN
    SELECT collection_type INTO NEW.collection_type
    FROM public.collections
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-sync collection_type on child collections
CREATE TRIGGER sync_collection_type_from_parent
BEFORE INSERT OR UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.sync_child_collection_type();