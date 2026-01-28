
import React, { useState, useEffect, useRef } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string; role: string; avatar: string };
  currentView: string;
  onNavigateProjects?: () => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigateProjects, onLogout }) => {
  const [showToast, setShowToast] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isProjectsActive = currentView === 'projects' || currentView === 'edit';

  const handleUnderDevelopment = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  console.log('Layout render - user:', user, 'onLogout exists:', !!onLogout);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-display">
      <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="px-6 md:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateProjects?.()}>
              <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">dataset</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">ProjectManager</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={handleUnderDevelopment}
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateProjects?.();
                }}
                className={`text-sm font-medium transition-colors ${isProjectsActive ? 'text-primary font-bold underline underline-offset-8 decoration-2' : 'text-slate-600 hover:text-primary'}`}
              >
                Projects
              </button>
              <button
                onClick={handleUnderDevelopment}
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
              >
                Teams
              </button>
              <button
                onClick={handleUnderDevelopment}
                className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
              >
                Settings
              </button>
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

            {/* Notification and Chat buttons */}
            <button className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </button>

            {/* User Dropdown Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                    {user.role}
                  </div>
                </div>
                <div
                  className="size-8 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-slate-700 bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden"
                  style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}
                >
                  {!user.avatar && (
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">person</span>
                  )}
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">
                  {showUserMenu ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-[100]">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user.role}
                    </div>
                  </div>
                  {onLogout && (
                    <div className="border-t border-slate-100 dark:border-slate-700 mt-1">
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-[18px] text-red-500">logout</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
        <div className="w-full max-w-[1200px]">
          {children}
        </div>
      </main>

      {/* Toast */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">construction</span>
          Under developing
        </div>
      </div>
    </div>
  );
};
