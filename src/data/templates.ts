import { SlideTheme } from '../types';

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: 'theme-minimal-dark',
    name: 'Onyx Minimal (Тёмный)',
    background: 'linear-gradient(145deg, #090d16 0%, #111827 50%, #030712 100%)',
    textColor: '#f9fafb',
    accentColor: '#38bdf8', // Sky 400
    cardBg: 'rgba(30, 41, 59, 0.75)',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeTextColor: '#38bdf8',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  {
    id: 'theme-cyber-neon',
    name: 'Cyber Violet (Неон)',
    background: 'linear-gradient(135deg, #180b2c 0%, #0d0720 50%, #2b0e45 100%)',
    textColor: '#ffffff',
    accentColor: '#a855f7', // Purple 500
    cardBg: 'rgba(40, 16, 75, 0.65)',
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    badgeTextColor: '#c084fc',
    fontFamily: 'system-ui, sans-serif'
  },
  {
    id: 'theme-emerald-growth',
    name: 'Emerald Wealth (Зеленый)',
    background: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #021f18 100%)',
    textColor: '#ecfdf5',
    accentColor: '#34d399', // Emerald 400
    cardBg: 'rgba(6, 78, 59, 0.7)',
    badgeBg: 'rgba(52, 211, 153, 0.2)',
    badgeTextColor: '#6ee7b7',
    fontFamily: 'system-ui, sans-serif'
  },
  {
    id: 'theme-editorial-paper',
    name: 'Warm Paper (Эстетичный светлый)',
    background: 'linear-gradient(135deg, #faf7f2 0%, #f3ede2 60%, #efe7d7 100%)',
    textColor: '#1c1917',
    accentColor: '#ea580c', // Orange 600
    cardBg: 'rgba(255, 255, 255, 0.85)',
    badgeBg: 'rgba(234, 88, 12, 0.12)',
    badgeTextColor: '#c2410c',
    fontFamily: 'Georgia, serif'
  },
  {
    id: 'theme-sunset-gradient',
    name: 'Sunset Glow (Закат)',
    background: 'linear-gradient(160deg, #431407 0%, #701a75 50%, #1e1b4b 100%)',
    textColor: '#fff1f2',
    accentColor: '#fb7185', // Rose 400
    cardBg: 'rgba(88, 28, 135, 0.5)',
    badgeBg: 'rgba(251, 113, 133, 0.2)',
    badgeTextColor: '#fda4af',
    fontFamily: 'system-ui, sans-serif'
  },
  {
    id: 'theme-clean-mono',
    name: 'Mono Studio (Черно-белый)',
    background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
    textColor: '#fafafa',
    accentColor: '#ffffff',
    cardBg: 'rgba(39, 39, 42, 0.8)',
    badgeBg: 'rgba(255, 255, 255, 0.15)',
    badgeTextColor: '#ffffff',
    fontFamily: 'system-ui, sans-serif'
  }
];

export interface StoryFormula {
  id: string;
  name: string;
  description: string;
  slidesCount: number;
  phases: Array<{
    phase: 'hook' | 'intrigue' | 'meat' | 'interactive' | 'climax' | 'cta';
    label: string;
    stickerType: 'none' | 'poll' | 'reaction' | 'question' | 'slider';
  }>;
}

export const STORY_FORMULAS: StoryFormula[] = [
  {
    id: 'formula-expert-breakthrough',
    name: 'Разрушение мифа & Экспертный инсайт',
    description: 'Взрывной хук, демонстрация скрытой проблемы, решение через личный подход и интерактив',
    slidesCount: 5,
    phases: [
      { phase: 'hook', label: '1. Шок-крючок и триггер', stickerType: 'reaction' },
      { phase: 'intrigue', label: '2. Почему 90% делают эту ошибку', stickerType: 'none' },
      { phase: 'meat', label: '3. Разбор механики и правильное решение', stickerType: 'none' },
      { phase: 'interactive', label: '4. Вопрос аудитории и опрос', stickerType: 'poll' },
      { phase: 'cta', label: '5. Призыв написать кодовое слово в Direct', stickerType: 'none' }
    ]
  },
  {
    id: 'formula-storytelling-hero',
    name: 'Путь героя: Факап → Инсайт → Победа',
    description: 'Искренняя личная история уязвимости, которая строит доверие и продает без давления',
    slidesCount: 6,
    phases: [
      { phase: 'hook', label: '1. Завязка: "Никогда об этом не говорил"', stickerType: 'none' },
      { phase: 'intrigue', label: '2. Точка перелома: когда всё пошло не так', stickerType: 'slider' },
      { phase: 'meat', label: '3. Главный инсайт, изменивший мышление', stickerType: 'none' },
      { phase: 'climax', label: '4. Результат и доказательства', stickerType: 'none' },
      { phase: 'interactive', label: '5. Окошко для ваших историй', stickerType: 'question' },
      { phase: 'cta', label: '6. Резюме и ссылка/слово', stickerType: 'none' }
    ]
  },
  {
    id: 'formula-lead-magnet',
    name: 'Прогрев на лид-магнит / Гайд / Чеклист',
    description: 'Быстрая цепочка из 4 слайдов, дающая максимальную конверсию в базу или директ',
    slidesCount: 4,
    phases: [
      { phase: 'hook', label: '1. Вопрос-боль целевой аудитории', stickerType: 'poll' },
      { phase: 'meat', label: '2. Демонстрация готового решения/схемы', stickerType: 'none' },
      { phase: 'interactive', label: '3. Реакция "Кому скинуть?"', stickerType: 'reaction' },
      { phase: 'cta', label: '4. Пиши кодовое слово в Direct', stickerType: 'none' }
    ]
  },
  {
    id: 'formula-day-in-life',
    name: 'Закулисье одного дня (Behind The Scenes)',
    description: 'Повышает вовлеченность и лояльность, показывает процесс работы изнутри',
    slidesCount: 5,
    phases: [
      { phase: 'hook', label: '1. Утренняя зацепка и главный фокус дня', stickerType: 'reaction' },
      { phase: 'meat', label: '2. Скрытый процесс работы над проектом', stickerType: 'none' },
      { phase: 'interactive', label: '3. Интерактивная дилемма / Опрос', stickerType: 'poll' },
      { phase: 'climax', label: '4. Финал дня и выводы', stickerType: 'slider' },
      { phase: 'cta', label: '5. Мысль на подумать на завтра', stickerType: 'none' }
    ]
  }
];

export const HOOK_FORMULAS = [
  { name: 'Провокация / Анти-совет', example: 'Перестаньте делать X, если не хотите потерять Y' },
  { name: 'Твердая цифра / Результат', example: 'Как за 14 дней сделать то, на что уходит 6 месяцев' },
  { name: 'Честная уязвимость', example: 'Самая глупая ошибка, которая стоила мне 300 000 ₽' },
  { name: 'Интрига / Секрет индустрии', example: 'Почему эксперты молчат об этом в открытом доступе?' },
  { name: 'Прямой вопрос в боль', example: 'Знакомо ощущение, когда работаешь 24/7, а чек не растет?' }
];
