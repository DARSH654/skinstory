/**
 * HeatmapCalendar — month grid, color intensity per day
 *
 * Same visual language as the other charts:
 *  - lavender brand family used as an intensity ramp
 *  - dark/light surfaces, tap a day to reveal its value
 *
 * Each day is a rounded tile whose fill steps through the lavender scale
 * (faint → saturated) based on the day's value. Tapping a day pins a
 * readout line above the grid.
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type HeatmapDatum = { day: number; value: number }; // value 0..100

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Lavender intensity ramp (level 0 → 4)
const LIGHT_SCALE = ['rgba(0,0,0,0.04)', '#ece5f5', '#d6cbe8', '#b9a6d6', '#937abd'];
const DARK_SCALE = [
  'rgba(255,255,255,0.06)',
  'rgba(147,122,189,0.22)',
  'rgba(147,122,189,0.44)',
  'rgba(147,122,189,0.68)',
  '#937abd',
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const GAP = 6;
const MAX_LEVEL = LIGHT_SCALE.length - 1;

function levelFor(value: number) {
  if (value <= 0) return 0;
  if (value < 25) return 1;
  if (value < 50) return 2;
  if (value < 75) return 3;
  return 4;
}

// Deterministic default data so the demo is stable across re-renders
function buildDefaultData(month: number): HeatmapDatum[] {
  const days = new Date(2026, month + 1, 0).getDate();
  const out: HeatmapDatum[] = [];
  for (let d = 1; d <= days; d++) {
    if (d % 7 === 0) {
      out.push({ day: d, value: 0 }); // a few missed days
      continue;
    }
    const seed = Math.sin(d * 12.9898 + month * 78.233) * 43758.5453;
    const noise = seed - Math.floor(seed);
    out.push({ day: d, value: Math.round(noise * 100) });
  }
  return out;
}

export default function HeatmapCalendar({
  data,
  year,
  month,
}: {
  data?: HeatmapDatum[];
  year?: number;
  month?: number;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();

  const sourceData = useMemo(() => data ?? buildDefaultData(m), [data, m]);

  const weeks = useMemo(() => {
    const map = new Map(sourceData.map((d) => [d.day, d.value]));
    const firstWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells: (HeatmapDatum | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, value: map.get(d) ?? 0 });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const out: (HeatmapDatum | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [sourceData, y, m]);

  const [activeDay, setActiveDay] = useState<number | null>(null);

  const available = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT;
  const cellSize = (available - GAP * 6) / 7;
  const scale = isDark ? DARK_SCALE : LIGHT_SCALE;

  const activeValue =
    activeDay != null ? sourceData.find((d) => d.day === activeDay)?.value ?? 0 : null;

  return (
    <View style={styles.chartSection}>
      {/* Month label + active-day readout */}
      <View style={styles.headerRow}>
        <Text style={[styles.monthLabel, { color: colors.text }]}>
          {MONTH_NAMES[m]} {y}
        </Text>
        {activeDay != null && (
          <View style={[styles.readoutPill, { backgroundColor: isDark ? '#27272a' : '#ffffff' }]}>
            <Text style={[styles.readoutText, { color: colors.textSecondary }]}>
              {MONTH_NAMES[m].slice(0, 3)} {activeDay}
            </Text>
            <Text style={[styles.readoutValue, { color: colors.text }]}>{activeValue}</Text>
          </View>
        )}
      </View>

      {/* Weekday header */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={`${w}-${i}`} style={{ width: cellSize, alignItems: 'center' }}>
            <Text style={[styles.weekday, { color: colors.textSecondary }]}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ gap: GAP }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={[styles.weekRow, { gap: GAP }]}>
            {week.map((cell, ci) => {
              if (!cell) {
                return <View key={`empty-${wi}-${ci}`} style={{ width: cellSize, height: cellSize }} />;
              }
              const level = levelFor(cell.value);
              const isActive = activeDay === cell.day;
              const light = level >= 3; // light text on saturated tiles
              return (
                <Pressable
                  key={`day-${cell.day}`}
                  onPress={() => setActiveDay(isActive ? null : cell.day)}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: scale[level],
                      borderColor: isActive
                        ? isDark
                          ? '#ffffff'
                          : '#09090b'
                        : 'transparent',
                      borderWidth: isActive ? 2 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { color: light ? '#ffffff' : colors.textSecondary },
                    ]}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Intensity legend */}
      <View style={styles.legendRow}>
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>Less</Text>
        {scale.map((c, i) => (
          <View
            key={`scale-${i}`}
            style={[styles.legendSwatch, { backgroundColor: c }]}
          />
        ))}
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartSection: {
    paddingLeft: H_PADDING_LEFT,
    paddingRight: H_PADDING_RIGHT,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  readoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  readoutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readoutValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  cell: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 11,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 16,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 2,
  },
});
