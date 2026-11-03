import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, Image, PanResponder, Animated, Dimensions, Easing, ActivityIndicator, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reanimated from 'react-native-reanimated';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChats, ChatMeta } from '@/hooks/useChats';
import ChatInputBar from '@/components/chat/ChatInputBar';
import { Message } from '@/components/chat/types';
import ChatNavbar from '@/components/chat/ChatNavbar';
import ChatDrawer from '@/components/chat/ChatDrawer';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ScrollToBottomButton from '@/components/chat/ScrollToBottomButton';
import RenameChatModal from '@/components/chat/RenameChatModal';
import MessageContextMenu from '@/components/chat/MessageContextMenu';
import DeleteMessageModal from '@/components/chat/DeleteMessageModal';
import { LinearGradient } from 'expo-linear-gradient';
import BadFeedbackSheet, { BadFeedbackSheetRef } from '@/components/chat/BadFeedbackSheet';
import RevertFeedbackModal from '@/components/chat/RevertFeedbackModal';
import TemporaryChatInfoModal from '@/components/chat/TemporaryChatInfoModal';
import ChatActionMenu from '@/components/chat/ChatActionMenu';
import DeleteChatConfirmModal from '@/components/chat/DeleteChatConfirmModal';
import Logo from '@/components/Logo';
import { useChatKeyboard } from '@/components/chat/hooks/useChatKeyboard';
import { useChatMessages } from '@/components/chat/hooks/useChatMessages';

