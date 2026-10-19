import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Bot,
  User,
  Sliders,
  ArrowRight,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

export const AgentChatDrawer: React.FC = () => {
  const {
    activePersona,
    chatMessages,
    sendChatMessage,
    isChatLoading,
    setActiveTab,
    setIsPersonaModalOpen
  } = useApp();

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isChatLoading) return;
    const text = input;
    setInput('');
    sendChatMessage(text);
  };

  const handleQuickPrompt = (promptText: string) => {
    sendChatMessage(promptText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 h-[calc(100dvh-9.5rem)] min-h-[480px] flex flex-col space-y-4">
      {/* Agent Persona Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={activePersona.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/50"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">{activePersona.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ИИ-Ассистент
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Тон: <span className="text-indigo-400 font-semibold">{activePersona.tone}</span> • Ниша:{' '}
              {activePersona.niche.split(',')[0]}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPersonaModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Настроить характер</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto space-y-4">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'agent' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Action button suggested by agent */}
              {msg.suggestedAction && (
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      if (msg.suggestedAction?.type === 'apply_story') {
                        setActiveTab('stories');
                      } else if (msg.suggestedAction?.type === 'apply_post') {
                        setActiveTab('posts');
                      } else if (msg.suggestedAction?.type === 'edit_persona') {
                        setIsPersonaModalOpen(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs transition"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span
                className={`block text-[10px] text-right font-mono ${
                  msg.sender === 'user' ? 'text-indigo-200/70' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isChatLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>ИИ думает над ответом...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-400 shrink-0">
        <span className="shrink-0 flex items-center gap-1 text-slate-500 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Быстрые запросы:
        </span>
        {[
          'Предложи 5 вирусных тем для постов на неделю',
          'Придумай сюжет сториз для прогрева к консультации',
          'Сделай опрос для аудитории про выгорание',
          'Напиши цепляющий хук про мой кейс'
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(q)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Спросите у ИИ-агента ${activePersona.name} или попросите написать контент...`}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || isChatLoading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition disabled:opacity-40"
        >
          <span>Отправить</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
