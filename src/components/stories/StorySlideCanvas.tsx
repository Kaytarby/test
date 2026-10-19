import React, { useState } from 'react';
import { StorySlide, Persona } from '../../types';
import { SLIDE_THEMES } from '../../data/templates';
import { ChevronLeft, ChevronRight, Heart, Share2, Sparkles } from 'lucide-react';

interface StorySlideCanvasProps {
  slide: StorySlide;
  persona: Persona;
  currentIndex: number;
  totalSlides: number;
  onPrev?: () => void;
  onNext?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export const StorySlideCanvas: React.FC<StorySlideCanvasProps> = ({
  slide,
  persona,
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  canvasRef
}) => {
  const theme = SLIDE_THEMES.find(t => t.id === slide.themeId) || SLIDE_THEMES[0];
  const [pollSelected, setPollSelected] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState(70);

  const phaseNames: Record<string, { label: string; color: string }> = {
    hook: { label: 'ХУК & ВОВЛЕЧЕНИЕ', color: 'from-amber-500 to-orange-500' },
    intrigue: { label: 'ИНТРИГА / ПРОБЛЕМА', color: 'from-purple-500 to-pink-500' },
    meat: { label: 'МЯСО & РЕШЕНИЕ', color: 'from-blue-500 to-indigo-500' },
    interactive: { label: 'ИНТЕРАКТИВ', color: 'from-emerald-500 to-teal-500' },
    climax: { label: 'КУЛЬМИНАЦИЯ', color: 'from-rose-500 to-red-500' },
    cta: { label: 'ПРИЗЫВ К ДЕЙСТВИЮ', color: 'from-indigo-500 to-cyan-500' }
  };

  const currentPhase = phaseNames[slide.phase] || { label: 'СЛАЙД', color: 'from-slate-500 to-slate-700' };

  return (
    <div className="relative flex flex-col items-center">
      {/* Phone Shell */}
      <div className="relative w-full max-w-[356px] rounded-[44px] bg-slate-950 p-3 shadow-2xl ring-1 ring-slate-800 shadow-indigo-950/40 select-none">
        {/* Dynamic Island / Top Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-3" />
          <div className="w-2 h-2 rounded-full bg-indigo-950/60" />
        </div>

        {/* 9:16 Slide Screen Container (Target for html-to-image export) */}
        <div
          ref={canvasRef}
          style={{
            background: slide.bgGradient || theme.background,
            color: slide.textColor || theme.textColor,
            fontFamily: theme.fontFamily
          }}
          className="relative w-full aspect-[9/16] rounded-[36px] overflow-hidden flex flex-col justify-between p-5 pt-9 pb-5 shadow-inner"
        >
          {/* Top Overlays: Stories Progress Bars */}
          <div className="relative z-20 space-y-3">
            <div className="flex gap-1.5 w-full">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      idx < currentIndex
                        ? 'w-full bg-white'
                        : idx === currentIndex
                        ? 'w-full bg-white shadow-sm'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Author Profile Header */}
            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-2.5">
                <img
                  src={persona.avatarUrl}
                  alt={persona.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs tracking-tight">{persona.handle}</span>
                    <span className="text-[10px] text-white/60">3ч</span>
                  </div>
                  <p className="text-[10px] text-white/70 truncate max-w-[140px]">{persona.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${currentPhase.color} text-white shadow-sm`}>
                  {currentPhase.label}
                </span>
              </div>
            </div>
          </div>

          {/* Center Content: Slide Typography & Elements */}
          <div className="relative z-20 flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
            <div className="my-auto py-3 space-y-3.5">
            {/* Title / Hook Header */}
            {slide.title && (
              <h3
                style={{ color: theme.textColor }}
                className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug drop-shadow-sm"
              >
                {slide.title}
              </h3>
            )}

            {/* Main Text Content */}
            <div
              style={{ color: theme.textColor }}
              className={`leading-relaxed whitespace-pre-line text-sm sm:text-base font-medium opacity-95 ${
                slide.alignment === 'center' ? 'text-center' : 'text-left'
              }`}
            >
              {slide.text}
            </div>

            {/* Accent Highlight Box / Callout */}
            {slide.accentText && (
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.accentColor + '50'
                }}
                className="p-3.5 rounded-2xl border backdrop-blur-md shadow-lg"
              >
                <div className="flex items-start gap-2">
                  <Sparkles
                    style={{ color: theme.accentColor }}
                    className="w-4 h-4 shrink-0 mt-0.5"
                  />
                  <p
                    style={{ color: theme.accentColor }}
                    className="text-xs sm:text-sm font-semibold leading-snug"
                  >
                    {slide.accentText}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Sticker Render */}
            {slide.sticker && slide.sticker.type !== 'none' && (
              <div className="pt-2">
                {/* 1. Poll Sticker */}
                {slide.sticker.type === 'poll' && (
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl p-3.5 shadow-xl text-center space-y-2.5 max-w-[280px] mx-auto border border-white/40">
                    <p className="font-bold text-xs text-slate-800">
                      {slide.sticker.question || 'Что вы думаете?'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {(slide.sticker.options && slide.sticker.options.length > 0
                        ? slide.sticker.options
                        : ['Да, согласен!', 'Нет, иначе']
                      ).map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPollSelected(i)}
                          className={`py-2 px-3 rounded-xl transition border ${
                            pollSelected === i
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          {opt}
                          {pollSelected !== null && (
                            <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                              {pollSelected === i ? '68%' : '32%'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Reaction Slider */}
                {slide.sticker.type === 'slider' && (
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl p-3.5 shadow-xl text-center space-y-2 max-w-[260px] mx-auto border border-white/40">
                    <p className="font-bold text-xs text-slate-800">
                      {slide.sticker.question || 'Насколько откликается?'}
                    </p>
                    <div className="flex items-center gap-3 px-2">
                      <span className="text-xl">{slide.sticker.emoji || '🔥'}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={e => setSliderValue(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Question Sticker */}
                {slide.sticker.type === 'question' && (
                  <div className="bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-xl text-center space-y-2 max-w-[270px] mx-auto">
                    <p className="font-extrabold text-xs">
                      {slide.sticker.question || 'Задайте мне вопрос 👇'}
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl py-2 px-3 text-[11px] text-white/80">
                      Напишите что-нибудь...
                    </div>
                  </div>
                )}

                {/* 4. Single Reaction Box */}
                {slide.sticker.type === 'reaction' && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2"
                    >
                      <span className="text-lg">{slide.sticker.emoji || '🔥'}</span>
                      <span>Жми реакцию</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          </div>

          {/* Bottom Social Bar Mockup */}
          <div className="relative z-20 flex items-center justify-between text-white/80 pt-2 border-t border-white/10">
            <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] text-white/70 mr-3">
              Отправить сообщение...
            </div>
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 hover:text-rose-400 cursor-pointer transition" />
              <Share2 className="w-5 h-5 hover:text-white cursor-pointer transition" />
            </div>
          </div>

          {/* Clickable hotspots to go Prev / Next */}
          <div
            onClick={onPrev}
            className="absolute left-0 top-16 bottom-16 w-1/4 z-10 cursor-pointer"
            title="Предыдущий слайд"
          />
          <div
            onClick={onNext}
            className="absolute right-0 top-16 bottom-16 w-1/4 z-10 cursor-pointer"
            title="Следующий слайд"
          />
        </div>
      </div>

      {/* Navigation Arrows under Phone */}
      <div className="flex items-center justify-between w-full max-w-[356px] mt-3 px-2">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </button>

        <span className="text-xs font-mono text-slate-400">
          Слайд {currentIndex + 1} из {totalSlides}
        </span>

        <button
          onClick={onNext}
          disabled={currentIndex === totalSlides - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Далее
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