export default function NewChatScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Read chatId and title from route params
  const params = useLocalSearchParams<{ chatId?: string; title?: string }>();
  const fallbackChatIdRef = useRef<string>(`chat-${Date.now()}`);
  const chatId = typeof params.chatId === 'string' && params.chatId.length > 0
    ? params.chatId
    : fallbackChatIdRef.current;

  const { upsertChat, chats, togglePinChat, deleteChat } = useChats();

  const [chatTitle, setChatTitle] = useState(() => {
    if (typeof params.title === 'string' && params.title.trim().length > 0) {
      return params.title.trim();
    }
    return 'Untitled Chat';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(chatTitle);
  const [greeting, setGreeting] = useState('Hello, there');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [showTemporaryInfoModal, setShowTemporaryInfoModal] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const drawerAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    Animated.timing(drawerAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsDrawerOpen(true);
      }
    });
  }, [drawerAnim]);

  const closeDrawer = useCallback((onFinish?: () => void) => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsDrawerOpen(false);
      }
      onFinish?.();
    });
  }, [drawerAnim]);

  // Give 48px extra clearance so elevation, shadow, and rounded corners never bleed at 100%
  const mainScreenTranslateX = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth + 48],
  });

  const mainScreenOpacity = drawerAnim.interpolate({
    inputRange: [0, 0.92, 1],
    outputRange: [1, 1, 0],
  });

  const mainScreenBorderRadius = drawerAnim.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0, 24, 24],
  });

  // PanResponder to track finger in real-time when swiping right from left edge (Gemini-level sensitivity)
  const edgeSwipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // High-sensitivity edge capture: starts within left 75px, slight horizontal movement
        return (
          gestureState.x0 < 75 &&
          gestureState.dx > 4 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderGrant: () => {
        Keyboard.dismiss();
      },
      onPanResponderMove: (_evt, gestureState) => {
        const progress = Math.min(1, Math.max(0, gestureState.dx / screenWidth));
        drawerAnim.setValue(progress);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const progress = gestureState.dx / screenWidth;
        const velocity = gestureState.vx;
        // Opens on either 50% drag OR a light, quick flick (vx > 0.25) or slight intentional swipe (dx > 70)
        const shouldOpen = progress > 0.5 || velocity > 0.25 || gestureState.dx > 70;
        if (shouldOpen) {
          openDrawer();
        } else {
          closeDrawer();
        }
      },
      onPanResponderTerminate: () => {
        closeDrawer();
      },
    })
  ).current;

  const isTemporaryChatRef = useRef(isTemporaryChat);
  isTemporaryChatRef.current = isTemporaryChat;
  const currentChatIdRef = useRef(chatId);
  currentChatIdRef.current = chatId;

  // Cleanup temporary chat when unmounting / navigating away
  useEffect(() => {
    return () => {
      if (isTemporaryChatRef.current) {
        AsyncStorage.removeItem(`ss_chat_msgs_${currentChatIdRef.current}`).catch(() => {});
      }
    };
  }, []);

  // If chat is found in existing chats list, sync title if needed
  useEffect(() => {
    setIsSwitchingChat(false);
    const existing = chats.find((c) => c.id === chatId);
    if (existing && existing.title && existing.title !== 'Untitled Chat') {
      setChatTitle(existing.title);
      setTempTitle(existing.title);
    }
  }, [chats, chatId]);

  const [contextMenu, setContextMenu] = useState<{
    message: Message;
    anchorY: number;
    align: 'left' | 'right';
  } | null>(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<Message | null>(null);
  const [feedbackTargetMessage, setFeedbackTargetMessage] = useState<Message | null>(null);
  const [revertTargetMessage, setRevertTargetMessage] = useState<Message | null>(null);

  // Track feedback status for each AI message: id -> 'liked' | 'disliked'
  const [messageFeedbackMap, setMessageFeedbackMap] = useState<Record<string, 'liked' | 'disliked'>>({});
  // Track whether detailed feedback was submitted for each message
  const [submittedFeedbackMap, setSubmittedFeedbackMap] = useState<Record<string, boolean>>({});

  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastScrollY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const badFeedbackSheetRef = useRef<BadFeedbackSheetRef>(null);
  const isProgrammaticScrolling = useRef(false);
  const programmaticScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether we are in an active typewriter stream (suppress animated spring during stream)
  const isTypewriterStreaming = useRef(false);
  // Throttle ref: only allow one non-animated scroll follow per 80ms during streaming
  const streamScrollThrottle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isNearBottomRef = useRef(true);
  const isUserDraggingRef = useRef(false);
  const userScrolledUpRef = useRef(false);
  const justFinishedGeneratingTimeRef = useRef(0);

  // Callback: fired every time a new message is sent/received — keeps the chat list index in sync
  const handleChatUpdated = useCallback(
    (lastMessage: string, updatedAt: number) => {
      // Temporary chat: never appears in chat history
      if (isTemporaryChat) return;

      upsertChat({
        id: chatId,
        title: chatTitle,
        lastMessage: lastMessage.slice(0, 80),
        updatedAt,
        createdAt: parseInt(chatId.replace('chat-', ''), 10) || updatedAt,
      });
    },
    [chatId, chatTitle, upsertChat, isTemporaryChat]
  );

  const {
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
  } = useChatMessages({ chatId, chatTitle, onChatUpdated: handleChatUpdated });

  const { footerStyle, resetFooter, keyboardHeight } = useChatKeyboard(undefined, !isEditingTitle);

  // Guarantee the Android soft keyboard is dismissed and scroll tracking is reset on chat switch
  useEffect(() => {
    Keyboard.dismiss();
    hasPerformedInitialScrollRef.current = false;
    messageLayoutYMap.current = {};
    prevMessageCountRef.current = 0;
  }, [chatId]);

  const scrollToBottom = useCallback((animated: boolean = true) => {
    userScrolledUpRef.current = false;
    isNearBottomRef.current = true;
    isProgrammaticScrolling.current = true;
    setShowScrollButton(false);
    scrollViewRef.current?.scrollToEnd({ animated });
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
    programmaticScrollTimer.current = setTimeout(() => {
      isProgrammaticScrolling.current = false;
      setShowScrollButton(false);
    }, 450);
  }, []);

  // Called during typewriter streaming AND immediately after completion when action buttons/banners expand content height
  const followBottom = useCallback(() => {
    const isRecentlyFinished = Date.now() - justFinishedGeneratingTimeRef.current < 500;
    if ((!isGenerating && !isRecentlyFinished) || userScrolledUpRef.current || isUserDraggingRef.current || !isNearBottomRef.current) return;
    if (streamScrollThrottle.current) return;
    streamScrollThrottle.current = setTimeout(() => {
      streamScrollThrottle.current = null;
      if (userScrolledUpRef.current || isUserDraggingRef.current) return;
      scrollViewRef.current?.scrollToEnd({ animated: isRecentlyFinished });
    }, 60);
  }, [isGenerating]);

  const handleTypewriterComplete = useCallback((messageId: string) => {
    justFinishedGeneratingTimeRef.current = Date.now();
    onTypewriterComplete(messageId);
    if (!userScrolledUpRef.current && isNearBottomRef.current) {
      setTimeout(() => {
        if (!userScrolledUpRef.current && isNearBottomRef.current) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }, 50);
    }
  }, [onTypewriterComplete]);

  const handleStopGeneration = useCallback(() => {
    justFinishedGeneratingTimeRef.current = Date.now();
    stopGeneration();
    if (!userScrolledUpRef.current && isNearBottomRef.current) {
      setTimeout(() => {
        if (!userScrolledUpRef.current && isNearBottomRef.current) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }, 50);
    }
  }, [stopGeneration]);

  useEffect(() => {
    const loadGreeting = async () => {
      try {
        const [profileStr, greetedOnce] = await Promise.all([
          AsyncStorage.getItem('user_profile'),
          AsyncStorage.getItem('ss_chat_greeted_once'),
        ]);
        let userName = 'there';
        if (profileStr) {
          const parsed = JSON.parse(profileStr);
          if (parsed?.name && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
            userName = parsed.name.trim();
          }
        }
        setGreeting(greetedOnce ? `Back at it, ${userName}` : `Hello, ${userName}`);
      } catch {
        setGreeting('Hello, there');
      }
    };
    loadGreeting();
  }, []);

  // Track whether initial scroll to latest question has been performed on mount
  const hasPerformedInitialScrollRef = useRef(false);
  const messageLayoutYMap = useRef<Record<string, number>>({});
  const prevMessageCountRef = useRef(0);

  // Identify the latest user question in history
  const latestUserMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') return messages[i].id;
    }
    return null;
  }, [messages]);

  // Identify the latest AI message in history
  const latestAiMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'ai') return messages[i].id;
    }
    return null;
  }, [messages]);

  useEffect(() => {
    const newCount = messages.length;
    const isInitialChatLoad = !hasPerformedInitialScrollRef.current && newCount > 0;
    const isMessageAdded = newCount > prevMessageCountRef.current;
    prevMessageCountRef.current = newCount;

    if (isInitialChatLoad) {
      // On initial chat load: Scroll to the latest user question (Gemini behavior)
      hasPerformedInitialScrollRef.current = true;
      const targetId = latestUserMessageId;
      const timer = setTimeout(() => {
        if (targetId && typeof messageLayoutYMap.current[targetId] === 'number') {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, messageLayoutYMap.current[targetId] - 12),
            animated: false,
          });
        } else {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }
        setShowScrollButton(false);
      }, 150);
      return () => clearTimeout(timer);
    }

    // When deleting messages (newCount < prevMessageCountRef.current), do NOT scroll — stay right where the user is
    if (isMessageAdded || isBotThinking) {
      // New discrete message sent during active conversation: smooth animated snap to bottom
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setShowScrollButton(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isBotThinking, latestUserMessageId]);

  const onSendMessage = (textToSend?: string) => {
    Keyboard.dismiss();
    userScrolledUpRef.current = false;
    isNearBottomRef.current = true;
    AsyncStorage.setItem('ss_chat_greeted_once', '1').catch(() => {});
    handleSendMessage(textToSend);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetMessage) return;

    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === deleteTargetMessage.id);
      if (idx === -1) return prev;

      const target = prev[idx];
      const idsToRemove = new Set<string>([target.id]);

      if (target.sender === 'ai') {
        // If an AI response is deleted, also delete the preceding user question
        if (idx > 0 && prev[idx - 1].sender === 'user') {
          idsToRemove.add(prev[idx - 1].id);
        }
      } else if (target.sender === 'user') {
        // If a user message is deleted, also delete the following AI response
        if (idx < prev.length - 1 && prev[idx + 1].sender === 'ai') {
          idsToRemove.add(prev[idx + 1].id);
        }
      }

      return prev.filter((m) => !idsToRemove.has(m.id));
    });

    setDeleteTargetMessage(null);
  };

  const handleRegenerate = (aiMessage: Message) => {
    const idx = messages.findIndex((m) => m.id === aiMessage.id);
    let promptToResend = '';

    if (idx > 0 && messages[idx - 1].sender === 'user') {
      promptToResend = messages[idx - 1].text;
    } else {
      promptToResend = aiMessage.text;
    }

    regenerateAiResponse(aiMessage, promptToResend);
  };

  const handleSelectVersion = (aiMessage: Message, versionIndex: number) => {
    selectVersion(aiMessage, versionIndex);
  };

  const handleSaveTitle = () => {
    const trimmed = tempTitle.trim();
    if (trimmed.length > 0) {
      const newTitle = trimmed.slice(0, 100);
      setChatTitle(newTitle);
      upsertChat({
        id: chatId,
        title: newTitle,
        lastMessage: messages.length > 0 ? messages[messages.length - 1].text.slice(0, 80) : '',
        updatedAt: Date.now(),
        createdAt: parseInt(chatId.replace('chat-', ''), 10) || Date.now(),
      });
    }
    setIsEditingTitle(false);
  };

  const displayTitle = chatTitle.length > 28 ? `${chatTitle.slice(0, 28)}...` : chatTitle;

  return (
    <View style={[styles.rootContainer, { backgroundColor: isDark ? '#121215' : '#ffffff' }]}>

      {/* Layer 1: Drawer UNDERNEATH — always mounted, zIndex 1 */}
      <ChatDrawer
        isOpen={isDrawerOpen}
        isDark={isDark}
        chats={chats}
        currentChatId={chatId}
        drawerAnim={drawerAnim}
        onClose={() => closeDrawer()}
        onNewChat={() => {
          setIsSwitchingChat(true);
          setIsTemporaryChat(false);
          setChatTitle('Untitled Chat');
          setTempTitle('Untitled Chat');
          closeDrawer(() => {
            const freshChatId = `chat-${Date.now()}`;
            router.setParams({ chatId: freshChatId, title: 'Untitled Chat' });
          });
        }}
        onSelectChat={(selected) => {
          if (selected.id !== chatId) {
            setIsSwitchingChat(true);
            setIsTemporaryChat(false);
            setChatTitle(selected.title || 'Untitled Chat');
            setTempTitle(selected.title || 'Untitled Chat');
          }
          closeDrawer(() => {
            if (selected.id !== chatId) {
              router.setParams({ chatId: selected.id, title: selected.title || 'Untitled Chat' });
            }
          });
        }}
      />

      {/* Layer 2: Main chat screen slides RIGHT to reveal drawer underneath */}
      <Animated.View
        style={[
          styles.mainChatScreen,
          {
            backgroundColor: isDark ? '#09090b' : '#fafafa',
            transform: [{ translateX: mainScreenTranslateX }],
            opacity: mainScreenOpacity,
            borderTopLeftRadius: mainScreenBorderRadius,
            borderBottomLeftRadius: mainScreenBorderRadius,
          },
        ]}
        {...edgeSwipePanResponder.panHandlers}
      >
      <View style={styles.chatBody}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={[
            styles.messageScrollContent,
            {
              paddingTop: Math.max(insets.top, 12) + 64,
              paddingBottom: 80 + insets.bottom + keyboardHeight,
              justifyContent: messages.length === 0 ? 'center' : 'flex-start',
            },
          ]}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            isUserDraggingRef.current = true;
          }}
          onScrollEndDrag={() => {
            isUserDraggingRef.current = false;
          }}
          onMomentumScrollEnd={() => {
            isUserDraggingRef.current = false;
          }}
          onContentSizeChange={(_w, contentHeight) => {
            if (contentHeight > 0) {
              followBottom();
            }
          }}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            lastScrollY.current = contentOffset.y;

            // While animated programmatic scrolling is in progress, suppress any flickering/reappearing
            if (isProgrammaticScrolling.current) {
              return;
            }

            const totalScrollable = contentSize.height - layoutMeasurement.height;
            // If the content fits on screen, never show scroll-to-bottom
            if (totalScrollable <= 20) {
              isNearBottomRef.current = true;
              userScrolledUpRef.current = false;
              if (showScrollButton) setShowScrollButton(false);
              return;
            }

            // Distance from bottom. If within 40px of bottom, consider user as at the bottom
            const distanceFromBottom = totalScrollable - contentOffset.y;
            const isAtBottom = distanceFromBottom <= 40;
            isNearBottomRef.current = isAtBottom;

            // Check if latest AI message is currently visible in the user's viewport
            const viewportTop = contentOffset.y;
            const viewportBottom = contentOffset.y + layoutMeasurement.height;
            const latestAiY = latestAiMessageId ? messageLayoutYMap.current[latestAiMessageId] : undefined;
            const isLatestAiVisible = typeof latestAiY === 'number' && latestAiY >= viewportTop - 40 && latestAiY <= viewportBottom;

            if (isAtBottom || isLatestAiVisible) {
              userScrolledUpRef.current = false;
              if (showScrollButton) setShowScrollButton(false);
            } else {
              if (isUserDraggingRef.current && distanceFromBottom > 60) {
                // User explicitly scrolled up away from bottom: respect their gesture!
                userScrolledUpRef.current = true;
              }
              if (!showScrollButton) {
                setShowScrollButton(true);
              }
            }
          }}
          scrollEventThrottle={16}
        >
          {!isLoaded || isSwitchingChat ? (
            <View style={styles.loadingCenterContainer}>
              <ActivityIndicator size="large" color={isDark ? '#e4e4e7' : '#52525b'} />
            </View>
          ) : messages.length === 0 && !isBotThinking ? (
            isTemporaryChat ? (
              <View style={styles.emptyStateContainer}>
                <Text
                  style={[
                    styles.temporaryTitle,
                    { color: isDark ? '#ffffff' : '#111827' },
                  ]}
                >
                  Temporary chat
                </Text>
                <View style={styles.temporarySubtitleRow}>
                  <Text
                    style={[
                      styles.temporarySubtitle,
                      { color: isDark ? '#9ca3af' : '#6b7280' },
                    ]}
                  >
                    This chat won't appear in history.{' '}
                  </Text>
                  <Pressable
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                    onPress={() => setShowTemporaryInfoModal(true)}
                  >
                    <Text
                      style={[
                        styles.temporaryLearnMore,
                        { color: isDark ? '#d4d4d8' : '#374151' },
                      ]}
                    >
                      Learn more
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <View style={styles.brandRow}>
                  <Logo
                    size={24}
                    color={isDark ? '#ffffff' : '#000000'}
                  />
                  <Text
                    style={[
                      styles.brandTitle,
                      { color: isDark ? '#ffffff' : '#000000' },
                    ]}
                  >
                    Skin Story AI Assistant
                  </Text>
                </View>
                <Text
                  style={[
                    styles.emptyStateGreeting,
                    { color: isDark ? '#ffffff' : '#000000' },
                  ]}
                >
                  {greeting}
                </Text>
              </View>
            )
          ) : null}

          {!isSwitchingChat && (() => {
            // Find ID of the latest completed AI message
            const latestAiMessage = [...messages].reverse().find((m) => m.sender === 'ai' && !m.interrupted && !m.error);
            const latestAiMessageId = latestAiMessage?.id;

            // Find ID of the latest interrupted/errored AI message (only if bot is not thinking/retrying)
            const latestInterruptedMessage = !isBotThinking
              ? [...messages].reverse().find((m) => m.sender === 'ai' && (m.interrupted || m.error))
              : null;
            const latestInterruptedMessageId = latestInterruptedMessage?.id;

            return messages.map((item) => (
              <View
                key={item.id}
                onLayout={(e) => {
                  messageLayoutYMap.current[item.id] = e.nativeEvent.layout.y;
                }}
              >
                <MessageBubble
                  message={item}
                  isDark={isDark}
                  isStreaming={
                    item.sender === 'ai' &&
                    (item.id === activeStreamingMessageId ||
                      (isBotThinking && item.text === '...'))
                  }
                  isLatestAiMessage={item.id === latestAiMessageId}
                  isLatestInterrupted={item.id === latestInterruptedMessageId}
                  feedback={messageFeedbackMap[item.id] || null}
                  onLongPress={(msg, pageY, align) => {
                    Keyboard.dismiss();
                    setContextMenu({ message: msg, anchorY: pageY, align });
                  }}
              onRegenerate={handleRegenerate}
              onSelectVersion={handleSelectVersion}
              onDelete={(msg) => setDeleteTargetMessage(msg)}
              onLike={(msg) => {
                setMessageFeedbackMap((prev) => ({
                  ...prev,
                  [msg.id]: prev[msg.id] === 'liked' ? (undefined as any) : 'liked',
                }));
              }}
              onDislike={(msg) => {
                const currentFeedback = messageFeedbackMap[msg.id];
                const wasSubmitted = submittedFeedbackMap[msg.id];

                // If already disliked and feedback was submitted, prompt to revert
                if (currentFeedback === 'disliked' && wasSubmitted) {
                  setRevertTargetMessage(msg);
                } else if (currentFeedback === 'disliked') {
                  // Simply toggle off
                  setMessageFeedbackMap((prev) => {
                    const copy = { ...prev };
                    delete copy[msg.id];
                    return copy;
                  });
                } else {
                  // Mark as disliked and open bad feedback sheet
                  setMessageFeedbackMap((prev) => ({ ...prev, [msg.id]: 'disliked' }));
                  setFeedbackTargetMessage(msg);
                  Keyboard.dismiss();
                  badFeedbackSheetRef.current?.present();
                }
              }}
              onTypewriterComplete={handleTypewriterComplete}
            />
          </View>
        ));
      })()}

          {isBotThinking && !regeneratingMessageId && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8 }}>
              <View style={{ paddingHorizontal: 0, paddingVertical: 4 }}>
                <TypingIndicator isDark={isDark} />
              </View>
            </View>
          )}
        </ScrollView>

        <Reanimated.View
          pointerEvents="box-none"
          style={[
            styles.inputFooter,
            footerStyle,
          ]}
        >
          {showScrollButton && (
            <View style={styles.scrollButtonWrapper} pointerEvents="box-none">
              <ScrollToBottomButton
                isDark={isDark}
                onPress={() => scrollToBottom(true)}
              />
            </View>
          )}
          <ChatInputBar
            isDark={isDark}
            value={inputText}
            onChangeText={setInputText}
            onSend={() => onSendMessage()}
            onStop={handleStopGeneration}
            isBotThinking={isGenerating}
          />
        </Reanimated.View>

        {/* Top-down fading gradient: smoothly merges text under floating icons like ChatGPT */}
        <LinearGradient
          pointerEvents="none"
          colors={
            isDark
              ? ['#09090b', 'rgba(9, 9, 11, 0.85)', 'rgba(9, 9, 11, 0)']
              : ['#fafafa', 'rgba(250, 250, 250, 0.88)', 'rgba(250, 250, 250, 0)']
          }
          locations={[0, 0.65, 1]}
          style={[
            styles.topGradientFade,
            { height: Math.max(insets.top, 12) + 68 },
          ]}
        />

        {/* Floating header — completely transparent background */}
        <View
          pointerEvents="box-none"
          style={[
            styles.floatingNavbarContainer,
            {
              paddingTop: Math.max(insets.top, 12),
            },
          ]}
        >
          <ChatNavbar
            isDark={isDark}
            displayTitle={displayTitle}
            isNewChat={messages.length === 0}
            isTemporaryChat={isTemporaryChat}
            onOpenDrawer={openDrawer}
            onNewChat={() => {
              setIsSwitchingChat(true);
              setIsTemporaryChat(false);
              setChatTitle('Untitled Chat');
              setTempTitle('Untitled Chat');
              const freshChatId = `chat-${Date.now()}`;
              router.setParams({ chatId: freshChatId, title: 'Untitled Chat' });
            }}
            onOpenMenu={() => {
              Keyboard.dismiss();
              setIsActionMenuOpen(true);
            }}
            onTemporaryChat={() => {
              setIsTemporaryChat((prev) => !prev);
            }}
          />
        </View>
      </View>
      </Animated.View>

      {/* Layer 3: Modals & Overlays — always on top, outside the animated main screen */}

      {/* Chat Action Dropdown Menu (Pin/Unpin, Rename, Delete) */}
      <ChatActionMenu
        visible={isActionMenuOpen}
        isDark={isDark}
        chatTitle={chatTitle}
        isPinned={Boolean(chats.find((c) => c.id === chatId)?.isPinned)}
        topOffset={Math.max(insets.top, 12) + 52}
        onClose={() => setIsActionMenuOpen(false)}
        onTogglePin={() => {
          togglePinChat(chatId);
        }}
        onRename={() => {
          setTempTitle(chatTitle);
          setIsEditingTitle(true);
        }}
        onDelete={() => {
          setIsDeletingChat(true);
        }}
      />

      {/* Delete Chat Confirmation Modal */}
      <DeleteChatConfirmModal
        visible={isDeletingChat}
        isDark={isDark}
        chatTitle={chatTitle}
        onCancel={() => setIsDeletingChat(false)}
        onConfirm={() => {
          setIsDeletingChat(false);
          deleteChat(chatId);
          setIsSwitchingChat(true);
          setIsTemporaryChat(false);
          setChatTitle('Untitled Chat');
          setTempTitle('Untitled Chat');
          const freshChatId = `chat-${Date.now()}`;
          router.setParams({ chatId: freshChatId, title: 'Untitled Chat' });
        }}
      />

      <TemporaryChatInfoModal
        visible={showTemporaryInfoModal}
        isDark={isDark}
        onClose={() => setShowTemporaryInfoModal(false)}
      />

      <RenameChatModal
        isDark={isDark}
        visible={isEditingTitle}
        currentTitle={chatTitle}
        tempTitle={tempTitle}
        onChangeText={(text) => setTempTitle(text.slice(0, 100))}
        onSave={handleSaveTitle}
        onCancel={() => setIsEditingTitle(false)}
      />


      <DeleteMessageModal
        visible={deleteTargetMessage !== null}
        isDark={isDark}
        onCancel={() => setDeleteTargetMessage(null)}
        onConfirm={handleConfirmDelete}
      />

      <BadFeedbackSheet
        ref={badFeedbackSheetRef}
        isDark={isDark}
        onCancel={() => {
          // Sheet was swiped away without submitting — unselect the dislike
          if (feedbackTargetMessage) {
            setMessageFeedbackMap((prev) => {
              const copy = { ...prev };
              delete copy[feedbackTargetMessage.id];
              return copy;
            });
          }
          setFeedbackTargetMessage(null);
          resetFooter();
        }}
        onDismiss={() => {
          // Fired after any dismiss (including post-submit).
          setFeedbackTargetMessage(null);
          resetFooter();
        }}
        onSubmit={() => {
          if (feedbackTargetMessage) {
            setSubmittedFeedbackMap((prev) => ({
              ...prev,
              [feedbackTargetMessage.id]: true,
            }));
          }
          // Do NOT clear feedbackTargetMessage here — onDismiss will do it
        }}
      />

      <RevertFeedbackModal
        visible={revertTargetMessage !== null}
        isDark={isDark}
        onCancel={() => setRevertTargetMessage(null)}
        onConfirm={() => {
          if (revertTargetMessage) {
            setMessageFeedbackMap((prev) => {
              const copy = { ...prev };
              delete copy[revertTargetMessage.id];
              return copy;
            });
            setSubmittedFeedbackMap((prev) => {
              const copy = { ...prev };
              delete copy[revertTargetMessage.id];
              return copy;
            });
            setRevertTargetMessage(null);
          }
        }}
      />

      {contextMenu && (
        <MessageContextMenu
          message={contextMenu.message}
          anchorY={contextMenu.anchorY}
          align={contextMenu.align}
          isDark={isDark}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            setInputText(contextMenu.message.text);
          }}
        />
      )}
    </View>

  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  mainChatScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  messageScroll: { flex: 1 },
  messageScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
    flexGrow: 1,
  },
  loadingCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateGreeting: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  temporaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  temporarySubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  temporarySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  temporaryLearnMore: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  chatBody: {
    flex: 1,
    flexDirection: 'column',
  },
  inputFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollButtonWrapper: {
    position: 'absolute',
    top: -52,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  floatingNavbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  topGradientFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
});
