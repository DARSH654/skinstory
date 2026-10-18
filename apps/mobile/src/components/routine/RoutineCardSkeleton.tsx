import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function RoutineCardSkeleton({ isDark }: { isDark: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const bgBase = isDark ? '#1f1f23' : '#e4e4e7';
  const highlight = isDark ? '#2e2e33' : '#f4f4f5';

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: bgBase,
          opacity: pulseAnim,
          borderColor: isDark ? '#27272a' : '#e5e7eb',
        },
      ]}
    >
      {/* Top author pill placeholder */}
      <View style={styles.topRow}>
        <View style={[styles.pillPlaceholder, { backgroundColor: highlight }]} />
      </View>

      {/* Middle Section: Title + Subtitle container matching RoutineCard */}
      <View style={[styles.textOverlayBox, { backgroundColor: highlight }]}>
        <View style={[styles.lineLarge, { backgroundColor: isDark ? '#3f3f46' : '#d4d4d8' }]} />
        <View style={[styles.lineSmall, { backgroundColor: isDark ? '#3f3f46' : '#d4d4d8' }]} />
        <View style={[styles.lineSmallExtra, { backgroundColor: isDark ? '#3f3f46' : '#d4d4d8' }]} />
      </View>

      {/* Bottom pills row */}
      <View style={styles.bottomRow}>
        <View style={styles.bottomLeftPills}>
          <View style={[styles.codePill, { backgroundColor: highlight }]} />
          <View style={[styles.stepPill, { backgroundColor: highlight }]} />
        </View>
        <View style={styles.actionsPlaceholder}>
          <View style={[styles.iconCircle, { backgroundColor: highlight }]} />
          <View style={[styles.iconCircle, { backgroundColor: highlight }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    width: '100%',
    minHeight: 280,
    borderRadius: 22,
    marginBottom: 16,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillPlaceholder: {
    width: 110,
    height: 28,
    borderRadius: 14,
  },
  textOverlayBox: {
    padding: 12,
    borderRadius: 16,
    gap: 8,
    marginVertical: 14,
  },
  lineLarge: {
    width: '45%',
    height: 14,
    borderRadius: 7,
  },
  lineSmall: {
    width: '80%',
    height: 10,
    borderRadius: 5,
  },
  lineSmallExtra: {
    width: '60%',
    height: 10,
    borderRadius: 5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  bottomLeftPills: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  codePill: {
    width: 115,
    height: 28,
    borderRadius: 14,
  },
  stepPill: {
    width: 65,
    height: 28,
    borderRadius: 14,
  },
  actionsPlaceholder: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
