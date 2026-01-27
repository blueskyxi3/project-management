
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2936] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#15202b]/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const FundingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Request Additional Funding"
      footer={
        <>
          <p className="text-[10px] text-slate-500 max-w-[200px]">By submitting, you agree to the budget allocation terms.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200">Cancel</button>
            <button className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-600 shadow-md flex items-center gap-2">
              Submit Request <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Amount Requested</span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input type="number" placeholder="0.00" className="w-full h-14 pl-8 pr-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-base" />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Funding Category</span>
          <select className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
            <option>Select category</option>
            <option>Labor</option>
            <option>Equipment</option>
            <option>Software</option>
          </select>
        </label>
        <div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Urgency Level</span>
          <div className="flex gap-3">
            {['Low', 'Medium', 'High'].map(level => (
              <label key={level} className="flex-1 cursor-pointer">
                <input type="radio" name="urgency" className="peer hidden" defaultChecked={level === 'Medium'} />
                <div className="h-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:border-2 text-sm font-medium transition-all">
                  {level}
                </div>
              </label>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Reason for Request</span>
          <textarea className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg resize-none" placeholder="Provide detailed justification..."></textarea>
          <p className="text-[10px] text-right text-slate-400 mt-1">0 / 500 characters</p>
        </label>
      </div>
    </Modal>
  );
};

export const UploadDocumentsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Project Documents"
      subtitle="Add supporting documentation to your project application"
      footer={
        <>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight max-w-[200px]">
            By uploading files, you agree to the project data management policy.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-600 transition-all shadow-md">
              Confirm Upload
            </button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="doc-category">Document Category</label>
          <div className="relative">
            <select className="w-full appearance-none bg-slate-50 dark:bg-[#15202b] border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10" id="doc-category">
              <option selected>Project Application</option>
              <option>Progress Report</option>
              <option>Financial Statement</option>
              <option>Technical Specification</option>
              <option>Other Related Documents</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>

        <div className="relative group cursor-pointer shrink-0">
          <input className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" multiple type="file" />
          <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-[#15202b]/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-primary/50 transition-all duration-200 text-center">
            <div className="p-3 bg-white dark:bg-[#1e2936] rounded-full shadow-sm mb-3 group-hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
            </div>
            <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop files here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PDF, DOCX, JPG or PNG (MAX. 10MB per file)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Files in queue
            </h4>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">3 Files selected</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* File 1: Progress */}
            <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">picture_as_pdf</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Q3_Progress_Report.pdf</p>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">60%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                  <div className="bg-primary h-1 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {/* File 2: Ready */}
            <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">description</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Budget_Overview_2024.xlsx</p>
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span> Ready
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
            {/* File 3: Queued */}
            <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">image</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Site_Photo_001.jpg</p>
                  <span className="text-[10px] font-bold text-slate-400">Queued</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                  <div className="bg-slate-300 dark:bg-slate-600 h-1 rounded-full w-0"></div>
                </div>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
