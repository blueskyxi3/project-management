/**
 * Supabase Database Types
 * These types match the database schema defined in schema.sql
 */

// ============================================
// Profile Types
// ============================================
export type UserRole = 'Admin' | 'Manager' | 'Member';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
}

export interface ProfileUpdate {
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
}

// ============================================
// Project Info Types (Overview Tab)
// ============================================
export type ProjectStatus = 'In Progress' | 'Completed' | 'Upcoming' | 'Pending';

export interface ProjectInfo {
  id: string;
  project_no: string;
  project_title: string;
  project_summary: string;
  project_url: string | null;
  project_file: string | null;
  status: ProjectStatus;
  creator_id: string | null;
  files_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectInfoInsert {
  project_no: string;
  project_title: string;
  project_summary: string;
  project_url?: string;
  project_file?: string;
  status?: ProjectStatus;
  creator_id?: string;
}

export interface ProjectInfoUpdate {
  project_title?: string;
  project_summary?: string;
  project_url?: string;
  project_file?: string;
  status?: ProjectStatus;
}

// ============================================
// Project Direct Info Types (Strategy Tab)
// ============================================
export type StrategyFit = 'National Strategy' | 'Group Strategy' | 'Subsidiary Direction';
export type AIDirectionalSignal = 'CONTINUE' | 'NEED_MORE_INFO' | 'RISK_ALERT';

export interface ProjectDirectInfo {
  id: string;
  project_id: string;
  project_no: string;
  strategy_fit: StrategyFit;
  demand_urgency: string;
  bottleneck: string | null;
  product_and_edge: string;
  trl: string | null;
  resources: string | null;
  supporting_materials_present: string | null;
  information_completeness_note: string | null;
  ai_directional_signal: AIDirectionalSignal;
  created_at: string;
  updated_at: string;
}

export interface ProjectDirectInfoInsert {
  project_id: string;
  project_no: string;
  strategy_fit: StrategyFit;
  demand_urgency: string;
  bottleneck?: string;
  product_and_edge: string;
  trl?: string;
  resources?: string;
  supporting_materials_present?: string;
  information_completeness_note?: string;
  ai_directional_signal?: AIDirectionalSignal;
}

export interface ProjectDirectInfoUpdate {
  strategy_fit?: StrategyFit;
  demand_urgency?: string;
  bottleneck?: string;
  product_and_edge?: string;
  trl?: string;
  resources?: string;
  supporting_materials_present?: string;
  information_completeness_note?: string;
  ai_directional_signal?: AIDirectionalSignal;
}

// ============================================
// Project Files Types
// ============================================
export type DocumentCategory = 'Project Application' | 'Progress Report' | 'Financial Statement' | 'Technical Specification' | 'Other Related Documents';

export interface ProjectFile {
  id: string;
  project_no: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  document_category: DocumentCategory;
  uploaded_by: string | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFileInsert {
  project_no: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  document_category?: DocumentCategory;
  uploaded_by?: string;
  mime_type?: string;
}

// ============================================
// View Types
// ============================================

export interface ProjectWithCreator {
  id: string;
  project_no: string;
  project_title: string;
  project_summary: string;
  project_url: string | null;
  project_file: string | null;
  status: ProjectStatus;
  files_count: number;
  created_at: string;
  updated_at: string;
  creator_name: string | null;
  creator_email: string | null;
  creator_avatar: string | null;
}

export interface ProjectCompleteDetails {
  id: string;
  project_no: string;
  project_title: string;
  project_summary: string;
  project_url: string | null;
  project_file: string | null;
  status: ProjectStatus;
  creator_id: string | null;
  files_count: number;
  created_at: string;
  updated_at: string;
  // Direct info fields
  strategy_fit: StrategyFit | null;
  demand_urgency: string | null;
  bottleneck: string | null;
  product_and_edge: string | null;
  trl: string | null;
  resources: string | null;
  supporting_materials_present: string | null;
  information_completeness_note: string | null;
  ai_directional_signal: AIDirectionalSignal | null;
  creator_name: string | null;
}

// ============================================
// API Request/Response Types
// ============================================

// Create Project Request
export interface CreateProjectRequest {
  project_title: string;
  project_summary: string;
  project_url?: string;
  project_file?: string;
}

// Upload Files Request
export interface UploadFilesRequest {
  project_id: string;
  files: File[];
  document_category: DocumentCategory;
}

// Search Projects Request
export interface SearchProjectsRequest {
  project_no?: string;
  keyword?: string;
  status?: ProjectStatus;
  page?: number;
  per_page?: number;
}

// Update Project Overview Request
export interface UpdateProjectOverviewRequest {
  project_title: string;
  project_summary: string;
  project_url?: string;
}

// Update Project Strategy Request
export interface UpdateProjectStrategyRequest {
  strategy_fit: StrategyFit;
  demand_urgency: string;
  bottleneck?: string;
  product_and_edge: string;
  trl?: string;
  resources?: string;
  supporting_materials_present?: string;
  information_completeness_note?: string;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Signup Request
export interface SignupRequest {
  email: string;
  password: string;
  full_name?: string;
  avatar_url?: string;
}

// ============================================
// Combined Types for Frontend
// ============================================

export interface Project extends ProjectInfo {
  creator_name?: string;
  direct_info?: ProjectDirectInfo;
}

export interface ProjectFileDisplay extends ProjectFile {
  uploaded_by_name?: string;
}

// ============================================
// Storage Types
// ============================================
export interface StorageUploadResult {
  path: string;
  fullPath: string;
}

export interface StorageUploadOptions {
  cacheControl?: string;
  upsert?: boolean;
}
