import React from 'react';
import { StorySlide } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface StorylineNavProps {
  slides: StorySlide[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
}

export const StorylineNav: React.FC<StorylineNavProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-300">
          Слайды истории ({slides.length})
        </span>
        <button
          onClick={onAddSlide}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Слайд
        </button>
      </div>

      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => onSelectSlide(idx)}
            className={`group relative p-2.5 rounded-xl border cursor-pointer transition shrink-0 sm:shrink flex sm:flex-col justify-between ${
              currentSlideIndex === idx
                ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/50 shadow-md'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-200">
                #{idx + 1} • <span className="uppercase font-mono text-[10px] text-indigo-400">{s.phase}</span>
              </span>

              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteSlide(idx);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-0.5"
                  title="Удалить слайд"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
              {s.title || s.text || 'Пустой слайд'}
            </p>

            {s.sticker && s.sticker.type !== 'none' && (
              <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 w-fit">
                Стикер: {s.sticker.type}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
