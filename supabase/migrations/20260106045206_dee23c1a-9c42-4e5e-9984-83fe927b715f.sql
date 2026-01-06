-- Create enum for collection types
CREATE TYPE public.collection_type AS ENUM ('couture', 'ready_to_wear');

-- Add collection_type column to collections table
ALTER TABLE public.collections 
ADD COLUMN collection_type public.collection_type NOT NULL DEFAULT 'ready_to_wear';

-- Add comment for clarity
COMMENT ON COLUMN public.collections.collection_type IS 'Determines purchase behavior: couture = inquiry only, ready_to_wear = standard checkout';