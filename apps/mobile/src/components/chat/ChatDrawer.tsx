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
import { ChatMeta } from '@/hooks/useChats';

interface ChatDrawerProps {
  isOpen: boolean;
  isDark: boolean;
  chats: ChatMeta[];
  currentChatId?: string;
  drawerAnim?: Animated.Value;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chat: ChatMeta) => void;
}

export default function ChatDrawer({
  isOpen,
  isDark,
  chats,
  currentChatId,
  drawerAnim,
  onClose,
  onNewChat,
  onSelectChat,
}: ChatDrawerProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  const [userName, setUserName] = useState('User');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  // Filtered recents
  const filteredChats = searchQuery.trim().length > 0
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : chats;

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  const displayUserName = userName.length > 12 ? `${userName.slice(0, 12)}...` : userName;

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        styles.drawerContainer,
        {
          backgroundColor: isDark ? '#121215' : '#ffffff',
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 12),
          transform: [{ translateX: drawerParallaxX }],
        },
      ]}
      {...closePanResponder.panHandlers}
    >
      {/* Top Header Row: Skin Story Title on left + Close (X) button on right (Matching Gemini) */}
      <View style={styles.topHeader}>
        <Text
          style={[
            styles.brandTitle,
            { color: isDark ? '#ffffff' : '#111827' },
          ]}
        >
          Skin Story
        </Text>

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
              onNewChat();
            }}
            style={({ pressed }) => [
              styles.newChatPill,
              {
                backgroundColor: isDark ? '#222227' : '#f3f4f6',
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <SquarePen size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
            <Text style={[styles.newChatText, { color: isDark ? '#ffffff' : '#111827' }]}>
              New chat
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsSearching((prev) => !prev)}
            style={({ pressed }) => [
              styles.navItem,
              pressed && { backgroundColor: isDark ? '#1e1e23' : '#f4f4f5' },
            ]}
          >
            <Search size={20} color={isDark ? '#d4d4d8' : '#374151'} strokeWidth={2.2} />
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
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Recents
          </Text>
        </View>

        {/* Recents List — Gemini style clean text lines */}
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
                  onSelectChat(chat);
                }}
                style={({ pressed }) => [
                  styles.chatLineItem,
                  isSelected && {
                    backgroundColor: isDark ? '#27272c' : '#f0f0f2',
                  },
                  pressed && {
                    backgroundColor: isDark ? '#1f1f24' : '#f4f4f5',
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

      {/* Bottom Profile Bar (Sticky at bottom: Avatar, Name, Credits Pill, Settings Icon) */}
      <View
        style={[
          styles.bottomProfileBar,
          {
            borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
        ]}
      >
        {/* User Profile Avatar & Name */}
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

        {/* Right side: 12 Credits Left Pill + Settings Icon (Matching Gemini) */}
        <View style={styles.bottomRightRow}>
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

          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.6 }]}
          >
            <Settings size={20} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2} />
          </Pressable>
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
    gap: 4,
    marginBottom: 12,
  },
  newChatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 22,
    marginBottom: 4,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: '800',
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
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
    paddingVertical: 24,
    paddingHorizontal: 14,
  },
  emptyChatsText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  bottomProfileBar: {
    borderTopWidth: 1,
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
    flex: 1,
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
  settingsBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
