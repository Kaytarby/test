import React from 'react';
import { StorySlide, Persona, StickerType } from '../../types';
import { SLIDE_THEMES } from '../../data/templates';
import { Palette, Video, Smile, AlignLeft, AlignCenter, Wand2 } from 'lucide-react';

interface SlideEditorProps {
  slide: StorySlide;
  onChange: (updated: StorySlide) => void;
  persona: Persona;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onChange, persona }) => {
  const handleThemeSelect = (themeId: string) => {
    const selectedTheme = SLIDE_THEMES.find(t => t.id === themeId);
    if (selectedTheme) {
      onChange({
        ...slide,
        themeId,
        bgGradient: selectedTheme.background,
        textColor: selectedTheme.textColor,
        accentColor: selectedTheme.accentColor
      });
    }
  };

  const handleStickerTypeChange = (type: StickerType) => {
    let sticker = { ...slide.sticker, type };
    if (type === 'poll' && (!sticker.options || sticker.options.length === 0)) {
      sticker.question = 'Согласны с этим?';
      sticker.options = ['Да, на 100%', 'Есть сомнения'];
    } else if (type === 'slider') {
      sticker.question = 'Насколько откликается?';
      sticker.emoji = '🔥';
    } else if (type === 'question') {
      sticker.question = 'Задайте мне вопрос по теме 👇';
    } else if (type === 'reaction') {
      sticker.emoji = '🔥';
    }
    onChange({ ...slide, sticker });
  };

  // AI Refine actions
  const handleAiRefine = (action: 'sharper' | 'shorter' | 'catchphrase' | 'friendly') => {
    let newText = slide.text;
    if (action === 'shorter') {
      // Condense text
      newText = slide.text
        .split('\n')
        .filter(l => l.trim().length > 0)
        .slice(0, 3)
        .join('\n');
    } else if (action === 'sharper') {
      newText = `Хватит делать вид, что всё нормально.\n\n${slide.text}\n\nЕсли не изменить это сейчас — дальше будет только дороже.`;
    } else if (action === 'catchphrase') {
      const phrase = persona.catchphrases[Math.floor(Math.random() * persona.catchphrases.length)] || 'Система бьет хаос';
      newText = `${slide.text}\n\nЗапомните: «${phrase}».`;
    } else if (action === 'friendly') {
      newText = `Друзья, хочу поделиться важной мыслью ☕️\n\n${slide.text}\n\nБерегите себя и не требуйте идеальности с первого шага!`;
    }
    onChange({ ...slide, text: newText });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-xs text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white">Редактор слайда #{slide.order}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 uppercase font-mono">
            {slide.phase}
          </span>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onChange({ ...slide, alignment: 'left' })}
            className={`p-1 rounded ${
              slide.alignment !== 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...slide, alignment: 'center' })}
            className={`p-1 rounded ${
              slide.alignment === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Quick Tuning */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Быстрая доработка текста ИИ-агентом:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleAiRefine('sharper')}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] transition"
          >
            🔥 Сделать острее
          </button>
          <button
            type="button"
            onClick={() => handleAiRefine('shorter')}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] transition"
          >
            ✂️ Сократить
          </button>
          <button
            type="button"
            onClick={() => handleAiRefine('catchphrase')}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] transition"
          >
            💬 Вставить словечко автора
          </button>
          <button
            type="button"
            onClick={() => handleAiRefine('friendly')}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] transition"
          >
            ☕️ Мягче / Дружелюбнее
          </button>
        </div>
      </div>

      {/* Story phase */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1.5">
          Роль слайда в драматургии серии:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'hook', label: 'Хук' },
              { id: 'intrigue', label: 'Интрига' },
              { id: 'meat', label: 'Мясо' },
              { id: 'interactive', label: 'Интерактив' },
              { id: 'climax', label: 'Кульминация' },
              { id: 'cta', label: 'CTA' }
            ] as const
          ).map(ph => (
            <button
              key={ph.id}
              type="button"
              onClick={() => onChange({ ...slide, phase: ph.id })}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                slide.phase === ph.id
                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {ph.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Title */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1">Заголовок слайда</label>
        <input
          type="text"
          value={slide.title || ''}
          onChange={e => onChange({ ...slide, title: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs font-semibold"
          placeholder="Краткий цепляющий заголовок"
        />
      </div>

      {/* Main Slide Text */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1">Текст на слайде (для чтения)</label>
        <textarea
          rows={4}
          value={slide.text}
          onChange={e => onChange({ ...slide, text: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs leading-relaxed resize-y font-sans"
          placeholder="Напишите тезисы слайда..."
        />
      </div>

      {/* Accent Callout */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1">
          Акцентная плашка / Цитата / Главная мысль
        </label>
        <input
          type="text"
          value={slide.accentText || ''}
          onChange={e => onChange({ ...slide, accentText: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 focus:outline-none focus:border-indigo-500 text-xs font-medium"
          placeholder="Например: Ссылка в шапке профиля 👆"
        />
      </div>

      {/* Director Notes */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-1.5">
        <label className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
          <Video className="w-4 h-4 text-amber-400" />
          Режиссёрская подсказка для автора (что снимать/говорить):
        </label>
        <textarea
          rows={2}
          value={slide.directorNotes}
          onChange={e => onChange({ ...slide, directorNotes: e.target.value })}
          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-amber-500/30 text-slate-200 text-xs focus:outline-none resize-none"
          placeholder="Инструкция для съёмки: ракурс, музыка, жесты..."
        />
      </div>

      {/* Visual Theme Selection */}
      <div>
        <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-indigo-400" />
          Стиль оформления (Тема):
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SLIDE_THEMES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleThemeSelect(t.id)}
              className={`p-2 rounded-xl border text-left transition flex flex-col items-start gap-1.5 ${
                slide.themeId === t.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-800/80'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div
                className="w-full h-5 rounded-lg border border-white/20"
                style={{ background: t.background }}
              />
              <span className="text-[10px] font-medium text-slate-300 truncate w-full">
                {t.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sticker Configuration */}
      <div className="space-y-2">
        <label className="block font-semibold text-slate-300 flex items-center gap-1.5">
          <Smile className="w-4 h-4 text-pink-400" />
          Интерактивный стикер:
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {(
            [
              { id: 'none', label: 'Нет' },
              { id: 'poll', label: 'Опрос' },
              { id: 'slider', label: 'Ползунок' },
              { id: 'question', label: 'Вопрос' },
              { id: 'reaction', label: 'Реакция' }
            ] as const
          ).map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStickerTypeChange(s.id)}
              className={`py-1.5 px-2 rounded-lg border text-center transition text-[11px] font-medium ${
                slide.sticker?.type === s.id
                  ? 'border-pink-500 bg-pink-500/20 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sub-controls for sticker */}
        {slide.sticker?.type === 'poll' && (
          <div className="pt-2 space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Вопрос опроса:</span>
              <input
                type="text"
                value={slide.sticker.question || ''}
                onChange={e =>
                  onChange({
                    ...slide,
                    sticker: { ...slide.sticker, question: e.target.value }
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                placeholder="Что думаете?"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={slide.sticker.options?.[0] || ''}
                onChange={e => {
                  const opts = [...(slide.sticker.options || ['', ''])];
                  opts[0] = e.target.value;
                  onChange({ ...slide, sticker: { ...slide.sticker, options: opts } });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                placeholder="Вариант 1"
              />
              <input
                type="text"
                value={slide.sticker.options?.[1] || ''}
                onChange={e => {
                  const opts = [...(slide.sticker.options || ['', ''])];
                  opts[1] = e.target.value;
                  onChange({ ...slide, sticker: { ...slide.sticker, options: opts } });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                placeholder="Вариант 2"
              />
            </div>
          </div>
        )}

        {slide.sticker?.type === 'slider' && (
          <div className="pt-2 flex items-center gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-xl">{slide.sticker.emoji || '🔥'}</span>
            <input
              type="text"
              value={slide.sticker.question || ''}
              onChange={e =>
                onChange({
                  ...slide,
                  sticker: { ...slide.sticker, question: e.target.value }
                })
              }
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              placeholder="Вопрос к ползунку"
            />
          </div>
        )}

        {slide.sticker?.type === 'question' && (
          <div className="pt-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <input
              type="text"
              value={slide.sticker.question || ''}
              onChange={e =>
                onChange({
                  ...slide,
                  sticker: { ...slide.sticker, question: e.target.value }
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              placeholder="Задайте вопрос автору 👇"
            />
          </div>
        )}
      </div>
    </div>
  );
};
