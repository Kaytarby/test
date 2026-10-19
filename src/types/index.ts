export type SocialPlatform = 'instagram' | 'telegram' | 'linkedin' | 'threads' | 'vk';

export type PostFormat = 'single' | 'carousel' | 'telegram_formatted' | 'thread';

export type ToneOfVoice =
  | 'expert' // Экспертный и системный
  | 'bold' // Дерзкий и бескомпромиссный
  | 'friendly' // Тёплый и дружелюбный
  | 'storyteller' // Глубокий сторителлинг
  | 'witty' // С иронией и юмором
  | 'provocative' // Провокационный и триггерный
  | 'luxury' // Премиальный и лаконичный
  | 'inspirational'; // Вдохновляющий и мотивирующий

export interface Persona {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  gender?: 'male' | 'female';
  niche: string;
  targetAudience: string;
  tone: ToneOfVoice;
  secondaryTone?: ToneOfVoice;
  bio: string;
  keyFacts: string[]; // Личные кейсы, опыт, фишки
  catchphrases: string[]; // Фирменные словечки и фразы
  stopWords: string[]; // Слова-табу
  emojiDensity: 'none' | 'minimal' | 'moderate' | 'expressive';
  provocationLevel: number; // 1 to 5
  ctaStyle: 'soft' | 'direct' | 'question' | 'dm_keyword';
  dmKeyword?: string;
  systemPromptCustom?: string;
}

export type StickerType = 'none' | 'poll' | 'reaction' | 'question' | 'slider' | 'quiz';

export interface StorySticker {
  type: StickerType;
  question?: string;
  options?: string[]; // for poll / quiz
  correctIndex?: number; // for quiz
  emoji?: string; // for reaction / slider
}

export interface StorySlide {
  id: string;
  order: number;
  phase: 'hook' | 'intrigue' | 'meat' | 'interactive' | 'climax' | 'cta';
  title?: string;
  text: string;
  accentText?: string;
  directorNotes: string; // Заметка для автора (что говорить на видео, эмоция, ракурс)
  sticker: StorySticker;
  themeId: string;
  bgType: 'gradient' | 'solid' | 'pattern' | 'image';
  bgColor?: string;
  bgGradient?: string;
  bgImageUrl?: string;
  textColor?: string;
  accentColor?: string;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
}

export interface StoryChain {
  id: string;
  title: string;
  topic: string;
  personaId?: string;
  goal: 'engagement' | 'expert' | 'lead_magnet' | 'sale' | 'entertainment';
  slides: StorySlide[];
  createdAt: string;
  scheduledDate?: string;
  tags: string[];
}

export interface CarouselSlide {
  id: string;
  order: number;
  slideType: 'cover' | 'content' | 'quote' | 'checklist' | 'cta';
  title: string;
  body: string;
  highlightText?: string;
  footerText?: string;
  themeId: string;
}

export interface PostContent {
  id: string;
  title: string;
  topic: string;
  platform: SocialPlatform;
  format: PostFormat;
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  carouselSlides?: CarouselSlide[];
  telegramButtonText?: string;
  telegramButtonUrl?: string;
  imagePrompt?: string; // Промпт для ИИ-генератора картинок
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: string;
  createdAt: string;
  personaId: string;
}

export interface SlideTheme {
  id: string;
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  cardBg: string;
  badgeBg: string;
  badgeTextColor: string;
  fontFamily: string;
  patternOverlay?: string;
}

export interface ApiSettings {
  provider: 'mock' | 'openai' | 'openrouter' | 'anthropic' | 'groq';
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_story' | 'apply_post' | 'edit_persona';
    data?: any;
    label: string;
  };
}
