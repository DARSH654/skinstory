import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/components/chat/types';
import { fetchGeminiChatResponse } from '@/services/geminiChat';
import { CHAT_MESSAGES_PREFIX, CHATS_INDEX_KEY, ChatMeta } from '@/hooks/useChats';

export interface ActiveGenerationState {
  chatId: string;
  userMsgId: string;
  promptText: string;
  isRegenerating: boolean;
  targetAiMsgId?: string;
  controller: AbortController;
  startTime: number;
}

type GenerationListener = (chatId: string) => void;

class ChatGenerationManager {
  private activeGenerations: Map<string, ActiveGenerationState> = new Map();
  private listeners: Set<GenerationListener> = new Set();

  /**
   * Subscribe to generation events (start, complete, stop)
   */
  public subscribe(listener: GenerationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(chatId: string) {
    this.listeners.forEach((listener) => {
      try {
        listener(chatId);
      } catch {
        // Safe notify
      }
    });
  }

  /**
   * Checks if a chat is currently waiting for a Gemini response in the background
   */
  public isChatGenerating(chatId: string): boolean {
    return this.activeGenerations.has(chatId);
  }

  /**
   * Gets the active generation state for a chat
   */
  public getActiveGeneration(chatId: string): ActiveGenerationState | undefined {
    return this.activeGenerations.get(chatId);
  }

  /**
   * Starts a background generation task for a newly sent message.
   * Continues running and saves directly to AsyncStorage even if the user leaves the screen!
   */
  public startSendMessageGeneration({
    chatId,
    userMsgId,
    content,
    history,
    chatTitle,
    onFinishInForeground,
  }: {
    chatId: string;
    userMsgId: string;
    content: string;
    history: Array<{ sender: 'user' | 'ai'; text: string }>;
    chatTitle: string;
    onFinishInForeground?: (aiMsg: Message) => void;
  }): AbortController {
    // If an existing generation is running for this chat, abort it first
    this.stopGeneration(chatId);

    const controller = new AbortController();
    const state: ActiveGenerationState = {
      chatId,
      userMsgId,
      promptText: content,
      isRegenerating: false,
      controller,
      startTime: Date.now(),
    };

    this.activeGenerations.set(chatId, state);
    this.notify(chatId);

    (async () => {
      let aiResponseText = '';
      try {
        aiResponseText = await fetchGeminiChatResponse(history, content, controller.signal);
      } catch (err: any) {
        if (controller.signal.aborted) {
          this.activeGenerations.delete(chatId);
          this.notify(chatId);
          return;
        }

        // Network or API failure: persist error state in storage
        await this.handleGenerationError(chatId, userMsgId, 'Connection issue. Please check your internet connection.');
        this.activeGenerations.delete(chatId);
        this.notify(chatId);
        return;
      }

      if (controller.signal.aborted) {
        this.activeGenerations.delete(chatId);
        this.notify(chatId);
        return;
      }

      // Success: construct final AI message
      const aiNow = Date.now();
      const aiMsgId = `ai-${aiNow}`;
      const aiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(aiNow).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: aiNow,
        parentId: userMsgId,
        childrenIds: [],
        versions: [aiResponseText],
        activeVersionIndex: 0,
        animateTypewriter: true,
      };

      // 1. Save directly to AsyncStorage so it is never lost if user is away
      await this.saveCompletedMessageToStorage(chatId, userMsgId, aiMsg, chatTitle);

      // 2. If screen is open and listening, give it the completed message directly
      if (onFinishInForeground) {
        onFinishInForeground(aiMsg);
      }

      this.activeGenerations.delete(chatId);
      this.notify(chatId);
    })();

    return controller;
  }

