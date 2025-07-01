-- Create creatives table for Creative Generator
CREATE TABLE IF NOT EXISTS public.creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  call_to_action TEXT NOT NULL,
  tone TEXT NOT NULL,
  target_audience TEXT,
  product_service TEXT,
  image_url TEXT,
  image_prompt TEXT,
  visual_description TEXT,
  conversion_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Create policy for creatives (allow all for now, can be restricted later)
DROP POLICY IF EXISTS "Anyone can manage creatives" ON public.creatives;
CREATE POLICY "Anyone can manage creatives" ON public.creatives FOR ALL USING (true); 