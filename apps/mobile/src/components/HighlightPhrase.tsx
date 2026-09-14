import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, LayoutChangeEvent, TextStyle } from 'react-native';
import { TitleText } from '@/components/AppText';
import { scale, moderateScale } from 'react-native-size-matters';

interface HighlightPhraseProps {
  words: string[];
  secondaryColor?: string;
  textStyle?: TextStyle;
}

export default function HighlightPhrase({
  words,
  secondaryColor = '#d6cbe8',
  textStyle,
}: HighlightPhraseProps) {
  const [positions, setPositions] = useState<{ [index: number]: number }>({});
  const isFrozen = useRef(false);

  const handleLayout = useCallback((index: number, e: LayoutChangeEvent) => {
    if (isFrozen.current) return;
    const y = Math.round(e.nativeEvent.layout.y);
    setPositions((prev) => {
      if (prev[index] === y) return prev;
      const next = { ...prev, [index]: y };
      if (Object.keys(next).length === words.length) {
        isFrozen.current = true;
      }
      return next;
    });
  }, [words.length]);

  const cornerRadius = scale(2);

  return (
    <>
      {words.map((wordWithTrailingSpace, index) => {
        const currentY = positions[index];
        const prevY = index > 0 ? positions[index - 1] : undefined;
        const nextY = index < words.length - 1 ? positions[index + 1] : undefined;

        // Same line checks (tolerance of 5px for subpixel/line-height variances)
        const connectedToPrev = prevY !== undefined && currentY !== undefined && Math.abs(currentY - prevY) < 5;
        const connectedToNext = nextY !== undefined && currentY !== undefined && Math.abs(currentY - nextY) < 5;

        // If connected on the left, make left sharp (0). If isolated/first on line, round left.
        const borderTopLeftRadius = connectedToPrev ? 0 : cornerRadius;
        const borderBottomLeftRadius = connectedToPrev ? 0 : cornerRadius;

        // If connected on the right, make right sharp (0). If isolated/last on line, round right.
        const borderTopRightRadius = connectedToNext ? 0 : cornerRadius;
        const borderBottomRightRadius = connectedToNext ? 0 : cornerRadius;

        return (
          <View
            key={`highlight-word-${index}`}
            style={styles.highlightWrapper}
            onLayout={(e) => handleLayout(index, e)}
          >
            <View
              style={[
                styles.highlightStripe,
                {
                  backgroundColor: secondaryColor,
                  borderTopLeftRadius,
                  borderBottomLeftRadius,
                  borderTopRightRadius,
                  borderBottomRightRadius,
                },
              ]}
            />
            <TitleText style={[styles.titleOverride, textStyle]}>
              {wordWithTrailingSpace}
            </TitleText>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: 0,
    right: 0,
    height: moderateScale(10, 0.3),
    zIndex: -1,
  },
  titleOverride: {
    color: '#1a1a1a',
    textAlign: 'left',
  },
});
