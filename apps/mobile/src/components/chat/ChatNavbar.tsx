import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, Pencil } from 'lucide-react-native';
import { Text } from '@/components/AppText';

interface ChatNavbarProps {
  isDark: boolean;
  displayTitle: string;
  onBack: () => void;
  onEditTitle: () => void;
}

export default function ChatNavbar({
  isDark,
  displayTitle,
  onBack,
  onEditTitle,
}: ChatNavbarProps) {
  return (
    <View
      style={[
        styles.navbar,
        {
          backgroundColor: isDark ? '#09090b' : '#fafafa',
        },
      ]}
    >
      {/* Left Side: Circular Back Button with Chevron pointing left */}
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        style={[
          styles.backCircleBtn,
          {
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            borderColor: isDark ? '#27272a' : '#e4e4e7',
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeft size={18} color={isDark ? '#ffffff' : '#000000'} strokeWidth={2.4} />
      </TouchableOpacity>

      {/* Title Row: left-aligned, larger title + Pencil icon */}
      <TouchableOpacity
        onPress={onEditTitle}
        activeOpacity={0.7}
        style={styles.titleRow}
      >
        <Text
          numberOfLines={1}
          style={[styles.navTitle, { color: isDark ? '#ffffff' : '#000000' }]}
        >
          {displayTitle}
        </Text>
        <Pencil size={14} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
