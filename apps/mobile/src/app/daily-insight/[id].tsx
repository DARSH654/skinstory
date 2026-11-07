import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
} from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO ONLY — no backend, no store, no API. Flip to false to preview locked.
// ─────────────────────────────────────────────────────────────────────────────
const IS_UNLOCKED = true;

const ACCENT = '#7c3aed';

// ── Hardcoded demo constants ────────────────────────────────────────────────
const INSIGHT_DATE = 'Oct 12, 2026';
const OVERVIEW_HEADLINE = 'Breakout risk rose yesterday.';
const OVERVIEW_EVIDENCE =
  'Stress hit 4/5 and the routine was skipped — your worst combo this month.';

const STRESS_TREND = [
  { label: 'Oct 10', value: 2 },
  { label: 'Oct 11', value: 3 },
  { label: 'Oct 12', value: 4 },
];

const BECAUSE_ROWS = [
  { question: 'Stress', answer: '4/5', date: 'Oct 12' },
  { question: 'Skipped skincare routine', answer: '', date: 'Oct 12' },
  { question: 'Sleep', answer: '5.5h (usual 7h)', date: 'Oct 11' },
];

const FACTORS = [
  {
    name: 'Stress',
    todayLabel: '4/5 today',
    usualLabel: 'usual 2/5',
    chip: 'likely trigger',
    strength: 3,
    todayPct: 80,
    usualPct: 40,
  },
  {
    name: 'Sleep',
    todayLabel: '5.5h today',
    usualLabel: 'usual 7.2h',
    chip: 'likely trigger',
    strength: 2,
    todayPct: 74,
    usualPct: 96,
  },
  {
    name: 'Hydration',
    todayLabel: '8 glasses',
    usualLabel: 'usual 6',
    chip: 'likely helper',
    strength: 1,
    todayPct: 90,
    usualPct: 68,
  },
];

const ACTION_PLAN = [
  'Tonight: skip actives, barrier-only routine.',
  'Protect sleep — aim for 7h+.',
  'Re-check stress triggers tomorrow morning.',
];

const DAY_LOG = [
  { q: 'Water', a: '8 glasses' },
  { q: 'Sleep', a: '5.5h' },
  { q: 'Stress', a: '4/5' },
  { q: 'Skincare routine', a: 'No' },
  { q: 'SPF applied', a: 'Yes' },
  { q: 'Diet triggers', a: 'Sugary' },
];

