
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string; role: string; avatar: string };
  currentView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-display">
      <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="px-6 md:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">dataset</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">ProjectManager Pro</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className={`text-sm font-medium ${currentView === 'projects' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>Projects</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">Teams</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">Settings</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
              </div>
              <input 
                type="text" 
                placeholder="Search..."
                className="block w-full rounded-lg border-none bg-slate-100 dark:bg-slate-800 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-border-light dark:border-border-dark pl-4 ml-2">
              <button className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </button>
              <div 
                className="ml-2 size-8 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-slate-700 cursor-pointer"
                style={{ backgroundImage: `url(${user.avatar})` }}
              ></div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
        <div className="w-full max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
};
