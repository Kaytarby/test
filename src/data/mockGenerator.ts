import { Persona, StoryChain, StorySlide, PostContent, SocialPlatform, PostFormat, ApiSettings, CarouselSlide, StorySticker } from '../types';
import { SLIDE_THEMES, STORY_FORMULAS } from './templates';

// Pick a past-tense verb form matching the persona's gender
function g(persona: Persona, male: string, female: string): string {
  return persona.gender === 'female' ? female : male;
}

// Opening flavor per tone of voice
const TONE_FLAVOR: Record<string, { hookTitle: string; opener: string }> = {
  bold: {
    hookTitle: 'Честно? Меня это уже достало.',
    opener: 'Скажу без фильтров.'
  },
  expert: {
    hookTitle: 'Разбор: где именно ломается результат',
    opener: 'Посмотрим на факты без эмоций.'
  },
  friendly: {
    hookTitle: 'Тёплая мысль на сегодня ☕️',
    opener: 'Знаете это чувство, когда вроде всё делаешь, а результата нет?'
  },
  storyteller: {
    hookTitle: 'История, которая многое объясняет',
    opener: 'Мне потребовалось время, чтобы решиться это рассказать.'
  },
  witty: {
    hookTitle: 'Сейчас будет немного неловко, но полезно',
    opener: 'Обычно я шучу, но тут шутки заканчиваются.'
  },
  provocative: {
    hookTitle: 'Непопулярное мнение: возможно, вы делаете это зря',
    opener: 'Приготовьтесь не согласиться — это нормально.'
  },
  luxury: {
    hookTitle: 'Простое решение, которое меняет уровень',
    opener: 'Всё гениальное выглядит скромно.'
  },
  inspirational: {
    hookTitle: 'Один шаг, который меняет всю картину',
    opener: 'Иногда достаточно одного честного решения.'
  }
};

// Helper to clean stop-words and format according to persona
function applyPersonaStyle(text: string, persona: Persona): string {
  let result = text;
  // replace stop words if any exist
  persona.stopWords.forEach(word => {
    const reg = new RegExp(word, 'gi');
    result = result.replace(reg, '...');
  });

  // Adjust emojis based on density
  if (persona.emojiDensity === 'none') {
    result = result.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  }
  return result;
}

