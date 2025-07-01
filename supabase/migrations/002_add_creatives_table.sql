-- Create creatives table for Creative Generator
CREATE TABLE public.creatives (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Create policy for creatives (allow all for now, can be restricted later)
CREATE POLICY "Anyone can manage creatives" ON public.creatives FOR ALL USING (true);

-- Create updated_at trigger
CREATE TRIGGER set_creatives_updated_at 
  BEFORE UPDATE ON public.creatives 
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at(); 