import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  size?: number; // Size of the bounding box
  color?: string; // Color of the squares
  style?: ViewStyle;
}

export default function Logo({ size = 100, color = '#111111', style }: Props) {
  // Let the larger square take up ~62% of the space, and the smaller take up ~38%
  const largeSize = size * 0.62;
  const smallSize = size * 0.38;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Top Right (Larger Square) */}
      <View
        style={[
          styles.square,
          {
            backgroundColor: color,
            width: largeSize,
            height: largeSize,
            top: 0,
            right: 0,
          },
        ]}
      />
      {/* Bottom Left (Smaller Square) */}
      <View
        style={[
          styles.square,
          {
            backgroundColor: color,
            width: smallSize,
            height: smallSize,
            bottom: 0,
            left: 0,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  square: {
    position: 'absolute',
  },
});