// Generate Realistic Story Chain
export async function generateStoryChain(
  topic: string,
  formulaId: string,
  persona: Persona,
  apiSettings?: ApiSettings
): Promise<StoryChain> {
  // If user provided a real API key and selected non-mock provider, attempt real LLM call
  if (apiSettings && apiSettings.apiKey && apiSettings.provider !== 'mock') {
    try {
      const liveResult = await callLlmForStory(topic, formulaId, persona, apiSettings);
      if (liveResult) return liveResult;
    } catch (e) {
      console.warn('Live API call failed, falling back to smart heuristic generator:', e);
    }
  }

  // Heuristic Smart Generator tailored to persona
  const formula = STORY_FORMULAS.find(f => f.id === formulaId) || STORY_FORMULAS[0];
  const theme = SLIDE_THEMES[0];
  const catchphrase = persona.catchphrases[Math.floor(Math.random() * persona.catchphrases.length)] || '';
  const keyFact = persona.keyFacts[Math.floor(Math.random() * persona.keyFacts.length)] || '';
  const dmWord = persona.dmKeyword || 'СТАРТ';

  const slides: StorySlide[] = formula.phases.map((phaseItem, index) => {
    let title = '';
    let text = '';
    let accentText = '';
    let directorNotes = '';
    let sticker: StorySticker = { type: phaseItem.stickerType, question: '', options: [], emoji: '🔥' };

    switch (phaseItem.phase) {
      case 'hook': {
        const flavor = TONE_FLAVOR[persona.tone] || TONE_FLAVOR.expert;
        title = flavor.hookTitle;
        text = `${flavor.opener} В теме «${topic}» 90% людей сливают результат на ровном месте — и дело совсем не в лени.`;
        accentText = `«${topic}» — это не про удачу, а про систему.`;
        directorNotes = 'Снимите говорящую голову на фронталку, держите зрительный контакт. Сделайте паузу после первой фразы, чтобы зацепить внимание.';
        if (phaseItem.stickerType === 'reaction') {
          sticker = { type: 'reaction', emoji: '🔥' };
        } else if (phaseItem.stickerType === 'poll') {
          sticker = { type: 'poll', question: 'Тоже замечали такое?', options: ['Да, постоянно!', 'Не обращал(а)'] };
        }
        break;
      }

      case 'intrigue':
        title = 'Почему старые методы умерли';
        text = `Большинство думает: «Сейчас я просто сделаю как у всех и получу результат».\n\nНо реальность жёстче. Мой опыт говорит сам за себя: ${keyFact}. И я ${g(persona, 'понял', 'поняла')} одно простое правило: ${catchphrase || 'надо менять подход'}.`;
        accentText = 'То, что работало год назад — сейчас тянет вас на дно.';
        directorNotes = 'Фото процесса или динамичный скриншот/видео за рабочим столом. Добавьте фоновую спокойную музыку (Lo-Fi).';
        if (phaseItem.stickerType === 'slider') {
          sticker = { type: 'slider', question: 'Насколько откликается?', emoji: '⚡' };
        }
        break;

      case 'meat':
        title = 'Формула решения без воды';
        text = `Вот как это на самом деле работает:\n\n1. Убираем лишние действия (хаос)\n2. Фокусируемся только на ключевой точке роста в «${topic}»\n3. Внедряем автоматизацию и твердые метрики\n\nНикакой магии, только логика и дисциплина.`;
        accentText = '3 шага, которые экономят месяцы сливов энергии.';
        directorNotes = 'Крупный текст на контрастном фоне. Выделите ключевые слова акцентным маркером. В озвучке делайте упор на цифры.';
        break;

      case 'interactive':
        title = 'Проверим ваш уровень?';
        text = `Мне искренне интересно: где прямо сейчас у вас затык в теме «${topic}»? \n\nЖмите вариант ниже или пишите мне — я разберу пару кейсов лично прямо в следующих сториз.`;
        accentText = 'Опрос анонимный, ответьте честно:';
        directorNotes = 'Короткое видео с жестом вниз (указание на стикер опроса или окошко). Улыбка и живая подача.';
        if (phaseItem.stickerType === 'poll') {
          sticker = {
            type: 'poll',
            question: `Что сложнее всего в «${topic}»?`,
            options: ['Начать и не бросить', 'Система и масштабирование']
          };
        } else if (phaseItem.stickerType === 'question') {
          sticker = {
            type: 'question',
            question: `Задай вопрос про «${topic}»👇`
          };
        }
        break;

      case 'climax':
        title = 'Результат внедрения';
        text = `Когда вы перестраиваете этот процесс — уходит тревога и постоянный синдром самозванца. \n\nПоявляется ясность, управляемый рост и свободное время на жизнь, а не вечный тупняк в монитор.`;
        accentText = `${catchphrase || 'Результат делают действия, а не сомнения.'}`;
        directorNotes = 'Эстетичный кадр с прогулки или лайфстайл видео. Спокойный, уверенный голос за кадром.';
        if (phaseItem.stickerType === 'slider') {
          sticker = { type: 'slider', question: 'Готовы внедрить?', emoji: '🚀' };
        }
        break;

      case 'cta':
        title = 'Заберите пошаговую инструкцию';
        if (persona.ctaStyle === 'dm_keyword') {
          text = `Я ${g(persona, 'собрал', 'собрала')} пошаговый разбор и готовый алгоритм по теме «${topic}» в один лаконичный документ.\n\nНапишите мне в Direct кодовое слово «${dmWord}» — и мой ИИ-бот сразу пришлет вам ссылку без лишних регистраций.`;
          accentText = `👉 Напиши в Direct: ${dmWord}`;
        } else if (persona.ctaStyle === 'question') {
          text = `Хотите персональный разбор вашей ситуации по «${topic}»? \n\nОставьте реакцию или черкните пару слов в директ — пообщаемся лично!`;
          accentText = 'Жду в директе, отвечаю сам(а) 📩';
        } else {
          text = `Ссылка на полный материал и бесплатный чек-лист уже ждет вас в шапке профиля.\n\nЗабирайте прямо сейчас, пока доступ открыт!`;
          accentText = 'Ссылка в шапке профиля 👆';
        }
        directorNotes = 'Яркий финальный слайд. Обязательно укажите стрелочками на кнопку перехода в Direct или шапку профиля.';
        break;
    }

    return {
      id: `slide-${Date.now()}-${index}`,
      order: index + 1,
      phase: phaseItem.phase,
      title,
      text: applyPersonaStyle(text, persona),
      accentText,
      directorNotes,
      sticker,
      themeId: theme.id,
      bgType: 'gradient',
      fontSize: 'md',
      alignment: 'left'
    };
  });

  return {
    id: `chain-${Date.now()}`,
    title: `Серия сториз: ${topic}`,
    topic,
    personaId: persona.id,
    goal: formula.id.includes('sale') ? 'sale' : formula.id.includes('lead') ? 'lead_magnet' : 'expert',
    slides,
    createdAt: new Date().toISOString(),
    tags: [persona.niche.split(',')[0].trim(), 'Сториз', 'Прогрев']
  };
}

