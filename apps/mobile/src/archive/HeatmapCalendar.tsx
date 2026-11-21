/**
 * HeatmapCalendar — Weekly Routine Consistency Grid
 *
 * Real-Life Skincare Example: 7-Day Habit & Routine Consistency
 *  - 7 prominent day boxes (1 to 7) representing days of the analysis week
 *  - Weekday letters (S, M, T, W, T, F, S) centered directly above each box
 *  - Lavender intensity scale reflecting completed AM/PM routines
 *  - Selecting a day updates the uplifted detail card below with full skincare routine logs
 *  - No random scores or top pills; clean, uplifted card architecture
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CheckCircle2 } from 'lucide-react-native';

export type DayConsistencyDatum = {
  day: number;
  weekday: string;
  fullWeekday: string;
  dateStr: string;
  completed: boolean;
  level: number; // 0 to 4
  amRoutine: string;
  pmRoutine: string;
  hydration: string;
  skinScore: number;
  statusLabel: string;
};

// 7-day routine logging data for the analyzed week
const DEFAULT_WEEK_DATA: DayConsistencyDatum[] = [
  {
    day: 1,
    weekday: 'S',
    fullWeekday: 'Sunday',
    dateStr: 'Jul 26',
    completed: true,
    level: 4,
    amRoutine: 'Cleanser, Hyaluronic Acid, SPF 50',
    pmRoutine: 'Double Cleanse, Ceramide Cream, Retinol 0.2%',
    hydration: '9 glasses (2.2L)',
    skinScore: 82,
    statusLabel: 'AM & PM Completed',
  },
  {
    day: 2,
    weekday: 'M',
    fullWeekday: 'Monday',
    dateStr: 'Jul 27',
    completed: true,
    level: 4,
    amRoutine: 'Gentle Wash, Vitamin C, SPF 50',
    pmRoutine: 'Micellar Water, BHA Exfoliant, Moisturizer',
    hydration: '11 glasses (2.7L)',
    skinScore: 84,
    statusLabel: 'AM & PM Completed',
  },
  {
    day: 3,
    weekday: 'T',
    fullWeekday: 'Tuesday',
    dateStr: 'Jul 28',
    completed: true,
    level: 3,
    amRoutine: 'Cleanser, Niacinamide, SPF 50',
    pmRoutine: 'Foam Cleanse, Night Recovery Balm',
    hydration: '8 glasses (2.0L)',
    skinScore: 83,
    statusLabel: 'AM & PM Completed',
  },
  {
    day: 4,
    weekday: 'W',
    fullWeekday: 'Wednesday',
    dateStr: 'Jul 29',
    completed: false,
    level: 1,
    amRoutine: 'Splash Water, Sunscreen SPF 50',
    pmRoutine: 'Missed (Late Night Travel)',
    hydration: '5 glasses (1.2L)',
    skinScore: 80,
    statusLabel: 'Partial • AM Only',
  },
  {
    day: 5,
    weekday: 'T',
    fullWeekday: 'Thursday',
    dateStr: 'Jul 30',
    completed: true,
    level: 4,
    amRoutine: 'Cleanser, Hyaluronic, Vitamin C, SPF 50',
    pmRoutine: 'Double Cleanse, Peptide Serum, Ceramide Cream',
    hydration: '10 glasses (2.5L)',
    skinScore: 85,
    statusLabel: 'AM & PM Completed',
  },
  {
    day: 6,
    weekday: 'F',
    fullWeekday: 'Friday',
    dateStr: 'Jul 31',
    completed: true,
    level: 4,
    amRoutine: 'Gentle Cleanser, Niacinamide, SPF 50',
    pmRoutine: 'Oil Cleanse, Retinol 0.2%, Barrier Cream',
    hydration: '10 glasses (2.5L)',
    skinScore: 86,
    statusLabel: 'AM & PM Completed',
  },
  {
    day: 7,
    weekday: 'S',
    fullWeekday: 'Saturday',
    dateStr: 'Aug 01',
    completed: true,
    level: 3,
    amRoutine: 'Cleanser, Barrier Serum, SPF 50',
    pmRoutine: 'Gentle Wash, Hydrating Mask, Night Cream',
    hydration: '8 glasses (2.0L)',
    skinScore: 85,
    statusLabel: 'AM & PM Completed',
  },
];

// Lavender intensity scale
const LIGHT_SCALE = ['rgba(0,0,0,0.04)', '#ece5f5', '#d6cbe8', '#b9a6d6', '#937abd'];
const DARK_SCALE = [
  'rgba(255,255,255,0.06)',
  'rgba(147,122,189,0.22)',
  'rgba(147,122,189,0.44)',
  'rgba(147,122,189,0.68)',
  '#937abd',
];

export default function HeatmapCalendar({
  title = 'Routine Consistency',
  data = DEFAULT_WEEK_DATA,
}: {
  title?: string;
  data?: DayConsistencyDatum[];
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Selected day index (defaults to Friday / Day 6)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(5);

  const cardInnerWidth = SCREEN_WIDTH - 40 - 32;
  const GAP = 8;
  const boxWidth = Math.floor((cardInnerWidth - 6 * GAP) / 7);
  const scale = isDark ? DARK_SCALE : LIGHT_SCALE;

  const selectedDay = data[selectedDayIndex] || data[0];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e5e7eb',
        },
      ]}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>6/7 days logged</Text>
        </View>
      </View>

      {/* Weekday Row + 7 Days Grid with Standardized 18px Headroom */}
      <View style={styles.gridContainer}>
        <View style={styles.daysRow}>
          {data.map((item, i) => {
            const isSelected = i === selectedDayIndex;
            const bg = scale[item.level];
            const isFilled = item.level >= 3;

            return (
              <View key={`day-col-${item.day}`} style={[styles.dayCol, { width: boxWidth }]}>
                {/* Weekday Letter Centered Above Box */}
                <Text
                  style={[
                    styles.weekdayLetter,
                    {
                      color: isSelected
                        ? isDark
                          ? '#ffffff'
                          : '#000000'
                        : colors.textSecondary,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {item.weekday}
                </Text>

                {/* Day Box with Big, Bold Number */}
                <Pressable
                  onPress={() => setSelectedDayIndex(i)}
                  style={[
                    styles.dayBox,
                    {
                      width: boxWidth,
                      height: 48,
                      backgroundColor: bg,
                      borderColor: isSelected
                        ? isDark
                          ? '#ffffff'
                          : '#09090b'
                        : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                      borderWidth: isSelected ? 2.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isFilled
                          ? '#ffffff'
                          : isDark
                          ? '#ffffff'
                          : '#18181b',
                      },
                    ]}
                  >
                    {item.day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* Selected Day Skincare Routine Uplifted Card */}
      {selectedDay && (
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: isDark ? '#222226' : '#f8f8fa',
              borderColor: isDark ? '#333338' : '#e5e7eb',
            },
          ]}
        >
          {/* Top row: Day title & status badge */}
          <View style={styles.detailHeaderRow}>
            <View>
              <Text style={[styles.detailDayTitle, { color: colors.text }]}>
                {selectedDay.fullWeekday} • Day {selectedDay.day}
              </Text>
              <Text style={[styles.detailDateSubtitle, { color: colors.textSecondary }]}>
                {selectedDay.dateStr}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: selectedDay.completed
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.18)'
                      : '#ecfdf5'
                    : isDark
                    ? 'rgba(245, 158, 11, 0.18)'
                    : '#fffbeb',
                  borderColor: selectedDay.completed
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.35)'
                      : '#a7f3d0'
                    : isDark
                    ? 'rgba(245, 158, 11, 0.35)'
                    : '#fde68a',
                },
              ]}
            >
              <CheckCircle2
                size={12}
                color={selectedDay.completed ? '#10b981' : '#f59e0b'}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: selectedDay.completed ? '#10b981' : '#f59e0b' },
                ]}
              >
                {selectedDay.statusLabel}
              </Text>
            </View>
          </View>

          {/* Routine logs */}
          <View style={styles.routineSection}>
            <View style={styles.routineRow}>
              <View style={[styles.routineTag, { backgroundColor: isDark ? '#2e2738' : '#f3eefb' }]}>
                <Text style={[styles.routineTagText, { color: '#937abd' }]}>AM</Text>
              </View>
              <Text numberOfLines={1} style={[styles.routineText, { color: colors.text }]}>
                {selectedDay.amRoutine}
              </Text>
            </View>
            <View style={[styles.routineRow, { marginTop: 6 }]}>
              <View style={[styles.routineTag, { backgroundColor: isDark ? '#2e2738' : '#f3eefb' }]}>
                <Text style={[styles.routineTagText, { color: '#937abd' }]}>PM</Text>
              </View>
              <Text numberOfLines={1} style={[styles.routineText, { color: colors.text }]}>
                {selectedDay.pmRoutine}
              </Text>
            </View>
          </View>

          {/* Quick Metrics footer */}
          <View style={[styles.detailFooter, { borderTopColor: isDark ? '#2e2e34' : '#ebebed' }]}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Hydration</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{selectedDay.hydration}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Skin Score</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{selectedDay.skinScore} pts</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    marginTop: 18,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCol: {
    alignItems: 'center',
  },
  weekdayLetter: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  dayBox: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailCard: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailDayTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  detailDateSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routineSection: {
    marginBottom: 10,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routineTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  routineTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  routineText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  detailFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 20,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '800',
  },
});
