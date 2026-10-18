import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, Pencil, Zap } from 'lucide-react-native';
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
          borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
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
        <ChevronLeft size={20} color={isDark ? '#ffffff' : '#000000'} strokeWidth={2.4} />
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
        <Pencil size={16} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2.2} />
      </TouchableOpacity>

      {/* Flex spacer */}
      <View style={{ flex: 1 }} />

      {/* Credits pill */}
      <View
        style={[
          styles.creditsPill,
          {
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            borderColor: isDark ? '#27272a' : '#e4e4e7',
          },
        ]}
      >
        <Zap size={14} strokeWidth={2} color={isDark ? '#e4e4e7' : '#18181b'} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.creditsText,
            { color: isDark ? '#a1a1aa' : '#71717a' },
          ]}
        >
          12 credits left
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: '40%',
  },
  creditsText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
});
