
import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ProjectListView } from './views/ProjectListView';
import { ProjectEditView } from './views/ProjectEditView';
import { Layout } from './components/Layout';
import { supabase } from './supabase/client';
import type { Profile } from './supabase/types';

type AuthView = 'login' | 'register';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; avatar: string }>({
    name: 'Alex Morgan',
    role: 'Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0'
  });

  // Fetch user profile helper function
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setCurrentUser({
          name: profileData.full_name || userEmail || 'User',
          role: profileData.role || 'Member',
          avatar: profileData.avatar_url || ''
        });
      } else {
        setCurrentUser({
          name: userEmail || 'User',
          role: 'Member',
          avatar: ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setCurrentUser({
        name: userEmail || 'User',
        role: 'Member',
        avatar: ''
      });
    }
  };

  // Initialize auth and listen for changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check:', session);

      if (session?.user && mounted) {
        await fetchUserProfile(session.user.id, session.user.email || '');
        setIsAuthenticated(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session, 'Mounted:', mounted);

      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
        setIsAuthenticated(true);
        setAuthView('login');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, resetting state');
        setIsAuthenticated(false);
        setAuthView('login');
        setCurrentUser({
          name: 'Alex Morgan',
          role: 'Admin',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0'
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    console.log('handleLogin called');

    // Wait a moment for session to be established
    await new Promise(resolve => setTimeout(resolve, 100));

    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session after login:', session);

    if (session?.user) {
      await fetchUserProfile(session.user.id, session.user.email || '');
      setIsAuthenticated(true);
    } else {
      console.log('No session found after login');
    }
  };

  const handleRegister = (email: string) => {
    // After successful registration, show login view
    setAuthView('login');
  };

  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', error);

      // Reset auth state
      setIsAuthenticated(false);
      setAuthView('login');
      setCurrentUser({
        name: 'Alex Morgan',
        role: 'Admin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0'
      });
    } catch (err) {
      console.error('Logout error:', err);
      // Reset state anyway
      setIsAuthenticated(false);
      setAuthView('login');
      setCurrentUser({
        name: 'Alex Morgan',
        role: 'Admin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0'
      });
    }
  };

  console.log('App render - isAuthenticated:', isAuthenticated, 'authView:', authView, 'currentUser:', currentUser);

  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterView
          onRegister={handleRegister}
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginView
        onLogin={handleLogin}
        onShowRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <Layout
      user={currentUser}
      currentView={selectedProject ? 'edit' : 'projects'}
      onNavigateProjects={() => setSelectedProject(null)}
      onLogout={handleLogout}
    >
      {selectedProject ? (
        <ProjectEditView
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <ProjectListView onSelectProject={setSelectedProject} />
      )}
    </Layout>
  );
};

export default App;
