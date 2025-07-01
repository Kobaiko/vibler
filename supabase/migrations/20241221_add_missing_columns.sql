-- Add missing columns to creatives table
ALTER TABLE public.creatives 
ADD COLUMN IF NOT EXISTS conversion_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS punchline TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Add comments to describe the new columns
COMMENT ON COLUMN public.creatives.conversion_score IS 'AI-generated conversion potential score (0-100)';
COMMENT ON COLUMN public.creatives.engagement_score IS 'AI-generated engagement potential score (0-100)';
COMMENT ON COLUMN public.creatives.punchline IS 'Main punchline text for the creative';
COMMENT ON COLUMN public.creatives.tagline IS 'Brand tagline for the creative'; 