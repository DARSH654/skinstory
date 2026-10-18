import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function RoutineDetailSkeleton({ isDark }: { isDark: boolean }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

  const bgCard = isDark ? '#18181b' : '#ffffff';
  const borderCard = isDark ? '#27272a' : '#e5e7eb';
  const highlight = isDark ? '#2e2e33' : '#e4e4e7';
  const subHighlight = isDark ? '#27272a' : '#f3f4f6';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      {/* Header Area */}
      <View style={[styles.headerArea, { paddingTop: insets.top + 8 }]}>
        {/* Progress row: Real Back button + Skeleton Progress Bar */}
        <View style={styles.progressRow}>
          <Pressable
            style={[styles.backBtn, isDark ? styles.backBtnDark : styles.backBtnLight]}
            onPress={() => router.back()}
            hitSlop={6}
          >
            <ArrowLeft size={17} color={isDark ? '#f4f4f5' : '#111111'} strokeWidth={2.8} />
          </Pressable>

          <View style={[styles.trackBorder, isDark ? styles.trackBorderDark : styles.trackBorderLight]}>
            <View style={[styles.track, isDark ? styles.trackDark : styles.trackLight]}>
              <Animated.View style={[styles.trackFill, { backgroundColor: highlight, opacity: pulseAnim }]} />
            </View>
          </View>
        </View>

        {/* Title skeleton */}
        <Animated.View style={[styles.titleSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />

        {/* Step indicator skeleton */}
        <Animated.View style={[styles.stepSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />
      </View>

      {/* Main Slide Card Container extending down */}
      <View style={[styles.cardWrapper, { paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.slideCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
          {/* Card Top: Action pill + Product name skeleton */}
          <View style={styles.cardTop}>
            <Animated.View style={[styles.actionPillSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />
            <Animated.View style={[styles.productNameSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />
          </View>

          {/* Image Placeholder Skeleton */}
          <View style={styles.imageContainer}>
            <Animated.View style={[styles.imageSkeleton, { backgroundColor: subHighlight, opacity: pulseAnim }]} />
          </View>

          {/* Toggle buttons: Action, Do's, Don'ts */}
          <View style={styles.tabsContainer}>
            <View style={[styles.tabsBg, isDark ? styles.tabsBgDark : styles.tabsBgLight]}>
              <View style={[styles.tabBtn, isDark ? styles.tabActiveDark : styles.tabActiveLight]}>
                <Animated.View style={[styles.tabTextSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />
              </View>
              <View style={styles.tabBtn}>
                <Animated.View style={[styles.tabTextSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />
              </View>
              <View style={styles.tabBtn}>
                <Animated.View style={[styles.tabTextSkeleton, { backgroundColor: highlight, opacity: pulseAnim }]} />
              </View>
            </View>
          </View>

          {/* Content Items Skeleton (Numbered list lines) */}
          <View style={styles.tabContent}>
            <View style={[styles.contentCard, { backgroundColor: subHighlight, borderColor: borderCard }]}>
              <View style={styles.listContainer}>
                {[1, 2].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.listItemSkeleton,
                      { backgroundColor: isDark ? '#1f1f23' : '#ffffff', borderColor: borderCard, opacity: pulseAnim },
                    ]}
                  >
                    <View style={[styles.bulletSkeleton, { backgroundColor: highlight }]} />
                    <View style={[styles.lineSkeleton, { backgroundColor: highlight }]} />
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, alignItems: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10, marginBottom: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  backBtnLight: { backgroundColor: '#efefef' },
  backBtnDark: { backgroundColor: '#27272a' },
  trackBorder: { flex: 1, borderWidth: 2, borderRadius: 99, padding: 0.5 },
  trackBorderLight: { borderColor: '#111111' },
  trackBorderDark: { borderColor: '#ffffff' },
  track: { width: '100%', height: 6, borderRadius: 99, overflow: 'hidden' },
  trackLight: { backgroundColor: '#e8e8e8' },
  trackDark: { backgroundColor: 'rgba(255,255,255,0.15)' },
  trackFill: { height: '100%', width: '40%', borderRadius: 99 },

  titleSkeleton: { width: 140, height: 22, borderRadius: 11, marginBottom: 8 },
  stepSkeleton: { width: 85, height: 12, borderRadius: 6 },

  cardWrapper: { flex: 1, paddingHorizontal: 16 },
  slideCard: { flex: 1, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  cardTop: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  actionPillSkeleton: { width: 100, height: 24, borderRadius: 10, marginBottom: 10 },
  productNameSkeleton: { width: 160, height: 22, borderRadius: 8 },

  imageContainer: { marginHorizontal: 20, marginVertical: 12 },
  imageSkeleton: { width: '100%', aspectRatio: 1.15, borderRadius: 16 },

  tabsContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  tabsBg: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  tabsBgLight: { backgroundColor: '#f3f4f6' },
  tabsBgDark: { backgroundColor: '#27272a' },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabActiveLight: { backgroundColor: '#ffffff' },
  tabActiveDark: { backgroundColor: '#3f3f46' },
  tabTextSkeleton: { width: 45, height: 12, borderRadius: 6 },

  tabContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  contentCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  listContainer: { gap: 12 },
  listItemSkeleton: { flexDirection: 'row', padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 12 },
  bulletSkeleton: { width: 18, height: 18, borderRadius: 9 },
  lineSkeleton: { flex: 1, height: 14, borderRadius: 7 },
});
