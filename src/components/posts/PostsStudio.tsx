import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PostPreview } from './PostPreview';
import { HooksGenerator } from './HooksGenerator';
import { generatePost } from '../../data/mockGenerator';
import { SocialPlatform, PostFormat, PostContent } from '../../types';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Copy,
  Download,
  BookmarkCheck,
  RefreshCw,
  Image as ImageIcon,
  FileCode,
  Lightbulb,
  Shuffle
} from 'lucide-react';

const POST_TOPIC_SUGGESTIONS = [
  'Почему 90% сливают результаты в начале пути',
  '3 принципа продуктивности без выгорания',
  'Что будет актуально в следующие 6 месяцев',
  'Ошибка, которая стоила мне $5,000 — и какой урок я вынес',
  'Пошаговый алгоритм: как запустить проект за 48 часов'
];

export const PostsStudio: React.FC = () => {
  const {
    activePersona,
    currentPost,
    setCurrentPost,
    saveCurrentPost,
    apiSettings,
    showToast
  } = useApp();

  const [topic, setTopic] = useState(currentPost?.topic || '');
  const [platform, setPlatform] = useState<SocialPlatform>(currentPost?.platform || 'telegram');
  const [format, setFormat] = useState<PostFormat>(currentPost?.format || 'telegram_formatted');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const lastPersonaRef = useRef<string | null>(null);

  const buildPost = React.useCallback(
    async (
      finalTopic: string,
      nextPlatform: SocialPlatform = platform,
      nextFormat: PostFormat = format
    ) => {
      setIsGenerating(true);
      try {
        const post = await generatePost(
          finalTopic,
          nextPlatform,
          nextFormat,
          activePersona,
          undefined,
          apiSettings
        );
        setCurrentPost(post);
        setActiveCarouselSlide(0);
        return post;
      } finally {
        setIsGenerating(false);
      }
    },
    [activePersona, apiSettings, format, platform, setCurrentPost]
  );

  // Keep the draft in sync with the selected AI agent.
  useEffect(() => {
    const personaChanged =
      lastPersonaRef.current !== null && lastPersonaRef.current !== activePersona.id;
    lastPersonaRef.current = activePersona.id;

    if (!currentPost) {
      buildPost(`Ключевые принципы роста в нише ${activePersona.niche.split(',')[0]}`, 'telegram', 'telegram_formatted');
      return;
    }

    if (personaChanged) {
      buildPost(currentPost.topic);
      showToast(`Пост перегенерирован под голос «${activePersona.name}» 🎙️`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePersona.id]);

  const handleGenerate = async (customTopic?: string) => {
    const finalTopic = customTopic || topic.trim();
    if (!finalTopic) {
      showToast('Введите тему поста для генерации!');
      return;
    }

    try {
      await buildPost(finalTopic);
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      } catch {
        /* декоративно — не мешает генерации */
      }
      showToast(`Пост для ${platform.toUpperCase()} успешно создан! 🎉`);
    } catch (e) {
      console.error(e);
      showToast('Ошибка при генерации поста.');
    }
  };

  const handlePlatformChange = (nextPlatform: SocialPlatform) => {
    const nextFormat: PostFormat =
      nextPlatform === 'telegram'
        ? 'telegram_formatted'
        : nextPlatform === 'instagram'
        ? 'carousel'
        : 'single';
    setPlatform(nextPlatform);
    setFormat(nextFormat);
    const baseTopic = currentPost?.topic || topic.trim();
    if (baseTopic) buildPost(baseTopic, nextPlatform, nextFormat);
  };

  const handleFormatChange = (nextFormat: PostFormat) => {
    setFormat(nextFormat);
    const baseTopic = currentPost?.topic || topic.trim();
    if (baseTopic) buildPost(baseTopic, platform, nextFormat);
  };

  const handleSurprise = () => {
    const randomTopic =
      POST_TOPIC_SUGGESTIONS[Math.floor(Math.random() * POST_TOPIC_SUGGESTIONS.length)];
    setTopic(randomTopic);
    handleGenerate(randomTopic);
  };

  // Export copy
  const handleCopyText = (asMarkdown: boolean = false) => {
    if (!currentPost) return;

    let fullText = '';
    if (asMarkdown) {
      fullText = `${currentPost.hook}\n\n${currentPost.body}\n\n${currentPost.callToAction}\n\n${currentPost.hashtags.join(' ')}`;
    } else {
      // Clean plain text
      fullText = `${currentPost.hook}\n\n${currentPost.body.replace(/\*\*/g, '')}\n\n${currentPost.callToAction}\n\n${currentPost.hashtags.join(' ')}`;
    }

    if (currentPost.telegramButtonText) {
      fullText += `\n\n[Кнопка: ${currentPost.telegramButtonText} -> ${currentPost.telegramButtonUrl}]`;
    }

    navigator.clipboard.writeText(fullText);
    showToast(asMarkdown ? 'Markdown скопирован в буфер! 📝' : 'Текст поста скопирован! 📋');
  };

  // Export Carousel Slide PNG
  const handleDownloadCarouselCard = async () => {
    if (!carouselRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(carouselRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `carousel-slide-${activeCarouselSlide + 1}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Карточка карусели сохранена в HD! 🎨');
    } catch (e) {
      console.error(e);
      showToast('Ошибка при экспорте изображения');
    } finally {
      setIsExporting(false);
    }
  };

  // Updates
  const updateCurrentPost = (updates: Partial<PostContent>) => {
    if (!currentPost) return;
    setCurrentPost({ ...currentPost, ...updates });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Generator Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Студия Постов & Каруселей
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Мульти-соцсети
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Создание контента под Telegram, Instagram, LinkedIn и Threads с адаптацией под ваш Tone of Voice
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => handleCopyText(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Копировать текст поста"
            >
              <Copy className="w-4 h-4 text-sky-400" />
              <span>Копировать</span>
            </button>

            <button
              onClick={() => handleCopyText(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Копировать с Markdown форматированием"
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Markdown</span>
            </button>

            {format === 'carousel' && (
              <button
                onClick={handleDownloadCarouselCard}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
                title="Скачать текущий слайд карусели"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isExporting ? 'Экспорт...' : 'Карточку PNG'}</span>
              </button>
            )}

            <button
              onClick={saveCurrentPost}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>В архив</span>
            </button>
          </div>
        </div>

        {/* Platform & Format Selectors */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-slate-400 mr-1">Платформа:</span>
          {(
            [
              { id: 'telegram', name: 'Telegram Канал' },
              { id: 'instagram', name: 'Instagram' },
              { id: 'linkedin', name: 'LinkedIn' },
              { id: 'threads', name: 'Threads / Twitter' }
            ] as const
          ).map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePlatformChange(p.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                platform === p.id
                  ? 'border-indigo-500 bg-indigo-500/20 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}

          <span className="text-xs font-semibold text-slate-400 ml-3 mr-1">Формат:</span>
          {(
            [
              { id: 'single', name: 'Один пост' },
              { id: 'carousel', name: 'Карусель (слайды)' },
              { id: 'telegram_formatted', name: 'Форматированный с кнопкой' }
            ] as const
          ).map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFormatChange(f.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                format === f.id
                  ? 'border-purple-500 bg-purple-500/20 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Topic Input + Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-9">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Введите тему поста или кликните по подсказкам ниже..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Пишем...' : 'Сгенерировать'}</span>
            </button>
            <button
              onClick={handleSurprise}
              disabled={isGenerating}
              title="Случайная тема"
              className="px-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-[11px] text-slate-400">
          <span className="shrink-0 flex items-center gap-1 text-slate-500 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Идеи:
          </span>
          {POST_TOPIC_SUGGESTIONS.map((item, idx) => (
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

      {/* Main Workspace Split: Left Editor, Right Live Preview */}
      {currentPost ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Post Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
            {/* Hook Generator Widget */}
            <HooksGenerator
              topic={currentPost.topic}
              persona={activePersona}
              currentHook={currentPost.hook}
              onSelectHook={h => updateCurrentPost({ hook: h })}
            />

            {/* Hook input */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <label className="block text-xs font-bold text-white">
                Цепляющий заголовок / Хук (Hook):
              </label>
              <input
                type="text"
                value={currentPost.hook}
                onChange={e => updateCurrentPost({ hook: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Body input */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white">Основной текст поста (Body):</label>
                <span className="text-[11px] text-slate-500">
                  {currentPost.body.length} символов
                </span>
              </div>
              <textarea
                rows={10}
                value={currentPost.body}
                onChange={e => updateCurrentPost({ body: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-y font-sans"
              />
            </div>

            {/* CTA input */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-bold text-amber-300">
                Призыв к действию (Call To Action):
              </label>
              <input
                type="text"
                value={currentPost.callToAction}
                onChange={e => updateCurrentPost({ callToAction: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Telegram Button Settings if Telegram */}
            {platform === 'telegram' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-sky-400 block">
                  Кнопка-ссылка внизу сообщения (Telegram Inline Button):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Текст на кнопке</span>
                    <input
                      type="text"
                      value={currentPost.telegramButtonText || ''}
                      onChange={e => updateCurrentPost({ telegramButtonText: e.target.value })}
                      placeholder="Забрать материал"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Ссылка URL</span>
                    <input
                      type="text"
                      value={currentPost.telegramButtonUrl || ''}
                      onChange={e => updateCurrentPost({ telegramButtonUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI Image Generation Prompt Box */}
            {currentPost.imagePrompt && (
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    Промпт для генерации иллюстрации (Midjourney / DALL-E):
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentPost.imagePrompt || '');
                      showToast('Промпт скопирован в буфер! 🎨');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Копировать
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  {currentPost.imagePrompt}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Live Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 order-1 lg:order-2">
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Живой предпросмотр: {platform.toUpperCase()}</span>
              {format === 'carousel' && (
                <span className="text-indigo-400 font-mono text-[11px]">
                  Слайд {activeCarouselSlide + 1}
                </span>
              )}
            </div>

            <PostPreview
              post={currentPost}
              persona={activePersona}
              activeCarouselSlide={activeCarouselSlide}
              onSelectCarouselSlide={idx => setActiveCarouselSlide(idx)}
              carouselRef={carouselRef}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">Загрузка поста...</p>
        </div>
      )}
    </div>
  );
};
