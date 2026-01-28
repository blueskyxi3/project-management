/**
 * Project Service
 * Handles all project-related API operations
 */

import { supabase, STORAGE_BUCKETS, uploadFile, deleteFile, getPublicUrl, getCurrentUser } from '../client';
import type {
  ProjectInfo,
  ProjectInfoInsert,
  ProjectInfoUpdate,
  ProjectDirectInfo,
  ProjectDirectInfoInsert,
  ProjectDirectInfoUpdate,
  ProjectFile,
  ProjectFileInsert,
  ProjectWithCreator,
  ProjectCompleteDetails,
  SearchProjectsRequest,
  UpdateProjectOverviewRequest,
  UpdateProjectStrategyRequest,
  ProjectStatus,
  DocumentCategory,
} from '../types';

// ============================================
// Project Info Operations (Overview Tab)
// ============================================

/**
 * Get all projects with pagination and filtering
 */
export async function getProjects(params: SearchProjectsRequest = {}) {
  let query = supabase
    .from('projects_with_creator')
    .select('*', { count: 'exact' });

  // Filter by project number
  if (params.project_no) {
    query = query.ilike('project_no', `%${params.project_no}%`);
  }

  // Filter by keyword (title or summary)
  if (params.keyword) {
    query = query.or(`project_title.ilike.%${params.keyword}%,project_summary.ilike.%${params.keyword}%`);
  }

  // Filter by status
  if (params.status) {
    query = query.eq('status', params.status);
  }

  // Pagination
  const page = params.page || 1;
  const perPage = params.per_page || 10;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return { projects: data || [], total: count || 0, page, perPage };
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: string): Promise<ProjectCompleteDetails> {
  const { data, error } = await supabase
    .from('project_complete_details')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}

/**
 * Get a single project by project number
 */
export async function getProjectByNo(projectNo: string): Promise<ProjectCompleteDetails> {
  const { data, error } = await supabase
    .from('project_complete_details')
    .select('*')
    .eq('project_no', projectNo)
    .single();

  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}

/**
 * Create a new project
 */
export async function createProject(projectData: ProjectInfoInsert): Promise<ProjectInfo> {
  const { data: userData } = await getCurrentUser();

  const { data, error } = await supabase
    .from('project_info')
    .insert({
      ...projectData,
      creator_id: userData?.user?.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data;
}

/**
 * Update project overview (from Overview tab)
 */
export async function updateProjectOverview(
  projectId: string,
  updates: UpdateProjectOverviewRequest
): Promise<ProjectInfo> {
  const { data, error } = await supabase
    .from('project_info')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data;
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<ProjectInfo> {
  const { data, error } = await supabase
    .from('project_info')
    .update({ status })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project status: ${error.message}`);
  }

  return data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  // First, get all files for the project
  const { data: files } = await supabase
    .from('project_files')
    .select('file_path')
    .eq('project_id', projectId);

  // Delete all files from storage
  if (files && files.length > 0) {
    const paths = files.map(f => f.file_path);
    await supabase.storage.from(STORAGE_BUCKETS.PROJECT_DOCUMENTS).remove(paths);
  }

  // Delete the project (cascade will handle related records)
  const { error } = await supabase
    .from('project_info')
    .delete()
    .eq('id', projectId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

// ============================================
// Project Direct Info Operations (Strategy Tab)
// ============================================

/**
 * Get project direct info by project ID
 */
export async function getProjectDirectInfo(projectId: string): Promise<ProjectDirectInfo | null> {
  const { data, error } = await supabase
    .from('project_direct_info')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch project direct info: ${error.message}`);
  }

  return data;
}

/**
 * Create or update project direct info (Strategy tab)
 */
export async function upsertProjectDirectInfo(
  projectId: string,
  projectNo: string,
  info: Partial<ProjectDirectInfoInsert>
): Promise<ProjectDirectInfo> {
  // Check if direct info exists
  const existing = await getProjectDirectInfo(projectId);

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('project_direct_info')
      .update(info)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project direct info: ${error.message}`);
    }

    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('project_direct_info')
      .insert({
        ...info,
        project_id: projectId,
        project_no: projectNo,
      } as ProjectDirectInfoInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project direct info: ${error.message}`);
    }

    return data;
  }
}

/**
 * Update project strategy (from Strategy tab)
 */
