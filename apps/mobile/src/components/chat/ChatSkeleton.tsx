import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function ChatSkeleton({ isDark }: { isDark: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const shimmerColor = isDark ? '#27272a' : '#e4e4e7';

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View
        style={[
          styles.skeletonBubble,
          {
            width: '75%',
            height: 52,
            alignSelf: 'flex-start',
            backgroundColor: shimmerColor,
            opacity: pulseAnim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonBubble,
          {
            width: '60%',
            height: 42,
            alignSelf: 'flex-end',
            backgroundColor: shimmerColor,
            opacity: pulseAnim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonBubble,
          {
            width: '85%',
            height: 64,
            alignSelf: 'flex-start',
            backgroundColor: shimmerColor,
            opacity: pulseAnim,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  skeletonBubble: {
    borderRadius: 16,
  },
});
