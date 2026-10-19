import React, { useState } from 'react';
import { Persona } from '../../types';
import { generateHooks } from '../../data/mockGenerator';
import { Sparkles, Check, Flame } from 'lucide-react';

interface HooksGeneratorProps {
  topic: string;
  persona: Persona;
  currentHook: string;
  onSelectHook: (hook: string) => void;
}

export const HooksGenerator: React.FC<HooksGeneratorProps> = ({
  topic,
  persona,
  currentHook,
  onSelectHook
}) => {
  const [hooks, setHooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFetchHooks = async () => {
    setLoading(true);
    try {
      const generated = await generateHooks(topic || 'Развитие личного бренда', persona);
      setHooks(generated);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          Генератор вирусных хуков (первое предложение)
        </span>
        <button
          type="button"
          onClick={handleFetchHooks}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Генерирую...' : 'Сгенерировать 5 хуков'}
        </button>
      </div>

      {isOpen && hooks.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {hooks.map((h, idx) => (
            <div
              key={idx}
              onClick={() => onSelectHook(h)}
              className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                currentHook === h
                  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <span>{h}</span>
              {currentHook === h && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
