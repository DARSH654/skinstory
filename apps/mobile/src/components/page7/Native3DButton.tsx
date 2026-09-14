import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import { getResponsiveValue } from '@/constants/theme';

interface Native3DButtonProps {
  enabled: boolean;
  onPress: () => void;
  primaryColor?: string;
  shadowColor?: string;
}

export default function Native3DButton({
  enabled,
  onPress,
  primaryColor = '#937abd',
  shadowColor = '#735b9c',
}: Native3DButtonProps) {
  // Shared value running 100% on Native UI Thread / Worklet
  const pressProgress = useSharedValue(0);

  const animatedMidStyle = useAnimatedStyle(() => {
    'worklet';
    const offset = pressProgress.value;
    return {
      transform: [
        { translateX: offset * 3 },
        { translateY: offset * 3 },
      ],
    };
  });

  const animatedTopStyle = useAnimatedStyle(() => {
    'worklet';
    const offset = pressProgress.value;
    return {
      transform: [
        { translateX: offset * 6 },
        { translateY: offset * 6 },
      ],
    };
  });

  // Native Gesture Handler directly on the UI worker thread
  const tapGesture = Gesture.Tap()
    .enabled(enabled)
    .maxDuration(10000)
    .onBegin(() => {
      'worklet';
      pressProgress.value = withTiming(1, {
        duration: 40,
        easing: Easing.out(Easing.quad),
      });
    })
    .onFinalize(() => {
      'worklet';
      pressProgress.value = withTiming(0, {
        duration: 70,
        easing: Easing.out(Easing.quad),
      });
    })
    .onEnd(() => {
      'worklet';
      runOnJS(onPress)();
    });

  return (
    <View style={styles.button3DContainer}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={styles.pressableArea}>
          {/* Base shadow layer */}
          <View
            style={[
              styles.buttonShadow,
              { backgroundColor: enabled ? shadowColor : '#cccccc' },
            ]}
          />
          {/* Animated Mid layer (Native UI thread) */}
          <Animated.View
            style={[
              styles.buttonMid,
              { backgroundColor: enabled ? shadowColor : '#cccccc' },
              animatedMidStyle,
            ]}
          />
          {/* Animated Top face layer (Native UI thread) */}
          <Animated.View
            style={[
              styles.nextButton,
              { backgroundColor: enabled ? primaryColor : '#d4d4d4' },
              animatedTopStyle,
            ]}
          >
            <ArrowRight
              size={getResponsiveValue(18, 20, 22, 24)}
              color={enabled ? '#ffffff' : '#aaaaaa'}
              strokeWidth={3}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  button3DContainer: {
    width: getResponsiveValue(44, 52, 60, 64),
    height: getResponsiveValue(44, 52, 60, 64),
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  buttonShadow: {
    width: '100%',
    height: '100%',
    borderRadius: getResponsiveValue(22, 26, 30, 32),
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonMid: {
    width: '100%',
    height: '100%',
    borderRadius: getResponsiveValue(22, 26, 30, 32),
    position: 'absolute',
    top: getResponsiveValue(-2, -2.5, -2.5, -2.5),
    left: getResponsiveValue(-2, -2.5, -2.5, -2.5),
  },
  nextButton: {
    width: '100%',
    height: '100%',
    borderRadius: getResponsiveValue(22, 26, 30, 32),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: getResponsiveValue(-4, -5, -5, -5),
    left: getResponsiveValue(-4, -5, -5, -5),
  },
});
