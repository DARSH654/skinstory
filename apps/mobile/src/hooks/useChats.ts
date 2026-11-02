import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHATS_INDEX_KEY = 'ss_chats_index_v1';
export const CHAT_MESSAGES_PREFIX = 'ss_chat_msgs_';

export interface ChatMeta {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  createdAt: number;
  isPinned?: boolean;
}

// Sorting helper: pinned chats first (sorted by updatedAt desc), then unpinned (sorted by updatedAt desc)
function sortChats(list: ChatMeta[]): ChatMeta[] {
  return [...list].sort((a, b) => {
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
      return a.isPinned ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });
}

export function useChats() {
  const [chats, setChats] = useState<ChatMeta[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the index on mount
  useEffect(() => {
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(CHATS_INDEX_KEY);
        if (raw) {
          const parsed: ChatMeta[] = JSON.parse(raw);
          setChats(sortChats(parsed));
        }
      } catch {
        // ignore
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  // Persist index whenever it changes (after initial load)
  const saveIndex = useCallback(async (updated: ChatMeta[]) => {
    try {
      await AsyncStorage.setItem(CHATS_INDEX_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // Upsert a chat in the index (create or update title/lastMessage/updatedAt)
  const upsertChat = useCallback(
    async (meta: ChatMeta) => {
      setChats((prev) => {
        const existsIdx = prev.findIndex((c) => c.id === meta.id);
        let next: ChatMeta[];
        if (existsIdx >= 0) {
          const existing = prev[existsIdx];
          next = prev.map((c) =>
            c.id === meta.id ? { ...existing, ...meta, isPinned: meta.isPinned ?? existing.isPinned } : c
          );
        } else {
          next = [meta, ...prev];
        }
        next = sortChats(next);
        saveIndex(next);
        return next;
      });
    },
    [saveIndex]
  );

  // Toggle pinned state for a chat
  const togglePinChat = useCallback(
    async (chatId: string) => {
      setChats((prev) => {
        const next = prev.map((c) =>
          c.id === chatId ? { ...c, isPinned: !c.isPinned } : c
        );
        const sorted = sortChats(next);
        saveIndex(sorted);
        return sorted;
      });
    },
    [saveIndex]
  );

  // Delete a chat from the index AND its message storage
  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        await AsyncStorage.removeItem(`${CHAT_MESSAGES_PREFIX}${chatId}`);
      } catch {
        // ignore
      }
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== chatId);
        saveIndex(next);
        return next;
      });
    },
    [saveIndex]
  );

  // Refresh from storage (useful when returning from a chat screen)
  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CHATS_INDEX_KEY);
      if (raw) {
        const parsed: ChatMeta[] = JSON.parse(raw);
        setChats(sortChats(parsed));
      }
    } catch {
      // ignore
    }
  }, []);

  return { chats, isLoaded, upsertChat, togglePinChat, deleteChat, refresh };
}
