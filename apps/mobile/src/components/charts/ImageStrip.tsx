/**
 * ImageStrip — image display (no chart)
 *
 * A horizontally scrollable strip of rounded progress photos with a small
 * caption chip on each tile. Drop-in for scan galleries / before-after sets.
 *
 * `ImageStrip` is the reusable primitive (named export).
 * The default export is a demo strip for the insight page.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Text } from '@/components/AppText';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type ImageStripItem = { uri: string; caption: string };

const ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';

const img = (prompt: string) =>
  `${ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`;

// ─── Default data: skin progress photos ───────────────────────────────────────
export const DEMO_IMAGES: ImageStripItem[] = [
  { uri: img('macro close-up photo of forehead skin texture, dermatology check, natural light'), caption: 'Day 1' },
  { uri: img('macro close-up photo of the left cheek skin texture, dermatology check, natural light'), caption: 'Day 3' },
  { uri: img('macro close-up photo of the right cheek skin texture, dermatology check, natural light'), caption: 'Day 5' },
  { uri: img('macro close-up photo of the chin skin texture, dermatology check, natural light'), caption: 'Day 7' },
  { uri: img('close-up photo of a full face skin check, clear skin, natural light'), caption: 'Day 10' },
];

export function ImageStrip({
  items = DEMO_IMAGES,
  tileWidth = 140,
  tileHeight = 184,
}: {
  items?: ImageStripItem[];
  tileWidth?: number;
  tileHeight?: number;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      decelerationRate="fast"
    >
      {items.map((item, i) => (
        <View
          key={`${item.caption}-${i}`}
          style={[
            styles.tile,
            {
              width: tileWidth,
              height: tileHeight,
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e5e7eb',
            },
          ]}
        >
          <Image
            source={{ uri: item.uri }}
            style={[styles.image, { width: tileWidth, height: tileHeight }]}
            contentFit="cover"
            transition={250}
          />
          <View style={styles.captionChip}>
            <Text style={styles.captionText}>{item.caption}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default function ImageStripShowcase() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const tileWidth = Math.round(SCREEN_WIDTH * 0.36);
  return (
    <View style={styles.section}>
      <ImageStrip tileWidth={tileWidth} tileHeight={Math.round(tileWidth * 1.3)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  strip: {
    paddingLeft: 14,
    paddingRight: 20,
    gap: 12,
  },
  tile: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  captionChip: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(9,9,11,0.62)',
  },
  captionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
