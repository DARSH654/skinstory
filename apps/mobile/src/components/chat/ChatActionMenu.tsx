import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/AppText';
import { Pin, Pencil, Trash2 } from 'lucide-react-native';

interface ChatActionMenuProps {
  visible: boolean;
  isDark: boolean;
  chatTitle: string;
  isPinned: boolean;
  topOffset: number;
  onClose: () => void;
  onTogglePin: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function ChatActionMenu({
  visible,
  isDark,
  chatTitle,
  isPinned,
  topOffset,
  onClose,
  onTogglePin,
  onRename,
  onDelete,
}: ChatActionMenuProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [visible, anim]);

  if (!visible) return null;

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  const iconColor = isDark ? '#d4d4d8' : '#374151';
  const textColor = isDark ? '#f4f4f5' : '#111827';
  const subColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.menuCard,
            {
              top: topOffset,
              backgroundColor: isDark ? '#1e1e23' : '#ffffff',
              borderColor: isDark ? '#2e2e36' : '#e5e7eb',
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Header row: Chat Title truncated with dot dot dot */}
          <View style={[styles.titleHeader, { borderBottomColor: isDark ? '#2e2e36' : '#f3f4f6' }]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.headerTitleText, { color: subColor }]}
            >
              {chatTitle}
            </Text>
          </View>

          {/* Option 1: Pin / Unpin */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.65}
            onPress={() => {
              onClose();
              onTogglePin();
            }}
          >
            <Pin size={18} color={iconColor} strokeWidth={2.2} />
            <Text style={[styles.menuItemText, { color: textColor }]}>
              {isPinned ? 'Unpin' : 'Pin'}
            </Text>
          </TouchableOpacity>

          {/* Option 2: Rename */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.65}
            onPress={() => {
              onClose();
              onRename();
            }}
          >
            <Pencil size={18} color={iconColor} strokeWidth={2.2} />
            <Text style={[styles.menuItemText, { color: textColor }]}>
              Rename
            </Text>
          </TouchableOpacity>

          {/* Option 3: Delete (in red) */}
          <TouchableOpacity
            style={[styles.menuItem, styles.deleteItem]}
            activeOpacity={0.65}
            onPress={() => {
              onClose();
              onDelete();
            }}
          >
            <Trash2 size={18} color="#ef4444" strokeWidth={2.2} />
            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuCard: {
    position: 'absolute',
    right: 16,
    width: 220,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 9999,
  },
  titleHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  headerTitleText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteItem: {
    marginTop: 2,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
