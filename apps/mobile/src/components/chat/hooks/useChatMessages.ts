import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';
import { fetchGeminiChatResponse } from '@/services/geminiChat';

const STORAGE_KEY = 'ss_local_chat_state_v1';

export function useChatMessages() {
  // Store all messages created in the conversation tree
  const [messagesMap, setMessagesMap] = useState<Record<string, Message>>({});
  // Current leaf message id representing the active branch tail
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  // Track message currently streaming its typewriter effect
  const [activeStreamingMessageId, setActiveStreamingMessageId] = useState<string | null>(null);
  // Track which message is currently being regenerated (or null if new message at bottom)
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  // Abort controller to cancel ongoing network request immediately
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track initial load to prevent overwriting stored data with empty initial state
  const isLoadedRef = useRef(false);

  // 1. Load chat messages from AsyncStorage on mount
  useEffect(() => {
    async function loadStoredChat() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.messagesMap && typeof parsed.messagesMap === 'object') {
            // Guarantee animateTypewriter is false for all restored historical messages
            const restoredMap: Record<string, Message> = {};
            Object.keys(parsed.messagesMap).forEach((id) => {
              const msg = parsed.messagesMap[id];
              restoredMap[id] = {
                ...msg,
                animateTypewriter: false,
              };
            });
            setMessagesMap(restoredMap);
            if (parsed.currentLeafId) {
              setCurrentLeafId(parsed.currentLeafId);
            }
          }
        }
      } catch (err) {
        console.warn('[useChatMessages] Failed to load local chat state:', err);
      } finally {
        isLoadedRef.current = true;
      }
    }
    loadStoredChat();
  }, []);

  // 2. Persist chat messages to AsyncStorage on change (only after initial load)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      // If empty, we can clean up storage or save empty state
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messagesMap,
          currentLeafId,
        })
      ).catch((err) => {
        console.warn('[useChatMessages] Failed to save local chat state:', err);
      });
    } catch (err) {
      console.warn('[useChatMessages] Error saving chat state:', err);
    }
  }, [messagesMap, currentLeafId]);

  // isGenerating is TRUE while the bot is either fetching from API OR typing onto screen
  const isGenerating = isBotThinking || activeStreamingMessageId !== null;

  const stopGeneration = useCallback(() => {
    // 1. Abort network request if pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // 2. If a message is currently streaming, freeze it at its current state
    if (activeStreamingMessageId) {
      setMessagesMap((prev) => {
        const currentMsg = prev[activeStreamingMessageId];
        if (currentMsg) {
          return {
            ...prev,
            [activeStreamingMessageId]: {
              ...currentMsg,
              animateTypewriter: false,
            },
          };
        }
        return prev;
      });
    }
    setIsBotThinking(false);
    setActiveStreamingMessageId(null);
    setRegeneratingMessageId(null);
  }, [activeStreamingMessageId]);

  const onTypewriterComplete = useCallback((messageId: string, finalText?: string) => {
    if (finalText !== undefined) {
      setMessagesMap((prev) => {
        const msg = prev[messageId];
        if (!msg) return prev;
        const activeIdx = msg.activeVersionIndex ?? 0;
        const updatedVersions = [...(msg.versions || [msg.text])];
        updatedVersions[activeIdx] = finalText;
        return {
          ...prev,
          [messageId]: {
            ...msg,
            text: finalText,
            versions: updatedVersions,
            animateTypewriter: false,
          },
        };
      });
    }
    setActiveStreamingMessageId((curr) => (curr === messageId ? null : curr));
  }, []);

  // Compute active linear messages from root to current leaf
  const messages = useMemo(() => {
    if (!currentLeafId || !messagesMap[currentLeafId]) {
      // If no valid leaf, but we have messages, fallback to sorted order
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
      // Calculate current linear list
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

      // Update current leaf id to last message in nextList
      const newTail = nextList.length > 0 ? nextList[nextList.length - 1].id : null;
      setCurrentLeafId(newTail);

      return nextMap;
    });
  }, [currentLeafId]);

  const handleSendMessage = (textToSend?: string) => {
    const rawContent = textToSend ?? inputText;
    const content = rawContent.trim();
    console.log('[useChatMessages] handleSendMessage invoked:', {
      rawContent,
      trimmedContent: content,
      rawLength: rawContent?.length,
      trimmedLength: content?.length,
      lastCharacters: content ? content.slice(-10) : '',
    });
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

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Call real Gemini AI model
    (async () => {
      let aiResponseText = '';
      try {
        const history = messages.map((m) => ({
          sender: m.sender,
          text: m.text,
        }));
        console.log('[useChatMessages] Sending to Gemini API with history count:', history.length);
        aiResponseText = await fetchGeminiChatResponse(history, content, controller.signal);
        console.log('[useChatMessages] Received Gemini response:', {
          length: aiResponseText?.length,
          snippet: aiResponseText?.slice(0, 50),
          tail: aiResponseText ? aiResponseText.slice(-30) : '',
        });
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          console.log('[Chat] Generation aborted by user.');
          return;
        }
        console.warn('[Chat] Gemini generation failed:', err);
        aiResponseText =
          'Based on your skin profile, keeping your skin barrier balanced is key. Maintaining steady hydration and gentle cleansing will help your skin repair effectively.';
      }

      if (controller.signal.aborted) return;

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

      setMessagesMap((prev) => {
        const updated = { ...prev, [aiMsgId]: aiMsg };
        if (updated[userMsgId]) {
          updated[userMsgId] = {
            ...updated[userMsgId],
            childrenIds: [...(updated[userMsgId].childrenIds || []), aiMsgId],
          };
        }
        return updated;
      });

      setCurrentLeafId(aiMsgId);
      setIsBotThinking(false);
      setActiveStreamingMessageId(aiMsgId);
      setRegeneratingMessageId(null);
      abortControllerRef.current = null;
    })();
  };

  const regenerateAiResponse = (targetAiMessage: Message, promptText: string) => {
    if (isBotThinking) return;

    const aiNow = Date.now();
    const newAiMsgId = `ai-${aiNow}`;

    // 1. Immediately create the new branch node with placeholder/loading state
    setMessagesMap((prev) => {
      const originalMsg = prev[targetAiMessage.id] || targetAiMessage;
      const existingVersions = originalMsg.versions && originalMsg.versions.length > 0
        ? [...originalMsg.versions]
        : [originalMsg.text];
      // Append an empty/loading version placeholder
      const newVersions = [...existingVersions, '...'];
      const newVersionIndex = newVersions.length - 1;

      const placeholderAiMsg: Message = {
        id: newAiMsgId,
        sender: 'ai',
        text: '', // Empty text while generating
        timestamp: new Date(aiNow).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: aiNow,
        parentId: originalMsg.parentId,
        childrenIds: [],
        versions: newVersions,
        activeVersionIndex: newVersionIndex,
      };

      const updated = { ...prev, [newAiMsgId]: placeholderAiMsg };

      const parentId = originalMsg.parentId;
      if (parentId && updated[parentId]) {
        const siblings = updated[parentId].childrenIds || [];
        updated[parentId] = {
          ...updated[parentId],
          childrenIds: siblings.includes(newAiMsgId) ? siblings : [...siblings, newAiMsgId],
        };
        updated[parentId].childrenIds?.forEach((sibId) => {
          if (updated[sibId]) {
            updated[sibId] = {
              ...updated[sibId],
              versions: newVersions,
            };
          }
        });
      }

      return updated;
    });

    // 2. Immediately switch the view to the new branch leaf!
    setCurrentLeafId(newAiMsgId);
    setIsBotThinking(true);
    setRegeneratingMessageId(newAiMsgId);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 3. Fetch real Gemini regeneration
    (async () => {
      let regeneratedVariation = '';
      try {
        const history = messages
          .filter((m) => m.id !== targetAiMessage.id && m.id !== newAiMsgId)
          .map((m) => ({
            sender: m.sender,
            text: m.text,
          }));
        regeneratedVariation = await fetchGeminiChatResponse(history, promptText, controller.signal);
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          console.log('[Chat] Regeneration aborted by user.');
          return;
        }
        console.warn('[Chat] Gemini regeneration failed:', err);
        regeneratedVariation =
          'To optimize your current skin results, ensure consistent barrier protection and gentle application. Focus on lightweight formulas and adequate SPF during daylight.';
      }

      if (controller.signal.aborted) return;

      setMessagesMap((prev) => {
        const target = prev[newAiMsgId];
        if (!target) return prev;

        const updatedVersions = (target.versions || []).map((v, i) =>
          i === (target.activeVersionIndex ?? target.versions!.length - 1) ? regeneratedVariation : v
        );

        const updated = {
          ...prev,
          [newAiMsgId]: {
            ...target,
            text: regeneratedVariation,
            versions: updatedVersions,
            animateTypewriter: true,
          },
        };

        const parentId = target.parentId;
        if (parentId && updated[parentId]) {
          updated[parentId].childrenIds?.forEach((sibId) => {
            if (updated[sibId]) {
              updated[sibId] = {
                ...updated[sibId],
                versions: updatedVersions,
              };
            }
          });
        }

        return updated;
      });

      setIsBotThinking(false);
      setActiveStreamingMessageId(newAiMsgId);
      setRegeneratingMessageId(null);
      abortControllerRef.current = null;
    })();
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
  };
}
