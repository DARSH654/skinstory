import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function TypingIndicator({ isDark }: { isDark: boolean }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnim = (animVal: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animVal, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(animVal, {
            toValue: 0.3,
            duration: 380,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
    };

    const anim1 = createAnim(dot1, 0);
    const anim2 = createAnim(dot2, 180);
    const anim3 = createAnim(dot3, 360);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotBg = isDark ? '#ffffff' : '#111827';

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { opacity: dot1, backgroundColor: dotBg }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2, backgroundColor: dotBg }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3, backgroundColor: dotBg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
