import React, { createContext, useContext, useState, useEffect } from 'react';
import { Persona, StoryChain, PostContent, ApiSettings, ChatMessage } from '../types';
import { DEFAULT_PERSONAS } from '../data/defaultPersonas';
import { agentChatMessage } from '../data/mockGenerator';

interface AppContextType {
  personas: Persona[];
  activePersona: Persona;
  setActivePersonaId: (id: string) => void;
  updatePersona: (persona: Persona) => void;
  createPersona: (persona: Omit<Persona, 'id'>) => Persona;
  deletePersona: (id: string) => void;
  resetPersonas: () => void;

  currentStoryChain: StoryChain | null;
  setCurrentStoryChain: (chain: StoryChain | null | ((prev: StoryChain | null) => StoryChain | null)) => void;

  currentPost: PostContent | null;
  setCurrentPost: (post: PostContent | null | ((prev: PostContent | null) => PostContent | null)) => void;

  savedStories: StoryChain[];
  savedPosts: PostContent[];
  saveCurrentStory: () => void;
  saveCurrentPost: () => void;
  deleteSavedStory: (id: string) => void;
  deleteSavedPost: (id: string) => void;
  scheduleStory: (id: string, dateISO: string) => void;
  schedulePost: (id: string, dateISO: string) => void;

  activeTab: 'stories' | 'posts' | 'planner' | 'agent';
  setActiveTab: (tab: 'stories' | 'posts' | 'planner' | 'agent') => void;

  isPersonaModalOpen: boolean;
  setIsPersonaModalOpen: (open: boolean) => void;

  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;

