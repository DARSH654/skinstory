import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';
import { CHAT_MESSAGES_PREFIX } from '@/hooks/useChats';
import { chatGenerationManager } from '@/services/chatGenerationManager';

interface UseChatMessagesOptions {
  chatId: string;
  chatTitle?: string;
  // Called whenever the chat gets a new message (so caller can update the index)
  onChatUpdated?: (lastMessage: string, updatedAt: number) => void;
}

export function useChatMessages({ chatId, chatTitle = 'Untitled Chat', onChatUpdated }: UseChatMessagesOptions) {
  const storageKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;

  // Store all messages created in the conversation tree
  const [messagesMap, setMessagesMap] = useState<Record<string, Message>>({});
  // Current leaf message id representing the active branch tail
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  // Track message currently streaming its typewriter effect
  const [activeStreamingMessageId, setActiveStreamingMessageId] = useState<string | null>(null);
  const activeStreamingMessageIdRef = useRef<string | null>(null);
  // Track whether the latest generation was handled directly in foreground
  const handledInForegroundRef = useRef(false);
  // Prevent duplicate competing AsyncStorage writes when chatGenerationManager already saved the response
  const skipNextStorageSaveRef = useRef(false);
  // Track which message is currently being regenerated (or null if new message at bottom)
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  // Track the active user prompt and message id currently awaiting an AI response
  const activeUserPromptRef = useRef<{ id: string; text: string; parentId: string | null; sentTime: number } | null>(null);
  // Track initial load to prevent overwriting stored data with empty initial state
  const isLoadedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load chat messages from AsyncStorage on mount or when storage updates
  const reloadFromStorage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.messagesMap && typeof parsed.messagesMap === 'object') {
          const restoredMap: Record<string, Message> = {};
          const isActivelyGenerating = chatGenerationManager.isChatGenerating(chatId);

          Object.keys(parsed.messagesMap).forEach((id) => {
            const msg = parsed.messagesMap[id];
            // If this message is currently animating its typewriter in the active foreground view, keep it animating!
            const isCurrentlyStreaming = id === activeStreamingMessageIdRef.current;

            // If an AI message was saved with empty text or '...' and NO active generation is running for it,
            // it was orphaned/interrupted (e.g. app killed, network drop, away). Cleanly mark as interrupted!
            if (msg.sender === 'ai' && (!msg.text || msg.text === '...') && !msg.interrupted && !msg.error && !isActivelyGenerating) {
              restoredMap[id] = {
                ...msg,
                text: '',
                animateTypewriter: false,
                interrupted: true,
              };
            } else {
              restoredMap[id] = {
                ...msg,
                animateTypewriter: isCurrentlyStreaming ? true : false,
              };
            }
          });
          setMessagesMap(restoredMap);
          if (parsed.currentLeafId) {
            setCurrentLeafId(parsed.currentLeafId);
          }
        }
      }
    } catch {
      // Failed to load stored chat state
    } finally {
      isLoadedRef.current = true;
      setIsLoaded(true);
    }
  }, [chatId, storageKey]);

  useEffect(() => {
    // Reset state when chatId changes
    setMessagesMap({});
    setCurrentLeafId(null);
    setInputText('');
    activeStreamingMessageIdRef.current = null;
    setActiveStreamingMessageId(null);
    handledInForegroundRef.current = false;
    isLoadedRef.current = false;
    setIsLoaded(false);

    // Check if background manager is already generating for this chat
    const activeGen = chatGenerationManager.getActiveGeneration(chatId);
    if (activeGen) {
      setIsBotThinking(true);
      if (activeGen.isRegenerating && activeGen.targetAiMsgId) {
        setRegeneratingMessageId(activeGen.targetAiMsgId);
      } else {
        setRegeneratingMessageId(null);
        activeUserPromptRef.current = {
          id: activeGen.userMsgId,
          text: activeGen.promptText,
          parentId: null,
          sentTime: activeGen.startTime,
        };
      }
    } else {
      setIsBotThinking(false);
      setRegeneratingMessageId(null);
    }

    reloadFromStorage();

    // Subscribe to background manager updates (for completions that finish while away)
    const unsubscribe = chatGenerationManager.subscribe((updatedChatId) => {
      if (updatedChatId === chatId) {
        const gen = chatGenerationManager.getActiveGeneration(chatId);
        if (!gen) {
          setIsBotThinking(false);
          setRegeneratingMessageId(null);
          // If this completion was already handled directly in the foreground, do NOT reload from storage
          // to avoid disrupting the active typewriter animation.
          if (handledInForegroundRef.current) {
            handledInForegroundRef.current = false;
            return;
          }
          reloadFromStorage();
        } else {
          setIsBotThinking(true);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, storageKey, reloadFromStorage]);

  // 2. Persist chat messages to AsyncStorage on change (only after initial load)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (skipNextStorageSaveRef.current) {
      // chatGenerationManager already saved this message to disk atomically.
      skipNextStorageSaveRef.current = false;
      return;
    }
    try {
      AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          messagesMap,
          currentLeafId,
        })
      ).catch(() => {});
    } catch {
      // Failed to save chat state
    }
  }, [messagesMap, currentLeafId, storageKey]);

  // isGenerating is TRUE while the bot is either fetching from API OR typing onto screen
  const isGenerating = isBotThinking || activeStreamingMessageId !== null;

  const stopGeneration = useCallback(() => {
    console.log('[DEBUG_STOP_CALLED]', {
      chatId,
      activeStreamingMessageId,
      regeneratingMessageId,
      isBotThinking,
      hasActiveUserPrompt: !!activeUserPromptRef.current,
    });

    // 1. Stop background generation manager for this chat
    chatGenerationManager.stopGeneration(chatId);

    // 2. If a message is currently streaming, freeze it at its current state with interrupted banner
    if (activeStreamingMessageId) {
      console.log('[DEBUG_STOP_BRANCH] Branch 2: streaming message freeze', activeStreamingMessageId);
      setMessagesMap((prev) => {
        const currentMsg = prev[activeStreamingMessageId];
        if (currentMsg) {
          return {
            ...prev,
            [activeStreamingMessageId]: {
              ...currentMsg,
              animateTypewriter: false,
              interrupted: true,
            },
          };
        }
        return prev;
      });
    } else if (regeneratingMessageId) {
      console.log('[DEBUG_STOP_BRANCH] Branch 3: regeneratingMessageId', regeneratingMessageId);
      // 3. User stopped while retrying/regenerating an AI message: keep message, set text to '', interrupted to true
      setMessagesMap((prev) => {
        const currentMsg = prev[regeneratingMessageId];
        console.log('[DEBUG_STOP_REGEN_PREV_MSG]', { exists: !!currentMsg, text: currentMsg?.text });
        if (currentMsg) {
          return {
            ...prev,
            [regeneratingMessageId]: {
              ...currentMsg,
              text: '',
              animateTypewriter: false,
              interrupted: true,
              error: null,
            },
          };
        }
        return prev;
      });
    } else if (isBotThinking || chatGenerationManager.isChatGenerating(chatId)) {
      // 4. User stopped while AI was thinking: create AI bubble with interrupted banner & Try again button
      const aiNow = Date.now();
      const aiMsgId = `ai-${aiNow}`;
      const parentId = activeUserPromptRef.current?.id || currentLeafId;

      const interruptedAiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp: new Date(aiNow).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: aiNow,
        parentId: parentId,
        childrenIds: [],
        interrupted: true,
      };

      setMessagesMap((prev) => {
        const updated = { ...prev, [aiMsgId]: interruptedAiMsg };
        if (parentId && updated[parentId]) {
          updated[parentId] = {
            ...updated[parentId],
            childrenIds: [...(updated[parentId].childrenIds || []), aiMsgId],
          };
        }
        return updated;
      });
      setCurrentLeafId(aiMsgId);
    }

    activeUserPromptRef.current = null;
    activeStreamingMessageIdRef.current = null;
    setIsBotThinking(false);
    setActiveStreamingMessageId(null);
    setRegeneratingMessageId(null);
  }, [chatId, activeStreamingMessageId, isBotThinking, regeneratingMessageId]);

  const onTypewriterComplete = useCallback((messageId: string) => {
    activeStreamingMessageIdRef.current = null;
    setActiveStreamingMessageId((curr) => (curr === messageId ? null : curr));
    skipNextStorageSaveRef.current = true;
    setMessagesMap((prev) => {
      const msg = prev[messageId];
      if (!msg) return prev;
      return {
        ...prev,
        [messageId]: {
          ...msg,
          animateTypewriter: false,
        },
      };
    });
  }, []);

  // Compute active linear messages from root to current leaf
  const messages = useMemo(() => {
    if (!currentLeafId || !messagesMap[currentLeafId]) {
      return Object.values(messagesMap).sort((a, b) => a.createdAt - b.createdAt);
    }
    const path: Message[] = [];
    let curr: string | null = currentLeafId;
    const visited = new Set<string>();

    while (curr && messagesMap[curr] && !visited.has(curr)) {
      visited.add(curr);
      path.unshift(messagesMap[curr]);
      curr = messagesMap[curr].parentId || null;
    }
    return path;
  }, [messagesMap, currentLeafId]);

  // Compatibility helper if components need direct setMessages (e.g., delete)
  const setMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
    setMessagesMap((prevMap) => {
      let currentList: Message[] = [];
      if (currentLeafId && prevMap[currentLeafId]) {
        let curr: string | null = currentLeafId;
        const visited = new Set<string>();
        while (curr && prevMap[curr] && !visited.has(curr)) {
          visited.add(curr);
          currentList.unshift(prevMap[curr]);
          curr = prevMap[curr].parentId || null;
        }
      } else {
        currentList = Object.values(prevMap).sort((a, b) => a.createdAt - b.createdAt);
      }

      const nextList = typeof updater === 'function' ? updater(currentList) : updater;
      const nextMap: Record<string, Message> = {};
      nextList.forEach((msg) => {
        nextMap[msg.id] = msg;
      });

      const newTail = nextList.length > 0 ? nextList[nextList.length - 1].id : null;
      setCurrentLeafId(newTail);

      return nextMap;
    });
  }, [currentLeafId]);

  const handleSendMessage = (textToSend?: string) => {
    const rawContent = textToSend ?? inputText;
    const content = rawContent.trim();
    if (!content || isBotThinking) return;

    const now = Date.now();
    const userMsgId = `user-${now}`;
    const parent = currentLeafId;

    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: content,
      timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now,
      parentId: parent,
      childrenIds: [],
    };

    setMessagesMap((prev) => {
      const updated = { ...prev, [userMsgId]: userMsg };
      if (parent && updated[parent]) {
        updated[parent] = {
          ...updated[parent],
          childrenIds: [...(updated[parent].childrenIds || []), userMsgId],
        };
      }
      return updated;
    });

    setCurrentLeafId(userMsgId);
    setInputText('');
    setIsBotThinking(true);
    setRegeneratingMessageId(null);
    activeUserPromptRef.current = { id: userMsgId, text: content, parentId: parent, sentTime: now };

    // Notify caller about the user message (updates the chat list index)
    onChatUpdated?.(content, now);

    const history = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    // Launch background generation via manager (continues even if user navigates back!)
    chatGenerationManager.startSendMessageGeneration({
      chatId,
      userMsgId,
      content,
      history,
      chatTitle,
      onFinishInForeground: (aiMsg) => {
        skipNextStorageSaveRef.current = true;
        handledInForegroundRef.current = true;
        activeUserPromptRef.current = null;
        setMessagesMap((prev) => {
          const updated = { ...prev, [aiMsg.id]: aiMsg };
          if (updated[userMsgId]) {
            updated[userMsgId] = {
              ...updated[userMsgId],
              childrenIds: [...(updated[userMsgId].childrenIds || []), aiMsg.id],
            };
          }
          return updated;
        });
        setCurrentLeafId(aiMsg.id);
        setIsBotThinking(false);
        activeStreamingMessageIdRef.current = aiMsg.id;
        setActiveStreamingMessageId(aiMsg.id);
        setRegeneratingMessageId(null);
        onChatUpdated?.(aiMsg.text, aiMsg.createdAt);
      },
    });
  };

  const regenerateAiResponse = (targetAiMessage: Message, promptText: string) => {
    if (isBotThinking) return;

    const targetMsgId = targetAiMessage.id;

    // Set loading placeholder on the existing message directly & clear interrupted/error states
    setMessagesMap((prev) => {
      const existing = prev[targetMsgId];
      if (!existing) return prev;
      return {
        ...prev,
        [targetMsgId]: {
          ...existing,
          text: '...',
          animateTypewriter: false,
          interrupted: false,
          error: null,
        },
      };
    });

    setIsBotThinking(true);
    setRegeneratingMessageId(targetMsgId);

    const history = messages
      .filter((m) => m.id !== targetMsgId)
      .map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

    // Launch background regenerate via manager
    chatGenerationManager.startRegenerateGeneration({
      chatId,
      targetAiMsgId: targetMsgId,
      promptText,
      history,
      chatTitle,
      onFinishInForeground: (updatedMsg) => {
        skipNextStorageSaveRef.current = true;
        handledInForegroundRef.current = true;
        setMessagesMap((prev) => {
          const target = prev[targetMsgId];
          if (!target) return prev;
          return {
            ...prev,
            [targetMsgId]: updatedMsg,
          };
        });
        setIsBotThinking(false);
        activeStreamingMessageIdRef.current = targetMsgId;
        setActiveStreamingMessageId(targetMsgId);
        setRegeneratingMessageId(null);
        onChatUpdated?.(updatedMsg.text, Date.now());
      },
    });
  };

  // Switch versions / branches at a specific message
  const selectVersion = (targetMessage: Message, versionIndex: number) => {
    setMessagesMap((prev) => {
      const parentId = targetMessage.parentId;
      if (!parentId || !prev[parentId]) {
        // Fallback: just update message in place
        return {
          ...prev,
          [targetMessage.id]: {
            ...prev[targetMessage.id],
            text: prev[targetMessage.id]?.versions?.[versionIndex] || targetMessage.text,
            activeVersionIndex: versionIndex,
          },
        };
      }

      // Sibling AI messages under this parent
      const siblingIds = prev[parentId].childrenIds || [];
      const targetChildId = siblingIds[versionIndex] || targetMessage.id;

      // Find the deepest descendant on this branch to set as leaf
      let leafId = targetChildId;
      const visited = new Set<string>();
      while (leafId && prev[leafId] && !visited.has(leafId)) {
        visited.add(leafId);
        const children = prev[leafId].childrenIds || [];
        if (children.length > 0) {
          leafId = children[children.length - 1]; // Pick latest child in this branch
        } else {
          break;
        }
      }

      setCurrentLeafId(leafId);

      // Update activeVersionIndex on all siblings in this group
      const updated = { ...prev };
      siblingIds.forEach((sId) => {
        if (updated[sId]) {
          updated[sId] = {
            ...updated[sId],
            activeVersionIndex: versionIndex,
          };
        }
      });

      return updated;
    });
  };

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    isBotThinking,
    isGenerating,
    activeStreamingMessageId,
    regeneratingMessageId,
    handleSendMessage,
    regenerateAiResponse,
    selectVersion,
    stopGeneration,
    onTypewriterComplete,
    isLoaded,
  };
}
