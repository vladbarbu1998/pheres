-- Function to cascade archive status from collection to products
CREATE OR REPLACE FUNCTION public.cascade_collection_archive()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only cascade when archived changes from false to true
  IF NEW.archived = true AND (OLD.archived = false OR OLD.archived IS NULL) THEN
    UPDATE public.products
    SET archived = true, updated_at = now()
    WHERE id IN (
      SELECT product_id 
      FROM public.product_collections 
      WHERE collection_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on collections table
CREATE TRIGGER trigger_cascade_collection_archive
  AFTER UPDATE OF archived ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_collection_archive();