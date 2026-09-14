import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, ButtonText } from '@/components/AppText';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { getResponsiveValue } from '@/constants/theme';

interface NativeWide3DButtonProps {
  label: string;
  onPress: () => void;
  enabled?: boolean;
  primaryColor?: string;
  shadowColor?: string;
  width: number;
}

export default function NativeWide3DButton({
  label,
  onPress,
  enabled = true,
  primaryColor = '#937abd',
  shadowColor = '#735b9c',
  width,
}: NativeWide3DButtonProps) {
  const height = getResponsiveValue(46, 52, 56, 60);
  const borderRadius = getResponsiveValue(23, 26, 28, 30);

  // Shared value running 100% on Native UI Thread / Worklet
  const pressProgress = useSharedValue(0);

  const animatedMidStyle = useAnimatedStyle(() => {
    'worklet';
    const offset = pressProgress.value;
    return {
      transform: [
        { translateX: offset * 2.5 },
        { translateY: offset * 2.5 },
      ],
    };
  });

  const animatedTopStyle = useAnimatedStyle(() => {
    'worklet';
    const offset = pressProgress.value;
    return {
      transform: [
        { translateX: offset * 5 },
        { translateY: offset * 5 },
      ],
    };
  });

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
    <View style={[styles.container, { width, height }]}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[styles.pressableArea, { width, height }]}>
          {/* Base shadow layer */}
          <View
            style={[
              styles.layer,
              {
                backgroundColor: enabled ? shadowColor : '#b0b0b0',
                borderRadius,
                width,
                height,
                top: 0,
                left: 0,
              },
            ]}
          />
          {/* Animated mid layer */}
          <Animated.View
            style={[
              styles.layer,
              {
                backgroundColor: enabled ? shadowColor : '#b0b0b0',
                borderRadius,
                width,
                height,
                top: getResponsiveValue(-1.5, -2, -2, -2),
                left: getResponsiveValue(-1.5, -2, -2, -2),
              },
              animatedMidStyle,
            ]}
          />
          {/* Animated top face */}
          <Animated.View
            style={[
              styles.layer,
              styles.topFace,
              {
                backgroundColor: enabled ? primaryColor : '#cccccc',
                borderRadius,
                width,
                height,
                top: getResponsiveValue(-3, -4, -4, -4),
                left: getResponsiveValue(-3, -4, -4, -4),
              },
              animatedTopStyle,
            ]}
          >
            <ButtonText style={styles.labelOverride}>{label}</ButtonText>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  pressableArea: {
    position: 'relative',
  },
  layer: {
    position: 'absolute',
  },
  topFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelOverride: {
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
