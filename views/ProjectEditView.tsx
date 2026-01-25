
import React, { useState } from 'react';
import { Project, ProjectFile, TabType, ProjectStatus } from '../types';
import { PROJECT_FILES, TRANSACTIONS, MILESTONES } from '../constants';
import { SpendingChart, AllocationPie } from '../components/Charts';
import { FundingModal } from '../components/Modals';

interface ProjectEditViewProps {
  project: Project;
  onBack: () => void;
}

export const ProjectEditView: React.FC<ProjectEditViewProps> = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);

  const tabs: TabType[] = ['Overview', 'Strategy', 'Technical', 'Timeline', 'Budget'];

  return (
    <div className="space-y-6 pb-12">
      <nav className="flex items-center text-sm font-medium text-slate-500">
        <button onClick={onBack} className="hover:text-primary transition-colors">Projects</button>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-900 dark:text-white font-semibold">{project.projectNo}</span>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-900 dark:text-white font-semibold">Edit</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{project.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage project details, schedule, and performance.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-5 h-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm">Cancel</button>
          <button className="px-5 h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-blue-600 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span> Save Changes
          </button>
        </div>
      </div>

      <div className="border-b border-border-light dark:border-border-dark overflow-x-auto">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 text-sm font-medium whitespace-nowrap px-1 transition-all ${
                activeTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

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
                <textarea className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 resize-none" rows={4} defaultValue={project.description}></textarea>
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
              <button className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors text-sm font-bold flex items-center gap-2">
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
                  {PROJECT_FILES.map(file => (
                    <tr key={file.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded bg-slate-100 flex items-center justify-center shrink-0 ${file.color}`}>
                            <span className="material-symbols-outlined text-[18px]">{file.icon}</span>
                          </div>
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">{file.type}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-600">{file.uploadedBy}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{file.modified}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">download</span></button>
                          <button className="text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'Strategy' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-[20px]">target</span>
                  <h3 className="text-[16px] font-bold">Strategic Objectives</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { title: 'Market Reach Expansion', current: 85, target: 100, color: 'bg-primary' },
                    { title: 'User Conversion Rate', current: 12.4, target: 15, color: 'bg-emerald-500' },
                    { title: 'Brand Sentiment Index', current: 4.2, target: 5.0, color: 'bg-amber-400' }
                  ].map((obj, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{obj.title}</span>
                        <span className="text-xs font-mono text-slate-500">{obj.current} / {obj.target}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${obj.color} rounded-full transition-all duration-1000`} 
                          style={{ width: `${(obj.current / obj.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                  <h3 className="text-[16px] font-bold">Stakeholder Analysis</h3>
                  <button className="text-xs font-bold text-primary hover:underline">View Full Map</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 border-b">
                        <th className="px-6 py-3">Group</th>
                        <th className="px-6 py-3">Impact</th>
                        <th className="px-6 py-3">Engagement</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {[
                        { group: 'Product Team', impact: 'High', engagement: 'Collaborative', status: 'Aligned' },
                        { group: 'Marketing Dept.', impact: 'Medium', engagement: 'Consultative', status: 'Pending Review' },
                        { group: 'IT Infrastructure', impact: 'High', engagement: 'Direct', status: 'Supportive' }
                      ].map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-medium">{item.group}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.impact === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{item.impact}</span></td>
                          <td className="px-6 py-4 text-slate-500">{item.engagement}</td>
                          <td className="px-6 py-4 text-right">
                             <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-700">
                               <div className={`size-1.5 rounded-full ${item.status === 'Aligned' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                               {item.status}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <h3 className="text-[16px] font-bold mb-6">SWOT Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Strengths', color: 'bg-emerald-50 text-emerald-700', icon: 'trending_up', items: ['Market Leader', 'Proprietary Tech'] },
                    { label: 'Weaknesses', color: 'bg-red-50 text-red-700', icon: 'trending_down', items: ['Limited Support', 'Legacy Code'] },
                    { label: 'Opportunities', color: 'bg-blue-50 text-blue-700', icon: 'lightbulb', items: ['Global Expansion', 'Mobile Integration'] },
                    { label: 'Threats', color: 'bg-amber-50 text-amber-700', icon: 'warning', items: ['New Competitors', 'Reg. Changes'] }
                  ].map((cell, i) => (
                    <div key={i} className={`p-3 rounded-lg border border-slate-100 dark:border-slate-800 ${cell.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[16px]">{cell.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{cell.label}</span>
                      </div>
                      <div className="space-y-1">
                        {cell.items.map((it, j) => <div key={j} className="text-[11px] font-medium leading-tight opacity-80">• {it}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bg-primary p-6 rounded-xl text-white shadow-lg overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 size-32 bg-white/10 rounded-full blur-2xl"></div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Strategic Alignment Score</h4>
                <div className="text-4xl font-extrabold mb-1">94.2%</div>
                <p className="text-[11px] opacity-90 leading-relaxed font-medium">This project is highly aligned with the corporate Q3-Q4 Digital Transformation Roadmap.</p>
              </section>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};
