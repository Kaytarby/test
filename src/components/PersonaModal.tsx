import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Persona, ToneOfVoice } from '../types';
import { DEFAULT_PERSONAS } from '../data/defaultPersonas';
import { X, Plus, Trash2, Check, ShieldAlert, Sliders, RefreshCw, BookmarkPlus } from 'lucide-react';

const TONE_OPTIONS: { id: ToneOfVoice; label: string; desc: string }[] = [
  { id: 'bold', label: 'Дерзкий & Прямолинейный', desc: 'Без воды, острые тезисы, ирония над стереотипами' },
  { id: 'expert', label: 'Экспертный & Системный', desc: 'Факты, цифры, методологии, твердые результаты' },
  { id: 'friendly', label: 'Тёплый & Дружелюбный', desc: 'Бережный, поддерживающий тон, доверительная беседа' },
  { id: 'storyteller', label: 'Глубокий Сторителлинг', desc: 'Личные истории, драматургия, преодоление факапов' },
  { id: 'witty', label: 'Ироничный & С юмором', desc: 'Шутки, мемы, легкая самоирония, понятный язык' },
  { id: 'provocative', label: 'Провокационный / Триггерный', desc: 'Разрушение догм, спорные тезисы, высокий хайп' },
  { id: 'luxury', label: 'Премиальный & Лаконичный', desc: 'Статусный, минималистичный, высокий средний чек' },
  { id: 'inspirational', label: 'Вдохновляющий & Мотивирующий', desc: 'Энергия, призыв действовать, вера в читателя' }
];