// Generate Post for Social Networks
export async function generatePost(
  topic: string,
  platform: SocialPlatform,
  format: PostFormat,
  persona: Persona,
  customNotes?: string,
  apiSettings?: ApiSettings
): Promise<PostContent> {
  if (apiSettings && apiSettings.apiKey && apiSettings.provider !== 'mock') {
    try {
      const liveResult = await callLlmForPost(topic, platform, format, persona, customNotes, apiSettings);
      if (liveResult) return liveResult;
    } catch (e) {
      console.warn('Live API call failed for post, falling back to smart heuristic:', e);
    }
  }

  const catchphrase = persona.catchphrases[0] || 'Система бьет хаос';
  const keyFact = persona.keyFacts[0] || 'личный опыт показал главное';
  const dmWord = persona.dmKeyword || 'МАТЕРИАЛ';
  let hook = '';
  let body = '';
  let cta = '';
  let hashtags: string[] = [];
  let carouselSlides: CarouselSlide[] | undefined;

  // Platform-specific formatting
  if (platform === 'telegram') {
    hook = `🔥 **${topic.toUpperCase()}: почему все делают это неправильно?**`;
    body = `Заметил интересную закономерность среди тех, кто пытается развиваться в этом направлении.

Большинство делает одну фатальную ошибку: пытается копировать верхушку чужого айсберга, не понимая внутренней механики.

**Вот 3 правила, которые я вывел на практике:**

1️⃣ **Фокус на одном рычаге.** Не распыляйтесь на 10 инструментов сразу. Выберите один, но доведите его до совершенства.
2️⃣ **Отказ от перфекционизма.** ${catchphrase}. Быстро сделанный MVP ценнее идеального проекта, который никогда не увидит свет.
3️⃣ **Опора на твердые метрики.** Если вы не можете это измерить — вы не можете этим управлять.

Когда я ${keyFact.toLowerCase()}, стало очевидно: побеждает тот, кто умеет упрощать сложные вещи, а не усложнять простые.`;

    cta = persona.ctaStyle === 'dm_keyword'
      ? `💬 Напишите мне в личные сообщения слово «${dmWord}», чтобы забрать полный гайд и шаблон.`
      : `👇 Что думаете по этому поводу? Делитесь мнением в комментариях ниже!`;

    hashtags = ['#' + topic.replace(/\s+/g, '_'), '#экспертность', '#мышление', '#развитие'];
  } else if (platform === 'linkedin') {
    hook = `Stop overcomplicating ${topic}. Here is what actually works:`;
    body = `Over the past years, I've seen countless professionals struggle with this exact challenge.

The truth is counter-intuitive:
More effort does not equal better results. Better systems do.

Here is my 3-step framework:
→ 1. Eliminate friction before adding resources.
→ 2. Automate repetitive feedback loops.
→ 3. Measure outcomes, not hours spent behind the screen.

As I learned: ${keyFact}.

Success is rarely about reinventing the wheel — it's about relentlessly executing fundamentals that others ignore.`;
    cta = `What has been your biggest learning curve regarding ${topic}? Let's connect and discuss in the comments.`;
    hashtags = ['#Productivity', '#Leadership', '#Strategy', '#Innovation'];
  } else if (format === 'carousel') {
    hook = `Свайпай 👉 5 главных правил по теме «${topic}»`;
    body = `Краткая выжимка для тех, кто ценит время и хочет применить сразу. Сохраняйте в закладки, чтобы не потерять!`;
    cta = `Пиши «${dmWord}» в комментариях, и я пришлю расширенную версию!`;
    hashtags = ['#карусель', '#польза', '#инструкция', '#' + topic.replace(/\s+/g, '_')];

    carouselSlides = [
      {
        id: 'c-1',
        order: 1,
        slideType: 'cover',
        title: topic,
        body: '5 критических ошибок и готовый пошаговый алгоритм решения',
        highlightText: 'ЧИТАТЬ ДО КОНЦА ➔',
        footerText: persona.handle,
        themeId: 'theme-minimal-dark'
      },
      {
        id: 'c-2',
        order: 2,
        slideType: 'content',
        title: 'Ошибка №1: Хаос вместо системы',
        body: 'Пытаться делать всё вручную и каждый день начинать с чистого листа. Так выгорают даже самые мотивированные.',
        highlightText: 'Решение: оцифруйте повторяющиеся процессы.',
        footerText: persona.handle,
        themeId: 'theme-minimal-dark'
      },
      {
        id: 'c-3',
        order: 3,
        slideType: 'content',
        title: 'Ошибка №2: Страх критики',
        body: `Синдром самозванца лечится только действием. ${catchphrase}. Пока вы полируете идею, конкуренты уже собирают сливки.`,
        highlightText: 'Идеального момента не существует.',
        footerText: persona.handle,
        themeId: 'theme-minimal-dark'
      },
      {
        id: 'c-4',
        order: 4,
        slideType: 'checklist',
        title: 'Чек-лист внедрения',
        body: `✓ Зафиксировать точку А\n✓ Выбрать 1 инструмент автоматизации\n✓ Сделать первый релиз за 48 часов\n✓ Собрать честный фидбек`,
        highlightText: 'Сохрани, чтобы свериться!',
        footerText: persona.handle,
        themeId: 'theme-minimal-dark'
      },
      {
        id: 'c-5',
        order: 5,
        slideType: 'cta',
        title: 'Хочешь готовую структуру?',
        body: `Я упаковал свои шаблоны и регламенты в закрытую базу знаний. Доступ бесплатный для моих подписчиков.`,
        highlightText: `Напиши «${dmWord}» в директ!`,
        footerText: persona.handle,
        themeId: 'theme-minimal-dark'
      }
    ];
  } else {
    // Standard Instagram / VK / Threads post
    hook = persona.provocationLevel > 3
      ? `Если вы до сих пор делаете «${topic}» по старинке — вы буквально выбрасываете свои ресурсы в мусорку.`
      : `Как на самом деле устроен «${topic}», если отбросить мифы и глянец?`;

    body = `Давайте начистоту. В ленте каждый второй учит, как жить эту жизнь и делать результаты играючи. Но за кулисами — совершенно другая картина.

Когда я только начинал${persona.gender === 'female' ? 'а' : ''} разбираться в теме, я ${g(persona, 'совершил', 'совершила')} все возможные ошибки:
— тратил${persona.gender === 'female' ? 'а' : ''} часы на то, что можно автоматизировать за 5 минут;
— слушал${persona.gender === 'female' ? 'а' : ''} теоретиков без реальных кейсов;
— сомневался${persona.gender === 'female' ? 'ась' : ''} в себе вместо того, чтобы просто действовать.

Сейчас за плечами: ${keyFact}.

Главный инсайт, который перевернул мой подход:
«${catchphrase}».

Перестаньте усложнять. Сделайте первый шаг сегодня, пусть даже корявый. Опыт приходит только в процессе движения.`;

    cta = persona.ctaStyle === 'dm_keyword'
      ? `Хотите получить мой шаблон внедрения? Напишите слово «${dmWord}» в комментариях или директ, и я вышлю файл!`
      : `А с чем у вас сейчас больше всего сложностей в этом? Делитесь в комментариях, давайте разберем! 👇`;

    hashtags = ['#' + topic.replace(/\s+/g, ''), '#личныйопыт', '#развитие', '#мышление', '#эксперт'];
  }

  return {
    id: `post-${Date.now()}`,
    title: `Пост: ${topic}`,
    topic,
    platform,
    format,
    hook: applyPersonaStyle(hook, persona),
    body: applyPersonaStyle(body, persona),
    callToAction: applyPersonaStyle(cta, persona),
    hashtags,
    carouselSlides,
    telegramButtonText:
      platform === 'telegram' && persona.ctaStyle === 'dm_keyword'
        ? `Забрать гайд (${dmWord})`
        : platform === 'telegram' && persona.ctaStyle === 'direct'
        ? 'Перейти по ссылке'
        : undefined,
    telegramButtonUrl: platform === 'telegram' ? `https://t.me/${persona.handle.replace('@', '')}` : undefined,
    imagePrompt: `Cinematic professional photograph related to ${topic}, dramatic atmospheric lighting, high details, 8k resolution, photorealistic, modern clean aesthetic, editorial style`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    personaId: persona.id
  };
}

