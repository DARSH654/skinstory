import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ArrowUp } from 'lucide-react-native';

export interface ChatInputBarProps {
  isDark: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isBotThinking?: boolean;
  placeholder?: string;
}

export const ChatInputBar = React.memo(function ChatInputBar({
  isDark,
  value,
  onChangeText,
  onSend,
  isBotThinking = false,
  placeholder = 'Type to get insights...',
}: ChatInputBarProps) {
  const inputRef = React.useRef<TextInput>(null);
  const textRef = React.useRef(value);
  textRef.current = value;

  // Clear native input directly when value is cleared from outside (e.g. after message sent)
  React.useEffect(() => {
    if (value === '') {
      inputRef.current?.clear();
    }
  }, [value]);

  const canSend = value.trim().length > 0 && !isBotThinking;
  const isSingleLineOrEmpty = value.trim().length === 0;

  return (
    <View
      style={[
        styles.inputBox,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e4e4e7',
        },
      ]}
    >
      <TextInput
        ref={inputRef}
        style={[
          styles.inputField,
          { color: isDark ? '#ffffff' : '#000000' },
          isSingleLineOrEmpty
            ? { textAlignVertical: 'center', paddingVertical: 0 }
            : { textAlignVertical: 'top', paddingVertical: 6 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
        defaultValue={value}
        onChangeText={onChangeText}
        multiline={true}
        maxLength={1000}
        returnKeyType="default"
        blurOnSubmit={false}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.7}
        style={[
          styles.sendBtn,
          {
            backgroundColor: canSend ? '#937abd' : isDark ? '#27272a' : '#e4e4e7',
          },
        ]}
      >
        <ArrowUp size={18} color={canSend ? '#ffffff' : isDark ? '#71717a' : '#9ca3af'} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
});

export default ChatInputBar;

const styles = StyleSheet.create({
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginHorizontal: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    minHeight: 34,
    maxHeight: 250,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
