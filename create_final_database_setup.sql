-- ===================================
-- VIBLER AI DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ===================================

-- 1. Create creatives table (for AI-generated content)
CREATE TABLE IF NOT EXISTS public.creatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    call_to_action TEXT NOT NULL,
    tone TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    product_service TEXT,
    image_url TEXT,
    image_prompt TEXT,
    visual_description TEXT,
    conversion_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create user profiles table (for company branding)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    company_description TEXT,
    industry TEXT,
    website TEXT,
    primary_color TEXT DEFAULT '#8b5cf6',
    secondary_color TEXT DEFAULT '#06b6d4',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for creatives table
CREATE POLICY "Enable all operations for authenticated users" ON public.creatives
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create policies for user profiles table  
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS creatives_created_at_idx ON public.creatives(created_at DESC);
CREATE INDEX IF NOT EXISTS creatives_platform_idx ON public.creatives(platform);
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);

-- ===================================
-- SETUP COMPLETE! 
-- Your Vibler AI app is now fully functional
-- =================================== 