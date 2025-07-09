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