-- Seed data for development and testing

-- Insert default organization
INSERT INTO organizations (id, name, slug, settings)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Default Organization', 'default', 
   '{"features": ["ai_synthesis", "collaborative_editing"], "theme": "light"}'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Research Institute', 'research-institute',
   '{"features": ["academic_citations", "peer_review"], "theme": "academic"}');

-- Insert test users (passwords will be set through Auth UI or API)
-- Note: These users need to be created in Supabase Auth first
-- These are just the profile records

-- Admin user
INSERT INTO users (id, organization_id, email, display_name, role, profile, consent_given_at, consent_version)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
   'admin@ltoc.test', 'Admin User', 'admin',
   '{"bio": "Platform administrator", "expertise": ["systems thinking", "platform management"]}',
   NOW(), '1.0');

-- Contributors
INSERT INTO users (id, organization_id, email, display_name, role, profile, consent_given_at, consent_version)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'sarah.chen@ltoc.test', 'Dr. Sarah Chen', 'contributor',
   '{"bio": "Systems change researcher focusing on climate adaptation", "expertise": ["climate systems", "adaptation strategies"], "affiliation": "University of Systems Science"}',
   NOW(), '1.0'),
  
  ('33333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'james.williams@ltoc.test', 'Prof. James Williams', 'contributor',
   '{"bio": "Expert in organizational transformation and complexity theory", "expertise": ["organizational change", "complexity science"], "affiliation": "Institute for Advanced Studies"}',
   NOW(), '1.0'),
  
  ('44444444-4444-4444-4444-444444444444', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   'maria.garcia@ltoc.test', 'Dr. Maria Garcia', 'contributor',
   '{"bio": "Social innovation and community resilience specialist", "expertise": ["social innovation", "community development"], "affiliation": "Research Institute"}',
   NOW(), '1.0');

-- Readers
INSERT INTO users (id, organization_id, email, display_name, role, profile, consent_given_at, consent_version)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'reader1@ltoc.test', 'Alex Thompson', 'reader',
   '{"bio": "Impact investor interested in systems change"}',
   NOW(), '1.0'),
  
  ('66666666-6666-6666-6666-666666666666', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'reader2@ltoc.test', 'Jordan Lee', 'reader',
   '{"bio": "Policy advisor exploring systems approaches"}',
   NOW(), '1.0');

-- Insert sample content
INSERT INTO content (id, organization_id, author_id, title, slug, body, summary, tags, status, published_at)
VALUES 
  -- Published content by Sarah Chen
  ('c1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '22222222-2222-2222-2222-222222222222',
   'Understanding Climate Systems Through a Complexity Lens',
   'climate-systems-complexity',
   '{"blocks": [{"type": "paragraph", "content": "Climate systems represent one of the most complex adaptive systems on Earth..."}]}',
   'An exploration of how complexity theory helps us understand climate dynamics and identify intervention points.',
   ARRAY['climate', 'complexity', 'systems thinking', 'adaptation'],
   'published',
   NOW() - INTERVAL '7 days'),

  -- Published content by James Williams
  ('c2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '33333333-3333-3333-3333-333333333333',
   'Organizational Transformation in Complex Environments',
   'organizational-transformation',
   '{"blocks": [{"type": "paragraph", "content": "Organizations today face unprecedented complexity in their operating environments..."}]}',
   'A framework for understanding and implementing organizational change in complex, uncertain conditions.',
   ARRAY['organizations', 'transformation', 'complexity', 'leadership'],
   'published',
   NOW() - INTERVAL '5 days'),

  -- Draft content by Maria Garcia
  ('c3333333-3333-3333-3333-333333333333', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
   '44444444-4444-4444-4444-444444444444',
   'Community Resilience Through Social Innovation',
   'community-resilience-innovation',
   '{"blocks": [{"type": "paragraph", "content": "Building resilient communities requires innovative approaches to social challenges..."}]}',
   'Exploring how social innovation can strengthen community resilience in the face of systemic challenges.',
   ARRAY['community', 'resilience', 'social innovation', 'systems change'],
   'draft',
   NULL),

  -- In-review content
  ('c4444444-4444-4444-4444-444444444444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '22222222-2222-2222-2222-222222222222',
   'Leverage Points in Climate Action',
   'leverage-points-climate',
   '{"blocks": [{"type": "paragraph", "content": "Donella Meadows identified twelve leverage points in complex systems..."}]}',
   'Applying Meadows leverage points framework to identify high-impact climate interventions.',
   ARRAY['leverage points', 'climate action', 'systems intervention'],
   'in_review',
   NULL);

-- Insert collaborators
INSERT INTO content_collaborators (content_id, user_id, role, added_by)
VALUES 
  ('c4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'reviewer', '22222222-2222-2222-2222-222222222222');

-- Insert reviews
INSERT INTO reviews (content_id, reviewer_id, decision, comments, suggestions, completed_at)
VALUES 
  ('c4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
   'request_changes',
   'Excellent framework application. Consider adding more concrete examples from recent climate initiatives.',
   '[{"type": "addition", "location": "section-3", "suggestion": "Add case study from Pacific Island nations"}]',
   NOW() - INTERVAL '1 day');

-- Insert sample AI synthesis
INSERT INTO ai_syntheses (organization_id, content_ids, synthesis_level, synthesis_text, attributions, confidence_score, provider, model_version, tokens_used, cost_cents)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   ARRAY['c1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222'],
   'executive',
   'The intersection of climate complexity and organizational transformation reveals critical insights for systems change. Dr. Chen''s analysis of climate as a complex adaptive system aligns with Prof. Williams'' framework for organizational adaptation, suggesting that similar principles govern both natural and human systems.',
   '[
     {"contentId": "c1111111-1111-1111-1111-111111111111", "author": "Dr. Sarah Chen", "contribution": "Climate complexity framework", "weight": 0.5},
     {"contentId": "c2222222-2222-2222-2222-222222222222", "author": "Prof. James Williams", "contribution": "Organizational adaptation principles", "weight": 0.5}
   ]',
   0.85,
   'openai',
   'gpt-3.5-turbo',
   750,
   15);

-- Insert activity logs
INSERT INTO user_activity_logs (user_id, organization_id, activity_type, metadata)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'login', '{"ip": "192.168.1.1"}'),
  ('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'content_created', '{"contentId": "c1111111-1111-1111-1111-111111111111"}'),
  ('33333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'review_submitted', '{"contentId": "c4444444-4444-4444-4444-444444444444"}');

-- Note: To use this seed data:
-- 1. First create the corresponding auth users in Supabase Auth
-- 2. Use the same UUIDs as specified above
-- 3. Run this seed file to populate the profile data