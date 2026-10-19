import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StorySlideCanvas } from './StorySlideCanvas';
import { SlideEditor } from './SlideEditor';
import { StorylineNav } from './StorylineNav';
import { generateStoryChain } from '../../data/mockGenerator';
import { STORY_FORMULAS, SLIDE_THEMES } from '../../data/templates';
import { StorySlide } from '../../types';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Download,
  BookmarkCheck,
  RefreshCw,
  FileText,
  Lightbulb,
  Wand2,
  Shuffle,
  Sliders,
  Flame,
  Smile,
  MessageCircle,
  Quote
} from 'lucide-react';

const TOPIC_SUGGESTIONS = [
  '3 фатальные ошибки новичков в моей сфере',
  'Как автоматизировать 80% рутины с помощью нейросетей',
  'Почему старые методы больше не работают в 2026',
  'Личная история: шаг до успеха, который дался тяжелее всего',
  'Разбор кейса: от хаоса к твёрдому результату за 14 дней',
  'Что я делаю каждую неделю для стабильного роста'
];

export const StoriesStudio: React.FC = () => {
  const {
    activePersona,
    currentStoryChain,
    setCurrentStoryChain,
    saveCurrentStory,
    apiSettings,
    showToast,
    setIsPersonaModalOpen
  } = useApp();

  const [topic, setTopic] = useState(currentStoryChain?.topic || '');
  const [selectedFormulaId, setSelectedFormulaId] = useState(STORY_FORMULAS[0].id);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const lastPersonaRef = useRef<string | null>(null);

  const buildChain = React.useCallback(
    async (finalTopic: string, formulaId: string) => {
      setIsGenerating(true);
      try {
        const chain = await generateStoryChain(finalTopic, formulaId, activePersona, apiSettings);
        setCurrentStoryChain(chain);
        setCurrentSlideIndex(0);
        return chain;
      } finally {
        setIsGenerating(false);
      }
    },
    [activePersona, apiSettings, setCurrentStoryChain]
  );

  // Keep the draft in sync with the selected AI agent.
  useEffect(() => {
    const personaChanged =
      lastPersonaRef.current !== null && lastPersonaRef.current !== activePersona.id;
    lastPersonaRef.current = activePersona.id;

    if (!currentStoryChain) {
      buildChain(
        `Внедрение AI и автоматизация в ${activePersona.niche.split(',')[0]}`,
        selectedFormulaId
      );
      return;
    }

    if (personaChanged) {
      buildChain(currentStoryChain.topic, selectedFormulaId);
      showToast(`Серия перегенерирована под голос «${activePersona.name}» 🎙️`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePersona.id]);

  const handleGenerate = async (customTopic?: string) => {
    const finalTopic = customTopic || topic.trim();
    if (!finalTopic) {
      showToast('Введите тему сториз для генерации!');
      return;
    }

    try {
      await buildChain(finalTopic, selectedFormulaId);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch {
        /* декоративно — не мешает генерации */
      }
      showToast('Серия сториз сгенерирована под ваш профиль! 🎉');
    } catch (e) {
      console.error(e);
      showToast('Ошибка при генерации. Попробуйте ещё раз.');
    }
  };

  const handleSurprise = () => {
    const randomTopic = TOPIC_SUGGESTIONS[Math.floor(Math.random() * TOPIC_SUGGESTIONS.length)];
    const randomFormula = STORY_FORMULAS[Math.floor(Math.random() * STORY_FORMULAS.length)];
    setTopic(randomTopic);
    setSelectedFormulaId(randomFormula.id);
    handleGenerate(randomTopic);
  };

  // Slide CRUD — functional updates keep rapid edits safe
  const handleUpdateSlide = (updatedSlide: StorySlide) => {
    setCurrentStoryChain(prev => {
      if (!prev) return prev;
      const slides = prev.slides.map((s, idx) => (idx === currentSlideIndex ? updatedSlide : s));
      return { ...prev, slides };
    });
  };

  const handleAddSlide = () => {
    const nextIndex = currentStoryChain ? currentStoryChain.slides.length : 0;
    setCurrentStoryChain(prev => {
      if (!prev) return prev;
      const newSlide: StorySlide = {
        id: `slide-${Date.now()}`,
        order: prev.slides.length + 1,
        phase: 'meat',
        title: 'Новый слайд',
        text: 'Напишите текст для этого слайда...',
        accentText: 'Важный тезис',
        directorNotes: 'Снимите видео или прикрепите фото',
        sticker: { type: 'none' },
        themeId: SLIDE_THEMES[0].id,
        bgType: 'gradient',
        fontSize: 'md',
        alignment: 'left'
      };
      return { ...prev, slides: [...prev.slides, newSlide] };
    });
    setCurrentSlideIndex(nextIndex);
    showToast('Слайд добавлен');
  };

  const handleDeleteSlide = (index: number) => {
    if (!currentStoryChain || currentStoryChain.slides.length <= 1) return;
    const nextLength = currentStoryChain.slides.length - 1;
    setCurrentStoryChain(prev => {
      if (!prev || prev.slides.length <= 1) return prev;
      const slides = prev.slides
        .filter((_, i) => i !== index)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...prev, slides };
    });
    setCurrentSlideIndex(current => Math.min(current, nextLength - 1));
    showToast('Слайд удалён');
  };

  // Export current slide as PNG
  const handleDownloadSlide = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `story-slide-${currentSlideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Слайд скачан в HD качестве! 📸');
    } catch (err) {
      console.error('Failed to export image', err);
      showToast('Не удалось экспортировать изображение');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy full filming script
  const handleCopyScript = () => {
    if (!currentStoryChain) return;
    let script = `🎬 СЦЕНАРИЙ СТОРИЗ: ${currentStoryChain.title}\n`;
    script += `Автор: ${activePersona.name} (${activePersona.handle})\n`;
    script += `Цель: ${currentStoryChain.goal}\n\n`;

    currentStoryChain.slides.forEach((s, idx) => {
      script += `═══════════════════════════════════\n`;
      script += `СЛАЙД #${idx + 1} [${s.phase.toUpperCase()}]\n`;
      if (s.title) script += `Заголовок: ${s.title}\n`;
      script += `Текст на экране:\n${s.text}\n`;
      if (s.accentText) script += `Плашка: ${s.accentText}\n`;
      if (s.directorNotes) script += `🎥 ЧТО ГОВОРИТЬ / СНИМАТЬ: ${s.directorNotes}\n`;
      if (s.sticker && s.sticker.type !== 'none') {
        script += `🔘 СТИКЕР: ${s.sticker.type.toUpperCase()}`;
        if (s.sticker.question) script += ` («${s.sticker.question}»)`;
        script += `\n`;
      }
      script += `\n`;
    });

    navigator.clipboard.writeText(script);
    showToast('Сценарий съёмки скопирован в буфер! 📋');
  };

  const activeSlide = currentStoryChain?.slides[currentSlideIndex] || currentStoryChain?.slides[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
      {/* Generator panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
              Студия Сториз 9:16
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                ИИ-прогревы
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Сюжетные цепочки с режиссёрскими подсказками — под голос и правила вашего блога
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Копировать сценарий для съёмки"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Сценарий</span>
            </button>

            <button
              onClick={handleDownloadSlide}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-50"
              title="Скачать текущий слайд как PNG"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExporting ? 'Экспорт...' : 'PNG'}</span>
            </button>

            <button
              onClick={saveCurrentStory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
              title="Сохранить в контент-план"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>В архив</span>
            </button>
          </div>
        </div>

        {/* Active agent profile strip */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
          <span className="text-slate-500 font-medium">Голос агента:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            <Quote className="w-3 h-3 text-indigo-400" />
            {activePersona.tone}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            <Flame className="w-3 h-3 text-amber-400" />
            Провокация {activePersona.provocationLevel}/5
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            <Smile className="w-3 h-3 text-pink-400" />
            Эмодзи: {activePersona.emojiDensity}
          </span>
          {activePersona.ctaStyle === 'dm_keyword' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              CTA: «{activePersona.dmKeyword || 'СТАРТ'}»
            </span>
          )}
          <button
            onClick={() => setIsPersonaModalOpen(true)}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-indigo-300 hover:text-white hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30 transition"
          >
            <Sliders className="w-3 h-3" />
            Настроить под себя
          </button>
        </div>

        {/* Topic + formula + generate */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Тема сториз: например, «ошибки новичков в моей нише»"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedFormulaId}
              onChange={e => setSelectedFormulaId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {STORY_FORMULAS.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} · {f.slidesCount} слайдов
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Пишем...' : 'Сгенерировать'}</span>
            </button>
            <button
              onClick={handleSurprise}
              disabled={isGenerating}
              title="Случайная идея + формула"
              className="px-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formula hint */}
        <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/70 rounded-xl px-3 py-2">
          <Wand2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            {STORY_FORMULAS.find(f => f.id === selectedFormulaId)?.description}
          </span>
        </div>

        {/* Topic chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-[11px] text-slate-400">
          <span className="shrink-0 flex items-center gap-1 text-slate-500 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Идеи:
          </span>
          {TOPIC_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(item);
                handleGenerate(item);
              }}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 hover:text-white transition"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Studio layout */}
      {currentStoryChain && activeSlide ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <StorylineNav
              slides={currentStoryChain.slides}
              currentSlideIndex={currentSlideIndex}
              onSelectSlide={idx => setCurrentSlideIndex(idx)}
              onAddSlide={handleAddSlide}
              onDeleteSlide={handleDeleteSlide}
            />
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:sticky lg:top-36">
            <StorySlideCanvas
              slide={activeSlide}
              persona={activePersona}
              currentIndex={currentSlideIndex}
              totalSlides={currentStoryChain.slides.length}
              onPrev={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              onNext={() =>
                setCurrentSlideIndex(prev =>
                  Math.min(currentStoryChain.slides.length - 1, prev + 1)
                )
              }
              canvasRef={canvasRef}
            />
          </div>

          <div className="lg:col-span-4 order-3">
            <SlideEditor slide={activeSlide} onChange={handleUpdateSlide} persona={activePersona} />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">Загрузка студии сториз...</p>
        </div>
      )}
    </div>
  );
};
