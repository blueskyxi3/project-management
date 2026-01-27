
import React from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="flex h-screen w-full bg-dark-base text-slate-300 font-display">
      <div className="hidden lg:flex relative w-3/5 h-full overflow-hidden bg-slate-900 border-r border-slate-800/50">
        <div 
          className="absolute inset-0 z-0 opacity-60" 
          style={{ 
            backgroundImage: "url('https://picsum.photos/1200/800?grayscale')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
        <div className="absolute inset-0 z-10 workflow-mesh"></div>
        <div className="absolute inset-0 z-20 bg-gradient-to-tr from-dark-base via-dark-base/40 to-transparent"></div>
        <div className="relative z-30 flex flex-col justify-center px-16 w-full">
          <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-bright text-xs font-mono uppercase tracking-widest">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            System Operational
          </div>
          <h1 className="text-6xl font-extrabold text-white leading-tight mb-6 max-w-xl">
            Streamline your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Milestones.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md font-light leading-relaxed">
            Connect your team, sync your workflows, and track every phase in one unified, high-performance environment.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-primary text-sm font-bold mb-1">Active Sprints</div>
              <div className="text-2xl font-mono text-white">24</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-cyan-400 text-sm font-bold mb-1">Efficiency</div>
              <div className="text-2xl font-mono text-white">98.2%</div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-2/5 h-full bg-dark-base flex flex-col justify-center px-8 sm:px-12 md:px-16 xl:px-24">
        <div className="mb-12">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white mb-8">
            <span className="material-symbols-outlined !text-3xl">token</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Node</h2>
          <p className="text-slate-500 font-light">Identify yourself to proceed.</p>
        </div>
        <div className="space-y-8">
          <button 
            onClick={onLogin}
            className="w-full group relative flex justify-center items-center gap-3 rounded-lg bg-primary py-4 px-6 text-sm font-bold text-white transition-all hover:bg-primary-bright glow-primary active:scale-[0.98]"
          >
            <span className="material-symbols-outlined !text-xl">shield_person</span>
            LOGIN WITH AUTHELIA (SSO)
          </button>
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Manual Override</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="group">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-primary" htmlFor="email">User Identifier</label>
              <div className="relative">
                <input className="w-full h-11 bg-dark-surface border-slate-800 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-700" id="email" placeholder="admin@workflow.os" type="email" />
                <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-700 text-lg">alternate_email</span>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase ml-1 transition-colors group-focus-within:text-primary" htmlFor="password">Security Key</label>
                <a className="text-[10px] font-mono text-slate-600 hover:text-primary transition-colors" href="#">Lost Key?</a>
              </div>
              <div className="relative">
                <input className="w-full h-11 bg-dark-surface border-slate-800 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-700" id="password" placeholder="••••••••" type="password" />
                <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-700 text-lg">lock</span>
              </div>
            </div>
            <button className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-md transition-all uppercase tracking-widest shadow-lg shadow-primary/20" type="submit">
              LOGIN
            </button>
          </form>
        </div>
        <div className="mt-24 pt-8 border-t border-slate-900 flex justify-between items-center">
          <p className="text-[10px] font-mono text-slate-600">© 2024 CORE SYSTEM</p>
          <a className="text-[10px] font-mono text-slate-500 hover:text-primary-bright uppercase tracking-widest flex items-center gap-2" href="#">
            Request Access <span className="material-symbols-outlined !text-sm">north_east</span>
          </a>
        </div>
      </div>
    </div>
  );
};
