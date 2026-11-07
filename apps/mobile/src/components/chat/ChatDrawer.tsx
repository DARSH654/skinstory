import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/AppText';
import {
  X,
  SquarePen,
  Search,
  Zap,
  Pin,
  Settings,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChats, ChatMeta } from '@/hooks/useChats';
import Logo from '@/components/Logo';
import ChatActionMenu from '@/components/chat/ChatActionMenu';
import RenameChatModal from '@/components/chat/RenameChatModal';
import DeleteChatConfirmModal from '@/components/chat/DeleteChatConfirmModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface ChatDrawerProps {
  isOpen: boolean;
  isDark: boolean;
  chats: ChatMeta[];
  currentChatId?: string;
  drawerAnim?: Animated.Value;
  isInTabs?: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chat: ChatMeta) => void;
  onProfilePress?: () => void;
}

export default function ChatDrawer({
  isOpen,
  isDark,
  chats,
  currentChatId,
  drawerAnim,
  isInTabs = false,
  onClose,
  onNewChat,
  onSelectChat,
  onProfilePress,
}: ChatDrawerProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const router = useRouter();

  const [userName, setUserName] = useState('User');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const { togglePinChat, deleteChat, upsertChat } = useChats();

  // Long-press chat action menu + rename/delete flows
  const [actionMenu, setActionMenu] = useState<{
    visible: boolean;
    chat: ChatMeta | null;
    topOffset: number;
  }>({ visible: false, chat: null, topOffset: 0 });
  const [renameTarget, setRenameTarget] = useState<ChatMeta | null>(null);
  const [tempRenameTitle, setTempRenameTitle] = useState('');
  const [chatToDelete, setChatToDelete] = useState<ChatMeta | null>(null);

  // Swipe left to close gesture — tracks finger in real-time (Gemini-level sensitivity)
  const closePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // High-sensitivity horizontal swipe detection anywhere on the drawer
        return (
          gestureState.dx < -4 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (drawerAnim) {
          const progress = Math.min(1, Math.max(0, 1 + gestureState.dx / screenWidth));
          drawerAnim.setValue(progress);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const progress = 1 + gestureState.dx / screenWidth;
        const velocity = gestureState.vx;
        // Closes on 50% drag OR a light, quick flick left (vx < -0.25) or slight intentional swipe (dx < -60)
        const shouldClose = progress < 0.5 || velocity < -0.25 || gestureState.dx < -60;
        if (shouldClose) {
          onClose();
        } else {
          // Snap back to fully open
          if (drawerAnim) {
            Animated.timing(drawerAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }).start();
          }
        }
      },
      onPanResponderTerminate: () => {
        if (drawerAnim) {
          Animated.timing(drawerAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Load user profile once on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const stored = await AsyncStorage.getItem('user_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name && parsed.name.trim().length > 0) {
            setUserName(parsed.name.trim());
          }
          if (parsed.avatarUri) {
            setAvatarUri(parsed.avatarUri);
          }
        }
      } catch {
        // ignore
      }
    }
    loadUser();
  }, []);

  // Subtle parallax effect matching native drawer behavior
  const drawerParallaxX = drawerAnim
    ? drawerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth * 0.16, 0],
      })
    : 0;

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        styles.drawerContainer,
        {
          backgroundColor: isDark ? '#121212' : '#f5f5f7',
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: isInTabs ? 8 : Math.max(insets.bottom, 12),
          transform: [{ translateX: drawerParallaxX }],
        },
      ]}
      {...closePanResponder.panHandlers}
    >
      {/* Top Header Row: Logo + Skin Story on left + Close (X) on right */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Logo size={28} color={isDark ? '#ffffff' : '#111827'} />
          <Text
            style={[
              styles.brandTitle,
              { color: isDark ? '#ffffff' : '#111827' },
            ]}
          >
            Skin Story
          </Text>
        </View>

        <Pressable
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          onPress={onClose}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <X size={24} color={isDark ? '#e4e4e7' : '#111827'} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* Quick Actions */}
      <View style={styles.navSection}>
        <Pressable
          onPress={onNewChat}
          style={({ pressed, hovered }) => [
            styles.newChatPill,
            (pressed || hovered) && {
              backgroundColor: isDark ? '#27272c' : '#f0f0f2',
            },
          ]}
        >
          <SquarePen size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
          <Text style={[styles.newChatText, { color: isDark ? '#ffffff' : '#111827' }]}>
            New chat
          </Text>
        </Pressable>


        {/* Search — opens the Search Chats page */}
        <Pressable
          onPress={() => {
            router.push('/search-chats');
          }}
          style={({ pressed, hovered }) => [
            styles.newChatPill,
            (pressed || hovered) && {
              backgroundColor: isDark ? '#27272c' : '#f0f0f2',
            },
          ]}
        >
          <Search size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
          <Text style={[styles.newChatText, { color: isDark ? '#ffffff' : '#111827' }]}>
            Search chats
          </Text>
        </Pressable>
      </View>

      {/* Recents Section Subtitle */}
      <View style={styles.recentsHeaderRow}>
        <Text style={[styles.sectionSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          Recents
        </Text>
      </View>



      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recents List — Gemini style clean text lines */}
        {chats.length === 0 ? (
          <View style={styles.emptyChatsBox}>
            <Text style={[styles.emptyChatsText, { color: isDark ? '#71717a' : '#9ca3af' }]}>
              No chats yet
            </Text>
          </View>
        ) : (
          chats.map((chat) => {
            const isSelected = chat.id === currentChatId;
            return (
              <Pressable
                key={chat.id}
                onPress={() => {
                  onSelectChat(chat);
                }}
                onLongPress={(e) => {
                  setActionMenu({ visible: true, chat, topOffset: e.nativeEvent.pageY });
                }}
                delayLongPress={300}
                style={({ pressed, hovered }) => [
                  styles.chatLineItem,
                  (isSelected || pressed || hovered) && {
                    backgroundColor: isDark ? '#27272c' : '#f0f0f2',
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chatLineText,
                    {
                      color: isSelected
                        ? (isDark ? '#ffffff' : '#000000')
                        : (isDark ? '#e4e4e7' : '#1f2937'),
                      fontWeight: isSelected ? '800' : '700',
                    },
                  ]}
                >
                  {chat.title || 'Untitled Chat'}
                </Text>
                {Boolean(chat.isPinned) && (
                  <Pin size={15} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2.4} />
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Long-press chat action menu + rename/delete flows */}
      {actionMenu.chat && (() => {
        const chat = actionMenu.chat!;
        return (
          <ChatActionMenu
            visible={actionMenu.visible}
            isDark={isDark}
            chatTitle={chat.title || 'Untitled Chat'}
            isPinned={Boolean(chat.isPinned)}
            topOffset={actionMenu.topOffset}
            onClose={() => setActionMenu({ visible: false, chat: null, topOffset: 0 })}
            onTogglePin={() => {
              togglePinChat(chat.id);
            }}
            onRename={() => {
              setRenameTarget(chat);
              setTempRenameTitle(chat.title || 'Untitled Chat');
            }}
            onDelete={() => {
              setChatToDelete(chat);
            }}
          />
        );
      })()}

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

      {/* Bottom fade — chats dissolve into the bar */}
      <LinearGradient
        colors={[
          isDark ? 'rgba(18,18,18,0)' : 'rgba(245,245,247,0)',
          isDark ? 'rgba(18,18,18,0.75)' : 'rgba(245,245,247,0.75)',
          isDark ? '#121212' : '#f5f5f7',
        ]}
        locations={[0, 0.55, 1]}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      {/* Bottom Profile Bar (Avatar, Name, Credits Pill) */}
      <View style={[styles.bottomProfileBar, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
        {/* Left: Avatar + Name — only the name is tappable */}
        <View style={styles.userLeftRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: isDark ? '#27272a' : '#e5e7eb' }]}>
              <Text style={[styles.avatarInitial, { color: isDark ? '#ffffff' : '#111827' }]}>
                {userInitial}
              </Text>
            </View>
          )}
          <Pressable
            onPress={() => { if (onProfilePress) { onProfilePress(); } else { router.push('/(tabs)/profile'); } }}
            style={({ pressed, hovered }) => [
              {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'flex-start',
              },
              pressed || hovered ? { opacity: 0.65 } : null,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.userNameText,
                { color: isDark ? '#ffffff' : '#111827' },
              ]}
            >
              {userName}
            </Text>
          </Pressable>
        </View>

        {/* Elevated credits pill */}
        <View
          style={[
            styles.creditsPill,
            {
              backgroundColor: isDark ? '#1e1e23' : '#ffffff',
              borderColor: isDark ? '#3f3f46' : 'rgba(0,0,0,0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: isDark ? 0.4 : 0.12,
              shadowRadius: 8,
              elevation: 5,
            },
          ]}
        >
          <Zap size={13} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
          <Text style={[styles.creditsPillText, { color: isDark ? '#ffffff' : '#111827' }]}>
            12 credits left
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    zIndex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  iconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navSection: {
    gap: 2,
    marginBottom: 4,
  },
  newChatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  newChatText: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  navItemText: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
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
  emptyChatsBox: {
    paddingVertical: 24,
    paddingHorizontal: 14,
  },
  emptyChatsText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: 2,
  },
  bottomProfileBar: {
    borderTopWidth: 0,
    zIndex: 3,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  userLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 6,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
  },
  userNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bottomRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  creditsPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
