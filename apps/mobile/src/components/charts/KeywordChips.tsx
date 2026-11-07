/**
 * KeywordChips — text display (no chart)
 *
 * A wrapping row of pill tags used to surface detected skin factors / topics.
 * Chips are tappable when an `onToggle` handler is supplied (selected chips
 * fill with the brand primary); otherwise they render as static labels.
 *
 * `KeywordChips` is the reusable primitive (named export).
 * The default export is a small toggleable showcase for the insight page.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function KeywordChips({
  keywords,
  selected = [],
  onToggle,
}: {
  keywords: string[];
  selected?: string[];
  onToggle?: (keyword: string) => void;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.wrap}>
      {keywords.map((k) => {
        const isSelected = selected.includes(k);
        const interactive = !!onToggle;
        return (
          <Pressable
            key={k}
            disabled={!interactive}
            onPress={() => onToggle?.(k)}
            style={[
              styles.chip,
              isSelected
                ? styles.chipSelected
                : isDark
                  ? styles.chipDark
                  : styles.chipLight,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? '#ffffff' : colors.text },
              ]}
            >
              {k}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const KEYWORDS = [
  'Hydration',
  'Glow',
  'Even tone',
  'Oiliness',
  'Texture',
  'Redness',
  'Sensitivity',
  'Pores',
];

export default function KeywordChipsShowcase() {
  const [selected, setSelected] = useState<string[]>(['Hydration', 'Glow']);

  const toggle = (k: string) =>
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <View style={styles.section}>
      <KeywordChips keywords={KEYWORDS} selected={selected} onToggle={toggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: 14,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  chipLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  chipDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  chipSelected: {
    backgroundColor: '#937abd',
    borderColor: '#937abd',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
