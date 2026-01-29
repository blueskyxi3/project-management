
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { UploadDocumentsModal, DeleteConfirmModal } from '../components/Modals';
import { getProjects } from '../supabase/services/projectService';
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

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch projects from Supabase on component mount
  useEffect(() => {
    fetchProjects();

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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { projects: data, total: totalCount } = await getProjects();
      setProjects(mapToProject(data));
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch('http://192.168.206.103:5678/webhook/project-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectToDelete.id,
          projectNo: projectToDelete.projectNo,
        }),
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
        // Refresh the project list
        fetchProjects();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete project: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please check your network connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-5">
        <form className="flex flex-col lg:flex-row items-end gap-4" onSubmit={(e) => e.preventDefault()}>
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
              />
            </div>
          </div>
          <div className="w-full lg:w-auto flex items-center gap-3">
            <button className="bg-primary hover:bg-primary-dark text-white px-5 h-10 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">search</span> Query
            </button>
            <button className="bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark px-5 h-10 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset
            </button>
            <button 
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
            <select className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark rounded text-sm py-1">
              <option>10</option>
              <option>20</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="size-8 rounded text-sm font-medium bg-primary text-white">1</button>
            <button className="size-8 rounded text-sm font-medium">2</button>
            <button className="p-1 rounded"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      <UploadDocumentsModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} user={user} />

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
