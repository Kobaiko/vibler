-- Enable Row Level Security (RLS)
-- Create custom types for enums
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE funnel_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Users table extension (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Teams/Organizations table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Team memberships
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'member',
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

-- ICPs (Ideal Customer Personas)
CREATE TABLE public.icps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  demographics JSONB,
  psychographics JSONB,
  pain_points TEXT[],
  goals TEXT[],
  preferred_channels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Marketing Strategies
CREATE TABLE public.strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  icp_id UUID REFERENCES public.icps(id),
  name TEXT NOT NULL,
  description TEXT,
  objectives TEXT[],
  tactics JSONB,
  budget_allocation JSONB,
  timeline JSONB,
  kpis TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Marketing Funnels
CREATE TABLE public.funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  strategy_id UUID REFERENCES public.strategies(id),
  icp_id UUID REFERENCES public.icps(id),
  name TEXT NOT NULL,
  description TEXT,
  status funnel_status DEFAULT 'draft',
  stages JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creative Assets (ad copy, images, videos, etc.)
CREATE TABLE public.creative_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  funnel_id UUID REFERENCES public.funnels(id),
  strategy_id UUID REFERENCES public.strategies(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ad_copy', 'image', 'video', 'landing_page', etc.
  content JSONB, -- For text content, copy variations, etc.
  file_url TEXT, -- For uploaded files
  file_size INTEGER,
  file_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Analytics and KPIs
CREATE TABLE public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  funnel_id UUID REFERENCES public.funnels(id),
  strategy_id UUID REFERENCES public.strategies(id),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_type TEXT NOT NULL, -- 'conversion_rate', 'ctr', 'cost_per_click', etc.
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subscriptions (for billing)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status subscription_status NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Team access policies
CREATE POLICY "Team members can read team data" ON public.teams FOR SELECT 
  USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
  
CREATE POLICY "Team admins can update teams" ON public.teams FOR UPDATE 
  USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Team members policies
CREATE POLICY "Team members can read membership" ON public.team_members FOR SELECT 
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

-- ICPs policies
CREATE POLICY "Team members can read ICPs" ON public.icps FOR SELECT 
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
  
CREATE POLICY "Team members can create ICPs" ON public.icps FOR INSERT 
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

-- Similar policies for other tables
CREATE POLICY "Team members can read strategies" ON public.strategies FOR SELECT 
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
  
CREATE POLICY "Team members can create strategies" ON public.strategies FOR INSERT 
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

CREATE POLICY "Team members can read funnels" ON public.funnels FOR SELECT 
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
  
CREATE POLICY "Team members can create funnels" ON public.funnels FOR INSERT 
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_icps_updated_at BEFORE UPDATE ON public.icps FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_strategies_updated_at BEFORE UPDATE ON public.strategies FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_funnels_updated_at BEFORE UPDATE ON public.funnels FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_creative_assets_updated_at BEFORE UPDATE ON public.creative_assets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at(); 