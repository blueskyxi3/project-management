
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

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
  projectNo: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectTitle,
  projectNo,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2936] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">warning</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Project?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            You are about to delete the following project. This action cannot be undone.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-left mb-4">
            <div className="mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Project Title</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{projectTitle}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Project No</span>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">{projectNo}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg py-2 px-3">
            <span className="material-symbols-outlined text-[16px]">error_outline</span>
            <span>This action is permanent and cannot be recovered</span>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const UploadDocumentsModal: React.FC<{ isOpen: boolean; onClose: () => void; user?: { name: string; role: string; avatar: string,id: string; } }> = ({ isOpen, onClose, user }) => {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('sheet') || type.includes('excel')) return 'table_view';
    if (type.includes('word') || type.includes('document')) return 'description';
    return 'insert_drive_file';
  };

  const getFileColor = (type: string): string => {
    if (type.includes('pdf')) return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    if (type.includes('image')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    if (type.includes('sheet') || type.includes('excel')) return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    if (type.includes('word') || type.includes('document')) return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
    return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConfirmUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('data', file.file);
      });

      // 添加用户信息
      if (user) {
        formData.append('userId', user.id);
        formData.append('userName', user.name);
        formData.append('userRole', user.role);
        formData.append('userAvatar', user.avatar);
      }

      const response = await fetch('http://192.168.206.103:5678/webhook/project-upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Files uploaded successfully');
        setUploadedFiles([]);
        onClose();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

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
            <button
              onClick={handleConfirmUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
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
          <input
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            multiple
            type="file"
            onChange={handleFileSelect}
          />
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

        {uploadedFiles.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Files in queue
              </h4>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {uploadedFiles.length} File{uploadedFiles.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getFileColor(file.type)}`}>
                    <span className="material-symbols-outlined text-xl">{getFileIcon(file.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
