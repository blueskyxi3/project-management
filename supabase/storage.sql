-- ============================================
-- Storage Buckets Setup for ProjectManager 
-- ============================================
--
-- EXECUTION INSTRUCTIONS:
--
-- Step 1: Create buckets via Supabase Dashboard
--   Go to: Storage → New bucket
--   Create bucket: project-documents (public, 10MB limit)
--   Create bucket: user-avatars (public, 2MB limit)
--
-- Step 2: Execute this SQL script for policies
--   Run in Supabase SQL Editor
--
-- ============================================

-- ============================================
-- Create Storage Buckets (if you prefer SQL)
-- ============================================

-- Note: If you have admin privileges, you can run this.
-- Otherwise, create buckets via Dashboard.

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'project-documents',
--   'project-documents',
--   true,
--   10485760,
--   ARRAY[
--     'application/pdf',
--     'application/msword',
--     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--     'application/vnd.ms-excel',
--     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--     'application/vnd.ms-powerpoint',
--     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
--     'image/jpeg',
--     'image/png',
--     'image/gif',
--     'image/webp'
--   ]
-- )
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'user-avatars',
--   'user-avatars',
--   true,
--   2097152,
--   ARRAY[
--     'image/jpeg',
--     'image/png',
--     'image/gif',
--     'image/webp'
--   ]
-- )
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies (RLS)
-- ============================================
-- Note: These policies should be created via Dashboard for easier management:
-- Storage → [bucket] → Policies → New Policy

-- For 'project-documents' bucket:
--
-- 1. Public read access:
--    - Operation: SELECT
--    - Target roles: public
--    - Policy definition: true
--
-- 2. Authenticated users can upload:
--    - Operation: INSERT
--    - Target roles: authenticated
--    - Policy definition: Check if user is project creator or admin
--
-- 3. Authenticated users can delete:
--    - Operation: DELETE
--    - Target roles: authenticated
--    - Policy definition: Check if user is project creator or admin

-- For 'user-avatars' bucket:
--
-- 1. Public read access:
--    - Operation: SELECT
--    - Target roles: public
--    - Policy definition: true
--
-- 2. Users can manage own avatar:
--    - Operation: INSERT, UPDATE, DELETE
--    - Target roles: authenticated
--    - Policy definition: auth.uid()::text = (storage.foldername(name))

-- ============================================
-- SQL for Policies (if you have admin access)
-- ============================================

-- DROP POLICY IF EXISTS "Public read access for project documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated can upload project documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Creators can delete project documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can manage own avatar" ON storage.objects;

-- Public read access for project documents
-- CREATE POLICY "Public read access for project documents"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'project-documents');

-- Authenticated users can upload to project-documents
-- CREATE POLICY "Authenticated can upload project documents"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'project-documents'
--   AND (
--     -- User is uploading to a project they created
--     EXISTS (
--       SELECT 1 FROM project_info
--       WHERE id = REGEXP_REPLACE(storage.foldername(name), '/.*', '')
--       AND creator_id = auth.uid()
--     )
--     OR
--     -- User is admin
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE id = auth.uid() AND role = 'Admin'
--     )
--   )
-- );

-- Creators can delete project documents
-- CREATE POLICY "Creators can delete project documents"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'project-documents'
--   AND (
--     EXISTS (
--       SELECT 1 FROM project_info
--       WHERE id = REGEXP_REPLACE(storage.foldername(name), '/.*', '')
--       AND creator_id = auth.uid()
--     )
--     OR
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE id = auth.uid() AND role = 'Admin'
--     )
--   )
-- );

-- Public read access for avatars
-- CREATE POLICY "Public read access for avatars"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'user-avatars');

-- Users can manage own avatar
-- CREATE POLICY "Users can manage own avatar"
-- ON storage.objects FOR ALL
-- TO authenticated
-- USING (bucket_id = 'user-avatars' AND auth.uid()::text = REGEXP_REPLACE(storage.foldername(name), '/.*', ''))
-- WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = REGEXP_REPLACE(storage.foldername(name), '/.*', ''));

-- ============================================
-- Helper Function for Storage (if needed)
-- ============================================
-- Supabase provides storage.foldername() as a built-in function
-- No need to create it manually

-- ============================================
-- Verification Queries
-- ============================================

-- List all buckets
SELECT * FROM storage.buckets;

-- List all objects in project-documents bucket
SELECT * FROM storage.objects WHERE bucket_id = 'project-documents' LIMIT 10;

-- List all objects in user-avatars bucket
SELECT * FROM storage.objects WHERE bucket_id = 'user-avatars' LIMIT 10;
