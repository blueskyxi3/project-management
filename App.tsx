
import React, { useState } from 'react';
import { Project } from './types';
import { LoginView } from './views/LoginView';
import { ProjectListView } from './views/ProjectListView';
import { ProjectEditView } from './views/ProjectEditView';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const user = {
    name: 'Alex Morgan',
    role: 'Admin',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7F7cLmuYpkyfGz36f535ttn6qzPq9KFAsQWUYTtLMpfjuPgHWWXkT3kPqwFBydF5MdD5N8myCmCd5ygNHsYPXt8JyZzW1nJblO_I27dzUyCwRl_EMVVbr0dm6ppRvUgWfOXedRVFP9ANRxxKVIJukdvHUpNssErL3bkb0_TnPVaxQSk803r_UZqHUbKEH9jumR32k8sZBfAPYMnLiFpUoHHzwrCkRmSzBfWUR8do9-iSSN8_XFw_MVrF9nWXXNEPOXP-Vz9Qd5c0'
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout user={user} currentView={selectedProject ? 'edit' : 'projects'}>
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
