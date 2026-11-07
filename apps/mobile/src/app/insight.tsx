/**
 * Insight — Dedicated Insight Page
 *
 * All previous content removed.
 * Renders only the archived line graph component (trend over time),
 * sourced from `src/archive/SkinScoreChartSection.tsx`.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkinScoreChartSection from '@/archive/SkinScoreChartSection';
import BarChart from '@/components/charts/BarChart';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart';
import PairedBarChart from '@/components/charts/PairedBarChart';
import StackedBarChart from '@/components/charts/StackedBarChart';
import DonutChart from '@/components/charts/DonutChart';
import HeatmapCalendar from '@/components/charts/HeatmapCalendar';
import ScatterPlot from '@/components/charts/ScatterPlot';
import SparklineShowcase from '@/components/charts/Sparkline';
import StatCardShowcase from '@/components/charts/StatCard';
import NoteCardShowcase from '@/components/charts/NoteCard';
import KeywordChipsShowcase from '@/components/charts/KeywordChips';
import ImageStripShowcase from '@/components/charts/ImageStrip';
import BeforeAfterSlider from '@/components/charts/BeforeAfterSlider';

export default function InsightDetailScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F7' }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>Line Graph</Text>
        <SkinScoreChartSection />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Bar Chart
        </Text>
        <BarChart />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Horizontal Bar Chart
        </Text>
        <HorizontalBarChart />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Paired Bar Chart
        </Text>
        <PairedBarChart />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Stacked Bar Chart
        </Text>
        <StackedBarChart />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Donut Chart
        </Text>
        <DonutChart />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Heatmap Calendar
        </Text>
        <HeatmapCalendar />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Scatter Plot
        </Text>
        <ScatterPlot />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Sparkline
        </Text>
        <SparklineShowcase />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Stat Card
        </Text>
        <StatCardShowcase />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Note Card
        </Text>
        <NoteCardShowcase />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Keyword Chips
        </Text>
        <KeywordChipsShowcase />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Image Strip
        </Text>
        <ImageStripShowcase />

        <Text style={[styles.title, styles.titleSpacing, { color: isDark ? '#ffffff' : '#000000' }]}>
          Before / After Slider
        </Text>
        <BeforeAfterSlider />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  titleSpacing: {
    marginTop: 20,
  },
});
