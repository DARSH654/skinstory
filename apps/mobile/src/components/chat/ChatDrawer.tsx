import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/AppText';
import {
  X,
  SquarePen,
  Search,
  Zap,
  Pin,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMeta } from '@/hooks/useChats';
import Logo from '@/components/Logo';

interface ChatDrawerProps {
  isOpen: boolean;
  isDark: boolean;
  chats: ChatMeta[];
  currentChatId?: string;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chat: ChatMeta) => void;
}

export default function ChatDrawer({
  isOpen,
  isDark,
  chats,
  currentChatId,
  onClose,
  onNewChat,
  onSelectChat,
}: ChatDrawerProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = Math.min(screenWidth * 0.84, 340);

  const [animVal] = useState(new Animated.Value(0));
  const [userName, setUserName] = useState('User');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Swipe left to close gesture
  const closePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return gestureState.dx < -15 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx < -40) {
          onClose();
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

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
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropOpacity = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateX = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  // Filtered recents
  const filteredChats = searchQuery.trim().length > 0
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : chats;

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  const displayUserName = userName.length > 10 ? `${userName.slice(0, 10)}...` : userName;

  return (
    <View style={styles.fullscreenOverlay} pointerEvents="box-none">
      {/* Dimmed backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer surface sliding from left, spanning entire vertical screen above nav bar */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: isDark ? '#141417' : '#ffffff',
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: Math.max(insets.bottom, 12),
            transform: [{ translateX }],
          },
        ]}
        {...closePanResponder.panHandlers}
      >
        {/* Top Header Row: Skin Story Logo + Title (sticky) + Close (X) button */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <Logo size={22} color={isDark ? '#ffffff' : '#000000'} />
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
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onClose}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <X size={22} color={isDark ? '#e4e4e7' : '#374151'} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Actions (Gemini-style clean nav items) */}
          <View style={styles.navSection}>
            <Pressable
              onPress={() => {
                onClose();
                onNewChat();
              }}
              style={({ pressed }) => [
                styles.navItem,
                pressed && { backgroundColor: isDark ? '#27272a' : '#f4f4f5' },
              ]}
            >
              <SquarePen size={19} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
              <Text style={[styles.navItemText, { color: isDark ? '#ffffff' : '#111827' }]}>
                New chat
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsSearching((prev) => !prev)}
              style={({ pressed }) => [
                styles.navItem,
                pressed && { backgroundColor: isDark ? '#27272a' : '#f4f4f5' },
              ]}
            >
              <Search size={19} color={isDark ? '#d4d4d8' : '#4b5563'} strokeWidth={2.2} />
              <Text style={[styles.navItemText, { color: isDark ? '#e4e4e7' : '#374151' }]}>
                Search chats
              </Text>
            </Pressable>

            {isSearching && (
              <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#ffffff' : '#111827' }]}
                  placeholder="Search chats..."
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  returnKeyType="search"
                />
              </View>
            )}
          </View>

          {/* Recents Section Subtitle */}
          <View style={styles.recentsHeaderRow}>
            <Text style={[styles.sectionSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
              Recents
            </Text>
          </View>

          {/* Recents List — Gemini style clean text lines with seamless edge merge */}
          {filteredChats.length === 0 ? (
            <View style={styles.emptyChatsBox}>
              <Text style={[styles.emptyChatsText, { color: isDark ? '#71717a' : '#9ca3af' }]}>
                No chats yet
              </Text>
            </View>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = chat.id === currentChatId;
              return (
                <Pressable
                  key={chat.id}
                  onPress={() => {
                    onClose();
                    onSelectChat(chat);
                  }}
                  style={({ pressed }) => [
                    styles.chatLineItem,
                    isSelected && {
                      backgroundColor: isDark ? '#27272a' : '#f0f0f2',
                    },
                    pressed && {
                      backgroundColor: isDark ? '#222226' : '#f4f4f5',
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

        {/* Bottom Profile Bar (Sticky at bottom: Avatar, <=10 chars Name..., 12 credits left pill) */}
        <View
          style={[
            styles.bottomProfileBar,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            },
          ]}
        >
          {/* User Profile Avatar & Name (Truncated at 10 chars) */}
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
            <Text
              numberOfLines={1}
              style={[
                styles.userNameText,
                { color: isDark ? '#ffffff' : '#111827' },
              ]}
            >
              {displayUserName}
            </Text>
          </View>

          {/* 12 Credits Left Pill in place of Upgrade */}
          <View
            style={[
              styles.creditsPill,
              {
                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                borderColor: isDark ? '#3f3f46' : '#e5e7eb',
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
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
    flexDirection: 'column',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  iconBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  navSection: {
    gap: 2,
    marginBottom: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  searchBox: {
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  searchBoxLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e5e7eb',
  },
  searchBoxDark: {
    backgroundColor: '#1f1f23',
    borderColor: '#2b2b30',
  },
  searchInput: {
    fontSize: 14,
    padding: 0,
    height: 32,
  },
  recentsHeaderRow: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  chatLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
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
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  emptyChatsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomProfileBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
  },
  userNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
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
