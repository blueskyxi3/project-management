-- ============================================
-- ProjectManager  - Supabase Database Schema
-- PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table (uses Supabase Auth, extended profile)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Manager', 'Member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Project Info Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_no VARCHAR(40) NOT NULL UNIQUE,
    project_title VARCHAR(800) NOT NULL,
    project_summary VARCHAR(800) NOT NULL,
    project_url VARCHAR(800),
    project_file VARCHAR(800),
    status VARCHAR(20) DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed', 'Upcoming', 'Pending')),
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    files_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_info_project_no ON project_info(project_no);
CREATE INDEX IF NOT EXISTS idx_project_info_creator ON project_info(creator_id);
CREATE INDEX IF NOT EXISTS idx_project_info_status ON project_info(status);

-- ============================================
-- Project Direct Info Table (Strategy Tab)
-- ============================================
CREATE TABLE IF NOT EXISTS project_direct_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES project_info(id) ON DELETE CASCADE,
    project_no VARCHAR(40) NOT NULL UNIQUE REFERENCES project_info(project_no),
    strategy_fit VARCHAR(40) NOT NULL CHECK (strategy_fit IN ('National Strategy', 'Group Strategy', 'Subsidiary Direction')),
    demand_urgency VARCHAR(800) NOT NULL,
    bottleneck VARCHAR(800),
    product_and_edge VARCHAR(1400) NOT NULL,
    trl VARCHAR(800),
    resources VARCHAR(800),
    supporting_materials_present VARCHAR(800),
    information_completeness_note VARCHAR(800),
    ai_directional_signal VARCHAR(40) DEFAULT 'NEED_MORE_INFO' CHECK (ai_directional_signal IN ('CONTINUE', 'NEED_MORE_INFO', 'RISK_ALERT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_direct_info_project_id ON project_direct_info(project_id);
CREATE INDEX IF NOT EXISTS idx_project_direct_info_project_no ON project_direct_info(project_no);

-- ============================================
-- Project Files Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES project_info(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    document_category VARCHAR(100) DEFAULT 'Project Application' CHECK (document_category IN ('Project Application', 'Progress Report', 'Financial Statement', 'Technical Specification', 'Other Related Documents')),
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON project_files(document_category);

-- ============================================
-- Storage Buckets Setup (for file uploads)
-- ============================================
-- Note: These need to be created via Supabase Dashboard or SQL

-- Bucket: project-documents
-- Enable public read for documents, authenticated write
-- RLS policies will be set separately

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_direct_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles Policies
-- ============================================

-- Users can view all profiles (for team functionality)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (triggered by auth)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- Project Info Policies
-- ============================================

-- Authenticated users can view all projects
CREATE POLICY "Projects are viewable by authenticated users"
    ON project_info FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
    ON project_info FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = creator_id);

-- Project creator can update their own projects
CREATE POLICY "Creators can update their own projects"
    ON project_info FOR UPDATE
    TO authenticated
    USING (auth.uid() = creator_id);

-- Admins can update any project
CREATE POLICY "Admins can update any project"
    ON project_info FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Creators and admins can delete projects
CREATE POLICY "Creators and admins can delete projects"
    ON project_info FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- ============================================
-- Project Direct Info Policies
-- ============================================

-- Authenticated users can view all project direct info
CREATE POLICY "Project direct info is viewable by authenticated users"
    ON project_direct_info FOR SELECT
    TO authenticated
    USING (true);

-- Project creators can insert direct info for their projects
CREATE POLICY "Creators can insert direct info for their projects"
    ON project_direct_info FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_info
            WHERE id = project_direct_info.project_id AND creator_id = auth.uid()
        )
    );

-- Project creators can update direct info for their projects
CREATE POLICY "Creators can update direct info for their projects"
    ON project_direct_info FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_info
            WHERE id = project_direct_info.project_id AND creator_id = auth.uid()
        )
    );

-- Admins can update any project direct info
CREATE POLICY "Admins can update any project direct info"
    ON project_direct_info FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- ============================================
-- Project Files Policies
-- ============================================

-- Authenticated users can view files for projects they have access to
CREATE POLICY "Files are viewable by authenticated users"
    ON project_files FOR SELECT
    TO authenticated
    USING (true);

-- Project creators can upload files to their projects
CREATE POLICY "Creators can upload files to their projects"
    ON project_files FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_info
            WHERE id = project_files.project_id AND creator_id = auth.uid()
        )
    );

-- Project creators can delete files from their projects
CREATE POLICY "Creators can delete files from their projects"
    ON project_files FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_info
            WHERE id = project_files.project_id AND creator_id = auth.uid()
        )
    );

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_info_updated_at
    BEFORE UPDATE ON project_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_direct_info_updated_at
    BEFORE UPDATE ON project_direct_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger to auto-increment files_count on project_info
-- ============================================

CREATE OR REPLACE FUNCTION update_files_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE project_info
        SET files_count = files_count + 1
        WHERE id = NEW.project_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE project_info
        SET files_count = GREATEST(files_count - 1, 0)
        WHERE id = OLD.project_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_files_count_on_insert
    AFTER INSERT ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_files_count();

CREATE TRIGGER update_project_files_count_on_delete
    AFTER DELETE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_files_count();

-- ============================================
-- Trigger to create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Useful Views
-- ============================================

-- View: Projects with creator info
CREATE OR REPLACE VIEW projects_with_creator AS
SELECT
    pi.id,
    pi.project_no,
    pi.project_title,
    pi.project_summary,
    pi.project_url,
    pi.project_file,
    pi.status,
    pi.files_count,
    pi.created_at,
    pi.updated_at,
    p.full_name as creator_name,
    p.email as creator_email,
    p.avatar_url as creator_avatar
FROM project_info pi
LEFT JOIN profiles p ON pi.creator_id = p.id;

-- View: Complete project details (info + direct info)
CREATE OR REPLACE VIEW project_complete_details AS
SELECT
    pi.*,
    pdi.strategy_fit,
    pdi.demand_urgency,
    pdi.bottleneck,
    pdi.product_and_edge,
    pdi.trl,
    pdi.resources,
    pdi.supporting_materials_present,
    pdi.information_completeness_note,
    pdi.ai_directional_signal,
    p.full_name as creator_name
FROM project_info pi
LEFT JOIN project_direct_info pdi ON pi.id = pdi.project_id
LEFT JOIN profiles p ON pi.creator_id = p.id;
