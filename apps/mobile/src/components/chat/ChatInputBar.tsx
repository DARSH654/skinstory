import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ArrowUp } from 'lucide-react-native';

export interface ChatInputBarProps {
  isDark: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isBotThinking?: boolean;
  placeholder?: string;
}

export const ChatInputBar = React.memo(function ChatInputBar({
  isDark,
  value,
  onChangeText,
  onSend,
  onStop,
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

  // Ensure keyboard never auto-opens on mount/screen entry
  React.useEffect(() => {
    inputRef.current?.blur();
  }, []);

  const canSend = value.trim().length > 0;
  const [isMultiLine, setIsMultiLine] = React.useState(false);

  // If value has a newline or was cleared, update multiline state
  React.useEffect(() => {
    if (value === '') {
      setIsMultiLine(false);
    } else if (value.includes('\n')) {
      setIsMultiLine(true);
    }
  }, [value]);

  return (
    <View
      style={[
        styles.inputBox,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e4e4e7',
          alignItems: isMultiLine ? 'flex-end' : 'center',
        },
      ]}
    >
      <TextInput
        ref={inputRef}
        style={[
          styles.inputField,
          { color: isDark ? '#ffffff' : '#000000' },
          isMultiLine
            ? { textAlignVertical: 'top', paddingTop: 2, paddingBottom: 0 }
            : { textAlignVertical: 'center', paddingVertical: 0 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
        defaultValue={value}
        onChangeText={(text) => {
          if (!text) {
            setIsMultiLine(false);
          }
          onChangeText(text);
        }}
        onContentSizeChange={(e) => {
          const height = e.nativeEvent.contentSize.height;
          // Guard: Empty input is NEVER multiline (prevents Android empty layout transient spike)
          const multilineActive = Boolean(value) && (height > 36 || value.includes('\n'));
          if (multilineActive !== isMultiLine) {
            setIsMultiLine(multilineActive);
          }
        }}
        multiline={true}
        maxLength={1000}
        returnKeyType="default"
        blurOnSubmit={false}
        autoFocus={false}
      />

      {isBotThinking ? (
        <TouchableOpacity
          onPress={() => {
            console.log('[DEBUG_STOP_1] Stop button onPress FIRED in ChatInputBar! isBotThinking:', isBotThinking);
            if (onStop) {
              console.log('[DEBUG_STOP_2] Calling onStop callback from ChatInputBar...');
              onStop();
            } else {
              console.warn('[DEBUG_STOP_WARN] onStop prop is undefined in ChatInputBar!');
            }
          }}
          onPressIn={() => console.log('[DEBUG_TOUCH] Stop button onPressIn registered')}
          activeOpacity={0.7}
          style={styles.stopBtn}
        >
          <View style={styles.stopInnerSquare} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (canSend) onSend();
          }}
          disabled={!canSend}
          activeOpacity={0.7}
          style={[
            styles.sendBtn,
            {
              backgroundColor: canSend ? '#937abd' : isDark ? '#27272a' : '#e4e4e7',
            },
          ]}
        >
          <ArrowUp
            size={18}
            color={canSend ? '#ffffff' : isDark ? '#71717a' : '#9ca3af'}
            strokeWidth={2.4}
          />
        </TouchableOpacity>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 34,
    maxHeight: 250,
    includeFontPadding: false,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    alignSelf: 'flex-end',
  },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    alignSelf: 'flex-end',
    backgroundColor: '#937abd', // primary color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  stopInnerSquare: {
    width: 13,
    height: 13,
    borderRadius: 3,
    backgroundColor: '#ffffff', // white square inside
  },
});