  apiSettings: ApiSettings;
  setApiSettings: (settings: ApiSettings) => void;

  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  isChatLoading: boolean;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PERSONAS = 'storycraft_personas_v1';
const LOCAL_STORAGE_KEY_ACTIVE_PID = 'storycraft_active_pid_v1';
const LOCAL_STORAGE_KEY_STORIES = 'storycraft_saved_stories_v1';
const LOCAL_STORAGE_KEY_POSTS = 'storycraft_saved_posts_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'storycraft_api_settings_v1';
const LOCAL_STORAGE_KEY_DRAFT_STORY = 'storycraft_draft_story_v1';
const LOCAL_STORAGE_KEY_DRAFT_POST = 'storycraft_draft_post_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Personas
  const [personas, setPersonas] = useState<Persona[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PERSONAS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading personas from localStorage', e);
    }
    return DEFAULT_PERSONAS;
  });

  const [activePersonaId, setActivePersonaIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_PID);
      if (stored) return stored;
    } catch {}
    return DEFAULT_PERSONAS[0].id;
  });

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0] || DEFAULT_PERSONAS[0];

  const setActivePersonaId = (id: string) => {
    setActivePersonaIdState(id);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_PID, id);
  };

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PERSONAS, JSON.stringify(personas));
  }, [personas]);

  // Modals & Navigation
  const [activeTab, setActiveTab] = useState<'stories' | 'posts' | 'planner' | 'agent'>('stories');
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Settings
  const [apiSettings, setApiSettingsState] = useState<ApiSettings>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      provider: 'mock',
      apiKey: '',
      model: 'gpt-4o-mini'
    };
  });

  const setApiSettings = (settings: ApiSettings) => {
    setApiSettingsState(settings);
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  };

  // Content drafts (persisted so a reload doesn't lose work)
  const [currentStoryChain, setCurrentStoryChain] = useState<StoryChain | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT_STORY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [currentPost, setCurrentPost] = useState<PostContent | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT_POST);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  useEffect(() => {
    try {
      if (currentStoryChain) {
        localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT_STORY, JSON.stringify(currentStoryChain));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_DRAFT_STORY);
      }
    } catch {}
  }, [currentStoryChain]);

  useEffect(() => {
    try {
      if (currentPost) {
        localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT_POST, JSON.stringify(currentPost));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_DRAFT_POST);
      }
    } catch {}
  }, [currentPost]);

  // Saved Library
  const [savedStories, setSavedStories] = useState<StoryChain[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_STORIES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [savedPosts, setSavedPosts] = useState<PostContent[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_POSTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STORIES, JSON.stringify(savedStories));
  }, [savedStories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_POSTS, JSON.stringify(savedPosts));
  }, [savedPosts]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // CRUD for personas
  const updatePersona = (updated: Persona) => {
    setPersonas(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    showToast('Настройки ИИ-агента обновлены ✨');
  };

  const createPersona = (data: Omit<Persona, 'id'>): Persona => {
    const newPersona: Persona = {
      ...data,
      id: `persona-${Date.now()}`
    };
    setPersonas(prev => [...prev, newPersona]);
    setActivePersonaId(newPersona.id);
    showToast(`ИИ-агент «${newPersona.name}» успешно создан!`);
    return newPersona;
  };

  const deletePersona = (id: string) => {
    if (personas.length <= 1) {
      showToast('Нельзя удалить единственного агента');
      return;
    }
    setPersonas(prev => prev.filter(p => p.id !== id));
    if (activePersonaId === id) {
      const next = personas.find(p => p.id !== id);
      if (next) setActivePersonaId(next.id);
    }
    showToast('Агент удален');
  };

  const resetPersonas = () => {
    setPersonas(DEFAULT_PERSONAS);
    setActivePersonaId(DEFAULT_PERSONAS[0].id);
    showToast('Сброшено к заводским шаблонам');
  };

  // Content Saving
  const saveCurrentStory = () => {
    if (!currentStoryChain) return;
    setSavedStories(prev => {
      const exists = prev.findIndex(s => s.id === currentStoryChain.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = currentStoryChain;
        return copy;
      }
      return [currentStoryChain, ...prev];
    });
    showToast('Серия сториз сохранена в библиотеку! 📁');
  };

  const saveCurrentPost = () => {
    if (!currentPost) return;
    setSavedPosts(prev => {
      const exists = prev.findIndex(p => p.id === currentPost.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = currentPost;
        return copy;
      }
      return [currentPost, ...prev];
    });
    showToast('Пост сохранен в библиотеку! 📁');
  };

  const deleteSavedStory = (id: string) => {
    setSavedStories(prev => prev.filter(s => s.id !== id));
    showToast('Сториз удалена из архива');
  };

  const deleteSavedPost = (id: string) => {
    setSavedPosts(prev => prev.filter(p => p.id !== id));
    showToast('Пост удален из архива');
  };

  const scheduleStory = (id: string, dateISO: string) => {
    setSavedStories(prev => prev.map(s => (s.id === id ? { ...s, scheduledDate: dateISO } : s)));
    showToast('Публикация запланирована в контент-плане 📅');
  };

  const schedulePost = (id: string, dateISO: string) => {
    setSavedPosts(prev => prev.map(p => (p.id === id ? { ...p, scheduledDate: dateISO } : p)));
    showToast('Публикация запланирована в контент-плане 📅');
  };

  // Chat with Agent
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: `Привет! Я твой персональный ИИ-агент контента. Мой текущий профиль настроен под нишу «${activePersona.niche}» и тональность «${activePersona.tone}».
Чем займемся сегодня? Могу сгенерировать серию сториз, написать пост для Telegram или Instagram, или набросать 5 вирусных хуков!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await agentChatMessage(
        [...chatMessages, userMsg].map(m => ({ sender: m.sender, text: m.text })),
        text,
        activePersona,
        apiSettings
      );

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'agent',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: res.action
      };
      setChatMessages(prev => [...prev, agentMsg]);
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'agent',
          text: 'Произошла небольшая заминка при обработке. Попробуйте еще раз или проверьте настройки API.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        personas,
        activePersona,
        setActivePersonaId,
        updatePersona,
        createPersona,
        deletePersona,
        resetPersonas,
        currentStoryChain,
        setCurrentStoryChain,
        currentPost,
        setCurrentPost,
        savedStories,
        savedPosts,
        saveCurrentStory,
        saveCurrentPost,
        deleteSavedStory,
        deleteSavedPost,
        scheduleStory,
        schedulePost,
        activeTab,
        setActiveTab,
        isPersonaModalOpen,
        setIsPersonaModalOpen,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
        apiSettings,
        setApiSettings,
        chatMessages,
        sendChatMessage,
        isChatLoading,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
