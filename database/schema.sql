-- Vibler Marketing Funnel Database Schema
-- Comprehensive schema for all funnel components with proper indexing and constraints

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB operations
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Funnel status enum
CREATE TYPE funnel_status AS ENUM (
  'draft',
  'active', 
  'paused',
  'completed',
  'archived'
);

-- Priority enum
CREATE TYPE priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Users table (if not exists from auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main funnels table (enhanced version of existing)
CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status funnel_status DEFAULT 'draft',
  priority priority_level DEFAULT 'medium',
  original_prompt TEXT,
  
  -- Core component data (JSONB for flexibility)
  icp JSONB,
  strategy JSONB,
  creatives JSONB,
  flow JSONB,
  kpis JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  version VARCHAR(50) DEFAULT '1.0.0',
  
  -- Ownership and collaboration
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_members JSONB DEFAULT '[]',
  last_modified_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT funnels_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT funnels_valid_version CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

-- Funnel templates table for reusable templates
CREATE TABLE IF NOT EXISTS funnel_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  industry VARCHAR(100),
  
  -- Template structure
  template_data JSONB NOT NULL,
  preview_image_url TEXT,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  
  -- Ownership
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funnel analytics table for performance tracking
CREATE TABLE IF NOT EXISTS funnel_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  
  -- Metrics data
  date DATE NOT NULL,
  metrics JSONB NOT NULL,
  
  -- Aggregation level
  granularity VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(funnel_id, date, granularity)
);

-- Funnel versions table for version control
CREATE TABLE IF NOT EXISTS funnel_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  
  -- Version data
  funnel_data JSONB NOT NULL,
  change_summary TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(funnel_id, version)
);