  /**
   * Starts a background generation task for retrying/regenerating an existing AI message.
   */
  public startRegenerateGeneration({
    chatId,
    targetAiMsgId,
    promptText,
    history,
    chatTitle,
    onFinishInForeground,
  }: {
    chatId: string;
    targetAiMsgId: string;
    promptText: string;
    history: Array<{ sender: 'user' | 'ai'; text: string }>;
    chatTitle: string;
    onFinishInForeground?: (updatedMsg: Message) => void;
  }): AbortController {
    this.stopGeneration(chatId);

    const controller = new AbortController();
    const state: ActiveGenerationState = {
      chatId,
      userMsgId: '',
      promptText,
      isRegenerating: true,
      targetAiMsgId,
      controller,
      startTime: Date.now(),
    };

    this.activeGenerations.set(chatId, state);
    this.notify(chatId);

    (async () => {
      let regeneratedVariation = '';
      try {
        regeneratedVariation = await fetchGeminiChatResponse(history, promptText, controller.signal);
      } catch (err: any) {
        if (controller.signal.aborted) {
          this.activeGenerations.delete(chatId);
          this.notify(chatId);
          return;
        }

        await this.handleRegenerateError(chatId, targetAiMsgId);
        this.activeGenerations.delete(chatId);
        this.notify(chatId);
        return;
      }

      if (controller.signal.aborted) {
        this.activeGenerations.delete(chatId);
        this.notify(chatId);
        return;
      }

      // Update existing message in storage
      const storageKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
      let updatedTarget: Message | null = null;
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const map = parsed.messagesMap || {};
          const currentTarget = map[targetAiMsgId];
          if (currentTarget) {
            updatedTarget = {
              ...currentTarget,
              text: regeneratedVariation,
              versions: [regeneratedVariation],
              animateTypewriter: true,
              interrupted: false,
              error: null,
            };
            map[targetAiMsgId] = updatedTarget;
            await AsyncStorage.setItem(storageKey, JSON.stringify({ ...parsed, messagesMap: map }));
          }
        }
      } catch {
        // Safe storage save
      }

      await this.updateChatIndexSnippet(chatId, regeneratedVariation, Date.now(), chatTitle);

      if (onFinishInForeground && updatedTarget) {
        onFinishInForeground(updatedTarget);
      }

      this.activeGenerations.delete(chatId);
      this.notify(chatId);
    })();

    return controller;
  }

  /**
   * Explicitly stops generation for a chat (called by user tapping Stop).
   */
  public stopGeneration(chatId: string) {
    const active = this.activeGenerations.get(chatId);
    if (active) {
      active.controller.abort();
      this.activeGenerations.delete(chatId);
      this.notify(chatId);
    }
  }

  private async saveCompletedMessageToStorage(
    chatId: string,
    userMsgId: string,
    aiMsg: Message,
    chatTitle: string
  ) {
    const storageKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      let messagesMap: Record<string, Message> = {};
      if (stored) {
        const parsed = JSON.parse(stored);
        messagesMap = parsed.messagesMap || {};
      }

      // Link to parent
      messagesMap[aiMsg.id] = aiMsg;
      if (messagesMap[userMsgId]) {
        messagesMap[userMsgId] = {
          ...messagesMap[userMsgId],
          childrenIds: [...(messagesMap[userMsgId].childrenIds || []), aiMsg.id],
        };
      }

      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          messagesMap,
          currentLeafId: aiMsg.id,
        })
      );

      await this.updateChatIndexSnippet(chatId, aiMsg.text, aiMsg.createdAt, chatTitle);
    } catch {
      // Safe fallback
    }
  }

  private async handleGenerationError(chatId: string, userMsgId: string, errorText: string) {
    const storageKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const messagesMap: Record<string, Message> = parsed.messagesMap || {};

      const aiNow = Date.now();
      const aiMsgId = `ai-${aiNow}`;
      const errAiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp: new Date(aiNow).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: aiNow,
        parentId: userMsgId,
        childrenIds: [],
        error: errorText,
      };

      messagesMap[aiMsgId] = errAiMsg;
      if (messagesMap[userMsgId]) {
        messagesMap[userMsgId] = {
          ...messagesMap[userMsgId],
          childrenIds: [...(messagesMap[userMsgId].childrenIds || []), aiMsgId],
        };
      }

      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          messagesMap,
          currentLeafId: aiMsgId,
        })
      );
    } catch {
      // Safe error save
    }
  }

  private async handleRegenerateError(chatId: string, targetAiMsgId: string) {
    const storageKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const messagesMap: Record<string, Message> = parsed.messagesMap || {};
      const target = messagesMap[targetAiMsgId];
      if (target) {
        messagesMap[targetAiMsgId] = {
          ...target,
          text: target.versions?.[0] || '',
          animateTypewriter: false,
          interrupted: true,
        };
        await AsyncStorage.setItem(storageKey, JSON.stringify({ ...parsed, messagesMap }));
      }
    } catch {
      // Safe error save
    }
  }

  private async updateChatIndexSnippet(
    chatId: string,
    lastMessage: string,
    updatedAt: number,
    chatTitle: string
  ) {
    try {
      const raw = await AsyncStorage.getItem(CHATS_INDEX_KEY);
      let list: ChatMeta[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((c) => c.id === chatId);
      const snippet = lastMessage.slice(0, 80);

      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          lastMessage: snippet,
          updatedAt,
        };
      } else {
        list.unshift({
          id: chatId,
          title: chatTitle || 'Untitled Chat',
          lastMessage: snippet,
          updatedAt,
          createdAt: parseInt(chatId.replace('chat-', ''), 10) || updatedAt,
        });
      }

      await AsyncStorage.setItem(CHATS_INDEX_KEY, JSON.stringify(list));
    } catch {
      // Safe index update
    }
  }
}

export const chatGenerationManager = new ChatGenerationManager();
