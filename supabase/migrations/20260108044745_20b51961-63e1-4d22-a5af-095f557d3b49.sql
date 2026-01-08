-- Update the cascade function to handle both archive and unarchive
CREATE OR REPLACE FUNCTION public.cascade_collection_archive()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Cascade when archived changes from false to true (archiving)
  IF NEW.archived = true AND (OLD.archived = false OR OLD.archived IS NULL) THEN
    UPDATE public.products
    SET archived = true, updated_at = now()
    WHERE id IN (
      SELECT product_id 
      FROM public.product_collections 
      WHERE collection_id = NEW.id
    );
  END IF;

  -- Cascade when archived changes from true to false (unarchiving)
  IF NEW.archived = false AND OLD.archived = true THEN
    UPDATE public.products
    SET archived = false, updated_at = now()
    WHERE id IN (
      SELECT product_id 
      FROM public.product_collections 
      WHERE collection_id = NEW.id
    );
  END IF;

  RETURN NEW;
END;
$function$;