-- Funnel shares table for collaboration
CREATE TABLE IF NOT EXISTS funnel_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Permissions
  role VARCHAR(50) DEFAULT 'viewer', -- viewer, editor, admin
  permissions JSONB DEFAULT '[]',
  
  -- Share metadata
  shared_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(funnel_id, shared_with_user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_funnels_status ON funnels(status);
CREATE INDEX IF NOT EXISTS idx_funnels_priority ON funnels(priority);
CREATE INDEX IF NOT EXISTS idx_funnels_created_at ON funnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnels_updated_at ON funnels(updated_at DESC);

-- JSONB indexes for component queries
CREATE INDEX IF NOT EXISTS idx_funnels_icp_gin ON funnels USING GIN(icp);
CREATE INDEX IF NOT EXISTS idx_funnels_strategy_gin ON funnels USING GIN(strategy);
CREATE INDEX IF NOT EXISTS idx_funnels_creatives_gin ON funnels USING GIN(creatives);
CREATE INDEX IF NOT EXISTS idx_funnels_flow_gin ON funnels USING GIN(flow);
CREATE INDEX IF NOT EXISTS idx_funnels_kpis_gin ON funnels USING GIN(kpis);
CREATE INDEX IF NOT EXISTS idx_funnels_metadata_gin ON funnels USING GIN(metadata);

-- Array indexes
CREATE INDEX IF NOT EXISTS idx_funnels_tags_gin ON funnels USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_funnels_user_status ON funnels(user_id, status);
CREATE INDEX IF NOT EXISTS idx_funnels_user_priority ON funnels(user_id, priority);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_funnel_templates_category ON funnel_templates(category);
CREATE INDEX IF NOT EXISTS idx_funnel_templates_industry ON funnel_templates(industry);
CREATE INDEX IF NOT EXISTS idx_funnel_templates_public ON funnel_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_funnel_templates_usage ON funnel_templates(usage_count DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_funnel_date ON funnel_analytics(funnel_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_granularity ON funnel_analytics(granularity);

-- Version indexes
CREATE INDEX IF NOT EXISTS idx_funnel_versions_funnel_id ON funnel_versions(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_versions_created_at ON funnel_versions(created_at DESC);

-- Share indexes
CREATE INDEX IF NOT EXISTS idx_funnel_shares_user ON funnel_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_shares_expires ON funnel_shares(expires_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_funnels_updated_at 
  BEFORE UPDATE ON funnels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funnel_templates_updated_at 
  BEFORE UPDATE ON funnel_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create funnel version on update
CREATE OR REPLACE FUNCTION create_funnel_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if significant fields changed
  IF (OLD.icp IS DISTINCT FROM NEW.icp OR 
      OLD.strategy IS DISTINCT FROM NEW.strategy OR 
      OLD.creatives IS DISTINCT FROM NEW.creatives OR 
      OLD.flow IS DISTINCT FROM NEW.flow OR 
      OLD.kpis IS DISTINCT FROM NEW.kpis) THEN
    
    INSERT INTO funnel_versions (
      funnel_id, 
      version, 
      funnel_data, 
      change_summary,
      created_by
    ) VALUES (
      OLD.id,
      OLD.version,
      jsonb_build_object(
        'icp', OLD.icp,
        'strategy', OLD.strategy,
        'creatives', OLD.creatives,
        'flow', OLD.flow,
        'kpis', OLD.kpis,
        'metadata', OLD.metadata
      ),
      'Automatic version created on update',
      NEW.last_modified_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply versioning trigger
CREATE TRIGGER create_funnel_version_trigger
  BEFORE UPDATE ON funnels
  FOR EACH ROW EXECUTE FUNCTION create_funnel_version();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_shares ENABLE ROW LEVEL SECURITY;

-- Funnel policies
CREATE POLICY "Users can view their own funnels" ON funnels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared funnels" ON funnels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funnel_shares 
      WHERE funnel_id = funnels.id 
      AND shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own funnels" ON funnels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funnels" ON funnels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funnels" ON funnels
  FOR DELETE USING (auth.uid() = user_id);

-- Template policies
CREATE POLICY "Users can view public templates" ON funnel_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own templates" ON funnel_templates
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON funnel_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON funnel_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Analytics policies
CREATE POLICY "Users can view analytics for their funnels" ON funnel_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funnels 
      WHERE id = funnel_analytics.funnel_id 
      AND user_id = auth.uid()
    )
  );

-- Version policies
CREATE POLICY "Users can view versions of their funnels" ON funnel_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funnels 
      WHERE id = funnel_versions.funnel_id 
      AND user_id = auth.uid()
    )
  );

-- Share policies
CREATE POLICY "Users can view their shares" ON funnel_shares
  FOR SELECT USING (
    auth.uid() = shared_with_user_id OR 
    EXISTS (
      SELECT 1 FROM funnels 
      WHERE id = funnel_shares.funnel_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get funnel with all related data
CREATE OR REPLACE FUNCTION get_funnel_with_analytics(funnel_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'funnel', to_jsonb(f.*),
    'recent_analytics', (
      SELECT jsonb_agg(to_jsonb(fa.*))
      FROM funnel_analytics fa
      WHERE fa.funnel_id = f.id
      ORDER BY fa.date DESC
      LIMIT 30
    ),
    'versions', (
      SELECT jsonb_agg(to_jsonb(fv.*))
      FROM funnel_versions fv
      WHERE fv.funnel_id = f.id
      ORDER BY fv.created_at DESC
      LIMIT 10
    ),
    'shares', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', fs.shared_with_user_id,
          'role', fs.role,
          'permissions', fs.permissions,
          'shared_at', fs.created_at
        )
      )
      FROM funnel_shares fs
      WHERE fs.funnel_id = f.id
    )
  ) INTO result
  FROM funnels f
  WHERE f.id = funnel_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search funnels with filters
CREATE OR REPLACE FUNCTION search_funnels(
  user_uuid UUID,
  search_text TEXT DEFAULT NULL,
  status_filter funnel_status DEFAULT NULL,
  priority_filter priority_level DEFAULT NULL,
  tags_filter TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  description TEXT,
  status funnel_status,
  priority priority_level,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.status,
    f.priority,
    f.tags,
    f.created_at,
    f.updated_at
  FROM funnels f
  WHERE f.user_id = user_uuid
    AND (search_text IS NULL OR f.name ILIKE '%' || search_text || '%' OR f.description ILIKE '%' || search_text || '%')
    AND (status_filter IS NULL OR f.status = status_filter)
    AND (priority_filter IS NULL OR f.priority = priority_filter)
    AND (tags_filter IS NULL OR f.tags && tags_filter)
  ORDER BY f.updated_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA (for development)
-- ============================================================================

-- Insert sample user (only if not exists)
INSERT INTO users (id, email, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@vibler.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE funnels IS 'Main table storing marketing funnels with all component data';
COMMENT ON TABLE funnel_templates IS 'Reusable funnel templates for quick funnel creation';
COMMENT ON TABLE funnel_analytics IS 'Performance metrics and analytics data for funnels';
COMMENT ON TABLE funnel_versions IS 'Version history for funnel changes';
COMMENT ON TABLE funnel_shares IS 'Funnel sharing and collaboration settings';

COMMENT ON COLUMN funnels.icp IS 'Ideal Customer Profile data stored as JSONB';
COMMENT ON COLUMN funnels.strategy IS 'Marketing Strategy data stored as JSONB';
COMMENT ON COLUMN funnels.creatives IS 'Creative Assets data stored as JSONB';
COMMENT ON COLUMN funnels.flow IS 'Funnel Flow data stored as JSONB';
COMMENT ON COLUMN funnels.kpis IS 'KPI Framework data stored as JSONB';
COMMENT ON COLUMN funnels.metadata IS 'Additional metadata and configuration';
COMMENT ON COLUMN funnels.team_members IS 'Array of team member access configurations'; 