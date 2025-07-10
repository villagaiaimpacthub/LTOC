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