import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface ScrollToBottomButtonProps {
  isDark: boolean;
  onPress: () => void;
}

export default function ScrollToBottomButton({
  isDark,
  onPress,
}: ScrollToBottomButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.scrollButton,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e4e4e7',
        },
      ]}
      activeOpacity={0.7}
    >
      <ChevronDown size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});
