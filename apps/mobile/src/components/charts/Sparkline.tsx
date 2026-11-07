/**
 * Sparkline — tiny trend line inside cards
 *
 * A compact, non-interactive line (optionally with a soft gradient area and
 * a dot on the latest point) meant to sit inside stat cards.
 *
 * `Sparkline` is the reusable primitive (named export).
 * The default export is a small showcase rendering it inside uplifted cards
 * so it can be dropped straight onto the insight page.
 */

import React, { useId } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Reusable primitive ───────────────────────────────────────────────────────
export function Sparkline({
  data,
  width = 96,
  height = 36,
  color = '#937abd',
  strokeWidth = 2,
  showArea = true,
  showLastDot = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showArea?: boolean;
  showLastDot?: boolean;
}) {
  const gradId = useId().replace(/:/g, '');

  const pad = strokeWidth + 1;
  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = n === 1 ? width / 2 : (i / (n - 1)) * width;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const last = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`sparkFill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {showArea && <Path d={areaPath} fill={`url(#sparkFill-${gradId})`} />}

      <Path
        d={linePath}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {showLastDot && last && <Circle cx={last.x} cy={last.y} r={strokeWidth + 1} fill={color} />}
    </Svg>
  );
}

// ─── Showcase data ────────────────────────────────────────────────────────────
type SparkCard = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  series: number[];
};

const CARDS: SparkCard[] = [
  {
    label: 'Skin Score',
    value: '82',
    delta: '+6.4%',
    positive: true,
    series: [61, 64, 60, 68, 72, 70, 76, 79, 82],
  },
  {
    label: 'Hydration',
    value: '68%',
    delta: '+2.1%',
    positive: true,
    series: [58, 60, 57, 62, 61, 65, 64, 67, 68],
  },
  {
    label: 'Breakouts',
    value: '12',
    delta: '-9.0%',
    positive: false,
    series: [22, 20, 21, 18, 17, 15, 16, 13, 12],
  },
];

export default function SparklineShowcase() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const cardBg = isDark ? '#18181b' : '#ffffff';
  const cardBorder = isDark ? '#27272a' : '#e5e7eb';

  return (
    <View style={styles.chartSection}>
      {CARDS.map((c) => (
        <View
          key={c.label}
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              shadowColor: '#000',
              shadowOpacity: isDark ? 0 : 0.04,
            },
          ]}
        >
          <View style={styles.cardLeft}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{c.label}</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{c.value}</Text>
            <Text
              style={[
                styles.cardDelta,
                { color: c.positive ? '#22c55e' : '#ef4444' },
              ]}
            >
              {c.positive ? '▲' : '▼'} {c.delta}
            </Text>
          </View>

          <Sparkline data={c.series} width={104} height={40} color="#937abd" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chartSection: {
    paddingLeft: 14,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    gap: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  cardDelta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
