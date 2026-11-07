/**
 * NoteCard — text display (no chart)
 *
 * A journal/insight note: header (icon badge + title + date), a body of text,
 * a hairline divider, then a row of keyword chips.
 *
 * `NoteCard` is the reusable primitive (named export) and reuses the
 * `KeywordChips` primitive for its tags. The default export is a small
 * showcase for the insight page.
 *
 * Card surface follows the app's "uplifted" convention (History tab cards).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { MessageSquare } from 'lucide-react-native';
import { KeywordChips } from '@/components/charts/KeywordChips';

export type NoteCardProps = {
  title: string;
  date: string;
  body: string;
  keywords: string[];
};

export function NoteCard({ title, date, body, keywords }: NoteCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: isDark ? 'rgba(147,122,189,0.18)' : 'rgba(147,122,189,0.12)' }]}>
          <MessageSquare size={16} color="#937abd" strokeWidth={2.4} />
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{date}</Text>
      </View>

      <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text>

      <View style={[styles.divider, { backgroundColor: isDark ? '#27272a' : '#e5e7eb' }]} />

      <KeywordChips keywords={keywords} />
    </View>
  );
}

// ─── Showcase data ────────────────────────────────────────────────────────────
const NOTES: NoteCardProps[] = [
  {
    title: 'Weekly reflection',
    date: 'Mon, 12 Feb',
    body:
      'Skin felt calmer this week. The new night cream is absorbing well and morning redness has noticeably settled around the cheeks.',
    keywords: ['Calmer', 'Hydration', 'Redness ↓'],
  },
  {
    title: 'Product note',
    date: 'Sat, 10 Feb',
    body:
      'Switched to a lighter SPF for daytime. No breakouts so far, though the T-zone still gets a little oily by late afternoon.',
    keywords: ['Oiliness', 'SPF', 'Texture'],
  },
];

export default function NoteCardShowcase() {
  return (
    <View style={styles.section}>
      {NOTES.map((n) => (
        <NoteCard key={n.title} {...n} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: 14,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 10,
  },
  divider: {
    height: 1,
    marginTop: 14,
    marginBottom: 14,
  },
});
