-- LTOC Platform Complete Database Setup
-- Run this in Supabase SQL Editor

-- ========================================
-- 001_initial_schema.sql
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'contributor', 'reader');
CREATE TYPE content_status AS ENUM ('draft', 'in_review', 'published', 'archived');
CREATE TYPE review_decision AS ENUM ('approve', 'reject', 'request_changes');
CREATE TYPE activity_type AS ENUM ('login', 'logout', 'content_created', 'content_updated', 'content_deleted', 'review_submitted', 'data_export');

-- Organizations table (multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    -- Soft delete fields
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization slug index
CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;

-- Users table with GDPR compliance
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role user_role DEFAULT 'reader',
    profile JSONB DEFAULT '{}',
    -- GDPR fields
    consent_given_at TIMESTAMPTZ,
    consent_version VARCHAR(50),
    data_retention_until TIMESTAMPTZ,
    anonymize_after_days INTEGER DEFAULT 365,
    -- Soft delete fields
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    anonymized_at TIMESTAMPTZ,
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for users
CREATE INDEX idx_users_organization ON users(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- User activity log for GDPR compliance
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    activity_type activity_type NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partitioning for activity logs by month
CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_type ON user_activity_logs(activity_type, created_at DESC);

-- Content table
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500),
    body JSONB NOT NULL, -- Rich text content
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    status content_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES content(id), -- For versioning
    -- Meta fields
    metadata JSONB DEFAULT '{}',
    word_count INTEGER,
    reading_time_minutes INTEGER,
    -- Soft delete fields
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    -- Constraints
    CONSTRAINT unique_org_slug UNIQUE(organization_id, slug)
);

-- Create indexes for content
CREATE INDEX idx_content_organization ON content(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_author ON content(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_status ON content(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_tags ON content USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_published ON content(published_at DESC) WHERE deleted_at IS NULL AND status = 'published';

-- Content collaborators
CREATE TABLE content_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'editor',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES users(id),
    CONSTRAINT unique_content_collaborator UNIQUE(content_id, user_id)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    decision review_decision,
    comments TEXT,
    suggestions JSONB DEFAULT '[]',
    is_anonymous BOOLEAN DEFAULT false,
    -- Soft delete fields
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for reviews
CREATE INDEX idx_reviews_content ON reviews(content_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id) WHERE deleted_at IS NULL;

-- AI synthesis table
CREATE TABLE ai_syntheses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    content_ids UUID[] NOT NULL,
    synthesis_level VARCHAR(50) NOT NULL,
    synthesis_text TEXT NOT NULL,
    attributions JSONB NOT NULL DEFAULT '[]',
    confidence_score DECIMAL(3,2),
    provider VARCHAR(50), -- 'openai', 'claude', etc.
    model_version VARCHAR(50),
    tokens_used INTEGER,
    cost_cents INTEGER,
    -- Soft delete fields
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Vector embeddings for content
CREATE TABLE content_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI ada-002 dimension
    model_version VARCHAR(50) DEFAULT 'ada-002',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_content_embedding UNIQUE(content_id, model_version)
);

-- Create vector index for similarity search
CREATE INDEX idx_content_embeddings_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops);

-- User data export requests (GDPR)
CREATE TABLE data_export_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    file_url TEXT,
    expires_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS (Row Level Security) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Organizations are viewable by members" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL
        )
    );

-- User policies
CREATE POLICY "Users can view their organization members" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Content policies
CREATE POLICY "Content is viewable by organization members" ON content
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

CREATE POLICY "Contributors can create content" ON content
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'contributor')
            AND deleted_at IS NULL
        )
    );

CREATE POLICY "Authors can update their own content" ON content
    FOR UPDATE USING (
        author_id = auth.uid() 
        OR auth.uid() IN (SELECT user_id FROM content_collaborators WHERE content_id = id)
    );

-- Review policies
CREATE POLICY "Reviews are viewable by organization members" ON reviews
    FOR SELECT USING (
        content_id IN (
            SELECT id FROM content WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL
            )
        )
    );

CREATE POLICY "Contributors can create reviews" ON reviews
    FOR INSERT WITH CHECK (
        reviewer_id = auth.uid()
        AND reviewer_id IN (
            SELECT id FROM users WHERE role IN ('admin', 'contributor') AND deleted_at IS NULL
        )
    );

