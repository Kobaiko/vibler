-- Add composition column to creatives table for layered ad editor
ALTER TABLE public.creatives 
ADD COLUMN IF NOT EXISTS composition JSONB;

-- Add comment to describe the composition column structure
COMMENT ON COLUMN public.creatives.composition IS 
'Stores layered composition data with structure: {baseImage: string, finalComposition: string, layers: AdLayer[], dimensions: {width: number, height: number}}';
