
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
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; avatar: string; id: string }>({
    name: 'Alex Morgan',
    role: 'Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0',
    id: ''
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
          id: userId,
          name: profileData.full_name || userEmail || 'User',
          role: profileData.role || 'Member',
          avatar: profileData.avatar_url || ''
        });
      } else {
        setCurrentUser({
          id: userId,
          name: userEmail || 'User',
          role: 'Member',
          avatar: ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setCurrentUser({
        id: userId,
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
      console.log('[App] Initial session check:', session);

      if (session?.user && mounted) {
        console.log('[App] Found existing session, setting authenticated=true');
        setIsAuthenticated(true);
        fetchUserProfile(session.user.id, session.user.email || '').catch(err => {
          console.error('[App] Failed to fetch user profile:', err);
        });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state changed:', event, 'Session:', session, 'Mounted:', mounted);

      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[App] User signed in, setting authenticated=true');
        // Set authenticated immediately to ensure navigation happens
        setIsAuthenticated(true);
        // Fetch profile in background
        fetchUserProfile(session.user.id, session.user.email || '').catch(err => {
          console.error('[App] Failed to fetch user profile:', err);
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out, resetting state');
        setIsAuthenticated(false);
        setCurrentUser({
          id: '',
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
    console.log('[App] handleLogin called, getting current session...');

    // Wait a brief moment for session to be available
    await new Promise(resolve => setTimeout(resolve, 50));

    const { data: { session } } = await supabase.auth.getSession();
    console.log('[App] Session in handleLogin:', session);

    if (session?.user) {
      console.log('[App] User authenticated in handleLogin, setting authenticated=true');
      setIsAuthenticated(true);
      fetchUserProfile(session.user.id, session.user.email || '').catch(err => {
        console.error('[App] Failed to fetch user profile:', err);
      });
    } else {
      console.warn('[App] No session found in handleLogin, relying on onAuthStateChange');
    }
  };

  const handleRegister = (_email: string) => {
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
        id: '',
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
        id: '',
        name: 'Alex Morgan',
        role: 'Admin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0'
      });
    }
  };

  console.log('App render - isAuthenticated:', isAuthenticated, 'authView:', authView, 'currentUser:', currentUser);

  if (!isAuthenticated) {
    console.log('[App] Rendering auth view:', authView);
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

  console.log('[App] Rendering authenticated view (ProjectListView)');
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
          user={currentUser}
        />
      ) : (
        <ProjectListView onSelectProject={setSelectedProject} user={currentUser} />
      )}
    </Layout>
  );
};

export default App;