export async function updateProjectStrategy(
  projectId: string,
  updates: UpdateProjectStrategyRequest
): Promise<ProjectDirectInfo> {
  const { data, error } = await supabase
    .from('project_direct_info')
    .update(updates)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project strategy: ${error.message}`);
  }

  return data;
}

// ============================================
// Project Files Operations
// ============================================

/**
 * Get all files for a project
 */
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const { data, error } = await supabase
    .from('project_files')
    .select(`
      *,
      profiles:uploaded_by (full_name, email)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch project files: ${error.message}`);
  }

  return data.map(file => ({
    ...file,
    uploaded_by_name: file.profiles?.full_name,
  }));
}

/**
 * Upload a file to a project
 */
export async function uploadProjectFile(
  projectId: string,
  file: File,
  documentCategory: DocumentCategory = 'Other Related Documents'
): Promise<ProjectFile> {
  const { data: userData } = await getCurrentUser();

  // Generate unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${projectId}/${fileName}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await uploadFile(
    STORAGE_BUCKETS.PROJECT_DOCUMENTS,
    filePath,
    file
  );

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get public URL
  const fileUrl = getPublicUrl(STORAGE_BUCKETS.PROJECT_DOCUMENTS, filePath);

  // Insert file record
  const { data: fileData, error: insertError } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      file_name: file.name,
      file_path: filePath,
      file_url: fileUrl,
      file_size: file.size,
      file_type: fileExt || 'unknown',
      document_category: documentCategory,
      uploaded_by: userData?.user?.id,
      mime_type: file.type,
    } as ProjectFileInsert)
    .select()
    .single();

  if (insertError) {
    // Rollback storage upload
    await deleteFile(STORAGE_BUCKETS.PROJECT_DOCUMENTS, filePath);
    throw new Error(`Failed to save file record: ${insertError.message}`);
  }

  return fileData;
}

/**
 * Upload multiple files to a project
 */
export async function uploadProjectFiles(
  projectId: string,
  files: File[],
  documentCategory: DocumentCategory = 'Other Related Documents'
): Promise<ProjectFile[]> {
  const uploadPromises = files.map(file =>
    uploadProjectFile(projectId, file, documentCategory)
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete a project file
 */
export async function deleteProjectFile(fileId: string): Promise<void> {
  // Get file info
  const { data: fileData, error: fetchError } = await supabase
    .from('project_files')
    .select('file_path')
    .eq('id', fileId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch file: ${fetchError.message}`);
  }

  // Delete from storage
  const { error: storageError } = await deleteFile(
    STORAGE_BUCKETS.PROJECT_DOCUMENTS,
    fileData.file_path
  );

  if (storageError) {
    console.warn('Failed to delete file from storage:', storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw new Error(`Failed to delete file record: ${dbError.message}`);
  }
}

/**
 * Download a project file
 */
export async function downloadProjectFile(fileId: string): Promise<Blob> {
  // Get file info
  const { data: fileData, error: fetchError } = await supabase
    .from('project_files')
    .select('file_path, file_name')
    .eq('id', fileId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch file: ${fetchError.message}`);
  }

  // Download from storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PROJECT_DOCUMENTS)
    .download(fileData.file_path);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return data;
}

// ============================================
// Combined Operations
// ============================================

/**
 * Get complete project data (info + direct info + files)
 */
export async function getCompleteProject(projectId: string) {
  const [project, directInfo, files] = await Promise.all([
    getProjectById(projectId),
    getProjectDirectInfo(projectId),
    getProjectFiles(projectId),
  ]);

  return {
    ...project,
    direct_info: directInfo,
    files,
  };
}

/**
 * Create a new project with initial strategy info
 */
export async function createProjectWithStrategy(
  projectData: ProjectInfoInsert,
  strategyData: Partial<ProjectDirectInfoInsert>
): Promise<{ project: ProjectInfo; directInfo: ProjectDirectInfo }> {
  // Create project
  const project = await createProject(projectData);

  // Create direct info
  const directInfo = await upsertProjectDirectInfo(
    project.id,
    project.project_no,
    strategyData
  );

  return { project, directInfo };
}

// ============================================
// Real-time Subscriptions
// ============================================

/**
 * Subscribe to project changes
 */
export function subscribeToProject(
  projectId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_info',
        filter: `id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to project files changes
 */
export function subscribeToProjectFiles(
  projectId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`project-files-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_files',
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): { icon: string; color: string } {
  const type = fileType.toLowerCase();

  if (['pdf'].includes(type)) {
    return { icon: 'picture_as_pdf', color: 'text-red-600' };
  }
  if (['doc', 'docx'].includes(type)) {
    return { icon: 'description', color: 'text-blue-600' };
  }
  if (['xls', 'xlsx'].includes(type)) {
    return { icon: 'table_chart', color: 'text-green-600' };
  }
  if (['ppt', 'pptx'].includes(type)) {
    return { icon: 'slideshow', color: 'text-orange-600' };
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
    return { icon: 'image', color: 'text-purple-600' };
  }
  if (['zip', 'rar', '7z'].includes(type)) {
    return { icon: 'folder_zip', color: 'text-yellow-600' };
  }

  return { icon: 'insert_drive_file', color: 'text-gray-600' };
}

/**
 * Get document type label from file type
 */
export function getDocumentType(fileType: string): string {
  const type = fileType.toLowerCase();

  if (['pdf'].includes(type)) return 'PDF Document';
  if (['doc', 'docx'].includes(type)) return 'Word Document';
  if (['xls', 'xlsx'].includes(type)) return 'Excel Spreadsheet';
  if (['ppt', 'pptx'].includes(type)) return 'PowerPoint Presentation';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return 'Image';
  if (['txt'].includes(type)) return 'Text File';
  if (['zip', 'rar', '7z'].includes(type)) return 'Archive';

  return `${type.toUpperCase()} File`;
}