// Generate viral hooks
export async function generateHooks(topic: string, persona: Persona): Promise<string[]> {
  void persona;
  return [
    `Почему 95% проваливаются в «${topic}», даже имея все ресурсы?`,
    `Перестаньте тратить время на «${topic}», пока не сделаете эти 3 шага.`,
    `Самая дорогая ошибка в моей карьере, которая научила меня главному.`,
    `Как внедрить «${topic}» за 3 дня без нервов и выгорания (личный алгоритм).`,
    `Если вы не понимаете это про «${topic}» — вы просто топчетесь на месте.`
  ];
}

// Interactive chat with the Agent
export async function agentChatMessage(
  history: { sender: 'user' | 'agent'; text: string }[],
  userMessage: string,
  persona: Persona,
  apiSettings?: ApiSettings
): Promise<{ text: string; action?: { type: 'apply_story' | 'apply_post' | 'edit_persona'; data?: any; label: string } }> {
  // Check for live API
  if (apiSettings && apiSettings.apiKey && apiSettings.provider !== 'mock') {
    try {
      const live = await callLlmChat(history, userMessage, persona, apiSettings);
      if (live) return live;
    } catch (e) {
      console.warn('Live chat LLM call failed:', e);
    }
  }

  // Smart conversational agent
  const lower = userMessage.toLowerCase();

  if (lower.includes('сториз') || lower.includes('истори') || lower.includes('прогрев')) {
    return {
      text: `Отличная идея! Я проанализировал твой профиль (${persona.niche}) и тон (${persona.tone}). Для темы твоих сториз лучше всего подойдет связка: цепляющий триггер в 1-м слайде, разбор через твою фразу «${persona.catchphrases[0] || 'Система бьет хаос'}» и интерактивный опрос в середине.

Я уже набросал черновик серии сториз. Хочешь загрузить его в редактор?`,
      action: {
        type: 'apply_story',
        label: 'Сгенерировать сториз в студии'
      }
    };
  }

  if (lower.includes('пост') || lower.includes('карусел') || lower.includes('текст')) {
    return {
      text: `Сделано! Я сформировал пост с учетом твоей ЦА (${persona.targetAudience}) и стоп-слов. Пост начинается с сильного контрастного хука, раскрывает мясо в 3 буллетах и закрывает на ключевое слово «${persona.dmKeyword || 'СТАРТ'}».

Перейти в студию постов для настройки визуала и предпросмотра?`,
      action: {
        type: 'apply_post',
        label: 'Открыть в студии постов'
      }
    };
  }

  if (lower.includes('кто ты') || lower.includes('настройк') || lower.includes('персона')) {
    return {
      text: `Я твой персональный ИИ-ассистент контента! 
Мой текущий характер:
• Имя автора: ${persona.name} (${persona.handle})
• Ниша: ${persona.niche}
• Тональность: ${persona.tone} (уровень провокации: ${persona.provocationLevel}/5)
• Фирменное выражение: «${persona.catchphrases[0] || 'Без воды'}»
• Стоп-слова: ${persona.stopWords.slice(0, 3).join(', ')}

Ты можешь в любой момент изменить меня во вкладке «Настройки агента»!`,
      action: {
        type: 'edit_persona',
        label: 'Настроить профиль агента'
      }
    };
  }

  // General helpful brainstorming response
  return {
    text: `Я услышал тебя! Работая в твоем стиле («${persona.tone}»), предлагаю зайти через контраст: сначала показать, как делают все, а потом дать твою авторскую методику. 

Что сделаем дальше? Можем сгенерировать серию сториз из 5 слайдов с интерактивом, написать экспертный пост-разбор или сгенерировать 5 вирусных хуков для Reels/постов.`
  };
}

