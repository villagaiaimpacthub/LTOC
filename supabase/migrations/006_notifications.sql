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