export const PersonaModal: React.FC = () => {
  const {
    isPersonaModalOpen,
    setIsPersonaModalOpen,
    activePersona,
    updatePersona,
    createPersona,
    deletePersona,
    resetPersonas,
    personas,
    setActivePersonaId
  } = useApp();

  const [formData, setFormData] = useState<Persona>(activePersona);
  const [newKeyFact, setNewKeyFact] = useState('');
  const [newCatchphrase, setNewCatchphrase] = useState('');
  const [newStopWord, setNewStopWord] = useState('');

  useEffect(() => {
    if (activePersona) {
      setFormData(activePersona);
    }
  }, [activePersona, isPersonaModalOpen]);

  if (!isPersonaModalOpen) return null;

  const handleSave = (asNewAgent: boolean) => {
    if (asNewAgent) {
      const { id: _id, ...rest } = formData;
      void _id;
      const created = createPersona({ ...rest, name: `${formData.name} (Копия)` });
      setActivePersonaId(created.id);
    } else {
      updatePersona(formData);
    }
    setIsPersonaModalOpen(false);
  };

  const addKeyFact = () => {
    if (newKeyFact.trim()) {
      setFormData(prev => ({
        ...prev,
        keyFacts: [...prev.keyFacts, newKeyFact.trim()]
      }));
      setNewKeyFact('');
    }
  };

  const removeKeyFact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFacts: prev.keyFacts.filter((_, i) => i !== index)
    }));
  };

  const addCatchphrase = () => {
    if (newCatchphrase.trim()) {
      setFormData(prev => ({
        ...prev,
        catchphrases: [...prev.catchphrases, newCatchphrase.trim()]
      }));
      setNewCatchphrase('');
    }
  };

  const removeCatchphrase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      catchphrases: prev.catchphrases.filter((_, i) => i !== index)
    }));
  };

  const addStopWord = () => {
    if (newStopWord.trim()) {
      setFormData(prev => ({
        ...prev,
        stopWords: [...prev.stopWords, newStopWord.trim()]
      }));
      setNewStopWord('');
    }
  };

  const removeStopWord = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stopWords: prev.stopWords.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Кастомизация ИИ-Агента
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                  Персонализация под вас
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Задайте характер, нишу, словарный запас и правила генерации контента
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPersonaModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Quick Preset Selector */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Быстрый выбор готового архетипа:
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PERSONAS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePersonaId(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition flex items-center gap-1.5 ${
                    activePersona.id === p.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 hover:text-white text-slate-300'
                  }`}
                >
                  <img src={p.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Архетип загружается в форму и становится активным агентом. «Сохранить как нового» создаст копию, не меняя оригинал.
            </p>
          </div>

          {/* Section 1: Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Имя автора / Эксперта *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="Например, Алексей Смирнов"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Никнейм в соцсетях *
              </label>
              <input
                type="text"
                value={formData.handle}
                onChange={e => setFormData({ ...formData, handle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="@alex.builder"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Аватарки
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
                <img
                  src={formData.avatarUrl}
                  alt="Превью"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                  onError={e => {
                    (e.target as HTMLElement).style.opacity = '0.3';
                  }}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Как агент должен говорить о вас в прошедшем времени?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'male', label: 'Мужской род', example: '«я понял», «я собрал»' },
                    { id: 'female', label: 'Женский род', example: '«я поняла», «я собрала»' }
                  ] as const
                ).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: opt.id })}
                    className={`p-3 rounded-xl border text-left transition ${
                      (formData.gender || 'male') === opt.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-semibold text-xs block">{opt.label}</span>
                    <span className="text-[10px] text-slate-400">{opt.example}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ниша и позиционирование *
              </label>
              <input
                type="text"
                value={formData.niche}
                onChange={e => setFormData({ ...formData, niche: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="IT, AI-агенты, Продуктовая разработка и Стартапы"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Целевая аудитория (для кого пишем?)
              </label>
              <textarea
                rows={2}
                value={formData.targetAudience}
                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
                placeholder="Разработчики, продакты, фаундеры, фрилансеры..."
              />
            </div>
          </div>

          {/* Section 2: Tone of Voice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Основная тональность (Tone of Voice):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TONE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, tone: opt.id })}
                  aria-pressed={formData.tone === opt.id}
                  className={`p-3 rounded-xl border text-left transition ${
                    formData.tone === opt.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{opt.label}</span>
                    {formData.tone === opt.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Sliders (Provocation & Emoji) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-300">
                  Уровень остроты и триггеров:
                </span>
                <span className="text-xs font-bold text-indigo-400">
                  {formData.provocationLevel} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.provocationLevel}
                onChange={e => setFormData({ ...formData, provocationLevel: Number(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Мягко & Академично</span>
                <span>Баланс</span>
                <span>Хайп & Провокация 🔥</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Использование эмодзи:
              </label>
              <div className="grid grid-cols-4 gap-1 text-center">
                {(['none', 'minimal', 'moderate', 'expressive'] as const).map(density => {
                  const labels = {
                    none: 'Без них',
                    minimal: 'Минимум',
                    moderate: 'Умеренно',
                    expressive: 'Много ✨'
                  };
                  return (
                    <button
                      key={density}
                      type="button"
                      onClick={() => setFormData({ ...formData, emojiDensity: density })}
                      className={`py-1.5 text-xs rounded-lg border transition ${
                        formData.emojiDensity === density
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {labels[density]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Call To Action & Funnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Стиль призыва к действию (CTA):
              </label>
              <select
                value={formData.ctaStyle}
                onChange={e => setFormData({ ...formData, ctaStyle: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="dm_keyword">Кодовое слово в Direct (Автоворонка)</option>
                <option value="question">Вопрос к аудитории для комментариев</option>
                <option value="direct">Прямая ссылка / Переход в шапку</option>
                <option value="soft">Мягкое вовлечение / Мысль на подумать</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Кодовое слово для Direct (триггер):
              </label>
              <input
                type="text"
                value={formData.dmKeyword || ''}
                onChange={e => setFormData({ ...formData, dmKeyword: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono uppercase"
                placeholder="СТАРТ, РАЗБОР, ГАЙД, МАТЕРИАЛ"
              />
            </div>
          </div>

          {/* Section 5: Key facts / Personal Story */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              База знаний: Личные факты, кейсы, достижения (ИИ будет вплетать их в тексты)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newKeyFact}
                onChange={e => setNewKeyFact(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyFact())}
                placeholder="Например: Запустил SaaS с MRR $15,000 без инвесторов"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addKeyFact}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить
              </button>
            </div>
            <div className="space-y-1.5">
              {formData.keyFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-300 truncate mr-2">• {fact}</span>
                  <button
                    onClick={() => removeKeyFact(idx)}
                    className="text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Catchphrases & Stop-words */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Фирменные фразы и словечки:
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCatchphrase}
                  onChange={e => setNewCatchphrase(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCatchphrase())}
                  placeholder="Меньше слайдов — больше кода"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCatchphrase}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.catchphrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]"
                  >
                    «{phrase}»
                    <button onClick={() => removeCatchphrase(idx)} className="hover:text-rose-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Стоп-слова (никогда не использовать):
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newStopWord}
                  onChange={e => setNewStopWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStopWord())}
                  placeholder="успешный успех, инсайт, ресурс"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addStopWord}
                  className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.stopWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]"
                  >
                    🚫 {word}
                    <button onClick={() => removeStopWord(idx)} className="hover:text-white">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 7: Custom System Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Дополнительные инструкции для ИИ (System Prompt)
            </label>
            <textarea
              rows={2}
              value={formData.systemPromptCustom || ''}
              onChange={e => setFormData({ ...formData, systemPromptCustom: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs resize-none font-mono"
              placeholder="Любые особые требования к структуре, стилю, форматированию..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetPersonas}
              className="px-3 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сбросить к шаблонам
            </button>

            {personas.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  deletePersona(formData.id);
                  setIsPersonaModalOpen(false);
                }}
                className="px-3 py-2 rounded-xl border border-rose-900/40 text-rose-400 hover:bg-rose-950/40 text-xs transition"
              >
                Удалить агента
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition flex items-center gap-1.5"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Сохранить как нового
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Применить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