// Live LLM Callers (OpenAI-compatible endpoints: OpenAI, Groq, OpenRouter)
async function callLlmForStory(
  topic: string,
  formulaId: string,
  persona: Persona,
  settings: ApiSettings
): Promise<StoryChain | null> {
  const url = settings.baseUrl || (settings.provider === 'groq' 
    ? 'https://api.groq.com/openai/v1/chat/completions' 
    : settings.provider === 'openrouter' 
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions');

  const model = settings.model || (settings.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  const systemPrompt = `Ты — элитный продюсер контента и личный ИИ-ассистент блогера.
Имя автора: ${persona.name} (@${persona.handle})
Ниша: ${persona.niche}
Тон голоса: ${persona.tone}
ЦА: ${persona.targetAudience}
Ключевые факты: ${persona.keyFacts.join('; ')}
Любимые фразы: ${persona.catchphrases.join(', ')}
Стоп-слова (никогда не используй!): ${persona.stopWords.join(', ')}
Плотность эмодзи: ${persona.emojiDensity}
Кодовое слово для Direct: ${persona.dmKeyword || 'СТАРТ'}
${persona.systemPromptCustom || ''}

Сгенерируй JSON со структурой серии сториз (5 слайдов). Выдавай ТОЛЬКО валидный JSON без markdown оберток.
Формат JSON:
{
  "title": "Название серии",
  "slides": [
    {
      "phase": "hook|intrigue|meat|interactive|climax|cta",
      "title": "Заголовок слайда",
      "text": "Основной текст слайда для чтения",
      "accentText": "Акцентная плашка",
      "directorNotes": "Что говорить на видео, ракурс, эмоция",
      "stickerType": "none|poll|reaction|question|slider",
      "stickerQuestion": "Вопрос для стикера если есть",
      "stickerOptions": ["Вариант 1", "Вариант 2"]
    }
  ]
}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Тема серии сториз: "${topic}". Создай прогрев по формуле ${formulaId}.` }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) throw new Error(`LLM Error: ${res.statusText}`);
  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content?.trim();
  const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  const slides: StorySlide[] = (parsed.slides || []).map((s: any, idx: number) => ({
    id: `slide-live-${Date.now()}-${idx}`,
    order: idx + 1,
    phase: s.phase || 'meat',
    title: s.title || '',
    text: s.text || '',
    accentText: s.accentText || '',
    directorNotes: s.directorNotes || '',
    sticker: {
      type: s.stickerType || 'none',
      question: s.stickerQuestion,
      options: s.stickerOptions,
      emoji: '🔥'
    },
    themeId: SLIDE_THEMES[0].id,
    bgType: 'gradient',
    fontSize: 'md',
    alignment: 'left'
  }));

  return {
    id: `chain-${Date.now()}`,
    title: parsed.title || `Серия сториз: ${topic}`,
    topic,
    personaId: persona.id,
    goal: 'expert',
    slides,
    createdAt: new Date().toISOString(),
    tags: [persona.niche.split(',')[0], 'Сториз']
  };
}

