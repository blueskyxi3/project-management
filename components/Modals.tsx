
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
        <div className="p-6 overflow-y-auto overflow-x-hidden flex flex-col gap-6">
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
