/**
 * StatCard — big number + ↑↓ delta tile
 *
 * A single metric tile: small label, a large value (with optional unit),
 * and a coloured up/down delta pill with a caption.
 *
 * `StatCard` is the reusable primitive (named export).
 * The default export is a 2-column showcase so it can be dropped straight
 * onto the insight page.
 *
 * Card surface follows the app's "uplifted" convention (used by the
 * History tab day cards): 1px border + {0,2} shadow, opacity .04, radius 8,
 * elevation 2.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ArrowUp, ArrowDown } from 'lucide-react-native';

export type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  positive: boolean;
  caption?: string;
};

export function StatCard({
  label,
  value,
  unit,
  delta,
  positive,
  caption = 'vs last week',
}: StatCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const deltaColor = positive ? '#22c55e' : '#ef4444';
  const deltaBg = positive
    ? isDark
      ? 'rgba(34,197,94,0.16)'
      : 'rgba(34,197,94,0.12)'
    : isDark
      ? 'rgba(239,68,68,0.16)'
      : 'rgba(239,68,68,0.12)';
  const Arrow = positive ? ArrowUp : ArrowDown;

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text> : null}
      </View>

      <View style={styles.deltaRow}>
        <View style={[styles.deltaPill, { backgroundColor: deltaBg }]}>
          <Arrow size={12} color={deltaColor} strokeWidth={3} />
          <Text style={[styles.deltaText, { color: deltaColor }]}>{delta}</Text>
        </View>
        <Text
          style={[styles.caption, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {caption}
        </Text>
      </View>
    </View>
  );
}

// ─── Showcase data ────────────────────────────────────────────────────────────
const STATS: StatCardProps[] = [
  { label: 'Skin Score', value: '82', delta: '6.4%', positive: true },
  { label: 'Hydration', value: '68', unit: '%', delta: '2.1%', positive: true },
  { label: 'Breakouts', value: '12', delta: '9.0%', positive: false },
  { label: 'Redness', value: '24', unit: '/100', delta: '3.3%', positive: false },
];

export default function StatCardShowcase() {
  return (
    <View style={styles.grid}>
      {STATS.map((s) => (
        <View key={s.label} style={styles.gridItem}>
          <StatCard {...s} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingLeft: 14,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItem: {
    width: '48%',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  unit: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 3,
    marginBottom: 5,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
});
