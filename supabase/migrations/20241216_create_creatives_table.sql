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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Create policy for creatives (allow all for now, can be restricted later)
DROP POLICY IF EXISTS "Anyone can manage creatives" ON public.creatives;
CREATE POLICY "Anyone can manage creatives" ON public.creatives FOR ALL USING (true);

-- Insert some test data
INSERT INTO public.creatives (platform, headline, description, call_to_action, tone, target_audience) VALUES
('facebook', 'Test Facebook Ad', 'This is a test Facebook ad description', 'Learn More', 'Professional', 'General audience'),
('google', 'Test Google Ad', 'This is a test Google ad description', 'Shop Now', 'Professional', 'General audience')
ON CONFLICT DO NOTHING; 