-- Functions for soft delete
CREATE OR REPLACE FUNCTION soft_delete(table_name TEXT, record_id UUID)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NOW(), deleted_by = auth.uid() WHERE id = $1', table_name)
    USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for GDPR data anonymization
CREATE OR REPLACE FUNCTION anonymize_user_data(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET
        email = 'anonymized-' || id || '@anonymous.local',
        display_name = 'Anonymous User',
        profile = '{}',
        anonymized_at = NOW()
    WHERE id = user_id;
    
    -- Remove identifiable data from activity logs
    UPDATE user_activity_logs SET
        ip_address = NULL,
        user_agent = 'Anonymized',
        metadata = '{}'
    WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_activity_type activity_type,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_logs (user_id, organization_id, activity_type, metadata)
    SELECT 
        auth.uid(),
        organization_id,
        p_activity_type,
        p_metadata
    FROM users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_content_search ON content USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

-- Initial organization and admin user will be created in seed file

-- ========================================
-- 002_auth_functions.sql
-- ========================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Get or create default organization
    SELECT id INTO default_org_id FROM organizations WHERE slug = 'default' LIMIT 1;
    
    IF default_org_id IS NULL THEN
        INSERT INTO organizations (name, slug) VALUES ('Default Organization', 'default')
        RETURNING id INTO default_org_id;
    END IF;

    -- Insert user profile
    INSERT INTO public.users (
        id,
        email,
        display_name,
        organization_id,
        role,
        consent_given_at,
        consent_version
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'organization_id')::UUID, default_org_id),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'reader'),
        NOW(),
        '1.0'
    );

    -- Log registration activity
    INSERT INTO user_activity_logs (user_id, organization_id, activity_type, metadata)
    VALUES (
        NEW.id,
        default_org_id,
        'login',
        jsonb_build_object('action', 'registration', 'provider', NEW.raw_user_meta_data->>'provider')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = required_role 
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin' 
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can contribute
CREATE OR REPLACE FUNCTION public.can_contribute()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'contributor') 
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM users 
    WHERE id = auth.uid() 
    AND deleted_at IS NULL
    LIMIT 1;
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(user_id UUID, new_role user_role)
RETURNS VOID AS $$
BEGIN
    -- Check if current user is admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can update user roles';
    END IF;
    
    -- Update the role
    UPDATE users 
    SET role = new_role 
    WHERE id = user_id 
    AND organization_id = get_user_organization_id();
    
    -- Log the activity
    INSERT INTO user_activity_logs (user_id, organization_id, activity_type, metadata)
    VALUES (
        auth.uid(),
        get_user_organization_id(),
        'content_updated',
        jsonb_build_object('action', 'role_change', 'target_user', user_id, 'new_role', new_role)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle social login metadata
CREATE OR REPLACE FUNCTION public.update_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile with social login data if available
    IF NEW.raw_user_meta_data ? 'avatar_url' THEN
        UPDATE users 
        SET profile = profile || jsonb_build_object('avatar_url', NEW.raw_user_meta_data->>'avatar_url')
        WHERE id = NEW.id;
    END IF;
    
    IF NEW.raw_user_meta_data ? 'full_name' THEN
        UPDATE users 
        SET display_name = NEW.raw_user_meta_data->>'full_name'
        WHERE id = NEW.id;
    END IF;
    
    -- Update last login
    UPDATE users SET last_login_at = NOW() WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating user metadata on login
CREATE OR REPLACE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_user_metadata();

-- Function to handle GDPR consent
CREATE OR REPLACE FUNCTION public.update_gdpr_consent(consent_version VARCHAR, consent_given BOOLEAN)
RETURNS VOID AS $$
BEGIN
    IF consent_given THEN
        UPDATE users 
        SET 
            consent_given_at = NOW(),
            consent_version = consent_version,
            data_retention_until = NOW() + INTERVAL '2 years'
        WHERE id = auth.uid();
    ELSE
        -- Mark for deletion if consent withdrawn
        UPDATE users 
        SET 
            data_retention_until = NOW() + INTERVAL '30 days'
        WHERE id = auth.uid();
    END IF;
    
    -- Log consent activity
    INSERT INTO user_activity_logs (user_id, organization_id, activity_type, metadata)
    VALUES (
        auth.uid(),
        get_user_organization_id(),
        'content_updated',
        jsonb_build_object('action', 'consent_update', 'version', consent_version, 'given', consent_given)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export user data (GDPR)
CREATE OR REPLACE FUNCTION public.request_data_export()
RETURNS UUID AS $$
DECLARE
    request_id UUID;
BEGIN
    INSERT INTO data_export_requests (user_id, status)
    VALUES (auth.uid(), 'pending')
    RETURNING id INTO request_id;
    
    -- Log export request
    INSERT INTO user_activity_logs (user_id, organization_id, activity_type, metadata)
    VALUES (
        auth.uid(),
        get_user_organization_id(),
        'data_export',
        jsonb_build_object('request_id', request_id)
    );
    
    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for auth-related tables
CREATE POLICY "Users can request their own data export" ON data_export_requests
    FOR ALL USING (user_id = auth.uid());

-- Additional RLS policy for admins
CREATE POLICY "Admins can view all users in organization" ON users
    FOR SELECT USING (
        is_admin() AND organization_id = get_user_organization_id()
    );

CREATE POLICY "Admins can update users in organization" ON users
    FOR UPDATE USING (
        is_admin() AND organization_id = get_user_organization_id()
    );

-- ========================================
-- 003_collaboration.sql
-- ========================================

-- Add collaboration support to content table
ALTER TABLE content 
ADD COLUMN collaboration_room_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX idx_content_collaboration_room ON content(collaboration_room_id) 
WHERE collaboration_room_id IS NOT NULL;

-- Add collaboration metadata
ALTER TABLE content 
ADD COLUMN collaborators UUID[] DEFAULT '{}';

-- Function to track collaborators
CREATE OR REPLACE FUNCTION add_collaborator(
  p_content_id UUID,
  p_user_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE content 
  SET collaborators = array_append(
    array_remove(collaborators, p_user_id), 
    p_user_id
  )
  WHERE id = p_content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_collaborator TO authenticated;

-- ========================================
-- 004_health_check.sql
-- ========================================

-- Health check function that can be called without authentication
CREATE OR REPLACE FUNCTION get_database_health()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'version', '1.0.0'
  );
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION get_database_health() TO anon;

-- Create a simple health check table for more robust checks
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'healthy',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anon to read health checks (but not write)
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous health check reads" ON health_checks
  FOR SELECT
  TO anon
  USING (true);

-- Cleanup old health checks (keep last 100)
CREATE OR REPLACE FUNCTION cleanup_health_checks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM health_checks
  WHERE id NOT IN (
    SELECT id FROM health_checks
    ORDER BY checked_at DESC
    LIMIT 100
  );
END;
$$;

-- ========================================
-- 005_search_functionality.sql
-- ========================================

-- Enable full-text search extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create search configuration for better text search
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS english_unaccent (COPY = english);
ALTER TEXT SEARCH CONFIGURATION english_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, english_stem;

-- Add search vector column to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to generate search vector
CREATE OR REPLACE FUNCTION generate_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english_unaccent', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english_unaccent', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english_unaccent', COALESCE(NEW.body::text, '')), 'C') ||
    setweight(to_tsvector('english_unaccent', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector
DROP TRIGGER IF EXISTS update_search_vector ON content;
CREATE TRIGGER update_search_vector
  BEFORE INSERT OR UPDATE OF title, summary, body, tags
  ON content
  FOR EACH ROW
  EXECUTE FUNCTION generate_search_vector();

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_content_search_vector ON content USING gin(search_vector);

-- Create index for trigram similarity search
CREATE INDEX IF NOT EXISTS idx_content_title_trgm ON content USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_content_tags_gin ON content USING gin(tags);

-- Update existing content to generate search vectors
UPDATE content SET search_vector = 
  setweight(to_tsvector('english_unaccent', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english_unaccent', COALESCE(summary, '')), 'B') ||
  setweight(to_tsvector('english_unaccent', COALESCE(body::text, '')), 'C') ||
  setweight(to_tsvector('english_unaccent', COALESCE(array_to_string(tags, ' '), '')), 'B');

-- Create search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_results UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for search history
CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX idx_search_history_query ON search_history(query);

-- Create popular searches view
CREATE OR REPLACE VIEW popular_searches AS
SELECT 
  query,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  COUNT(DISTINCT user_id) as unique_users
FROM search_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 20;

-- Create function for advanced search
CREATE OR REPLACE FUNCTION search_content(
  search_query TEXT,
  tag_filter TEXT[] DEFAULT NULL,
  author_filter UUID DEFAULT NULL,
  content_type_filter content_type DEFAULT NULL,
  status_filter content_status DEFAULT NULL,
  date_from TIMESTAMPTZ DEFAULT NULL,
  date_to TIMESTAMPTZ DEFAULT NULL,
  organization_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  tags TEXT[],
  author_id UUID,
  author_name TEXT,
  content_type content_type,
  status content_status,
  created_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  rank REAL,
  highlight_title TEXT,
  highlight_summary TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_content AS (
    SELECT 
      c.id,
      c.title,
      c.summary,
      c.tags,
      c.author_id,
      u.display_name as author_name,
      c.content_type,
      c.status,
      c.created_at,
      c.published_at,
      ts_rank(c.search_vector, websearch_to_tsquery('english_unaccent', search_query)) as rank,
      ts_headline('english_unaccent', c.title, websearch_to_tsquery('english_unaccent', search_query), 
        'MaxWords=50, MinWords=15, ShortWord=3, HighlightAll=FALSE, StartSel=<mark>, StopSel=</mark>') as highlight_title,
      ts_headline('english_unaccent', COALESCE(c.summary, ''), websearch_to_tsquery('english_unaccent', search_query),
        'MaxWords=100, MinWords=30, ShortWord=3, HighlightAll=FALSE, StartSel=<mark>, StopSel=</mark>') as highlight_summary
    FROM content c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE 
      c.deleted_at IS NULL
      AND (search_query = '' OR c.search_vector @@ websearch_to_tsquery('english_unaccent', search_query))
      AND (tag_filter IS NULL OR c.tags && tag_filter)
      AND (author_filter IS NULL OR c.author_id = author_filter)
      AND (content_type_filter IS NULL OR c.content_type = content_type_filter)
      AND (status_filter IS NULL OR c.status = status_filter)
      AND (date_from IS NULL OR c.created_at >= date_from)
      AND (date_to IS NULL OR c.created_at <= date_to)
      AND (organization_filter IS NULL OR c.organization_id = organization_filter)
  )
  SELECT * FROM ranked_content
  ORDER BY 
    CASE WHEN search_query = '' THEN created_at ELSE NULL END DESC,
    rank DESC,
    created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function for search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_query TEXT,
  user_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  suggestion TEXT,
  type TEXT,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Get matching content titles
  SELECT DISTINCT
    c.title as suggestion,
    'content' as type,
    COUNT(sh.id)::INTEGER as usage_count
  FROM content c
  LEFT JOIN search_history sh ON sh.query ILIKE '%' || c.title || '%'
  WHERE 
    c.deleted_at IS NULL
    AND c.status = 'published'
    AND c.title ILIKE partial_query || '%'
  GROUP BY c.title
  
  UNION ALL
  
  -- Get matching tags
  SELECT DISTINCT
    unnest(c.tags) as suggestion,
    'tag' as type,
    COUNT(*)::INTEGER as usage_count
  FROM content c
  WHERE 
    c.deleted_at IS NULL
    AND c.status = 'published'
    AND EXISTS (
      SELECT 1 FROM unnest(c.tags) AS t(tag)
      WHERE t.tag ILIKE partial_query || '%'
    )
  GROUP BY unnest(c.tags)
  
  UNION ALL
  
  -- Get recent searches
  SELECT DISTINCT
    sh.query as suggestion,
    'history' as type,
    COUNT(*)::INTEGER as usage_count
  FROM search_history sh
  WHERE 
    sh.query ILIKE partial_query || '%'
    AND (user_filter IS NULL OR sh.user_id = user_filter)
    AND sh.created_at > NOW() - INTERVAL '30 days'
  GROUP BY sh.query
  
  ORDER BY usage_count DESC, suggestion
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT SELECT ON search_history TO authenticated;
GRANT INSERT ON search_history TO authenticated;
GRANT SELECT ON popular_searches TO authenticated;
GRANT EXECUTE ON FUNCTION search_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions TO authenticated;

-- Add RLS policies for search history
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on author search
CREATE INDEX IF NOT EXISTS idx_content_author_status ON content(author_id, status) 
WHERE deleted_at IS NULL;

-- ========================================
-- 006_notifications.sql
-- ========================================

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'content_published',
  'content_reviewed',
  'review_assigned',
  'review_decision',
  'mention',
  'comment',
  'collaboration_invite',
  'achievement',
  'system_announcement'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_notifications_user_read (user_id, read_at),
  INDEX idx_notifications_created (created_at DESC),
  INDEX idx_notifications_type (type)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  
  -- Per-type preferences
  preferences JSONB DEFAULT '{
    "content_published": {"email": true, "push": true},
    "content_reviewed": {"email": true, "push": true},
    "review_assigned": {"email": true, "push": true},
    "review_decision": {"email": true, "push": true},
    "mention": {"email": true, "push": true},
    "comment": {"email": true, "push": true},
    "collaboration_invite": {"email": true, "push": true},
    "achievement": {"email": false, "push": true},
    "system_announcement": {"email": true, "push": true}
  }',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_expires_in_days INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Calculate expiration if provided
  IF p_expires_in_days IS NOT NULL THEN
    v_expires_at := NOW() + INTERVAL '1 day' * p_expires_in_days;
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    expires_at,
    organization_id
  )
  SELECT 
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data,
    v_expires_at,
    u.organization_id
  FROM users u
  WHERE u.id = p_user_id
  RETURNING id INTO v_notification_id;
  
  -- Trigger realtime update
  PERFORM pg_notify(
    'notifications_channel',
    json_build_object(
      'user_id', p_user_id,
      'notification_id', v_notification_id,
      'type', p_type
    )::text
  );
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = p_notification_id 
    AND user_id = p_user_id
    AND read_at IS NULL;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE user_id = p_user_id
    AND read_at IS NULL;
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
) RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id
      AND read_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create triggers for automatic notifications

-- Notify when content is published
CREATE OR REPLACE FUNCTION notify_content_published()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the author
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    PERFORM send_notification(
      NEW.author_id,
      'content_published',
      'Your content has been published!',
      'Your content "' || NEW.title || '" is now live.',
      jsonb_build_object('content_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_content_published
  AFTER UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION notify_content_published();

-- Notify when review is completed
CREATE OR REPLACE FUNCTION notify_review_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_content RECORD;
BEGIN
  -- Only notify on status change
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'changes_requested') THEN
    -- Get content details
    SELECT title, author_id INTO v_content
    FROM content
    WHERE id = NEW.content_id;
    
    -- Notify content author
    PERFORM send_notification(
      v_content.author_id,
      'review_decision',
      'Review ' || NEW.status,
      'Your content "' || v_content.title || '" has been ' || 
      CASE NEW.status 
        WHEN 'approved' THEN 'approved'
        WHEN 'changes_requested' THEN 'marked for changes'
      END || '.',
      jsonb_build_object(
        'content_id', NEW.content_id,
        'review_id', NEW.id,
        'status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_review_completed
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_review_completed();

-- Notify when review is assigned
CREATE OR REPLACE FUNCTION notify_review_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_content RECORD;
BEGIN
  -- Get content details
  SELECT title INTO v_content
  FROM content
  WHERE id = NEW.content_id;
  
  -- Notify reviewer
  PERFORM send_notification(
    NEW.reviewer_id,
    'review_assigned',
    'New review assigned',
    'You have been assigned to review "' || v_content.title || '".',
    jsonb_build_object(
      'content_id', NEW.content_id,
      'review_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_review_assigned
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_review_assigned();

-- Create views for easy access

-- Active notifications view
CREATE OR REPLACE VIEW active_notifications AS
SELECT 
  n.*,
  u.display_name as user_name,
  u.email as user_email
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE (n.expires_at IS NULL OR n.expires_at > NOW());

-- Notification statistics view
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE read_at IS NULL) as unread_count,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked_count,
  MAX(created_at) as last_notification_at
FROM notifications
WHERE (expires_at IS NULL OR expires_at > NOW())
GROUP BY user_id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION send_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT SELECT ON active_notifications TO authenticated;
GRANT SELECT ON notification_stats TO authenticated;

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

