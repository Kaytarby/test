import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl animate-fade-in backdrop-blur-md">
      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
    </div>
  );
};
