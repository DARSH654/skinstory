/**
 * Insight — Dedicated Insight & Report Screen
 *
 * Header Architecture:
 *  - Top Nav Bar: Back Button, Date Range Pill, Share Action
 *  - Screen Title: Dynamic (Weekly / Monthly / Quarterly Skin & Habit Analysis)
 *  - Executive Overview Card: Status badge, Score Delta (+6 pts), Plain-language narrative summary, Consistency Metrics
 *  - Showcase Sections: Line Graph, Bar Chart, Horizontal Bar Chart, Paired Bar Chart, Stacked Bar Chart, etc.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import SkinScoreChartSection from '@/archive/SkinScoreChartSection';
import BarChart from '@/components/charts/BarChart';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart';
import PairedBarChart from '@/components/charts/PairedBarChart';
import StackedBarChart from '@/components/charts/StackedBarChart';
import DonutChart from '@/components/charts/DonutChart';
import ImageStripShowcase from '@/components/charts/ImageStrip';

// ── Extreme Stress-Test Datasets (Worst-Case Scenarios) ──
const WORST_CASE_BAR = [
  { label: 'Mon 01', value: 2500 },
  { label: 'Tue 02', value: 350 },
  { label: 'Wednesday Long 03', value: 1800 },
  { label: 'Thu 04', value: 0 },
  { label: 'Fri 05', value: 2450 },
  { label: 'Sat 06', value: 1200 },
  { label: 'Sun 07', value: 900 },
  { label: 'Mon 08', value: 2100 },
  { label: 'Tue 09', value: 1500 },
  { label: 'Wed 10', value: 750 },
  { label: 'Thu 11', value: 2200 },
  { label: 'Fri 12', value: 0 },
];

const WORST_CASE_HORIZONTAL = [
  { label: 'Super-Concentrated Retinol 1.0% + Squalane Booster', value: 28 },
  { label: 'Ceramide NP + AP Complex Cream', value: 30 },
  { label: 'Niacinamide 10% + Zinc 1%', value: 18 },
  { label: 'Hyaluronic Acid Multi-Molecular Hydrator', value: 25 },
  { label: 'Salicylic Acid 2% Exfoliating BHA Liquid', value: 4 },
  { label: 'Ultra Pure Vitamin C 15% Ethyl Ascorbic Acid Serum', value: 12 },
  { label: 'Zinc Oxide SPF 50+ Broad Spectrum Mineral Sunscreen', value: 30 },
];

const WORST_CASE_PAIRED = [
  { label: 'Mon 01', series1: 100, series2: 0 },
  { label: 'Tuesday 02', series1: 20, series2: 100 },
  { label: 'Wed 03', series1: 85, series2: 90 },
  { label: 'Thu 04', series1: 0, series2: 0 },
  { label: 'Friday Extra Long 05', series1: 100, series2: 100 },
  { label: 'Sat 06', series1: 50, series2: 30 },
  { label: 'Sun 07', series1: 100, series2: 80 },
  { label: 'Mon 08', series1: 70, series2: 95 },
  { label: 'Tue 09', series1: 40, series2: 60 },
  { label: 'Wed 10', series1: 100, series2: 100 },
];

const WORST_CASE_STACKED = [
  { label: 'Mon 01', layer1: 3, layer2: 4, layer3: 3 },
  { label: 'Tuesday Long 02', layer1: 1, layer2: 0, layer3: 1 },
  { label: 'Wed 03', layer1: 2, layer2: 3, layer3: 2 },
  { label: 'Thu 04', layer1: 1, layer2: 1, layer3: 1 },
  { label: 'Friday Extra Long 05', layer1: 3, layer2: 4, layer3: 3 },
  { label: 'Sat 06', layer1: 0, layer2: 0, layer3: 0 },
  { label: 'Sun 07', layer1: 2, layer2: 4, layer3: 2 },
  { label: 'Mon 08', layer1: 1, layer2: 2, layer3: 1 },
  { label: 'Tue 09', layer1: 2, layer2: 2, layer3: 0 },
];

export default function InsightDetailScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string }>();

  const reportType = params.type || 'weekly';

  // Dynamic Titles & Date Ranges based on report period
  const meta = {
    dateRange: '14 Nov – 20 Nov 2026',
    cardTitle: 'Weekly Overview',
    summary:
      'Your skin barrier resilience improved steadily this week. High routine adherence and consistent SPF application helped reduce localized forehead redness.',
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F7' }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Navigation Bar: Back Button + Hardcoded Title "Weekly Skin Report" ── */}
        <View style={styles.topNavBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: pressed
                  ? (isDark ? '#27272a' : '#e4e4e7')
                  : (isDark ? '#18181b' : '#ffffff'),
                borderColor: isDark ? '#27272a' : '#e5e7eb',
              },
            ]}
          >
            <ChevronLeft size={20} color={colors.text} strokeWidth={2.4} />
          </Pressable>
          <Text style={[styles.mainScreenTitle, { color: colors.text }]}>
            Weekly Skin Report
          </Text>
        </View>

        {/* ── Executive Overview Card ── */}
        <View
          style={[
            styles.executiveCard,
            {
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e5e7eb',
            },
          ]}
        >
          {/* Top Row: Weekly Overview on Left, Primary Date Pill on Right */}
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitleText, { color: colors.text }]}>
              {meta.cardTitle}
            </Text>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>
                {meta.dateRange}
              </Text>
            </View>
          </View>

          {/* Plain-Language Narrative Summary */}
          <Text style={[styles.execSummaryText, { color: colors.textSecondary }]}>
            {meta.summary}
          </Text>
        </View>

        {/* ── Section Charts ── */}
        <Text style={[styles.sectionHeading, styles.firstSectionHeading, { color: colors.text }]}>
          Overall Trajectory
        </Text>
        <SkinScoreChartSection />

        <Text style={[styles.sectionHeading, styles.headingSpacing, { color: colors.text }]}>
          Daily Hydration Log
        </Text>
        <BarChart
          title="Extremely Super Duper Unreasonably Long Multi-Line Card Title For Daily Hydration Metric In Milliliters Over Extended Observation Period"
          unit="milliliters (mL)"
          maxValue={2500}
          data={WORST_CASE_BAR}
        />

        <Text style={[styles.sectionHeading, styles.headingSpacing, { color: colors.text }]}>
          Top Ingredients & Actives
        </Text>
        <HorizontalBarChart
          title="Comprehensive Actives and Ingredients Frequency Breakdown Throughout The Entire Quarterly Regimen"
          unit="application cycles"
          maxValue={30}
          data={WORST_CASE_HORIZONTAL}
        />

        <Text style={[styles.sectionHeading, styles.headingSpacing, { color: colors.text }]}>
          AM vs PM Routine
        </Text>
        <PairedBarChart
          title="AM Versus PM Routine Consistency Compliance Percentage Comparative Analysis"
          unit="percent ratio (%)"
          maxValue={100}
          data={WORST_CASE_PAIRED}
        />

        <Text style={[styles.sectionHeading, styles.headingSpacing, { color: colors.text }]}>
          Routine Layering
        </Text>
        <StackedBarChart
          title="Cumulative Daily Multi-Step Product Application Layers Stacking Tracker"
          unit="skincare steps & serums"
          maxSteps={10}
          data={WORST_CASE_STACKED}
        />

        <Text style={[styles.sectionHeading, styles.headingSpacing, { color: colors.text }]}>
          Composition Breakdown
        </Text>
        <DonutChart />

        <Text style={[styles.sectionHeading, styles.headingSpacing, { color: colors.text }]}>
          Facial Photo Timeline
        </Text>
        <ImageStripShowcase />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 64,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mainScreenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  executiveCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  datePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#937abd',
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  execSummaryText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginHorizontal: 20,
  },
  firstSectionHeading: {
    marginTop: 22,
    marginBottom: 12,
  },
  headingSpacing: {
    marginTop: 26,
    marginBottom: 12,
  },
});
