import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChats, ChatMeta } from '@/hooks/useChats';
import ChatActionMenu from '@/components/chat/ChatActionMenu';
import RenameChatModal from '@/components/chat/RenameChatModal';
import DeleteChatConfirmModal from '@/components/chat/DeleteChatConfirmModal';
import { X, Search, Pin, ChevronLeft } from 'lucide-react-native';

export default function SearchChatsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { chats, togglePinChat, deleteChat, upsertChat } = useChats();
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Long-press chat action menu + rename/delete flows
  const [actionMenu, setActionMenu] = useState<{
    visible: boolean;
    chat: ChatMeta | null;
    topOffset: number;
  }>({ visible: false, chat: null, topOffset: 0 });
  const [renameTarget, setRenameTarget] = useState<ChatMeta | null>(null);
  const [tempRenameTitle, setTempRenameTitle] = useState('');
  const [chatToDelete, setChatToDelete] = useState<ChatMeta | null>(null);

  const filteredChats = query.trim().length > 0
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(query.trim().toLowerCase())
      )
    : chats;

  const openChat = (chat: ChatMeta) => {
    Keyboard.dismiss();
    router.replace({
      pathname: '/new-chat',
      params: { chatId: chat.id, title: chat.title || 'Untitled Chat' },
    });
  };

  const handleGoBack = () => {
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      const freshChatId = `chat-${Date.now()}`;
      router.replace({
        pathname: '/new-chat',
        params: { chatId: freshChatId, title: 'Untitled Chat' },
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121212' : '#f5f5f7',
          paddingTop: Math.max(insets.top, 14),
        },
      ]}
    >
      {/* Top row: close (left) + search field (right) */}
      <View style={styles.topRow}>
        <Pressable
          onPress={handleGoBack}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          style={({ pressed }) => [
            styles.closeBtn,
            {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e5e7eb',
            },
            pressed && { opacity: 0.6 },
          ]}
        >
          <ChevronLeft
            size={18}
            color={isDark ? '#e4e4e7' : '#111827'}
            strokeWidth={2.4}
          />
        </Pressable>

        <View
          style={[
            styles.searchPill,
            {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e5e7eb',
            },
          ]}
        >
          <Search size={16} color={isDark ? '#71717a' : '#9ca3af'} strokeWidth={2.2} />
          <TextInput
            ref={searchInputRef}
            defaultValue={query}
            onChangeText={setQuery}
            placeholder="Search chats..."
            placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            style={[styles.searchField, { color: isDark ? '#ffffff' : '#111827' }]}
          />
          <Pressable
            onPress={() => {
              searchInputRef.current?.clear();
              setQuery('');
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
          >
            <X size={16} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      {/* Recents subtitle */}
      <View style={styles.recentsHeaderRow}>
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          Recents
        </Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          filteredChats.length === 0 && styles.emptyScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredChats.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: isDark ? '#71717a' : '#9ca3af' }]}>
              No chats found
            </Text>
          </View>
        ) : (
          filteredChats.map((chat) => (
            <Pressable
              key={chat.id}
              onPress={() => openChat(chat)}
              onLongPress={(e) => {
                setActionMenu({ visible: true, chat, topOffset: e.nativeEvent.pageY });
              }}
              delayLongPress={300}
              style={({ pressed, hovered }) => [
                styles.chatLineItem,
                (pressed || hovered) && {
                  backgroundColor: isDark ? '#27272c' : '#f0f0f2',
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.chatLineText,
                  { color: isDark ? '#e4e4e7' : '#1f2937' },
                ]}
              >
                {chat.title || 'Untitled Chat'}
              </Text>
              {Boolean(chat.isPinned) && (
                <Pin size={15} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2.4} />
              )}
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Long-press chat action menu + rename/delete flows */}
      {actionMenu.chat && (
        <ChatActionMenu
          visible={actionMenu.visible}
          isDark={isDark}
          chatTitle={actionMenu.chat.title || 'Untitled Chat'}
          isPinned={Boolean(actionMenu.chat.isPinned)}
          topOffset={actionMenu.topOffset}
          onClose={() => setActionMenu({ visible: false, chat: null, topOffset: 0 })}
          onTogglePin={() => {
            togglePinChat(actionMenu.chat.id);
          }}
          onRename={() => {
            setRenameTarget(actionMenu.chat);
            setTempRenameTitle(actionMenu.chat.title || 'Untitled Chat');
          }}
          onDelete={() => {
            setChatToDelete(actionMenu.chat);
          }}
        />
      )}

      <RenameChatModal
        isDark={isDark}
        visible={renameTarget !== null}
        currentTitle={renameTarget?.title || 'Untitled Chat'}
        tempTitle={tempRenameTitle}
        onChangeText={(text) => setTempRenameTitle(text.slice(0, 100))}
        onSave={async () => {
          if (renameTarget && tempRenameTitle.trim()) {
            await upsertChat({
              ...renameTarget,
              title: tempRenameTitle.trim(),
              updatedAt: Date.now(),
            });
            setRenameTarget(null);
          }
        }}
        onCancel={() => setRenameTarget(null)}
      />

      <DeleteChatConfirmModal
        visible={chatToDelete !== null}
        isDark={isDark}
        chatTitle={chatToDelete?.title || 'Untitled Chat'}
        onCancel={() => setChatToDelete(null)}
        onConfirm={() => {
          if (chatToDelete) deleteChat(chatToDelete.id);
          setChatToDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  searchField: {
    flex: 1,
    fontSize: 15,
    height: 40,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  clearBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  recentsHeaderRow: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  chatLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 50,
    gap: 8,
  },
  chatLineText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    letterSpacing: -0.2,
    flex: 1,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});