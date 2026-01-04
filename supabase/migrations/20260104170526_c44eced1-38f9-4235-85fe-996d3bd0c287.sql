-- Create press_outlets table
CREATE TABLE public.press_outlets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create press_articles table
CREATE TABLE public.press_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  outlet_id UUID NOT NULL REFERENCES public.press_outlets(id) ON DELETE CASCADE,
  external_url TEXT NOT NULL,
  publish_date DATE,
  short_description TEXT,
  thumbnail_url TEXT,
  is_highlight BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.press_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_articles ENABLE ROW LEVEL SECURITY;

-- RLS policies for press_outlets
CREATE POLICY "Anyone can view active press outlets"
ON public.press_outlets
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all press outlets"
ON public.press_outlets
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage press outlets"
ON public.press_outlets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for press_articles
CREATE POLICY "Anyone can view active press articles"
ON public.press_articles
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all press articles"
ON public.press_articles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage press articles"
ON public.press_articles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_press_outlets_updated_at
BEFORE UPDATE ON public.press_outlets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_press_articles_updated_at
BEFORE UPDATE ON public.press_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_press_outlets_active ON public.press_outlets(is_active);
CREATE INDEX idx_press_outlets_display_order ON public.press_outlets(display_order);
CREATE INDEX idx_press_articles_outlet ON public.press_articles(outlet_id);
CREATE INDEX idx_press_articles_active ON public.press_articles(is_active);
CREATE INDEX idx_press_articles_publish_date ON public.press_articles(publish_date DESC);