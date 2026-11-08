import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from '@/components/AppText';
import { Pencil, Trash2 } from 'lucide-react-native';

interface SkinItemActionMenuProps {
  visible: boolean;
  isDark: boolean;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SkinItemActionMenu({
  visible,
  isDark,
  anchorX,
  anchorY,
  onClose,
  onEdit,
  onDelete,
}: SkinItemActionMenuProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 160,
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
    outputRange: [-6, 0],
  });

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // Viewport containment: position popup safely near touch coordinates
  const menuWidth = 125;
  const left = Math.min(Math.max(anchorX - 35, 16), windowWidth - menuWidth - 16);
  const top = Math.min(Math.max(anchorY - 20, 50), windowHeight - 160);

  const iconColor = isDark ? '#d4d4d8' : '#374151';
  const textColor = isDark ? '#f4f4f5' : '#111827';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.menuCard,
            {
              top,
              left,
              backgroundColor: isDark ? '#1e1e23' : '#ffffff',
              borderColor: isDark ? '#2e2e36' : '#e5e7eb',
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* 1. Edit Option */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.65}
            onPress={() => {
              onClose();
              onEdit();
            }}
          >
            <Pencil size={16} color={iconColor} strokeWidth={2.2} />
            <Text style={[styles.menuItemText, { color: textColor }]}>
              Edit
            </Text>
          </TouchableOpacity>

          {/* 2. Delete Option */}
          <TouchableOpacity
            style={[styles.menuItem, styles.deleteItem]}
            activeOpacity={0.65}
            onPress={() => {
              onClose();
              onDelete();
            }}
          >
            <Trash2 size={16} color="#ef4444" strokeWidth={2.2} />
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
    width: 125,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  deleteItem: {
    marginTop: 0,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
