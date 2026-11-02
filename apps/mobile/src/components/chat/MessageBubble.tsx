import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableOpacity, Pressable, GestureResponderEvent, Text as RNText, TextInput } from 'react-native';
import { Copy, ThumbsUp, ThumbsDown, RotateCw, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Info, AlertCircle } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Text } from '@/components/AppText';
import TypingIndicator from './TypingIndicator';
import { Message } from './types';
import { Colors } from '@/constants/theme';

interface MessageBubbleProps {
  message: Message;
  isDark: boolean;
  isStreaming?: boolean;
  isLatestAiMessage?: boolean;
  isLatestInterrupted?: boolean;
  onLongPress: (message: Message, pageY: number, align: 'left' | 'right') => void;
  onRegenerate?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onLike?: (message: Message) => void;
  onDislike?: (message: Message) => void;
  onSelectVersion?: (message: Message, versionIndex: number) => void;
  onTypewriterComplete?: (messageId: string, finalText?: string) => void;
  feedback?: 'liked' | 'disliked' | null;
}

export default function MessageBubble({
  message,
  isDark,
  isStreaming = false,
  isLatestAiMessage = true,
  isLatestInterrupted = true,
  onLongPress,
  onRegenerate,
  onDelete,
  onLike,
  onDislike,
  onSelectVersion,
  onTypewriterComplete,
  feedback = null,
}: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [canUserExpand, setCanUserExpand] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(14)).current;
  // Typewriter effect state for AI messages
  const shouldAnimate = !isUser && Boolean(message.animateTypewriter) && Boolean(message.text && message.text !== '...');
  const [displayedLength, setDisplayedLength] = useState(() => (shouldAnimate ? 0 : (message.text?.length || 0)));

  useEffect(() => {
    if (!shouldAnimate || !message.text) {
      setDisplayedLength(message.text?.length || 0);
      return;
    }

    setDisplayedLength(0);
    const fullText = message.text;
    const fullLength = fullText.length;
    let current = 0;

    // Buttery smooth, comfortable reading pace (~1 word every 50ms)
    const interval = setInterval(() => {
      let nextPos = current + 3;
      if (nextPos < fullLength) {
        const nextSpace = fullText.indexOf(' ', nextPos);
        if (nextSpace !== -1 && nextSpace - current <= 7) {
          nextPos = nextSpace + 1;
        }
      } else {
        nextPos = fullLength;
      }

      current = Math.min(nextPos, fullLength);
      setDisplayedLength(current);

      if (current >= fullLength) {
        clearInterval(interval);
        setDisplayedLength(fullLength);
        onTypewriterComplete?.(message.id);
      }
    }, 45);

    return () => {
      // Safe cleanup: ONLY clear the timer. NEVER truncate or corrupt the canonical message text in storage!
      clearInterval(interval);
    };
  }, [shouldAnimate, message.text, message.id, onTypewriterComplete]);

  // When shouldAnimate is true, show animated typing progress. When shouldAnimate is false, ALWAYS show 100% full text!
  const displayedText = message.text
    ? (shouldAnimate && displayedLength < message.text.length)
      ? message.text.slice(0, displayedLength)
      : message.text
    : (message.text || '');

  useEffect(() => {
    // If this bubble is streaming, keep it completely stationary (no translateY overshoot)
    if (shouldAnimate) {
      fadeAnim.setValue(1);
      translateYAnim.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, shouldAnimate]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.text);
  };

  const handleLike = () => {
    onLike?.(message);
  };

  const handleDislike = () => {
    onDislike?.(message);
  };

  const handleLongPress = (e: GestureResponderEvent) => {
    // Only open context menu on user messages; AI messages have inline toolbar
    if (isUser) {
      onLongPress(message, e.nativeEvent.pageY, 'right');
    }
  };

  const defaultIconColor = isDark ? '#a1a1aa' : '#71717a';

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAi,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <View style={isUser ? styles.userMessageWrapper : styles.aiMessageWrapper}>
        {/* Message content bubble (hidden if AI has no text and is interrupted/errored) */}
        {(!(!isUser && !message.text && (message.interrupted || message.error))) && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={isUser && canUserExpand ? () => setIsUserExpanded((prev) => !prev) : undefined}
            delayLongPress={500}
            onLongPress={isUser ? handleLongPress : undefined}
            style={isUser ? undefined : { width: '100%' }}
          >
            <View
              style={[
                styles.messageBubble,
                isUser
                  ? [
                      styles.bubbleUser,
                      {
                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                        borderColor: isDark ? '#27272a' : '#e4e4e7',
                      },
                    ]
                  : styles.bubbleAiPlain,
              ]}
            >
              {!isUser && (!message.text || message.text === '...') ? (
                !message.interrupted && !message.error ? (
                  <View style={{ paddingVertical: 4 }}>
                    <TypingIndicator isDark={isDark} />
                  </View>
                ) : null
              ) : (
                <View style={isUser && canUserExpand ? { position: 'relative' } : undefined}>
                  <Text
                    onTextLayout={
                      isUser
                        ? (e) => {
                            if (e.nativeEvent.lines.length > 4) {
                              setCanUserExpand(true);
                            }
                          }
                        : undefined
                    }
                    numberOfLines={isUser && canUserExpand && !isUserExpanded ? 4 : undefined}
                    ellipsizeMode={isUser && canUserExpand && !isUserExpanded ? 'tail' : undefined}
                    style={[
                      isUser ? styles.userChatText : styles.aiChatText,
                      styles.chatTextMessage,
                      { color: isDark ? '#ffffff' : '#000000' },
                      isUser && canUserExpand && !isUserExpanded && { paddingRight: 30 },
                    ]}
                  >
                    {displayedText}
                  </Text>

                  {isUser && canUserExpand && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsUserExpanded((prev) => !prev)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[
                        styles.expandChevronBtn,
                        {
                          backgroundColor: isDark ? '#27272a' : '#ffffff',
                          borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                        },
                      ]}
                    >
                      {isUserExpanded ? (
                        <ChevronUp size={15} color={isDark ? '#e4e4e7' : '#3f3f46'} strokeWidth={2.4} />
                      ) : (
                        <ChevronDown size={15} color={isDark ? '#e4e4e7' : '#3f3f46'} strokeWidth={2.4} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Claude-style 'AI response was interrupted' banner with 'Try again' button */}
        {!isUser && (message.interrupted || message.error) && !isStreaming && (
          <View
            style={[
              styles.interruptedBanner,
              isDark ? styles.interruptedBannerDark : styles.interruptedBannerLight,
            ]}
          >
            <View style={styles.interruptedLeft}>
              {message.error ? (
                <AlertCircle size={16} color={isDark ? '#f87171' : '#dc2626'} strokeWidth={2.2} />
              ) : (
                <Info size={16} color={isDark ? '#d4d4d8' : '#52525b'} strokeWidth={2.2} />
              )}
              <Text
                style={[
                  styles.interruptedText,
                  { color: isDark ? '#e4e4e7' : '#1f2937' },
                ]}
              >
                {message.error || 'AI response was interrupted.'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={isLatestInterrupted ? 0.7 : 1}
              disabled={!isLatestInterrupted}
              onPress={isLatestInterrupted ? () => onRegenerate?.(message) : undefined}
              style={[
                styles.tryAgainBtn,
                isDark ? styles.tryAgainBtnDark : styles.tryAgainBtnLight,
                !isLatestInterrupted && (isDark ? styles.tryAgainBtnDisabledDark : styles.tryAgainBtnDisabledLight),
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text
                style={[
                  styles.tryAgainBtnText,
                  {
                    color: !isLatestInterrupted
                      ? isDark
                        ? '#71717a'
                        : '#9ca3af'
                      : isDark
                      ? '#ffffff'
                      : '#111827',
                  },
                ]}
              >
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action icons row:
            - If message has some text (completed OR partially generated before stop): show action icons
            - If message was stopped with zero text (e.g. 3-dots): completely hidden */}
        {!isUser && !isStreaming && Boolean(message.text && message.text !== '...') && (
          <View style={styles.actionRow}>
            {/* Version Switcher (e.g. < 2/2 >) - Preserved but hidden from UI
            {message.versions && message.versions.length > 1 && (
              <View style={styles.versionContainer}>
                <Pressable
                  onPress={() => {
                    const currentIdx = message.activeVersionIndex ?? (message.versions!.length - 1);
                    if (currentIdx > 0) {
                      onSelectVersion?.(message, currentIdx - 1);
                    }
                  }}
                  disabled={(message.activeVersionIndex ?? (message.versions.length - 1)) <= 0}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  style={({ pressed, hovered }: any) => [
                    styles.versionChevronBtn,
                    (pressed || hovered) &&
                      (message.activeVersionIndex ?? (message.versions!.length - 1)) > 0 && {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                      },
                  ]}
                >
                  <ChevronLeft
                    size={18}
                    color={
                      (message.activeVersionIndex ?? (message.versions.length - 1)) > 0
                        ? defaultIconColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(0, 0, 0, 0.25)'
                    }
                    strokeWidth={2}
                  />
                </Pressable>
                <Text
                  style={[
                    styles.versionText,
                    { color: isDark ? '#d4d4d8' : '#52525b' },
                  ]}
                >
                  {`${(message.activeVersionIndex ?? message.versions.length - 1) + 1}/${message.versions.length}`}
                </Text>
                <Pressable
                  onPress={() => {
                    const currentIdx = message.activeVersionIndex ?? (message.versions!.length - 1);
                    if (currentIdx < message.versions!.length - 1) {
                      onSelectVersion?.(message, currentIdx + 1);
                    }
                  }}
                  disabled={
                    (message.activeVersionIndex ?? (message.versions.length - 1)) >=
                    message.versions.length - 1
                  }
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  style={({ pressed, hovered }: any) => [
                    styles.versionChevronBtn,
                    (pressed || hovered) &&
                      (message.activeVersionIndex ?? (message.versions!.length - 1)) <
                        message.versions!.length - 1 && {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                      },
                  ]}
                >
                  <ChevronRight
                    size={18}
                    color={
                      (message.activeVersionIndex ?? (message.versions.length - 1)) <
                      message.versions.length - 1
                        ? defaultIconColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(0, 0, 0, 0.25)'
                    }
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            )} */}

            {/* Copy */}
            <Pressable
              onPress={handleCopy}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={({ pressed, hovered }: any) => [
                styles.actionBtn,
                (pressed || hovered) && {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <Copy size={18} color={defaultIconColor} strokeWidth={2} />
            </Pressable>

            {/* Like */}
            <Pressable
              onPress={handleLike}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={({ pressed, hovered }: any) => [
                styles.actionBtn,
                styles.feedbackBtn,
                (pressed || hovered) && feedback !== 'liked' && {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                },
              ]}
            >
              <ThumbsUp
                size={18}
                color={
                  feedback === 'liked'
                    ? isDark
                      ? '#ffffff'
                      : '#000000'
                    : defaultIconColor
                }
                fill={
                  feedback === 'liked'
                    ? isDark
                      ? '#ffffff'
                      : '#000000'
                    : 'transparent'
                }
                strokeWidth={2}
              />
            </Pressable>

            {/* Dislike */}
            <Pressable
              onPress={handleDislike}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={({ pressed, hovered }: any) => [
                styles.actionBtn,
                styles.feedbackBtn,
                (pressed || hovered) && feedback !== 'disliked' && {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                },
              ]}
            >
              <ThumbsDown
                size={18}
                color={
                  feedback === 'disliked'
                    ? isDark
                      ? '#ffffff'
                      : '#000000'
                    : defaultIconColor
                }
                fill={
                  feedback === 'disliked'
                    ? isDark
                      ? '#ffffff'
                      : '#000000'
                    : 'transparent'
                }
                strokeWidth={2}
              />
            </Pressable>

            {/* Regenerate (Only on latest completed AI message, never on interrupted) */}
            {isLatestAiMessage && !message.interrupted && !message.error && (
              <Pressable
                onPress={() => onRegenerate?.(message)}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                style={({ pressed, hovered }: any) => [
                  styles.actionBtn,
                  (pressed || hovered) && {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <RotateCw size={18} color={defaultIconColor} strokeWidth={2} />
              </Pressable>
            )}

            {/* Delete */}
            <Pressable
              onPress={() => onDelete?.(message)}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              style={({ pressed, hovered }: any) => [
                styles.actionBtn,
                (pressed || hovered) && {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <Trash2 size={18} color={defaultIconColor} strokeWidth={2} />
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
    maxWidth: '92%',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
    width: '100%',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleAiPlain: {
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  chatTextMessage: {
    padding: 0,
    includeFontPadding: false,
  },
  userChatText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  aiChatText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBtn: {
    borderRadius: 8,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 6,
  },
  versionChevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 3,
  },
  expandChevronBtn: {
    position: 'absolute',
    bottom: -3,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  interruptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 6,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  interruptedBannerLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  interruptedBannerDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  interruptedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  interruptedText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  tryAgainBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  tryAgainBtnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#d4d4d8',
  },
  tryAgainBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  tryAgainBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tryAgainBtnDisabledLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.7,
  },
  tryAgainBtnDisabledDark: {
    backgroundColor: '#1f1f23',
    borderColor: '#2e2e33',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
});
