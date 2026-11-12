import React, { useEffect } from 'react';
import { StyleSheet, Modal, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/AppText';

export interface FutureLockModalProps {
  visible: boolean;
  origin: { x: number; y: number };
  isDark: boolean;
  onClose: () => void;
}

export default function FutureLockModal({
  visible,
  origin,
  isDark,
  onClose,
}: FutureLockModalProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 340,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  }, [visible]);

  const handleDismiss = () => {
    progress.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const animatedModalStyle = useAnimatedStyle(() => {
    const targetX = SCREEN_WIDTH / 2;
    const targetY = SCREEN_HEIGHT / 2;
    const originX = origin.x || targetX;
    const originY = origin.y || targetY;

    const translateX = interpolate(progress.value, [0, 1], [originX - targetX, 0]);
    const translateY = interpolate(progress.value, [0, 1], [originY - targetY, 0]);
    const scale = interpolate(progress.value, [0, 1], [0.12, 1]);
    const opacity = interpolate(progress.value, [0, 0.25, 1], [0, 1, 1]);

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss}>
        <Animated.View style={[styles.modalBackdrop, animatedBackdropStyle]}>
          <Animated.View style={animatedModalStyle}>
            <Pressable
              style={[
                styles.modalCard,
                isDark ? styles.modalCardDark : styles.modalCardLight,
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                style={[
                  styles.modalText,
                  isDark ? styles.textDark : styles.textLight,
                ]}
              >
                Forecast unlocks as you get closer. Please log in daily.
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalCardLight: {
    backgroundColor: '#FAF8F6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalCardDark: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2b2b30',
  },
  modalText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#ffffff',
  },
});
