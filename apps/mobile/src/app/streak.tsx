import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { X, Flame } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import fireAnimation from '../../assets/animations/fire.json';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface DayItem {
  day: string;
  isCompleted: boolean;
  dateStr?: string;
}

const WEEK_DAYS: DayItem[] = [
  { day: 'Sat', isCompleted: true },
  { day: 'Sun', isCompleted: true },
  { day: 'Mon', isCompleted: true },
  { day: 'Tue', isCompleted: true },
  { day: 'Wed', isCompleted: true },
  { day: 'Thu', isCompleted: false, dateStr: '08' },
  { day: 'Fri', isCompleted: false, dateStr: '09' },
];

export default function StreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Top Header Row with Cross (Close) Button */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.closeBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.08)',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          hitSlop={12}
        >
          <X size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Fire Icon Section */}
        <View style={styles.fireWrapper} collapsable={false}>
          <LottieView
            source={fireAnimation}
            autoPlay
            loop
            speed={1.5}
            style={{ width: 175, height: 175 }}
          />
        </View>

        {/* Title and Motivational Subtitle */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            5 Days Streaks
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)' },
            ]}
          >
            Great job! Just 2 more days to earn your trophy.
          </Text>
        </View>

        {/* Days Tracker Card (Sat, Sun, Mon, Tue, Wed, Thu, Fri) */}
        <View
          style={[
            styles.weekCard,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <View style={styles.daysRow}>
            {WEEK_DAYS.map((item, index) => {
              return (
                <View key={index} style={styles.dayCol}>
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isDark
                          ? 'rgba(255, 255, 255, 0.55)'
                          : 'rgba(0, 0, 0, 0.5)',
                        fontWeight: item.isCompleted ? '600' : '400',
                      },
                    ]}
                  >
                    {item.day}
                  </Text>

                  {item.isCompleted ? (
                    <View
                      style={[
                        styles.dayIndicatorCompleted,
                        {
                          backgroundColor: isDark
                            ? 'rgba(147, 122, 189, 0.2)'
                            : '#f0ecf7',
                          borderColor: '#937abd',
                        },
                      ]}
                    >
                      <LottieView
                        source={fireAnimation}
                        autoPlay
                        loop
                        speed={1.5}
                        style={{ width: 22, height: 22 }}
                      />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.dayIndicatorIncomplete,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : '#fafafa',
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(0, 0, 0, 0.08)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateNumText,
                          {
                            color: isDark
                              ? 'rgba(255, 255, 255, 0.45)'
                              : 'rgba(0, 0, 0, 0.45)',
                          },
                        ]}
                      >
                        {item.dateStr}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom "Let's go!" Button with consistent gap */}
      <View style={[styles.bottomBarFixed, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.letsGoBtn,
            {
              backgroundColor: '#937abd',
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={styles.letsGoBtnText}>Let's go!</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  fireWrapper: {
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
  },
  weekCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 36,
    paddingVertical: 22,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dayCol: {
    alignItems: 'center',
    gap: 10,
  },
  dayLabel: {
    fontSize: 13,
  },
  dayIndicatorCompleted: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayIndicatorIncomplete: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBarFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  letsGoBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#937abd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  letsGoBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
});