export default function DetailedDailyInsightScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [logOpen, setLogOpen] = useState(false);

  const page = isDark ? '#0d0d0d' : '#f4f4f5';
  const card = isDark ? '#18181b' : '#ffffff';
  const cardBorder = isDark ? '#27272a' : '#ececf0';
  const primary = isDark ? '#ffffff' : '#1a1a1a';
  const secondary = isDark ? '#a1a1aa' : '#6b7280';
  const muted = isDark ? '#71717a' : '#9ca3af';
  const trackBg = isDark ? '#27272a' : '#ececf0';
  const chipBg = isDark ? '#27272a' : '#f4f4f5';

  return (
    <View style={{ flex: 1, backgroundColor: page }}>
      {/* 1. HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={24} color={primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: primary }]}>Daily Insight</Text>
          <Text style={[styles.headerDate, { color: secondary }]}>{INSIGHT_DATE}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* 2. OVERVIEW CARD (free) */}
        <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
          <View style={styles.overviewTopRow}>
            <View style={[styles.iconCircle, { backgroundColor: chipBg }]}>
              <Sparkles size={18} color={ACCENT} />
            </View>
            <Text style={[styles.overviewHeadline, { color: primary }]}>
              {OVERVIEW_HEADLINE}
            </Text>
          </View>
          <Text style={[styles.overviewEvidence, { color: secondary }]}>
            {OVERVIEW_EVIDENCE}
          </Text>
        </View>

        {/* 3. FREE SECTION — What happened */}
        <Text style={[styles.sectionLabel, { color: primary }]}>What happened</Text>

        {/* CHART 1: 3-day stress trend */}
        <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
          <View style={styles.chartRow}>
            {STRESS_TREND.map((d) => {
              const isToday = d.label === 'Oct 12';
              const barH = (d.value / 5) * verticalScale(96);
              return (
                <View key={d.label} style={styles.chartCol}>
                  <Text style={[styles.chartValue, { color: isToday ? ACCENT : muted }]}>
                    {d.value}
                  </Text>
                  <View style={[styles.chartTrack, { backgroundColor: trackBg }]}>
                    <View
                      style={{
                        width: '100%',
                        height: barH,
                        borderRadius: 6,
                        backgroundColor: isToday ? ACCENT : cardBorder,
                      }}
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: isToday ? ACCENT : muted }]}>
                    {d.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Because bullets */}
        <Text style={[styles.subLabel, { color: secondary }]}>Because</Text>
        <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder, paddingVertical: 4 }]}>
          {BECAUSE_ROWS.map((row, i) => (
            <View
              key={row.question}
              style={[
                styles.row,
                i < BECAUSE_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: cardBorder },
              ]}
            >
              <Text style={[styles.rowQuestion, { color: primary }]} numberOfLines={1}>
                {row.question}
              </Text>
              <Text style={[styles.rowAnswer, { color: secondary }]}>{row.answer}</Text>
              <Text style={[styles.rowDate, { color: muted }]}>{row.date}</Text>
            </View>
          ))}
        </View>

        {/* 4. PAYWALL DIVIDER */}
        <View style={styles.dividerRow}>
          <Lock size={14} color={secondary} />
          <Text style={[styles.dividerText, { color: secondary }]}>How we figured this out</Text>
        </View>

        {!IS_UNLOCKED && (
          <View style={styles.paywallBlock}>
            {[0, 1, 2].map((n) => (
              <View
                key={n}
                style={[styles.skeletonRow, { backgroundColor: trackBg }]}
              />
            ))}
            <Pressable
              style={[styles.ctaBtn, { backgroundColor: ACCENT }]}
              onPress={() => {}}
            >
              <Text style={styles.ctaText}>Unlock full analysis</Text>
            </Pressable>
          </View>
        )}

        {/* 5. LOCKED SECTION */}
        <View
          style={!IS_UNLOCKED ? { opacity: 0.25 } : undefined}
          pointerEvents={IS_UNLOCKED ? 'auto' : 'none'}
        >
          {/* a. FACTOR BREAKDOWN */}
          <Text style={[styles.sectionLabel, { color: primary }]}>Top factors for this day</Text>
          <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
            {FACTORS.map((f, i) => (
              <View
                key={f.name}
                style={[
                  styles.factorRow,
                  i < FACTORS.length - 1 && { borderBottomWidth: 1, borderBottomColor: cardBorder },
                ]}
              >
                <View style={styles.factorTopRow}>
                  <Text style={[styles.factorName, { color: primary }]}>{f.name}</Text>
                  <View style={[styles.chip, { backgroundColor: chipBg }]}>
                    <Text style={[styles.chipText, { color: ACCENT }]}>{f.chip}</Text>
                  </View>
                </View>
                <Text style={[styles.factorValue, { color: secondary }]}>
                  {f.todayLabel} ({f.usualLabel})
                </Text>
                <View style={styles.strengthRow}>
                  {[0, 1, 2].map((s) => (
                    <View
                      key={s}
                      style={{
                        width: 26,
                        height: 6,
                        borderRadius: 3,
                        marginRight: 5,
                        backgroundColor: s < f.strength ? ACCENT : trackBg,
                      }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* b. CHART 2: You vs your usual */}
          <Text style={[styles.sectionLabel, { color: primary }]}>You vs your usual</Text>
          <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
            {FACTORS.map((f) => (
              <View key={f.name} style={{ marginBottom: verticalScale(14) }}>
                <Text style={[styles.barPairTitle, { color: primary }]}>{f.name}</Text>
                <View style={styles.barPairRow}>
                  <Text style={[styles.barPairTag, { color: secondary }]}>Today</Text>
                  <View style={[styles.barPairTrack, { backgroundColor: trackBg }]}>
                    <View style={{ width: `${f.todayPct}%`, height: '100%', borderRadius: 4, backgroundColor: ACCENT }} />
                  </View>
                </View>
                <View style={[styles.barPairRow, { marginTop: 6 }]}>
                  <Text style={[styles.barPairTag, { color: muted }]}>Usual</Text>
                  <View style={[styles.barPairTrack, { backgroundColor: trackBg }]}>
                    <View style={{ width: `${f.usualPct}%`, height: '100%', borderRadius: 4, backgroundColor: muted }} />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* c. SCAN EVIDENCE ROW */}
          <View style={[styles.card, styles.scanRow, { backgroundColor: card, borderColor: cardBorder }]}>
            <View style={[styles.thumb, { backgroundColor: trackBg }]}>
              <ImageIcon size={22} color={muted} />
            </View>
            <Text style={[styles.scanText, { color: primary }]}>
              3 pimples — vs 1 on Oct 9 scan
            </Text>
          </View>

          {/* d. ACTION PLAN */}
          <Text style={[styles.sectionLabel, { color: primary }]}>What to do today</Text>
          <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder }]}>
            {ACTION_PLAN.map((a) => (
              <View key={a} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: ACCENT }]} />
                <Text style={[styles.bulletText, { color: secondary }]}>{a}</Text>
              </View>
            ))}
          </View>

          {/* e. ASK BUTTON (outline) */}
          <Pressable style={[styles.outlineBtn, { borderColor: ACCENT }]} onPress={() => {}}>
            <MessageCircle size={18} color={ACCENT} />
            <Text style={[styles.outlineBtnText, { color: ACCENT }]}>
              Ask your data about this day
            </Text>
          </Pressable>

          {/* f. COLLAPSIBLE FULL DAY LOG */}
          <View style={[styles.card, { backgroundColor: card, borderColor: cardBorder, paddingVertical: 4 }]}>
            <Pressable style={styles.logHeader} onPress={() => setLogOpen((v) => !v)}>
              <Text style={[styles.logHeaderText, { color: primary }]}>Full day log</Text>
              {logOpen ? (
                <ChevronUp size={18} color={secondary} />
              ) : (
                <ChevronDown size={18} color={secondary} />
              )}
            </Pressable>
            {logOpen &&
              DAY_LOG.map((row, i) => (
                <View
                  key={row.q}
                  style={[
                    styles.row,
                    i < DAY_LOG.length - 1 && { borderBottomWidth: 1, borderBottomColor: cardBorder },
                  ]}
                >
                  <Text style={[styles.rowQuestion, { color: secondary }]} numberOfLines={1}>
                    {row.q}
                  </Text>
                  <Text style={[styles.rowAnswer, { color: primary }]}>{row.a}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* 6. FOOTER — prev / next day */}
        <View style={styles.footer}>
          <Pressable style={styles.footerBtn} onPress={() => {}}>
            <ChevronLeft size={18} color={secondary} />
            <Text style={[styles.footerText, { color: secondary }]}>Oct 11</Text>
          </Pressable>
          <Pressable style={styles.footerBtn} onPress={() => {}}>
            <Text style={[styles.footerText, { color: secondary }]}>Oct 13</Text>
            <ChevronRight size={18} color={secondary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 4,
  },
  backBtn: { padding: 6, marginRight: 2 },
  headerTitle: { fontSize: moderateScale(18, 0.3), fontWeight: '800' },
  headerDate: { fontSize: moderateScale(12, 0.3), fontWeight: '600', marginTop: 1 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: scale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  overviewTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewHeadline: { flex: 1, fontSize: moderateScale(15, 0.3), fontWeight: '800' },
  overviewEvidence: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
    marginTop: verticalScale(8),
    lineHeight: 19,
  },

  sectionLabel: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    marginBottom: verticalScale(10),
  },
  subLabel: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    marginTop: verticalScale(-4),
  },

  // Chart 1
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: verticalScale(150) },
  chartCol: { alignItems: 'center', flex: 1 },
  chartValue: { fontSize: moderateScale(12, 0.3), fontWeight: '700', marginBottom: 4 },
  chartTrack: {
    width: 28,
    height: verticalScale(110),
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartLabel: { fontSize: moderateScale(11, 0.3), fontWeight: '600', marginTop: 8 },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
    gap: 10,
  },
  rowQuestion: { flex: 1, fontSize: moderateScale(13, 0.3), fontWeight: '700' },
  rowAnswer: { fontSize: moderateScale(13, 0.3), fontWeight: '600' },
  rowDate: { fontSize: moderateScale(11, 0.3), fontWeight: '600', width: 52, textAlign: 'right' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: verticalScale(12), marginTop: verticalScale(2) },
  dividerText: { fontSize: moderateScale(12, 0.3), fontWeight: '700' },

  // Paywall
  paywallBlock: {
    marginBottom: verticalScale(16),
    overflow: 'hidden',
  },
  skeletonRow: {
    height: verticalScale(18),
    borderRadius: 9,
    marginBottom: verticalScale(10),
    opacity: 0.7,
  },
  ctaBtn: {
    marginTop: verticalScale(6),
    borderRadius: 999,
    paddingVertical: verticalScale(15),
    alignItems: 'center',
  },
  ctaText: { color: '#ffffff', fontSize: moderateScale(15, 0.3), fontWeight: '800' },

  // Factors
  factorRow: { paddingVertical: verticalScale(12) },
  factorTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  factorName: { fontSize: moderateScale(14, 0.3), fontWeight: '700' },
  chip: { borderRadius: 999, paddingHorizontal: scale(10), paddingVertical: verticalScale(3) },
  chipText: { fontSize: moderateScale(10, 0.3), fontWeight: '700' },
  factorValue: { fontSize: moderateScale(12, 0.3), fontWeight: '600', marginTop: verticalScale(3) },
  strengthRow: { flexDirection: 'row', marginTop: verticalScale(8) },

  // Chart 2
  barPairTitle: { fontSize: moderateScale(13, 0.3), fontWeight: '700', marginBottom: 6 },
  barPairRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barPairTag: { width: 42, fontSize: moderateScale(11, 0.3), fontWeight: '600' },
  barPairTrack: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },

  // Scan evidence
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scanText: { flex: 1, fontSize: moderateScale(13, 0.3), fontWeight: '700' },

  // Action plan
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: verticalScale(10) },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: 10 },
  bulletText: { flex: 1, fontSize: moderateScale(13, 0.3), fontWeight: '600', lineHeight: 19 },

  // Outline button
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(16),
  },
  outlineBtnText: { fontSize: moderateScale(14, 0.3), fontWeight: '800' },

  // Collapsible log
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(14),
  },
  logHeaderText: { fontSize: moderateScale(14, 0.3), fontWeight: '800' },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: verticalScale(8), paddingHorizontal: scale(8) },
  footerText: { fontSize: moderateScale(13, 0.3), fontWeight: '700' },
});
