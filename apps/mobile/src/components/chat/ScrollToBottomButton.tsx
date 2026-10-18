import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDown } from 'lucide-react-native';

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
      style={[styles.scrollButton, { backgroundColor: isDark ? '#27272a' : '#ffffff' }]}
      activeOpacity={0.8}
    >
      <ArrowDown size={20} color={isDark ? '#ffffff' : '#000000'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
});
