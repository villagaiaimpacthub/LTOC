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