async function callLlmForPost(
  topic: string,
  platform: SocialPlatform,
  format: PostFormat,
  persona: Persona,
  customNotes?: string,
  settings?: ApiSettings
): Promise<PostContent | null> {
  if (!settings || !settings.apiKey) return null;

  const url = settings.baseUrl || (settings.provider === 'groq' 
    ? 'https://api.groq.com/openai/v1/chat/completions' 
    : 'https://api.openai.com/v1/chat/completions');

  const model = settings.model || (settings.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  const systemPrompt = `Ты — персональный копирайтер автора ${persona.name}.
Ниша: ${persona.niche}. Тон: ${persona.tone}.
Пиши для соцсети: ${platform}, формат: ${format}.
Стоп-слова: ${persona.stopWords.join(', ')}.
Верни ТОЛЬКО валидный JSON:
{
  "hook": "первое цепляющее предложение",
  "body": "основной текст поста с абзацами",
  "callToAction": "призыв к действию",
  "hashtags": ["#тег1", "#тег2"],
  "imagePrompt": "промпт для нейросети генерации фото"
}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Тема поста: "${topic}". Заметки: ${customNotes || 'без заметок'}` }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) throw new Error(`LLM post error: ${res.statusText}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim();
  const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  return {
    id: `post-${Date.now()}`,
    title: `Пост: ${topic}`,
    topic,
    platform,
    format,
    hook: parsed.hook || '',
    body: parsed.body || '',
    callToAction: parsed.callToAction || '',
    hashtags: parsed.hashtags || [],
    imagePrompt: parsed.imagePrompt || '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    personaId: persona.id
  };
}

async function callLlmChat(
  history: { sender: 'user' | 'agent'; text: string }[],
  userMessage: string,
  persona: Persona,
  settings: ApiSettings
): Promise<{ text: string } | null> {
  const url = settings.baseUrl || (settings.provider === 'groq' 
    ? 'https://api.groq.com/openai/v1/chat/completions' 
    : 'https://api.openai.com/v1/chat/completions');

  const model = settings.model || (settings.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

  const messages = [
    {
      role: 'system',
      content: `Ты — личный ИИ-ассистент блогера. Твоего автора зовут ${persona.name}. Ниша: ${persona.niche}. Тон: ${persona.tone}.
Помогай придумывать идеи контента, сториз, постов, дорабатывай тексты. Отвечай кратко, бодро, вдохновляюще.`
    },
    ...history.slice(-6).map(h => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text
    })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 })
  });

  if (!res.ok) return null;
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content?.trim() || 'Готово!'
  };
}
