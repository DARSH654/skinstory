import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChevronLeft, Flame, Award, Lock, Sparkles, Check } from 'lucide-react-native';
import Svg, { Polygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AchievementBadge {
  id: string;
  days: number;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  colorGrad: [string, string];
  borderColor: string;
  shadowColor: string;
}

const ALL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge-3',
    days: 3,
    title: 'Spark Starter',
    description: 'Maintained a consecutive skincare routine for 3 days',
    unlocked: true,
    unlockedDate: 'Unlocked Sep 29',
    colorGrad: ['#ff6b6b', '#ee5253'],
    borderColor: '#ff8787',
    shadowColor: '#ee5253',
  },
  {
    id: 'badge-7',
    days: 7,
    title: 'Glow Getter',
    description: 'Completed a full 7-day skincare streak without missing',
    unlocked: true,
    unlockedDate: 'Unlocked Oct 01',
    colorGrad: ['#ff74a4', '#f04380'],
    borderColor: '#ffa2c0',
    shadowColor: '#f04380',
  },
  {
    id: 'badge-14',
    days: 14,
    title: 'Radiance Master',
    description: 'Consistent daily regimen for 14 continuous days',
    unlocked: false,
    colorGrad: ['#9ca3af', '#6b7280'],
    borderColor: '#cbd5e1',
    shadowColor: '#6b7280',
  },
  {
    id: 'badge-30',
    days: 30,
    title: 'Skin Champion',
    description: 'A month of dedication and proven skin transformation',
    unlocked: false,
    colorGrad: ['#94a3b8', '#64748b'],
    borderColor: '#cbd5e1',
    shadowColor: '#64748b',
  },
  {
    id: 'badge-60',
    days: 60,
    title: 'Legendary Habit',
    description: '60 days milestone: Skincare mastery achieved',
    unlocked: false,
    colorGrad: ['#d1d5db', '#9ca3af'],
    borderColor: '#e5e7eb',
    shadowColor: '#9ca3af',
  },
];

export default function BadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const unlockedCount = ALL_ACHIEVEMENTS.filter((b) => b.unlocked).length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
          Achievements
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner summary card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            },
          ]}
        >
          <View style={styles.summaryLeft}>
            <Text style={[styles.summaryTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              {unlockedCount} of {ALL_ACHIEVEMENTS.length} Badges
            </Text>
            <Text
              style={[
                styles.summarySubtitle,
                { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)' },
              ]}
            >
              Keep your streak alive to unlock upcoming trophies!
            </Text>
          </View>
          <View
            style={[
              styles.trophyIconWrapper,
              { backgroundColor: isDark ? 'rgba(147, 122, 189, 0.2)' : '#f0ecf7' },
            ]}
          >
            <Award size={26} color="#937abd" />
          </View>
        </Animated.View>

        {/* Badges List */}
        <View style={styles.listSection}>
          {ALL_ACHIEVEMENTS.map((badge, index) => (
            <Animated.View
              key={badge.id}
              entering={FadeInDown.delay(100 + index * 60).duration(450)}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              {/* Badge Visual 3D Hexagon */}
              <View
                style={[
                  styles.badgeHexagonOuter,
                  {
                    shadowColor: badge.shadowColor,
                    shadowOpacity: badge.unlocked ? 0.35 : 0.08,
                  },
                ]}
              >
                <LinearGradient
                  colors={badge.colorGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.badgeHexagonGrad,
                    {
                      borderColor: badge.borderColor,
                    },
                  ]}
                >
                  <View style={styles.badgeGlossOverlay} />
                  <Text style={styles.badgeDaysNum}>{badge.days}</Text>
                </LinearGradient>
              </View>

              {/* Text Description */}
              <View style={styles.badgeInfo}>
                <View style={styles.badgeTitleRow}>
                  <Text
                    style={[
                      styles.badgeTitle,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    {badge.title}
                  </Text>
                  {badge.unlocked ? (
                    <View style={styles.unlockedPill}>
                      <Check size={11} color="#10b981" strokeWidth={3} />
                      <Text style={styles.unlockedPillText}>Unlocked</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedPill}>
                      <Lock size={11} color="#9ca3af" strokeWidth={2.5} />
                      <Text style={styles.lockedPillText}>{badge.days} Days</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.badgeDesc,
                    { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)' },
                  ]}
                >
                  {badge.description}
                </Text>
                {badge.unlockedDate && (
                  <Text style={styles.badgeDate}>{badge.unlockedDate}</Text>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLeft: {
    flex: 1,
    paddingRight: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  summarySubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  trophyIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSection: {
    gap: 14,
  },
  badgeCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeHexagonOuter: {
    width: 58,
    height: 58,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  badgeHexagonGrad: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 2.2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  badgeGlossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  badgeDaysNum: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  unlockedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  lockedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  badgeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#937abd',
  },
});
