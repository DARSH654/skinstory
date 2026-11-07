/**
 * DonutChart — share of whole
 *
 * Same visual language as the other charts:
 *  - lavender brand family, rounded (round-capped) segments
 *  - dark/light surfaces, tap-to-reveal readout
 *
 * Tapping an arc (or a legend row) highlights that slice and updates the
 * centred readout with its share of the whole. Arc hit-testing uses the
 * touch angle + radius so only the ring itself responds.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  GestureResponderEvent,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Svg, { Circle } from 'react-native-svg';

export type DonutDatum = { label: string; value: number };

// ─── Default data: share of whole (skin factors) ──────────────────────────────
const DONUT_DATA: DonutDatum[] = [
  { label: 'Hydration', value: 38 },
  { label: 'Texture', value: 26 },
  { label: 'Oiliness', value: 21 },
  { label: 'Sensitivity', value: 15 },
];

const SLICE_COLORS = ['#937abd', '#a992c9', '#bfaedb', '#d6cbe8'];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const SIZE = 190;
const THICKNESS = 26;
const MID_R = (SIZE - THICKNESS) / 2;
const C = 2 * Math.PI * MID_R;
const VISUAL_GAP = 5;
const DASH_GAP = VISUAL_GAP + THICKNESS; // round caps add THICKNESS to visible length
const TOOLTIP_W = 56;
const TOOLTIP_H = 38;

export default function DonutChart({ data = DONUT_DATA }: { data?: DonutDatum[] }) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [activeIndex, setActiveIndex] = useState(0);

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const center = SIZE / 2;

  // Pre-compute each slice's dash length + start offset (in circumference units)
  let acc = 0;
  const slices = data.map((d, i) => {
    const raw = (d.value / total) * C;
    const len = Math.max(raw - DASH_GAP, 0.01);
    const start = acc;
    acc += raw;
    return { len, start, color: SLICE_COLORS[i % SLICE_COLORS.length] };
  });

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx = locationX - center;
    const dy = locationY - center;
    const dist = Math.hypot(dx, dy);
    const innerR = MID_R - THICKNESS / 2;
    const outerR = MID_R + THICKNESS / 2;
    if (dist < innerR || dist > outerR) return; // touch missed the ring

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // 0° = top, clockwise
    if (deg < 0) deg += 360;
    const frac = deg / 360;

    let run = 0;
    for (let i = 0; i < data.length; i++) {
      const f = data[i].value / total;
      if (frac < run + f) {
        setActiveIndex(i);
        return;
      }
      run += f;
    }
  };

  const activePct = Math.round((data[activeIndex].value / total) * 100);

  return (
    <View style={styles.chartSection}>
      {/* Donut + centred readout */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
          <Pressable onPress={handleTouch}>
            <Svg width={SIZE} height={SIZE}>
              <Circle
                cx={center}
                cy={center}
                r={MID_R}
                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
                strokeWidth={THICKNESS}
                fill="none"
              />
              {slices.map((s, i) => (
                <Circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={MID_R}
                  stroke={s.color}
                  strokeWidth={THICKNESS}
                  strokeDasharray={[s.len, C - s.len]}
                  strokeDashoffset={-s.start}
                  strokeLinecap="round"
                  fill="none"
                  transform={`rotate(-90 ${center} ${center})`}
                  opacity={i === activeIndex ? 1 : 0.32}
                />
              ))}
            </Svg>
          </Pressable>

          {/* Centre readout */}
          <View pointerEvents="none" style={styles.centerReadout}>
            <Text style={[styles.centerValue, { color: colors.text }]}>{activePct}%</Text>
            <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>
              {data[activeIndex].label}
            </Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendGrid}>
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          const isSelected = i === activeIndex;
          return (
            <Pressable
              key={`${d.label}-${i}`}
              onPress={() => setActiveIndex(i)}
              style={styles.legendItem}
            >
              <View
                style={[
                  styles.legendSwatch,
                  { backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] },
                ]}
              />
              <Text
                style={[
                  styles.legendLabel,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {d.label}
              </Text>
              <Text
                style={[
                  styles.legendPct,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {pct}%
              </Text>
            </Pressable>
          );
        })}
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
  centerReadout: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  legendGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 6,
    paddingRight: 10,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
  },
  legendPct: {
    fontSize: 12,
  },
});
