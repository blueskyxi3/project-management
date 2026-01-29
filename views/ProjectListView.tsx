
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { UploadDocumentsModal, DeleteConfirmModal } from '../components/Modals';
import { getProjects, deleteProject } from '../supabase/services/projectService';
import { supabase } from '../supabase/client';

interface ProjectListViewProps {
  onSelectProject: (p: Project) => void;
  user?: { name: string; role: string; avatar: string ,id: string };
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ onSelectProject, user }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [projectNoQuery, setProjectNoQuery] = useState('');
  const [keywordQuery, setKeywordQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ projectNo: '', keyword: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteToast, setDeleteToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch projects from Supabase on component mount
  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_info',
        },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [page, perPage, appliedFilters]);

  useEffect(() => {
    if (!deleteToast) return;
    const timer = window.setTimeout(() => setDeleteToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [deleteToast]);

  const buildSearchParams = (override?: { projectNo?: string; keyword?: string }) => {
    const projectNo = (override?.projectNo ?? appliedFilters.projectNo).trim();
    const keyword = (override?.keyword ?? appliedFilters.keyword).trim();

    return {
      project_no: projectNo || undefined,
      keyword: keyword || undefined,
      page,
      per_page: perPage,
    };
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { projects: data, total: totalCount } = await getProjects(buildSearchParams());
      setProjects(mapToProject(data));
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setPage(1);
    setAppliedFilters({ projectNo: projectNoQuery, keyword: keywordQuery });
  };

  const handleReset = async () => {
    setProjectNoQuery('');
    setKeywordQuery('');
    setPage(1);
    setAppliedFilters({ projectNo: '', keyword: '' });
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Map Supabase ProjectWithCreator to UI Project type
  const mapToProject = (data: any[]): Project[] => {
    return data.map(item => ({
      id: item.id,
      projectNo: item.project_no,
      title: item.project_title,
      description: item.project_summary,
      creator: item.creator_name || 'Unknown',
      filesCount: item.files_count || 0,
      status: item.status as ProjectStatus,
      createdAt: formatDate(item.created_at),
    }));
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 格式化时间部分
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes}`;
  };

  // Handle delete project - open confirm modal
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete project - call n8n webhook
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id, projectToDelete.projectNo);

      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setProjects((prev) => prev.filter((project) => project.id !== projectToDelete.id));
      fetchProjects();
      setDeleteToast({ type: 'success', message: 'Project deleted successfully.' });

      fetch('http://192.168.206.103:5678/webhook/project-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectToDelete.id,
          projectNo: projectToDelete.projectNo,
        }),
      }).catch((error) => {
        console.warn('Webhook delete failed:', error);
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete project. Please try again.';
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setDeleteToast({ type: 'error', message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {deleteToast && (
        <div className="fixed left-1/2 top-12 z-50 -translate-x-1/2">
          <div
            className={`min-w-[280px] max-w-[360px] rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              deleteToast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                : 'bg-rose-50/90 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`material-symbols-outlined text-[22px] ${
                  deleteToast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {deleteToast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {deleteToast.type === 'success' ? 'Deleted' : 'Delete Failed'}
                </div>
                <div className="text-xs opacity-80 mt-0.5">{deleteToast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteToast(null)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Dismiss"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-5">
        <form className="flex flex-col lg:flex-row items-end gap-4" onSubmit={handleQuery}>
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project No</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[18px]">tag</span>
              </span>
              <input 
                className="pl-9 w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800 text-sm h-10" 
                placeholder="e.g. PJ-2023-001" 
                type="text" 
                value={projectNoQuery}
                onChange={(event) => setProjectNoQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="w-full lg:flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Content</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input 
                className="pl-9 w-full rounded-lg border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800 text-sm h-10" 
                placeholder="Search by title or summary..." 
                type="text" 
                value={keywordQuery}
                onChange={(event) => setKeywordQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="w-full lg:w-auto flex items-center gap-3">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-5 h-10 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span> Query
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark px-5 h-10 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset
            </button>
            <button 
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#10b981] hover:bg-[#059669] text-white px-6 h-10 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Create New Project
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-tight">Project Management List</h3>
          <span className="text-xs text-slate-500 font-medium">
            {loading ? 'Loading...' : `Showing ${projects.length} of ${total}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-5 py-4">Project No</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Creator</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">{project.projectNo}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{project.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{project.description}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{project.creator}</td>
                  <td className="px-5 py-4">
                    {project.status === ProjectStatus.COMPLETED ? (
                      <div className="flex items-center text-green-500">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </div>
                    ) : project.status === ProjectStatus.IN_PROGRESS ? (
                      <div className="flex items-center text-primary">
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                      </div>
                    ) : project.status === ProjectStatus.UPCOMING ? (
                      <div className="flex items-center text-blue-500">
                        <span className="material-symbols-outlined text-[20px]">event</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-500">
                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{project.createdAt}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border-light dark:border-border-dark px-5 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
              className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark rounded text-sm py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className={`p-1 rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={page === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`size-8 rounded text-sm font-medium ${
                  pageNumber === page ? 'bg-primary text-white' : ''
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className={`p-1 rounded ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={page === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <UploadDocumentsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={() => fetchProjects()}
        user={user}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        projectTitle={projectToDelete?.title || ''}
        projectNo={projectToDelete?.projectNo || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};
