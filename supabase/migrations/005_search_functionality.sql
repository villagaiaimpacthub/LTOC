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