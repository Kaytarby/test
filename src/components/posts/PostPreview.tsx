import React from 'react';
import { PostContent, Persona } from '../../types';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Eye,
  CheckCircle,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';

interface PostPreviewProps {
  post: PostContent;
  persona: Persona;
  activeCarouselSlide?: number;
  onSelectCarouselSlide?: (index: number) => void;
  carouselRef?: React.RefObject<HTMLDivElement | null>;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  post,
  persona,
  activeCarouselSlide = 0,
  onSelectCarouselSlide,
  carouselRef
}) => {
  // Format body text with simulated Markdown bolding
  const renderFormattedText = (rawText: string) => {
    return rawText.split('\n').map((line, i) => {
      // Bold match **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block min-h-[1.1em] mb-1.5">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  if (post.platform === 'telegram') {
    return (
      <div className="bg-[#17212b] rounded-2xl border border-slate-700/60 p-4 max-w-lg mx-auto shadow-2xl text-slate-200 font-sans">
        {/* Telegram Channel Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={persona.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-1 ring-sky-400"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{persona.name}</span>
                <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
              </div>
              <p className="text-[11px] text-slate-400">{persona.handle} • 14.2K подписчиков</p>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>

        {/* Telegram Message Bubble */}
        <div className="bg-[#182533] rounded-2xl p-4 border border-slate-700/40 text-[13px] leading-relaxed space-y-3">
          {/* Post Hook */}
          <div className="font-bold text-sky-300 text-sm">{post.hook}</div>

          {/* Post Body */}
          <div className="text-slate-200">{renderFormattedText(post.body)}</div>

          {/* CTA */}
          <div className="text-amber-300 font-medium pt-1 border-t border-slate-700/40">
            {post.callToAction}
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="text-sky-400 text-xs flex flex-wrap gap-1 pt-1 font-mono">
              {post.hashtags.map((tag, idx) => (
                <span key={idx} className="hover:underline cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Optional Inline Button */}
          {post.telegramButtonText && (
            <div className="pt-2">
              <a
                href={post.telegramButtonUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#2b5278] hover:bg-[#32608d] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>{post.telegramButtonText}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          )}

          {/* Message Meta: Views, Time, Reactions */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/30">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[11px]">🔥 84</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[11px]">⚡️ 41</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-[11px]">🚀 29</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                2.4K
              </span>
              <span>14:32</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instagram / Carousel Preview
  return (
    <div className="bg-black rounded-2xl border border-slate-800 max-w-md mx-auto shadow-2xl overflow-hidden text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            <img
              src={persona.avatarUrl}
              alt=""
              className="w-full h-full rounded-full object-cover border border-black"
            />
          </div>
          <div>
            <span className="font-semibold text-xs text-white block">{persona.handle.replace('@', '')}</span>
            <span className="text-[10px] text-slate-400 block">{persona.name}</span>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </div>

      {/* Visual Media / Carousel Canvas */}
      {post.format === 'carousel' && post.carouselSlides && post.carouselSlides.length > 0 ? (
        <div className="relative">
          {/* Active Carousel Card (Exportable Target) */}
          <div
            ref={carouselRef}
            className="w-full aspect-[4/5] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 flex flex-col justify-between relative overflow-hidden select-none border-y border-slate-800"
          >
            {/* Top info */}
            <div className="flex justify-between items-center text-xs text-indigo-400">
              <span className="font-mono text-[11px] font-bold">
                {activeCarouselSlide + 1} / {post.carouselSlides.length}
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase">
                {persona.handle}
              </span>
            </div>

            {/* Middle Content */}
            <div className="my-auto space-y-4">
              <h3 className="text-xl font-black text-white leading-tight">
                {post.carouselSlides[activeCarouselSlide]?.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {post.carouselSlides[activeCarouselSlide]?.body}
              </p>

              {post.carouselSlides[activeCarouselSlide]?.highlightText && (
                <div className="inline-block p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs">
                  {post.carouselSlides[activeCarouselSlide].highlightText}
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 flex justify-between items-center">
              <span>{persona.niche.split(',')[0]}</span>
              <span className="text-indigo-400 font-semibold">Свайпай дальше ➔</span>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1 py-2 bg-black">
            {post.carouselSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCarouselSlide && onSelectCarouselSlide(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === activeCarouselSlide ? 'w-4 bg-sky-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Single Post Banner */
        <div className="w-full aspect-square bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-950 p-6 flex flex-col justify-between border-y border-slate-800">
          <div className="flex justify-between items-center text-xs text-indigo-400">
            <span className="font-bold">{persona.name}</span>
            <span>{persona.handle}</span>
          </div>
          <div className="my-auto text-center space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {post.hook}
            </h3>
            <p className="text-xs text-slate-400">
              {persona.niche}
            </p>
          </div>
          <div className="text-center text-[10px] text-slate-500">
            Сохраняй, чтобы не потерять 🔖
          </div>
        </div>
      )}

      {/* Action Icons */}
      <div className="p-3 pb-1 flex items-center justify-between text-white">
        <div className="flex items-center gap-3.5">
          <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
          <MessageCircle className="w-5 h-5 hover:text-sky-400 cursor-pointer" />
          <Send className="w-5 h-5 hover:text-indigo-400 cursor-pointer" />
        </div>
        <Bookmark className="w-5 h-5 hover:text-amber-400 cursor-pointer" />
      </div>

      {/* Likes */}
      <div className="px-3 text-xs font-semibold text-slate-200">
        1,394 отметок «Нравится»
      </div>

      {/* Caption */}
      <div className="p-3 text-xs leading-relaxed space-y-1.5">
        <p>
          <span className="font-bold text-white mr-1.5">{persona.handle.replace('@', '')}</span>
          <span className="font-semibold text-slate-100">{post.hook}</span>
        </p>
        <p className="text-slate-300 whitespace-pre-line">{post.body}</p>
        <p className="text-amber-400 font-semibold">{post.callToAction}</p>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="text-sky-400 text-[11px] pt-1">
            {post.hashtags.join(' ')}
          </div>
        )}
      </div>
    </div>
  );
};
