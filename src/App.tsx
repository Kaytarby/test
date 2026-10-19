import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StoriesStudio } from './components/stories/StoriesStudio';
import { PostsStudio } from './components/posts/PostsStudio';
import { ContentPlanner } from './components/planner/ContentPlanner';
import { AgentChatDrawer } from './components/agent/AgentChatDrawer';
import { PersonaModal } from './components/PersonaModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toast } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'stories' && <StoriesStudio />}
        {activeTab === 'posts' && <PostsStudio />}
        {activeTab === 'planner' && <ContentPlanner />}
        {activeTab === 'agent' && <AgentChatDrawer />}
      </main>

      {/* Modals & Overlays */}
      <PersonaModal />
      <ApiKeyModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
