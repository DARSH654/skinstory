/**
 * BeforeAfterSlider — image display (no chart)
 *
 * Two stacked images with a draggable divider: the "Before" image is clipped
 * to the left of the handle, the "After" image fills the frame underneath.
 * Drag horizontally to compare.
 *
 * The pan responder only claims horizontal drags, so vertical scrolling of
 * the parent page still works when the gesture starts on the slider.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { Text } from '@/components/AppText';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ArrowLeftRight } from 'lucide-react-native';

const ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';
const img = (prompt: string) =>
  `${ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`;

const BEFORE_URI = img(
  'close-up front-facing beauty portrait of a young woman with mild acne redness and uneven skin texture, soft neutral studio lighting, skincare clinic photo'
);
const AFTER_URI = img(
  'close-up front-facing beauty portrait of a young woman with clear smooth glowing skin, soft neutral studio lighting, skincare clinic photo'
);

const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const HANDLE_SIZE = 40;

export default function BeforeAfterSlider() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const frameWidth = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT;
  const frameHeight = Math.round(frameWidth * 1.2);

  const [pos, setPos] = useState(0.5); // 0..1 divider position
  const posRef = useRef(0.5);
  const widthRef = useRef(0);
  const dragStartPageX = useRef(0);
  const dragStartPos = useRef(0.5);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 2,
      onPanResponderGrant: (evt) => {
        dragStartPageX.current = evt.nativeEvent.pageX;
        dragStartPos.current = posRef.current;
      },
      onPanResponderMove: (evt) => {
        const w = widthRef.current || 1;
        const delta = evt.nativeEvent.pageX - dragStartPageX.current;
        const next = Math.min(1, Math.max(0, dragStartPos.current + delta / w));
        posRef.current = next;
        setPos(next);
      },
    })
  ).current;

  const dividerX = frameWidth * pos;
  const handleLeft = Math.min(
    Math.max(dividerX - HANDLE_SIZE / 2, 0),
    Math.max(frameWidth - HANDLE_SIZE, 0)
  );

  return (
    <View style={styles.section}>
      <View
        {...pan.panHandlers}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
        }}
        style={[
          styles.frame,
          {
            width: frameWidth,
            height: frameHeight,
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            borderColor: isDark ? '#27272a' : '#e5e7eb',
          },
        ]}
      >
        {/* AFTER — full frame underneath */}
        <Image
          source={{ uri: AFTER_URI }}
          style={{ width: frameWidth, height: frameHeight }}
          contentFit="cover"
          transition={250}
        />

        {/* BEFORE — clipped to the left of the divider */}
        <View
          style={[styles.clip, { width: dividerX, height: frameHeight }]}
          pointerEvents="none"
        >
          <Image
            source={{ uri: BEFORE_URI }}
            style={{ width: frameWidth, height: frameHeight }}
            contentFit="cover"
            transition={250}
          />
        </View>

        {/* Divider + handle */}
        <View
          pointerEvents="none"
          style={[styles.divider, { left: dividerX - 1, height: frameHeight }]}
        />
        <View
          pointerEvents="none"
          style={[styles.handle, { left: handleLeft, top: frameHeight / 2 - HANDLE_SIZE / 2 }]}
        >
          <ArrowLeftRight size={18} color="#ffffff" strokeWidth={2.6} />
        </View>

        {/* Corner tags */}
        <View pointerEvents="none" style={[styles.tag, styles.tagLeft]}>
          <Text style={styles.tagText}>Before</Text>
        </View>
        <View pointerEvents="none" style={[styles.tag, styles.tagRight]}>
          <Text style={styles.tagText}>After</Text>
        </View>
      </View>

      <View style={styles.hintRow}>
        <ArrowLeftRight size={13} color={isDark ? '#B0B4BA' : '#60646C'} strokeWidth={2.6} />
        <Text style={[styles.hint, { color: isDark ? '#B0B4BA' : '#60646C' }]}>
          Drag to compare
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: H_PADDING_LEFT,
    paddingRight: H_PADDING_RIGHT,
    paddingTop: 16,
    paddingBottom: 8,
  },
  frame: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  clip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#937abd',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tag: {
    position: 'absolute',
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(9,9,11,0.62)',
  },
  tagLeft: {
    left: 12,
  },
  tagRight: {
    right: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
  },
});
