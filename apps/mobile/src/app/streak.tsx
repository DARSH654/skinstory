import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { X, Flame, ArrowUpRight } from 'lucide-react-native';
import Svg, { Polygon, Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import fireAnimation from '../../assets/animations/fire.json';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

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

interface Badge {
  days: number;
  unlocked: boolean;
  colorGrad: [string, string];
  borderColor: string;
  shadowColor: string;
}

const BADGES: Badge[] = [
  {
    days: 3,
    unlocked: true,
    colorGrad: ['#ff6b6b', '#ee5253'],
    borderColor: '#ff8787',
    shadowColor: '#ee5253',
  },
  {
    days: 7,
    unlocked: true,
    colorGrad: ['#ff74a4', '#f04380'],
    borderColor: '#ffa2c0',
    shadowColor: '#f04380',
  },
  {
    days: 14,
    unlocked: false,
    colorGrad: ['#9ca3af', '#6b7280'],
    borderColor: '#cbd5e1',
    shadowColor: '#6b7280',
  },
  {
    days: 30,
    unlocked: false,
    colorGrad: ['#94a3b8', '#64748b'],
    borderColor: '#cbd5e1',
    shadowColor: '#64748b',
  },
  {
    days: 60,
    unlocked: false,
    colorGrad: ['#d1d5db', '#9ca3af'],
    borderColor: '#e5e7eb',
    shadowColor: '#9ca3af',
  },
];

function HexagonBadge({ badge }: { badge: Badge }) {
  const W = 136;
  const H = 150;
  const gradId = `hexGrad-${badge.days}`;
  const strokeGradId = `hexStroke-${badge.days}`;

  // Sharp pointy-topped hexagon SVG points for 136x150 container
  const points = '68,5 129,40 129,110 68,145 7,110 7,40';
  const innerGlossPoints = '68,10 124,42 124,75 68,75 12,75 12,42';

  return (
    <View style={styles.badgeHexagonOuter}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor={badge.colorGrad[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={badge.colorGrad[1]} stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id={strokeGradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={badge.borderColor} stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.4)" stopOpacity="0.8" />
          </SvgGradient>
        </Defs>

        {/* Outer Hexagon Shape */}
        <Polygon
          points={points}
          fill={`url(#${gradId})`}
          stroke={`url(#${strokeGradId})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Top Gloss Highlight */}
        <Polygon
          points={innerGlossPoints}
          fill="rgba(255, 255, 255, 0.22)"
        />
      </Svg>

      {/* Centered Badge Number */}
      <View style={styles.badgeTextCenter}>
        <Text style={styles.badgeText}>{badge.days}</Text>
        <Text style={styles.badgeDaysLabel}>DAYS</Text>
      </View>
    </View>
  );
}

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
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Fire Icon Section */}
        <View style={styles.fireWrapper}>
          <LottieView
            source={fireAnimation}
            autoPlay
            loop
            speed={1.2}
            style={{ width: 175, height: 175 }}
          />
        </View>

        {/* Title and Motivational Subtitle */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.titleSection}>
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
        </Animated.View>

        {/* Days Tracker Card (Sat, Sun, Mon, Tue, Wed, Thu, Fri) */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(500)}
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
                          borderColor: isDark
                            ? '#937abd'
                            : '#937abd',
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
        </Animated.View>

        {/* My Badges Card */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(500)}
          style={[
            styles.badgesCard,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <View style={styles.badgesHeader}>
            <Text style={[styles.badgesTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              My Badges
            </Text>
            <Pressable
              onPress={() => router.push('/badges')}
              style={({ pressed }) => [
                styles.viewAllBtn,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              hitSlop={8}
            >
              <Text style={[styles.viewAllText, { color: isDark ? '#ffffff' : '#000000' }]}>
                View all achievements
              </Text>
              <ArrowUpRight size={17} color={isDark ? '#ffffff' : '#000000'} strokeWidth={2.6} />
            </Pressable>
          </View>

          {/* Smooth free-sliding horizontal badges carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScrollContent}
            decelerationRate="normal"
          >
            {BADGES.map((b, idx) => (
              <View key={idx} style={styles.badgeItem}>
                <HexagonBadge badge={b} />
              </View>
            ))}
          </ScrollView>
        </Animated.View>
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
    marginTop: 18,
    paddingVertical: 20,
    paddingHorizontal: 10,
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
  /* My Badges Card */
  badgesCard: {
    width: '100%',
    minHeight: 255,
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 16,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  badgesTitle: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  /* Badges Carousel */
  badgesScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 18,
  },
  badgeItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeHexagonOuter: {
    width: 136,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeTextCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 44,
  },
  badgeDaysLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1.4,
    marginTop: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* Fixed Bottom Let's Go Button */
  bottomBarFixed: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  letsGoBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#937abd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  letsGoBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
