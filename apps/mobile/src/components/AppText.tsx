import React from 'react';
import { Text as RNText, TextProps, StyleSheet, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

// ─────────────────────────────────────────────────────────────────────────────
// BASE COMPONENT
// All variants build on this. Controls:
//   • includeFontPadding: false  → no Android glyph clipping ever
//   • textBreakStrategy: 'simple' → clean Android word breaks
//   • maxFontSizeMultiplier      → Android system font scaling cap
// ─────────────────────────────────────────────────────────────────────────────
export function Text({
  style,
  maxFontSizeMultiplier = 1.0,
  textBreakStrategy = 'simple',
  ...props
}: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      textBreakStrategy={Platform.OS === 'android' ? textBreakStrategy : undefined}
      style={[styles.base, style]}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TITLE TEXT
// For onboarding headlines and screen titles.
//   • Montserrat_800ExtraBold
//   • fontSize: moderateScale(22, 0.3)
//   • NO lineHeight → immune to Android font scale blowing up spacing
//   • maxFontSizeMultiplier: 1.0 → titles NEVER grow on any device
// ─────────────────────────────────────────────────────────────────────────────
export function TitleText({ style, ...props }: TextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.0}
      style={[styles.title, style]}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBTITLE TEXT
// For section headings, card titles, screen sub-headings.
//   • Montserrat_700Bold
//   • fontSize: moderateScale(18, 0.3)
//   • NO lineHeight
//   • maxFontSizeMultiplier: 1.0
// ─────────────────────────────────────────────────────────────────────────────
export function SubtitleText({ style, ...props }: TextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.0}
      style={[styles.subtitle, style]}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BODY TEXT
// For descriptions, paragraphs, list items.
//   • Montserrat_600SemiBold
//   • fontSize: moderateScale(15, 0.3)
//   • NO lineHeight
//   • maxFontSizeMultiplier: 1.2 → body text can grow slightly for readability
// ─────────────────────────────────────────────────────────────────────────────
export function BodyText({ style, ...props }: TextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.2}
      style={[styles.body, style]}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON TEXT
// For CTA buttons and action labels.
//   • Montserrat_700Bold
//   • fontSize: moderateScale(16, 0.3)
//   • NO lineHeight
//   • maxFontSizeMultiplier: 1.0 → buttons NEVER overflow their container
// ─────────────────────────────────────────────────────────────────────────────
export function ButtonText({ style, ...props }: TextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.0}
      style={[styles.button, style]}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPTION TEXT
// For small labels, badges, hints, step indicators.
//   • Montserrat_500Medium
//   • fontSize: moderateScale(13, 0.3)
//   • NO lineHeight
//   • maxFontSizeMultiplier: 1.2
// ─────────────────────────────────────────────────────────────────────────────
export function CaptionText({ style, ...props }: TextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.2}
      style={[styles.caption, style]}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// NO lineHeight on any variant — intentional and permanent.
// lineHeight scales with Android system font and cannot be capped
// by maxFontSizeMultiplier. Removing it makes spacing immune to all devices.
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  title: {
    fontSize: moderateScale(22, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
  },
  subtitle: {
    fontSize: moderateScale(18, 0.3),
    fontFamily: 'Montserrat_700Bold',
  },
  body: {
    fontSize: moderateScale(15, 0.3),
    fontFamily: 'Montserrat_600SemiBold',
  },
  button: {
    fontSize: moderateScale(16, 0.3),
    fontFamily: 'Montserrat_700Bold',
  },
  caption: {
    fontSize: moderateScale(13, 0.3),
    fontFamily: 'Montserrat_500Medium',
  },
});

export default Text;
