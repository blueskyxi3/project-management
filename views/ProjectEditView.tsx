
import React, { useState, useEffect } from 'react';
import { Project, TabType, ProjectStatus } from '../types';
import { TRANSACTIONS, MILESTONES } from '../constants';
import { SpendingChart, AllocationPie } from '../components/Charts';
import { FundingModal, UploadDocumentsModal } from '../components/Modals';
import { supabase } from '../supabase/client';
import { getProjectFiles, formatFileSize, getFileIcon, getProjectDirectInfo, upsertProjectDirectInfo, updateProjectOverview } from '../supabase/services/projectService';
import type { ProjectDirectInfo, StrategyFit, AIDirectionalSignal } from '../supabase/types';

interface ProjectEditViewProps {
  project: Project;
  onBack: () => void;
  user?: { name: string; role: string; avatar: string,id: string };
}

export const ProjectEditView: React.FC<ProjectEditViewProps> = ({ project, onBack, user }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [devToastVisible, setDevToastVisible] = useState(false);

  // State for title modification
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [projectSummary, setProjectSummary] = useState(project.description);

  // State for project files from Supabase
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [uploaderNameById, setUploaderNameById] = useState<Record<string, string>>({});

  // State for strategy data from project_direct_info
  const [strategyData, setStrategyData] = useState<Partial<ProjectDirectInfo>>({});
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [isSavingStrategy, setIsSavingStrategy] = useState(false);
  const [isSavingOverview, setIsSavingOverview] = useState(false);
  const [saveToast, setSaveToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoadingFiles(true);
      try {
        // 使用项目ID获取文件
        const files = await getProjectFiles(project.id);
        setProjectFiles(files);
      } catch (error) {
        console.error('Failed to fetch project files:', error);
        setProjectFiles([]);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [project.id]);

  useEffect(() => {
    const fetchUploaderNames = async () => {
      const idsToFetch = Array.from(
        new Set(
          projectFiles
            .filter((file) => file.uploaded_by && !file.uploaded_by_name)
            .map((file) => file.uploaded_by as string)
        )
      ).filter((id) => !uploaderNameById[id]);

      if (idsToFetch.length === 0) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', idsToFetch);

      if (error) {
        console.warn('Failed to fetch uploader profiles:', error.message);
        return;
      }

      const nextMap: Record<string, string> = {};
      (data || []).forEach((profile) => {
        nextMap[profile.id] = profile.full_name || profile.email;
      });

      if (Object.keys(nextMap).length > 0) {
        setUploaderNameById((prev) => ({ ...prev, ...nextMap }));
      }
    };

    fetchUploaderNames();
  }, [projectFiles, uploaderNameById]);

  useEffect(() => {
    if (!saveToast) return;
    const timer = window.setTimeout(() => setSaveToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [saveToast]);

  useEffect(() => {
    if (!devToastVisible) return;
    const timer = window.setTimeout(() => setDevToastVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, [devToastVisible]);

  const showUnderDeveloping = () => {
    setDevToastVisible(true);
  };

  // Fetch strategy data from project_direct_info
  useEffect(() => {
    const fetchStrategyData = async () => {
      setIsLoadingStrategy(true);
      try {
        const data = await getProjectDirectInfo(project.id, project.projectNo);
        if (data) {
          setStrategyData(data);
        }
      } catch (error) {
        console.error('Failed to fetch strategy data:', error);
      } finally {
        setIsLoadingStrategy(false);
      }
    };

    if (activeTab === 'Strategy') {
      fetchStrategyData();
    }
  }, [project.id, activeTab]);

  const tabs: TabType[] = ['Overview', 'Strategy', 'Technical', 'Timeline', 'Budget'];

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    // In a real app, this would trigger an API update
  };

  // Handle strategy field changes
  const handleStrategyChange = (field: keyof ProjectDirectInfo, value: string) => {
    setStrategyData(prev => ({ ...prev, [field]: value }));
  };

  // Save strategy data
  const handleSaveStrategy = async () => {
    setIsSavingStrategy(true);
    try {
      await upsertProjectDirectInfo(project.id, project.projectNo, {
        strategy_fit: (strategyData.strategy_fit || 'Group Strategy') as StrategyFit,
        demand_urgency: strategyData.demand_urgency || '',
        bottleneck: strategyData.bottleneck || '',
        product_and_edge: strategyData.product_and_edge || '',
        trl: strategyData.trl || '',
        resources: strategyData.resources || '',
        supporting_materials_present: strategyData.supporting_materials_present || '',
        information_completeness_note: strategyData.information_completeness_note || '',
      });
      setSaveToast({ type: 'success', message: 'Strategy changes saved successfully.' });
    } catch (error) {
      console.error('Failed to save strategy data:', error);
      const message = error instanceof Error ? error.message : 'Failed to save strategy. Please try again.';
      setSaveToast({ type: 'error', message });
    } finally {
      setIsSavingStrategy(false);
    }
  };

  const handleSaveOverview = async () => {
    setIsSavingOverview(true);
    try {
      await updateProjectOverview(project.id, {
        project_title: projectTitle,
        project_summary: projectSummary,
      });
      setSaveToast({ type: 'success', message: 'Overview changes saved successfully.' });
    } catch (error) {
      console.error('Failed to save overview data:', error);
      const message = error instanceof Error ? error.message : 'Failed to save overview. Please try again.';
      setSaveToast({ type: 'error', message });
    } finally {
      setIsSavingOverview(false);
    }
  };

  const handleSaveChanges = async () => {
    if (activeTab === 'Strategy') {
      await handleSaveStrategy();
      return;
    }
    if (activeTab === 'Overview') {
      await handleSaveOverview();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {saveToast && (
        <div className="fixed left-1/2 top-12 z-50 -translate-x-1/2">
          <div
            className={`min-w-[280px] max-w-[360px] rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              saveToast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                : 'bg-rose-50/90 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`material-symbols-outlined text-[22px] ${
                  saveToast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {saveToast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {saveToast.type === 'success' ? 'Saved' : 'Save Failed'}
                </div>
                <div className="text-xs opacity-80 mt-0.5">{saveToast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => setSaveToast(null)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Dismiss"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {devToastVisible && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-2 shadow-lg">
            <span className="material-symbols-outlined text-[18px] text-blue-400">construction</span>
            <span className="text-sm font-semibold">Under developing</span>
          </div>
        </div>
      )}
      {/* Consistent Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <button onClick={onBack} className="hover:text-primary transition-colors">Projects</button>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-500 dark:text-slate-400">{project.projectNo}</span>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white font-semibold">Edit</span>
      </nav>

      {/* Consistent Header with Editable Title */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 group">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full max-w-xl">
                <input 
                  type="text" 
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight bg-white dark:bg-slate-800 border-2 border-primary rounded-lg px-2 py-1 w-full focus:ring-0 focus:outline-none"
                  autoFocus
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {projectTitle}
                </h1>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage project details, schedule, and performance.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onBack} 
            className="px-5 h-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={(activeTab === 'Strategy' && isSavingStrategy) || (activeTab === 'Overview' && isSavingOverview)}
            className="px-5 h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeTab === 'Strategy' && isSavingStrategy ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                Saving...
              </>
            ) : activeTab === 'Overview' && isSavingOverview ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Consistent Tab Navigation */}
      <div className="border-b border-border-light dark:border-border-dark">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 text-sm font-medium whitespace-nowrap px-1 transition-colors ${
                activeTab === tab 
                  ? 'border-primary text-primary font-semibold' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <h3 className="text-[16px] font-bold">General Details</h3>
              </div>
              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-200">Active</span>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2 block">Project Number</span>
                  <div className="relative">
                    <input className="w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed text-sm h-10 px-3" readOnly value={project.projectNo} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                    </span>
                  </div>
                </label>
              </div>
              <label className="block">
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2 block">Summary</span>
                <textarea
                  className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 resize-none"
                  rows={4}
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-1.5"><span className="text-[11px] text-slate-400 font-medium">184/500 characters</span></div>
              </label>
            </div>
          </section>

          <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">attach_file</span>
                <h3 className="text-[16px] font-bold">Project Files</h3>
              </div>
              <button 
                onClick={showUnderDeveloping}
                className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors text-sm font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span> Upload New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-border-light dark:border-border-dark">
                    <th className="px-6 py-3">File Name</th>
                    <th className="px-6 py-3">Document Type</th>
                    <th className="px-6 py-3">Uploaded By</th>
                    <th className="px-6 py-3">Modified</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {isLoadingFiles ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Loading files...
                      </td>
                    </tr>
                  ) : projectFiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No files uploaded yet
                      </td>
                    </tr>
                  ) : (
                    projectFiles.map(file => {
                      const { icon, color } = getFileIcon(file.file_type);
                      const uploadedByLabel =
                        file.uploaded_by_name ||
                        (file.uploaded_by ? uploaderNameById[file.uploaded_by] : undefined) ||
                        (user?.id && file.uploaded_by === user.id ? user.name : undefined) ||
                        project.creator ||
                        'Unknown';
                      const rawFileSize = file.file_size;
                      let sizeLabel = '-';
                      if (rawFileSize !== null && rawFileSize !== undefined && rawFileSize !== '') {
                        if (typeof rawFileSize === 'number') {
                          sizeLabel = formatFileSize(rawFileSize);
                        } else if (typeof rawFileSize === 'bigint') {
                          sizeLabel = formatFileSize(Number(rawFileSize));
                        } else if (typeof rawFileSize === 'string') {
                          const normalized = rawFileSize.replace(/,/g, '').trim();
                          const asNumber = Number(normalized);
                          sizeLabel = Number.isFinite(asNumber) ? formatFileSize(asNumber) : rawFileSize;
                        }
                      }
                      return (
                        <tr key={file.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`size-8 rounded bg-slate-100 flex items-center justify-center shrink-0 ${color}`}>
                                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                              </div>
                              <span className="text-sm font-medium">{file.file_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">{file.document_category}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{uploadedByLabel}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(file.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{sizeLabel}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={showUnderDeveloping}
                                className="text-slate-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">download</span>
                              </button>
                              <button
                                onClick={showUnderDeveloping}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'Strategy' && (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {isLoadingStrategy ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-2xl">refresh</span>
              <span className="ml-2 text-slate-500">Loading strategy data...</span>
            </div>
          ) : (
            <>
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Strategic Alignment</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${
                    strategyData.ai_directional_signal === 'CONTINUE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : strategyData.ai_directional_signal === 'RISK_ALERT'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    {strategyData.ai_directional_signal || 'CONTINUE'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2 block">Strategy Fit</label>
                      <select
                        value={strategyData.strategy_fit || 'Group Strategy'}
                        onChange={(e) => handleStrategyChange('strategy_fit', e.target.value)}
                        className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="National Strategy">National Strategy</option>
                        <option value="Group Strategy">Group Strategy</option>
                        <option value="Subsidiary Direction">Subsidiary Direction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Demand Urgency Analysis</span>
                          <span className="text-[11px] text-slate-400 uppercase font-semibold">Max 300 words</span>
                        </div>
                        <textarea
                          value={strategyData.demand_urgency || ''}
                          onChange={(e) => handleStrategyChange('demand_urgency', e.target.value)}
                          className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                          placeholder="Analysis of demand reality, urgency, customer type, and pain points..."
                          rows={4}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-border-light dark:border-border-dark">
                    <h4 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">AI Directional Signal</h4>
                    <div className="flex flex-col gap-4">
                      <label className="block">
                        <select
                          value={strategyData.ai_directional_signal || 'CONTINUE'}
                          onChange={(e) => handleStrategyChange('ai_directional_signal', e.target.value)}
                          className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:border-primary focus:ring-primary"
                        >
                          <option value="CONTINUE">CONTINUE</option>
                          <option value="NEED_MORE_INFO">NEED_MORE_INFO</option>
                          <option value="RISK_ALERT">RISK_ALERT</option>
                        </select>
                      </label>
                      <div className={`p-3 rounded-lg border ${
                        strategyData.ai_directional_signal === 'CONTINUE'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'
                          : strategyData.ai_directional_signal === 'RISK_ALERT'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50'
                          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center ${
                            strategyData.ai_directional_signal === 'CONTINUE'
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                              : strategyData.ai_directional_signal === 'RISK_ALERT'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">
                              {strategyData.ai_directional_signal === 'CONTINUE' ? 'check_circle' :
                               strategyData.ai_directional_signal === 'RISK_ALERT' ? 'warning' : 'help'}
                            </span>
                          </div>
                          <div>
                            <div className={`text-[13px] font-bold ${
                              strategyData.ai_directional_signal === 'CONTINUE'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : strategyData.ai_directional_signal === 'RISK_ALERT'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}>
                              {strategyData.ai_directional_signal === 'CONTINUE' ? 'Proceed Confidently' :
                               strategyData.ai_directional_signal === 'RISK_ALERT' ? 'Risk Alert' : 'Need More Info'}
                            </div>
                            <div className={`text-[11px] ${
                              strategyData.ai_directional_signal === 'CONTINUE'
                                ? 'text-emerald-600/70 dark:text-emerald-400/60'
                                : strategyData.ai_directional_signal === 'RISK_ALERT'
                                ? 'text-red-600/70 dark:text-red-400/60'
                                : 'text-amber-600/70 dark:text-amber-400/60'
                            }`}>
                              {strategyData.ai_directional_signal === 'CONTINUE' ? 'Strategy alignment is above 90%' :
                               strategyData.ai_directional_signal === 'RISK_ALERT' ? 'Potential risks detected' : 'Additional information required'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        The AI analysis suggests {strategyData.ai_directional_signal === 'CONTINUE' ? 'high alignment with current priorities' :
                          strategyData.ai_directional_signal === 'RISK_ALERT' ? 'potential risks that need attention' : 'more information is needed for proper evaluation'}.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-[20px]">architecture</span>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Project Definition</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Bottleneck Identification</span>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Max 300 words</span>
                      </div>
                      <textarea
                        value={strategyData.bottleneck || ''}
                        onChange={(e) => handleStrategyChange('bottleneck', e.target.value)}
                        className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                        placeholder="Analysis of technical, industry, or value chain bottlenecks with evidence..."
                        rows={5}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Product & Edge</span>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Max 500 words</span>
                      </div>
                      <textarea
                        value={strategyData.product_and_edge || ''}
                        onChange={(e) => handleStrategyChange('product_and_edge', e.target.value)}
                        className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                        placeholder="Product solution, competitive advantage, and 1-2 year forecast..."
                        rows={5}
                      />
                    </label>
                  </div>
                </div>
                <div className="border-t border-border-light dark:border-border-dark pt-6">
                  <label className="block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">TRL Evidence</span>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Max 200 words</span>
                    </div>
                    <textarea
                      value={strategyData.trl || ''}
                      onChange={(e) => handleStrategyChange('trl', e.target.value)}
                      className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                      placeholder="Supporting evidence for TRL levels..."
                      rows={3}
                    />
                  </label>
                </div>
              </section>

              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Execution & Readiness</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Capabilities & Resources</span>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Max 200 words</span>
                      </div>
                      <textarea
                        value={strategyData.resources || ''}
                        onChange={(e) => handleStrategyChange('resources', e.target.value)}
                        className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                        placeholder="Team capabilities, platform resources, industry partners..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Supporting Materials</span>
                      </div>
                      <textarea
                        value={strategyData.supporting_materials_present || ''}
                        onChange={(e) => handleStrategyChange('supporting_materials_present', e.target.value)}
                        className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                        placeholder="Detailed supporting information..."
                        rows={9}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="block flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Info Completeness Note</span>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Max 200 words</span>
                      </div>
                      <textarea
                        value={strategyData.information_completeness_note || ''}
                        onChange={(e) => handleStrategyChange('information_completeness_note', e.target.value)}
                        className="w-full flex-1 rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                        placeholder="Describe info coverage (Conceptual/Preliminary/Complete) and missing parts..."
                        rows={8}
                      />
                    </label>
                  </div>
                </div>
              </section>

              <div className="flex justify-between items-center">
                <div className="flex gap-6 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Created: {strategyData.created_at ? new Date(strategyData.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    Updated: {strategyData.updated_at ? new Date(strategyData.updated_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Technical Tab Content */}
      {activeTab === 'Technical' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             <div className="lg:col-span-3 space-y-6">
               <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
                     <h3 className="text-[16px] font-bold">Infrastructure Stack</h3>
                   </div>
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                     <span className="material-symbols-outlined text-[14px]">bolt</span> HIGH PERFORMANCE
                   </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { name: 'Frontend', tech: 'React 19', status: 'Healthy', icon: 'view_quilt' },
                     { name: 'Backend', tech: 'Go Micro', status: 'Healthy', icon: 'settings_input_component' },
                     { name: 'Database', tech: 'PostgreSQL', status: 'Active', icon: 'database' },
                     { name: 'Cloud', tech: 'AWS Cluster', status: 'Healthy', icon: 'cloud' }
                   ].map((item, i) => (
                     <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center text-center">
                        <span className="material-symbols-outlined text-primary text-[28px] mb-3">{item.icon}</span>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.name}</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white mb-2">{item.tech}</div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">{item.status}</span>
                     </div>
                   ))}
                 </div>
               </section>

               <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                 <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <h3 className="text-[16px] font-bold">API Endpoint Monitor</h3>
                    <div className="flex gap-2">
                       <button className="p-1.5 hover:bg-slate-100 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">refresh</span></button>
                    </div>
                 </div>
                 <div className="divide-y divide-border-light dark:divide-border-dark">
                    {[
                      { path: '/api/v1/auth/session', method: 'GET', latency: '42ms', uptime: '99.9%' },
                      { path: '/api/v1/projects/PJ-1023', method: 'PATCH', latency: '128ms', uptime: '98.5%' },
                      { path: '/api/v1/analytics/realtime', method: 'WS', latency: '12ms', uptime: '100.0%' }
                    ].map((api, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className={`w-12 text-[10px] font-bold px-1.5 py-0.5 rounded text-center ${api.method === 'GET' ? 'bg-blue-100 text-blue-700' : api.method === 'PATCH' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                            {api.method}
                          </span>
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{api.path}</span>
                        </div>
                        <div className="flex items-center gap-8 text-xs font-medium">
                           <div className="flex flex-col items-end">
                             <span className="text-slate-400 text-[10px] uppercase font-bold">Latency</span>
                             <span className="text-slate-800 dark:text-white">{api.latency}</span>
                           </div>
                           <div className="flex flex-col items-end">
                             <span className="text-slate-400 text-[10px] uppercase font-bold">Uptime</span>
                             <span className="text-emerald-500 font-bold">{api.uptime}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </section>
             </div>

             <div className="space-y-6">
               <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                  <h3 className="text-[16px] font-bold mb-6">Security Compliance</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'SOC2 Type II', status: true },
                      { label: 'AES-256 Encryption', status: true },
                      { label: '2FA Auth Nodes', status: true },
                      { label: 'Penetration Testing', status: false }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className={`material-symbols-outlined text-[20px] ${item.status ? 'text-emerald-500' : 'text-slate-200'}`}>
                          {item.status ? 'check_circle' : 'pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    Download Audit PDF
                  </button>
               </section>

               <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <span className="material-symbols-outlined text-slate-400 mb-2">construction</span>
                  <div className="text-xs font-bold text-slate-500 uppercase">Tech Debt Level</div>
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-300">Low (8%)</div>
               </section>
             </div>
           </div>
        </div>
      )}

      {/* Budget Tab Content */}
      {activeTab === 'Budget' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white text-sm font-semibold flex items-center gap-2 text-slate-700"><span className="material-symbols-outlined text-[18px]">tune</span> Adjust Budget</button>
            <button onClick={() => setIsFundingModalOpen(true)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Request Funding</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Budget', val: '$124,500', sub: 'USD' },
              { label: 'Total Spent', val: '$82,410', sub: '66.2%' },
              { label: 'Remaining Balance', val: '$42,090', icon: 'trending_up' },
              { label: 'Burn Rate', val: '74.5%', badge: 'On Track' },
            ].map((card, i) => (
              <div key={i} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{card.label}</p>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-2xl font-bold">{card.val}</h4>
                  {card.sub && <span className="text-[11px] text-slate-400 font-medium">{card.sub}</span>}
                  {card.icon && <span className="text-green-500 material-symbols-outlined text-[16px]">{card.icon}</span>}
                  {card.badge && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">{card.badge}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-base font-bold">Planned vs. Actual Spending</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-slate-200"></div><span className="text-[11px] text-slate-500 font-medium uppercase">Planned</span></div>
                  <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-primary"></div><span className="text-[11px] text-slate-500 font-medium uppercase">Actual</span></div>
                </div>
              </div>
              <SpendingChart />
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
              <h3 className="text-base font-bold mb-8">Budget Allocation</h3>
              <AllocationPie />
              <div className="w-full grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-primary"></div><span className="text-[11px] font-medium text-slate-600">Labor (45%)</span></div>
                <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-500"></div><span className="text-[11px] font-medium text-slate-600">Software (25%)</span></div>
                <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-amber-400"></div><span className="text-[11px] font-medium text-slate-600">Hardware (20%)</span></div>
                <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-purple-500"></div><span className="text-[11px] font-medium text-slate-600">Marketing (10%)</span></div>
              </div>
            </div>
          </div>

          <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                <h3 className="text-[16px] font-bold">Detailed Transactions</h3>
              </div>
              <button className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Expense
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b">
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Description</th>
                    <th className="px-6 py-3 font-semibold">Category</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {TRANSACTIONS.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                      <td className="px-6 py-4 font-medium">{tx.description}</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[11px] font-semibold">{tx.category}</span></td>
                      <td className="px-6 py-4 font-bold">${tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Timeline Tab Content */}
      {activeTab === 'Timeline' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider">Current Phase: Implementation</h3>
              <span className="text-sm font-medium text-primary">65% Complete</span>
            </div>
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-0 w-[65%] h-1 bg-primary -translate-y-1/2"></div>
              <div className="relative flex justify-between items-center">
                {['Initiation', 'Planning', 'Implementation', 'Testing', 'Closure'].map((phase, i) => (
                  <div key={phase} className="flex flex-col items-center">
                    <div className={`size-6 rounded-full flex items-center justify-center z-10 transition-all ${
                      i < 2 ? 'bg-primary text-white' : i === 2 ? 'bg-primary ring-4 ring-primary/20' : 'bg-white border-2'
                    }`}>
                      {i < 2 ? <span className="material-symbols-outlined text-[14px]">check</span> : i === 2 ? <div className="size-2 rounded-full bg-white"></div> : null}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 ${i <= 2 ? 'text-primary' : 'text-slate-400'}`}>{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                    <h3 className="text-[16px] font-bold">Timeline Visualization</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Q3 2023</span>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                  </div>
                </div>
                <div className="p-6">
                   <div className="space-y-4 gantt-grid p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-1/3 text-sm font-semibold">System Analysis</div>
                        <div className="w-2/3 h-4 bg-primary/20 rounded-full relative"><div className="absolute left-0 w-[50%] h-full bg-primary rounded-full"></div></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-1/3 text-sm font-semibold">Database Migration</div>
                        <div className="w-2/3 h-4 bg-primary/20 rounded-full relative"><div className="absolute left-[20%] w-[60%] h-full bg-primary rounded-full"></div></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-1/3 text-sm font-semibold">Server Provisioning</div>
                        <div className="w-2/3 h-4 bg-primary/20 rounded-full relative"><div className="absolute left-[50%] w-[40%] h-full bg-primary rounded-full"></div></div>
                      </div>
                   </div>
                </div>
              </section>
            </div>
            <div className="lg:col-span-1">
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-[20px]">flag</span>
                  <h3 className="text-[16px] font-bold">Milestones</h3>
                </div>
                <div className="space-y-6">
                  {MILESTONES.map((m, i) => (
                    <div key={m.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          m.status === ProjectStatus.COMPLETED ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">diamond</span>
                        </div>
                        {i < MILESTONES.length - 1 && <div className="w-px h-full bg-border-light dark:bg-border-dark mt-2"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm">{m.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.status === ProjectStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{m.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{m.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{m.date}</div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full h-11 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-primary hover:border-primary transition-all font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">add_circle</span> Add Milestone
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <FundingModal isOpen={isFundingModalOpen} onClose={() => setIsFundingModalOpen(false)} />
      <UploadDocumentsModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} user={user} />
    </div>
  );
};
