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