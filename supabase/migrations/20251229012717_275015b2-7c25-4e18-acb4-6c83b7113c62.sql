-- Add new columns to press_entries for enhanced celebrity appearances management
ALTER TABLE public.press_entries
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS section text,
ADD COLUMN IF NOT EXISTS jewelry_photo_url text,
ADD COLUMN IF NOT EXISTS notes text;

-- Add a check constraint for section values
ALTER TABLE public.press_entries
ADD CONSTRAINT press_entries_section_check 
CHECK (section IS NULL OR section IN ('Red Carpet', 'Magazine Cover', 'Special Appearance'));