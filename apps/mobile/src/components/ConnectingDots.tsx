import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

interface ConnectingDotsProps {
  count: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  isDark: boolean;
  dotSize?: number;
  pillWidth?: number;
  dotGap?: number;
}

function AnimatedDotItem({
  index,
  scrollX,
  itemWidth,
  dotSize,
  pillWidth,
  isDark,
  dotGap,
  isLast,
}: {
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  dotSize: number;
  pillWidth: number;
  isDark: boolean;
  dotGap: number;
  isLast: boolean;
}) {
  const activeBg = '#937abd';
  const inactiveBg = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.22)';
  const borderColor = isDark ? '#ffffff' : '#000000';

  const animStyle = useAnimatedStyle(() => {
    const p = itemWidth > 0 ? scrollX.value / itemWidth : 0;
    const dist = Math.abs(p - index);
    const width = interpolate(
      dist,
      [0, 1],
      [pillWidth, dotSize],
      Extrapolation.CLAMP
    );
    const height = interpolate(
      dist,
      [0, 1],
      [10, dotSize],
      Extrapolation.CLAMP
    );
    const borderWidth = interpolate(
      dist,
      [0, 1],
      [1.5, 0],
      Extrapolation.CLAMP
    );
    const backgroundColor = interpolateColor(
      dist,
      [0, 1],
      [activeBg, inactiveBg]
    );

    return {
      width,
      height,
      borderWidth,
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={[
        {
          borderRadius: 5,
          borderColor,
          marginRight: isLast ? 0 : dotGap,
        },
        animStyle,
      ]}
    />
  );
}

export default function ConnectingDots({
  count,
  scrollX,
  itemWidth,
  isDark,
  dotSize = 9,
  pillWidth = 24,
  dotGap = 8,
}: ConnectingDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <AnimatedDotItem
          key={i}
          index={i}
          scrollX={scrollX}
          itemWidth={itemWidth}
          dotSize={dotSize}
          pillWidth={pillWidth}
          isDark={isDark}
          dotGap={dotGap}
          isLast={i === count - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: 14,
  },
});
