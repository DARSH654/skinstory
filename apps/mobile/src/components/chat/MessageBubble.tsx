import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableOpacity, Pressable, GestureResponderEvent, Text as RNText, TextInput } from 'react-native';
import { Copy, ThumbsUp, ThumbsDown, RotateCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Text } from '@/components/AppText';
import TypingIndicator from './TypingIndicator';
import { Message } from './types';
import { Colors } from '@/constants/theme';

interface MessageBubbleProps {
  message: Message;
  isDark: boolean;
  onLongPress: (message: Message, pageY: number, align: 'left' | 'right') => void;
  onRegenerate?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onLike?: (message: Message) => void;
  onDislike?: (message: Message) => void;
  onSelectVersion?: (message: Message, versionIndex: number) => void;
  feedback?: 'liked' | 'disliked' | null;
}

export default function MessageBubble({
  message,
  isDark,
  onLongPress,
  onRegenerate,
  onDelete,
  onLike,
  onDislike,
  onSelectVersion,
  feedback = null,
}: MessageBubbleProps) {
  const isUser = message.sender === 'user';
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
        message.animateTypewriter = false;
      }
    }, 45);

    return () => {
      clearInterval(interval);
    };
  }, [shouldAnimate, message.text]);

  const displayedText = shouldAnimate && message.text
    ? message.text.slice(0, displayedLength)
    : message.text;

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
        <TouchableOpacity
          activeOpacity={isUser ? 0.8 : 1}
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
              <View style={{ paddingVertical: 4 }}>
                <TypingIndicator isDark={isDark} />
              </View>
            ) : (
              <Text
                style={[
                  isUser ? styles.userChatText : styles.aiChatText,
                  styles.chatTextMessage,
                  { color: isDark ? '#ffffff' : '#000000' },
                ]}
              >
                {displayedText}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {!isUser && (
          <View style={styles.actionRow}>
            {/* Version Switcher (e.g. < 2/2 >) if multiple versions exist */}
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
            )}

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

            {/* Regenerate */}
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
    maxWidth: '82%',
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
});
