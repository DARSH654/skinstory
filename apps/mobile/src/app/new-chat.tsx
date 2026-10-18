import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reanimated from 'react-native-reanimated';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ChatInputBar from '@/components/chat/ChatInputBar';
import { Message } from '@/components/chat/types';
import ChatNavbar from '@/components/chat/ChatNavbar';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ScrollToBottomButton from '@/components/chat/ScrollToBottomButton';
import RenameChatModal from '@/components/chat/RenameChatModal';
import MessageContextMenu from '@/components/chat/MessageContextMenu';
import DeleteMessageModal from '@/components/chat/DeleteMessageModal';
import BadFeedbackSheet, { BadFeedbackSheetRef } from '@/components/chat/BadFeedbackSheet';
import RevertFeedbackModal from '@/components/chat/RevertFeedbackModal';
import Logo from '@/components/Logo';
import { useChatKeyboard } from '@/components/chat/hooks/useChatKeyboard';
import { useChatMessages } from '@/components/chat/hooks/useChatMessages';

export default function NewChatScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [chatTitle, setChatTitle] = useState('Untitled Chat');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(chatTitle);
  const [greeting, setGreeting] = useState('Hello, there');

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

  const scrollToBottom = useCallback((animated: boolean = true) => {
    isProgrammaticScrolling.current = true;
    setShowScrollButton(false);
    scrollViewRef.current?.scrollToEnd({ animated });
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
    programmaticScrollTimer.current = setTimeout(() => {
      isProgrammaticScrolling.current = false;
      setShowScrollButton(false);
    }, 450);
  }, []);

  const { footerStyle, resetFooter } = useChatKeyboard(() => scrollToBottom(false), !isEditingTitle);

  const {
    messages,
    setMessages,
    inputText,
    setInputText,
    isBotThinking,
    regeneratingMessageId,
    handleSendMessage,
    regenerateAiResponse,
    selectVersion,
  } = useChatMessages();

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

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      setShowScrollButton(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [messages, isBotThinking]);

  const onSendMessage = (textToSend?: string) => {
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
    if (trimmed.length > 0) setChatTitle(trimmed.slice(0, 100));
    setIsEditingTitle(false);
  };

  const displayTitle = chatTitle.length > 28 ? `${chatTitle.slice(0, 28)}...` : chatTitle;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#09090b' : '#fafafa', paddingTop: Math.max(insets.top, 12) }]}>
      <ChatNavbar
        isDark={isDark}
        displayTitle={displayTitle}
        onBack={() => router.back()}
        onEditTitle={() => {
          Keyboard.dismiss();
          setTempTitle(chatTitle);
          setIsEditingTitle(true);
        }}
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={[
            styles.messageScrollContent,
            {
              paddingBottom: 80 + insets.bottom,
              justifyContent: messages.length === 0 ? 'center' : 'flex-start',
            },
          ]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={(_w, contentHeight) => {
            if (contentHeight > 0) {
              scrollToBottom(true);
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
              if (showScrollButton) setShowScrollButton(false);
              return;
            }

            // Distance from bottom. If within 100px of bottom, consider user as at the bottom
            const distanceFromBottom = totalScrollable - contentOffset.y;
            const isAtBottom = distanceFromBottom <= 100;

            if (isAtBottom && showScrollButton) {
              setShowScrollButton(false);
            } else if (!isAtBottom && !showScrollButton) {
              setShowScrollButton(true);
            }
          }}
          scrollEventThrottle={16}
        >
          {messages.length === 0 && !isBotThinking && (
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
          )}

          {messages.map((item) => (
            <MessageBubble
              key={item.id}
              message={item}
              isDark={isDark}
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
            />
          ))}

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
            isBotThinking={isBotThinking}
          />
        </Reanimated.View>
      </View>

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
          // Fired after any dismiss (including post-submit). Only reset footer.
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
  container: { flex: 1 },
  messageScroll: { flex: 1 },
  messageScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
    flexGrow: 1,
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
});
