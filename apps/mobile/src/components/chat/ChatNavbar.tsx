import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { Pencil } from 'lucide-react-native';
import { Text } from '@/components/AppText';

interface ChatNavbarProps {
  isDark: boolean;
  displayTitle: string;
  isNewChat?: boolean;
  isTemporaryChat?: boolean;
  onOpenDrawer: () => void;
  onNewChat?: () => void;
  onOpenMenu?: () => void;
  onTemporaryChat?: () => void;
}

export default function ChatNavbar({
  isDark,
  displayTitle,
  isNewChat = false,
  isTemporaryChat = false,
  onOpenDrawer,
  onNewChat,
  onOpenMenu,
  onTemporaryChat,
}: ChatNavbarProps) {
  const iconColor = isDark ? '#ffffff' : '#09090b';
  const circleBg = isDark ? '#18181b' : '#ffffff';
  const circleBorder = isDark ? '#27272a' : '#e4e4e7';

  // 1. New Chat Mode (when chat has not yet started)
  if (isNewChat) {
    return (
      <View
        style={[
          styles.navbar,
          styles.navbarNewChat,
        ]}
      >
        {/* Left Side: Circular Menu Button (2 horizontal lines like screenshot) */}
        <TouchableOpacity
          onPress={onOpenDrawer}
          activeOpacity={0.7}
          style={[
            styles.circleBtn,
            {
              backgroundColor: circleBg,
              borderColor: circleBorder,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Svg width={18} height={14} viewBox="0 0 18 14" fill="none">
            <Line x1="1" y1="3" x2="17" y2="3" stroke={iconColor} strokeWidth={2.4} strokeLinecap="round" />
            <Line x1="1" y1="11" x2="11" y2="11" stroke={iconColor} strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>

        {/* Right Side: Circular Temporary Chat Button (dashed chat bubble + checkmark when active) */}
        <TouchableOpacity
          onPress={onTemporaryChat}
          activeOpacity={0.7}
          style={[
            styles.circleBtn,
            {
              backgroundColor: circleBg,
              borderColor: circleBorder,
            },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
              stroke={iconColor}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2.8 3.6"
            />
            {isTemporaryChat && (
              <Path
                d="M8.5 12l2.2 2.2 4.2-4.2"
                stroke={iconColor}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Active Chat Mode (Chat in progress: menu button on left, new chat pill + 3 dots on right)
  return (
    <View
      style={[
        styles.navbar,
        styles.navbarActiveChat,
      ]}
    >
      {/* Left Side: Circular Menu Button to open drawer */}
      <TouchableOpacity
        onPress={onOpenDrawer}
        activeOpacity={0.7}
        style={[
          styles.circleBtn,
          {
            backgroundColor: circleBg,
            borderColor: circleBorder,
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Svg width={18} height={14} viewBox="0 0 18 14" fill="none">
          <Line x1="1" y1="3" x2="17" y2="3" stroke={iconColor} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1="1" y1="11" x2="11" y2="11" stroke={iconColor} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      </TouchableOpacity>

      {/* Right Side: Pill with New Chat Icon & Three-Dot Menu Icon */}
      <View
        style={[
          styles.rightActionPill,
          {
            backgroundColor: circleBg,
            borderColor: circleBorder,
          },
        ]}
      >
        {/* New Chat Button */}
        <TouchableOpacity
          onPress={onNewChat}
          activeOpacity={0.7}
          style={styles.pillActionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
              stroke={iconColor}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Three Dots More Menu Button */}
        <TouchableOpacity
          onPress={onOpenMenu}
          activeOpacity={0.7}
          style={styles.pillActionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="5.01" stroke={iconColor} strokeWidth={3} strokeLinecap="round" />
            <Line x1="12" y1="12" x2="12" y2="12.01" stroke={iconColor} strokeWidth={3} strokeLinecap="round" />
            <Line x1="12" y1="19" x2="12" y2="19.01" stroke={iconColor} strokeWidth={3} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navbarNewChat: {
    justifyContent: 'space-between',
  },
  navbarActiveChat: {
    justifyContent: 'space-between',
  },
  circleBtn: {
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
  rightActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 6,
    borderRadius: 19,
    borderWidth: 1,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillActionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
