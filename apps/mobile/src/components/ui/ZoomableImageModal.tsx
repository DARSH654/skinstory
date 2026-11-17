import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ZoomableImageModalProps {
  visible: boolean;
  onClose: () => void;
  imageSource: ImageSourcePropType | string;
  isDark?: boolean;
  badgeLabel?: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function ZoomableImageModal({
  visible,
  onClose,
  imageSource,
  isDark = true,
  badgeLabel,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
}: ZoomableImageModalProps) {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = useCallback(() => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  // Reset transforms whenever visibility toggles or source changes
  useEffect(() => {
    if (visible) {
      resetZoom();
    }
  }, [visible, imageSource, resetZoom]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      scale.value = Math.max(0.8, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1.05) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 4.5) {
        scale.value = withTiming(4.5);
        savedScale.value = 4.5;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      'worklet';
      if (scale.value > 1.05) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      if (scale.value <= 1.05) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        const maxPanX = (SCREEN_WIDTH * (scale.value - 1)) / 2 + 40;
        const maxPanY = (SCREEN_HEIGHT * (scale.value - 1)) / 2 + 40;
        if (Math.abs(translateX.value) > maxPanX) {
          translateX.value = withTiming(Math.sign(translateX.value) * maxPanX);
        }
        if (Math.abs(translateY.value) > maxPanY) {
          translateY.value = withTiming(Math.sign(translateY.value) * maxPanY);
        }
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      if (scale.value > 1.2) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedImageStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const resolvedSource =
    typeof imageSource === 'string' ? { uri: imageSource } : imageSource;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Blurred Depth Backdrop */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 90}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, styles.backdropOverlay]} />

        {/* Tap outside backdrop to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Top Controls: X Close Button */}
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 16 }]}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <X size={20} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Optional Badge (e.g. Date or Category) */}
        {badgeLabel && (
          <View style={[styles.badgePill, { top: insets.top + 18 }]}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        )}

        {/* Interactive Viewport-Contained Image Area */}
        <View style={styles.viewportArea} pointerEvents="box-none">
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.gestureWrapper, animatedImageStyle]}>
              <Image
                source={resolvedSource}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Chevrons for Multi-Image Comparison (e.g. Before / After) */}
        {hasPrevious && onPrevious && (
          <TouchableOpacity
            style={[styles.navChevron, styles.chevronLeft]}
            onPress={onPrevious}
            activeOpacity={0.8}
          >
            <ChevronLeft size={28} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        {hasNext && onNext && (
          <TouchableOpacity
            style={[styles.navChevron, styles.chevronRight]}
            onPress={onNext}
            activeOpacity={0.8}
          >
            <ChevronRight size={28} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  badgePill: {
    position: 'absolute',
    left: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 40,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  viewportArea: {
    width: SCREEN_WIDTH - 24,
    height: SCREEN_HEIGHT * 0.78,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gestureWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  navChevron: {
    position: 'absolute',
    top: '50%',
    marginTop: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 40,
  },
  chevronLeft: {
    left: 12,
  },
  chevronRight: {
    right: 12,
  },
});
