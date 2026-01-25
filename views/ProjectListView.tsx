
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { PROJECTS } from '../constants';

interface ProjectListViewProps {
  onSelectProject: (p: Project) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ onSelectProject }) => {
  return (
    <div className="space-y-6">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-5">
        <form className="flex flex-col lg:flex-row items-end gap-4">
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
            <button className="bg-[#10b981] hover:bg-[#059669] text-white px-6 h-10 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Create New Project
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-tight">Project Management List</h3>
          <span className="text-xs text-slate-500 font-medium">Showing 1-{PROJECTS.length} of 48</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-5 py-4">Project No</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Creator</th>
                <th className="px-5 py-4">Files</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {PROJECTS.map((project) => (
                <tr 
                  key={project.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectProject(project)}
                >
                  <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">{project.projectNo}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{project.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{project.description}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{project.creator}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-[16px]">attach_file</span>
                      <span>{project.filesCount}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className={`flex items-center ${project.status === ProjectStatus.COMPLETED ? 'text-green-500' : 'text-primary'}`}>
                      <span className={`material-symbols-outlined text-[20px] ${project.status === ProjectStatus.IN_PROGRESS ? 'animate-spin-slow' : 'font-bold'}`}>
                        {project.status === ProjectStatus.COMPLETED ? 'check_circle' : 'sync'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{project.createdAt}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </div>
  );
};
