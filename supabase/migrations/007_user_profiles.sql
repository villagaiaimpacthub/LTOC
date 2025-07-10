-- User Profiles Enhancement Migration
-- Adds comprehensive user profile functionality

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Extend users table with profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email": {
    "updates": true,
    "mentions": true,
    "reviews": true,
    "synthesis": false
  },
  "in_app": {
    "updates": true,
    "mentions": true,
    "reviews": true,
    "synthesis": true
  }
}'::jsonb;

-- Create user_profiles view for public access
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

-- Create user_experiences table for work history
CREATE TABLE IF NOT EXISTS user_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_achieved DATE,
  category TEXT CHECK (category IN ('certification', 'award', 'publication', 'project', 'other')),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_social_links table
CREATE TABLE IF NOT EXISTS user_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Create following/followers relationship
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_experiences_user_id ON user_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_social_links_user_id ON user_social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_users_skills ON users USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN (interests);

-- RLS Policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for profile data
ALTER TABLE user_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Everyone can view public profile information
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (is_public = true OR id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Experiences policies
CREATE POLICY "Public experiences are viewable"
  ON user_experiences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_experiences.user_id 
      AND (users.is_public = true OR users.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own experiences"
  ON user_experiences FOR ALL
  USING (user_id = auth.uid());

-- Achievements policies
CREATE POLICY "Public achievements are viewable"
  ON user_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_achievements.user_id 
      AND (users.is_public = true OR users.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own achievements"
  ON user_achievements FOR ALL
  USING (user_id = auth.uid());

-- Social links policies
CREATE POLICY "Public social links are viewable"
  ON user_social_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_social_links.user_id 
      AND (users.is_public = true OR users.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own social links"
  ON user_social_links FOR ALL
  USING (user_id = auth.uid());

-- Follow policies
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  USING (follower_id = auth.uid());

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  theories_count BIGINT,
  collaborations_count BIGINT,
  followers_count BIGINT,
  following_count BIGINT,
  contributions_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM content WHERE author_id = user_uuid AND deleted_at IS NULL),
    (SELECT COUNT(DISTINCT content_id) FROM content_collaborators WHERE user_id = user_uuid),
    (SELECT COUNT(*) FROM user_follows WHERE following_id = user_uuid),
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = user_uuid),
    (SELECT COUNT(*) FROM content_versions WHERE created_by = user_uuid)
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upload avatar
CREATE OR REPLACE FUNCTION upload_avatar(file_path TEXT, file_data BYTEA)
RETURNS TEXT AS $$
DECLARE
  file_url TEXT;
BEGIN
  -- This is a placeholder - actual file upload happens through Supabase Storage API
  -- Returns the public URL of the uploaded avatar
  file_url := 'https://your-project.supabase.co/storage/v1/object/public/avatars/' || auth.uid() || '/' || file_path;
  
  -- Update user's avatar_url
  UPDATE users 
  SET avatar_url = file_url, updated_at = NOW()
  WHERE id = auth.uid();
  
  RETURN file_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;