-- Add GitHub URL field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Add validation for GitHub URL format
ALTER TABLE users ADD CONSTRAINT valid_github_url 
  CHECK (github_url IS NULL OR github_url ~ '^https?://(www\.)?github\.com/[\w-]+/?$');

-- Update user_profiles view to include GitHub URL
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  email,
  display_name,
  avatar_url,
  bio,
  location,
  website,
  linkedin_url,
  twitter_handle,
  github_url,
  skills,
  interests,
  role,
  created_at,
  CASE 
    WHEN is_public = true THEN email
    ELSE NULL
  END as public_email
FROM users
WHERE deleted_at IS NULL;

-- Add GitHub to user_social_links if not already present
-- This allows for backward compatibility with existing social links
INSERT INTO user_social_links (user_id, platform, url)
SELECT 
  id as user_id,
  'github' as platform,
  github_url as url
FROM users
WHERE github_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM user_social_links 
    WHERE user_social_links.user_id = users.id 
      AND user_social_links.platform = 'github'
  );

-- Create trigger to sync GitHub URL with social links
CREATE OR REPLACE FUNCTION sync_github_social_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.github_url IS DISTINCT FROM OLD.github_url THEN
    IF NEW.github_url IS NULL THEN
      -- Remove GitHub social link if URL is removed
      DELETE FROM user_social_links 
      WHERE user_id = NEW.id AND platform = 'github';
    ELSE
      -- Insert or update GitHub social link
      INSERT INTO user_social_links (user_id, platform, url)
      VALUES (NEW.id, 'github', NEW.github_url)
      ON CONFLICT (user_id, platform) 
      DO UPDATE SET url = EXCLUDED.url;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for GitHub URL sync
CREATE TRIGGER sync_github_url_trigger
AFTER UPDATE OF github_url ON users
FOR EACH ROW
EXECUTE FUNCTION sync_github_social_link();

-- Add comment for documentation
COMMENT ON COLUMN users.github_url IS 'GitHub profile URL for the user';