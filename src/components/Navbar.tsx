import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Sliders, Key, Layers, Send, Calendar, Bot, ChevronDown } from 'lucide-react';

const TABS = [
  { id: 'stories', label: 'Сториз', icon: Layers },
  { id: 'posts', label: 'Посты', icon: Send },
  { id: 'planner', label: 'План & Архив', icon: Calendar },
  { id: 'agent', label: 'Чат с ИИ', icon: Bot }
] as const;

export const Navbar: React.FC = () => {
  const {
    personas,
    activePersona,
    setActivePersonaId,
    setIsPersonaModalOpen,
    setIsApiKeyModalOpen,
    activeTab,
    setActiveTab,
    apiSettings
  } = useApp();

  return (
    <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Row 1: Logo + persona + api */}
        <div className="flex items-center justify-between gap-2 h-16">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent whitespace-nowrap">
                  StoryCraft AI
                </span>
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                Студия сториз и постов с вашим ИИ-агентом
              </p>
            </div>
          </div>

          {/* Persona + API */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <img
                src={activePersona.avatarUrl}
                alt={activePersona.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50 shrink-0"
                onError={e => {
                  (e.target as HTMLElement).style.opacity = '0.4';
                }}
              />
              <div className="relative">
                <select
                  value={activePersona.id}
                  onChange={e => setActivePersonaId(e.target.value)}
                  className="appearance-none bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer w-[92px] sm:w-[140px] truncate pr-5"
                  title={activePersona.name}
                >
                  {personas.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={() => setIsPersonaModalOpen(true)}
                title="Настроить ИИ-агента"
                className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              title="Настройки API нейросети"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">
                {apiSettings.provider === 'mock' ? 'Smart Engine' : apiSettings.provider}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Navigation tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-3 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white whitespace-nowrap"
            title="API нейросети"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>API</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
