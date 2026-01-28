import React, { useState } from 'react';
import { supabase } from '../supabase/client';

interface RegisterViewProps {
  onRegister: (email: string) => void;
  onBackToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailConfirm: true,
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        onRegister(formData.email);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

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
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Platform.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md font-light leading-relaxed">
            Create an account to manage projects, track milestones, and collaborate with your team.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-sm">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-primary text-sm font-bold mb-1">Free to Start</div>
              <div className="text-2xl font-mono text-white">0 Setup</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-cyan-400 text-sm font-bold mb-1">Security</div>
              <div className="text-2xl font-mono text-white">256-bit</div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-2/5 h-full bg-dark-base flex flex-col justify-center px-8 sm:px-12 md:px-16 xl:px-24">
        <div className="mb-8">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white mb-8">
            <span className="material-symbols-outlined !text-3xl">token</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-light">Join to start managing your projects.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="group">
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-primary" htmlFor="fullName">Full Name</label>
            <div className="relative">
              <input
                className="w-full h-11 bg-dark-surface border-slate-800 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-700"
                id="fullName"
                placeholder="John Doe"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-700 text-lg">person</span>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-primary" htmlFor="email">Email Address</label>
            <div className="relative">
              <input
                className="w-full h-11 bg-dark-surface border-slate-800 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-700"
                id="email"
                placeholder="john@example.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-700 text-lg">alternate_email</span>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
            <div className="relative">
              <input
                className="w-full h-11 bg-dark-surface border-slate-800 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-700"
                id="password"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-700 text-lg">lock</span>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-primary" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                className="w-full h-11 bg-dark-surface border-slate-800 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-700"
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-2.5 material-symbols-outlined text-slate-700 text-lg">lock</span>
            </div>
          </div>

          <button
            className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-md transition-all uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Creating Account...
              </span>
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500">
            Already have an account?{' '}
            <button
              onClick={onBackToLogin}
              className="text-primary hover:text-primary-bright font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-900 flex justify-between items-center">
          <p className="text-[10px] font-mono text-slate-600">© 2024 CORE SYSTEM</p>
          <a className="text-[10px] font-mono text-slate-500 hover:text-primary-bright uppercase tracking-widest flex items-center gap-2" href="#">
            Terms <span className="material-symbols-outlined !text-sm">north_east</span>
          </a>
        </div>
      </div>
    </div>
  );
};
