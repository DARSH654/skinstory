import { useState, useMemo, useCallback } from 'react';
import { Message } from '../types';

export function useChatMessages() {
  // Store all messages created in the conversation tree
  const [messagesMap, setMessagesMap] = useState<Record<string, Message>>({});
  // Current leaf message id representing the active branch tail
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  // Track which message is currently being regenerated (or null if new message at bottom)
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);

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
    const content = (textToSend || inputText).trim();
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

    // Simulate smart AI skincare response
    setTimeout(() => {
      let aiResponseText =
        'Based on your recent scan metrics, keeping your skin barrier balanced is key. Maintaining steady hydration and gentle cleansing will help your skin repair effectively.';

      const lower = content.toLowerCase();
      if (lower.includes('hydration') || lower.includes('dry')) {
        aiResponseText =
          'Your moisture barrier thrives on gentle humectants. Incorporate hyaluronic acid on damp skin followed by a ceramide-rich moisturizer to seal in hydration throughout the day.';
      } else if (lower.includes('routine') || lower.includes('order')) {
        aiResponseText =
          'Ideal skincare order: Cleanser -> Toner/Essence -> Targeted Treatment (Serums) -> Moisturizer -> Sunscreen (AM). Let each layer absorb for 30–60 seconds.';
      } else if (lower.includes('scan') || lower.includes('compare') || lower.includes('score')) {
        aiResponseText =
          'Comparing your latest scans indicates steady recovery around the cheek and forehead zones. Continue tracking daily to catch barrier sensitivity early.';
      }

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
      setRegeneratingMessageId(null);
    }, 1100);
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

    // 3. Complete generation after delay and fill in final text
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      let regeneratedVariation =
        'To optimize your current skin results, ensure consistent barrier protection and gentle application. Focus on lightweight formulas and adequate SPF during daylight.';

      if (lower.includes('hydration') || lower.includes('dry')) {
        regeneratedVariation =
          'Alternative hydration tip: Layer a soothing hydrating mist between serum and moisturizer. Look for glycerin, panthenol, and beta-glucan for deep, long-lasting barrier resilience.';
      } else if (lower.includes('routine') || lower.includes('order')) {
        regeneratedVariation =
          'Simplified routine option: Keep it minimalist with a low-pH cleanser, barrier repairing lotion, and daily broad-spectrum SPF 50. Less is often more when repairing sensitivity.';
      } else if (lower.includes('scan') || lower.includes('compare') || lower.includes('score')) {
        regeneratedVariation =
          'Looking closer at your skin mapping, redness and oil balance show progressive improvement. Consistency over 14 days will yield the clearest trend.';
      }

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
      setRegeneratingMessageId(null);
    }, 1100);
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
    regeneratingMessageId,
    handleSendMessage,
    regenerateAiResponse,
    selectVersion,
  };
}
