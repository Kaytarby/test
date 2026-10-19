import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApiSettings } from '../types';
import { Key, X, Check, Cpu, ShieldCheck } from 'lucide-react';

export const ApiKeyModal: React.FC = () => {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen, apiSettings, setApiSettings, showToast } = useApp();

  const [provider, setProvider] = useState<ApiSettings['provider']>(apiSettings.provider);
  const [apiKey, setApiKey] = useState(apiSettings.apiKey);
  const [model, setModel] = useState(apiSettings.model);
  const [baseUrl, setBaseUrl] = useState(apiSettings.baseUrl || '');

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    setApiSettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      baseUrl: baseUrl.trim() ? baseUrl.trim() : undefined
    });
    setIsApiKeyModalOpen(false);
    showToast('Настройки нейросети сохранены 🚀');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Движок ИИ & API Ключи</h2>
              <p className="text-xs text-slate-400">Выберите режим генерации контента</p>
            </div>
          </div>
          <button
            onClick={() => setIsApiKeyModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          {/* Provider Selection */}
          <div>
            <label className="block font-semibold text-slate-200 mb-2">
              Источник генерации контента:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'mock', name: 'Smart Engine (Встроенный)', badge: 'Без ключа' },
                { id: 'openai', name: 'OpenAI (GPT-4o)', badge: 'API Key' },
                { id: 'groq', name: 'Groq (Llama 3.3)', badge: 'Супер-скорость' },
                { id: 'openrouter', name: 'OpenRouter / Любые', badge: 'Универсальный' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setProvider(item.id as any);
                    if (item.id === 'groq' && !model) setModel('llama-3.3-70b-versatile');
                    if (item.id === 'openai' && !model) setModel('gpt-4o-mini');
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    provider === item.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-semibold text-slate-200 text-xs">{item.name}</span>
                  <span className="text-[10px] text-indigo-400 mt-1 font-mono">{item.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {provider === 'mock' ? (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-medium text-indigo-300">
                <Cpu className="w-4 h-4" />
                <span>Автономный интеллектуальный генератор</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Работает мгновенно без внешних ключей и оплаты. Полностью учитывает настройки вашего
                ИИ-агента: тональность, нишу, фирменные фразы, стоп-слова, уровень триггеров и CTA.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  API Key для {provider.toUpperCase()}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Ключ хранится локально в вашем браузере (LocalStorage) и не отправляется на сторонние серверы.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Название модели
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder={provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">
                  Custom Base URL (необязательно)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
