import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoryChain, PostContent } from '../../types';
import {
  Calendar,
  Layers,
  Send,
  Trash2,
  ExternalLink,
  Plus,
  BookMarked,
  Clock,
  CalendarPlus
} from 'lucide-react';

type AnyItem =
  | { kind: 'story'; item: StoryChain }
  | { kind: 'post'; item: PostContent };

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const itemDateKey = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return dateKey(d);
};

export const ContentPlanner: React.FC = () => {
  const {
    savedStories,
    savedPosts,
    deleteSavedStory,
    deleteSavedPost,
    scheduleStory,
    schedulePost,
    setCurrentStoryChain,
    setCurrentPost,
    setActiveTab,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'stories' | 'posts'>('all');

  const openStory = (story: StoryChain) => {
    setCurrentStoryChain(story);
    setActiveTab('stories');
    showToast(`Серия сториз «${story.title}» загружена в студию! 🎬`);
  };

  const openPost = (post: PostContent) => {
    setCurrentPost(post);
    setActiveTab('posts');
    showToast(`Пост «${post.title}» загружен в студию! 📝`);
  };

  // Next 7 days, starting today
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const schedule = (kind: 'story' | 'post', id: string, date: Date) => {
    if (kind === 'story') scheduleStory(id, date.toISOString());
    else schedulePost(id, date.toISOString());
  };

  const plannedFor = (date: Date): AnyItem[] => {
    const key = dateKey(date);
    const stories: AnyItem[] = savedStories
      .filter(s => itemDateKey(s.scheduledDate) === key)
      .map(item => ({ kind: 'story' as const, item }));
    const posts: AnyItem[] = savedPosts
      .filter(p => itemDateKey(p.scheduledDate) === key)
      .map(item => ({ kind: 'post' as const, item }));
    return [...stories, ...posts];
  };

  const unscheduledStories = savedStories.filter(s => !s.scheduledDate);
  const unscheduledPosts = savedPosts.filter(p => !p.scheduledDate);
  const scheduledCount =
    savedStories.filter(s => s.scheduledDate).length +
    savedPosts.filter(p => p.scheduledDate).length;

  const renderCard = (kind: 'story' | 'post', data: StoryChain | PostContent) => {
    const isStory = kind === 'story';
    const story = data as StoryChain;
    const post = data as PostContent;

    return (
      <div
        key={data.id}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition space-y-3 shadow-lg"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md border ${
                isStory
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              }`}
            >
              {isStory ? <Layers className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {isStory ? `Сториз · ${story.slides.length} слайдов` : post.platform.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(data.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <h3 className="font-bold text-sm text-white line-clamp-1">
            {isStory ? story.title : post.hook}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2">
            {isStory ? story.slides[0]?.text || story.topic : post.body}
          </p>

          {data.scheduledDate && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {new Date(data.scheduledDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long'
              })}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => (isStory ? openStory(story) : openPost(post))}
              className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
                isStory
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span>В студию</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {!data.scheduledDate && (
              <button
                onClick={() => schedule(kind, data.id, new Date())}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 whitespace-nowrap"
                title="Запланировать на сегодня"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Сегодня
              </button>
            )}
          </div>

          <button
            onClick={() => (isStory ? deleteSavedStory(data.id) : deleteSavedPost(data.id))}
            className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
            title="Удалить из архива"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
            Контент-план & Архив
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Библиотека
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Сохранённые материалы и расписание публикаций на ближайшие 7 дней
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(
            [
              { id: 'all', label: `Все (${savedStories.length + savedPosts.length})` },
              { id: 'stories', label: `Сториз (${savedStories.length})` },
              { id: 'posts', label: `Посты (${savedPosts.length})` }
            ] as const
          ).map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeFilter === f.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Расписание на 7 дней
          </h2>
          <span className="text-[11px] text-slate-500">
            Запланировано: {scheduledCount}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {weekDates.map((date, idx) => {
            const items = plannedFor(date);
            const isToday = idx === 0;
            return (
              <div
                key={dateKey(date)}
                className={`rounded-xl p-2.5 min-h-[120px] flex flex-col justify-between border ${
                  isToday
                    ? 'bg-indigo-950/30 border-indigo-500/40'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white capitalize">
                      {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isToday ? 'text-indigo-300' : 'text-slate-500'
                      }`}
                    >
                      {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {items.length === 0 && (
                      <div className="text-[10px] text-slate-600 italic py-2 text-center">
                        Свободно
                      </div>
                    )}
                    {items.map(({ kind, item }) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          kind === 'story'
                            ? openStory(item as StoryChain)
                            : openPost(item as PostContent)
                        }
                        className={`w-full text-left p-1.5 rounded-lg border text-[10px] font-medium truncate transition ${
                          kind === 'story'
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                            : 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25'
                        }`}
                        title={kind === 'story' ? (item as StoryChain).title : (item as PostContent).hook}
                      >
                        {kind === 'story' ? '🎬 ' : '📝 '}
                        {kind === 'story' ? (item as StoryChain).title : (item as PostContent).hook}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (unscheduledStories[0]) {
                      schedule('story', unscheduledStories[0].id, date);
                    } else if (unscheduledPosts[0]) {
                      schedule('post', unscheduledPosts[0].id, date);
                    } else {
                      showToast('Нет неразмещённых материалов — создайте новый контент');
                    }
                  }}
                  className="text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1 mt-2 transition"
                  title="Добавить материал из архива на этот день"
                >
                  <Plus className="w-3 h-3" />
                  <span>Заполнить слот</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Archive */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-indigo-400" />
          Сохранённые материалы
        </h2>

        {savedStories.length === 0 && savedPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <BookMarked className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">В архиве пока пусто</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Создайте серию сториз или пост в студии и нажмите «В архив», чтобы сохранить их сюда
              и запланировать публикацию.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('stories')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Создать сториз
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Создать пост
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeFilter === 'all' || activeFilter === 'stories') &&
              savedStories.map(story => renderCard('story', story))}
            {(activeFilter === 'all' || activeFilter === 'posts') &&
              savedPosts.map(post => renderCard('post', post))}
            {(activeFilter === 'stories' && savedStories.length === 0) ||
            (activeFilter === 'posts' && savedPosts.length === 0) ? (
              <div className="col-span-full text-center py-10 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="mb-3">В этой категории пока нет сохранённых материалов</p>
                <button
                  onClick={() => setActiveTab(activeFilter === 'stories' ? 'stories' : 'posts')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold hover:bg-indigo-600/30 transition"
                >
                  Создать материал
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
